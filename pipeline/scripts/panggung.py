"""panggung — layout "panggung" (L02): talking-head satu frame penuh dengan kedalaman 4 lapis lewat Composition
Remotion PanggungReel (latar bersih → grafis belakang → talent roto ber-alpha → grafis depan) + kamera virtual.

Sumber kebenaran per proyek: proyek/<id>/panggung.json (adegan dari pustaka remotion/src/panggung/Adegan.tsx, kamera per
adegan, punch-in, anchor kata, musik, SFX). Waktu = anchor {"kata": "...", "ke": n, "offset": s} atau detik (split.py).

Pemakaian:
    python pipeline/scripts/panggung.py siapkan <proyek>            # roto semua frame + mask halus → talent.webm (alpha)
                                                                    #   + latar.mp4 (talent di-inpaint) di remotion/public
    python pipeline/scripts/panggung.py props   <proyek>            # resolve anchor → .sementara/panggung/<id>/props.json
    python pipeline/scripts/panggung.py still   <proyek> 1.2,5,9    # PNG per detik → out/storyboard/panggung_<t>.png
    python pipeline/scripts/panggung.py studio  <proyek>
    python pipeline/scripts/panggung.py render  <proyek>            # video + audio (suara, musik ber-ducking, SFX) → out/<id>.mp4
    python pipeline/scripts/panggung.py qa      <proyek>            # → out/qa-report.md
    python pipeline/scripts/panggung.py cek     <proyek>            # validasi panggung.json tanpa render

Lewat pintu utama: video.py render|qa <proyek> memakai panggung.py bila proyek punya panggung.json.

Mask halus (aturan §10 — tepi hijab/rambut tanpa tepi kasar, halo, atau sisa latar), per frame:
  1. kepercayaan MediaPipe → smoothstep, komponen subjek terbesar
  2. pita tepi ±50 px dikelaskan ulang dengan histogram warna Lab + tekstur (latih dari bagian yakin subjek/latar di
     frame yang sama) — membuang serpih batu yang menempel di sisi hijab
  3. GrabCut 540×960 berbenih hasil (2): tepi mengikuti kontras lokal (bayangan hijab vs batu gelap)
  4. guided filter berpanduan frame + smoothstep + feather 1 px; EMA temporal hanya di piksel yang diam (anti kedip
     tanpa ekor saat tangan bergerak)
  5. dekontaminasi warna tepi (warna dalam subjek ditarik ke pita tepi) — tanpa halo abu-abu di latar gelap/terang
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sistem import (ROOT, SEMENTARA, GagalPipeline, Proyek, baca_json, durasi, ffprobe, fps_dari,  # noqa: E402
                    jalankan, log, main_aman, sha_file, stream, tulis_json, ukur_loudness)
import remotion_jembatan as rj  # noqa: E402
import split  # noqa: E402
import ducking  # noqa: E402

KOMPOSISI = "PanggungReel"
VERSI_MASK = "halus-1"
TRANSISI = {"garis", "potong"}
CARA_KAMERA = {"potong", "snap", "halus"}
GERAK_BAWAAN = {"masuk": [0.16, 1, 0.3, 1], "keluar": [0.7, 0, 0.84, 0], "durasi_masuk": 0.6, "durasi_keluar": 0.33,
                "snap": 0.2, "halus": 0.7, "dorong": 0.04}
GRADE_BAWAAN = {"latar_terang": 0.32, "latar_blur": 16, "latar_saturasi": 0.45, "rim": 0.45, "bayangan": 0.55}
# perkiraan geometri kepala dari mask (QA caption vs wajah): dagu ≈ puncak kepala + RASIO_DAGU × lebar kepala
RASIO_DAGU = 1.35


def kerja(p: Proyek) -> Path:
    d = SEMENTARA / "panggung" / p.dir.name
    d.mkdir(parents=True, exist_ok=True)
    return d


def publik(p: Proyek) -> Path:
    d = rj.DIR / "public" / "proyek" / p.dir.name
    d.mkdir(parents=True, exist_ok=True)
    return d


# ------------------------------------------------------------------ mask halus

def _sst(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def _elips(r: int):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r))


def _terbesar(m: np.ndarray) -> np.ndarray:
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n <= 1:
        return m.astype(np.uint8)
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    return (lab == k).astype(np.uint8)


def _isi_lubang(m: np.ndarray, maks: float = 0.002) -> np.ndarray:
    """Isi lubang KECIL di dalam subjek (≤ maks × luas frame, salah kelas di kain/kulit). Celah latar asli yang tertutup
    (antara lengan & badan saat tangan di pinggang/terkatup) jauh lebih besar → tetap latar."""
    lubang = (m == 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(lubang, connectivity=4)
    x, y, w, h, luas = (st[:, j] for j in range(5))
    tepi = (x == 0) | (y == 0) | (x + w >= m.shape[1]) | (y + h >= m.shape[0])
    isi = ~tepi & (luas <= maks * m.size)
    isi[0] = False
    return np.maximum(m, isi[lab].astype(m.dtype))


def _haluskan_hist(h: np.ndarray) -> np.ndarray:
    """Blur histogram 4D (L, a, b, tekstur): Gaussian σ 1,2 di bidang a·b (cv2, banyak kanal), [¼ ½ ¼] di sumbu L & tekstur."""
    L, A, B, T = h.shape
    ab = np.ascontiguousarray(h.transpose(1, 2, 0, 3).reshape(A, B, L * T)).astype(np.float32)
    ab = cv2.GaussianBlur(ab, (0, 0), 1.2, borderType=cv2.BORDER_CONSTANT).reshape(A, B, L, T).transpose(2, 0, 1, 3)
    for ax in (0, 3):
        ab = 0.5 * ab + 0.25 * (np.roll(ab, 1, ax) + np.roll(ab, -1, ax))
    return ab


def haluskan_mask(rgb: np.ndarray, conf: np.ndarray, pita: int = 101) -> np.ndarray:
    """Kepercayaan subjek (0..1, sembarang resolusi) + frame RGB → alpha 0..1 bersih (lihat docstring modul, langkah 1–4
    tanpa temporal). Murni numpy/OpenCV (tanpa sklearn/scipy) agar jalan di .venv proyek."""
    H, W = rgb.shape[:2]
    if conf.shape != (H, W):
        conf = cv2.resize(conf, (W, H), interpolation=cv2.INTER_LINEAR)
    t = _sst(conf.astype(np.float32), 0.35, 0.65)
    fg = _terbesar(t > 0.5)
    if fg.sum() < 1000:
        return np.zeros((H, W), np.float32)
    yakin_fg = cv2.erode(fg, _elips(pita)) > 0
    yakin_bg = cv2.dilate(fg, _elips(pita)) == 0
    band = ~yakin_fg & ~yakin_bg
    # (2) histogram Bayes Lab (L/16, a/4, b/4) × tekstur (8 tingkat) dari bagian yakin di frame ini
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    abu = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    tex = cv2.GaussianBlur(np.abs(cv2.Laplacian(abu, cv2.CV_32F)), (0, 0), 3)
    q = ((lab[..., 0] // 16).astype(np.int32) * 4096 + (lab[..., 1] // 4).astype(np.int32) * 64
         + (lab[..., 2] // 4).astype(np.int32)) * 8 + np.clip(tex / 6, 0, 7).astype(np.int32)
    bentuk = (16, 64, 64, 8)
    hf = np.bincount(q[yakin_fg], minlength=int(np.prod(bentuk))).astype(np.float32).reshape(bentuk)
    hb = np.bincount(q[yakin_bg], minlength=int(np.prod(bentuk))).astype(np.float32).reshape(bentuk)
    hf = _haluskan_hist(hf / max(1.0, hf.sum()))
    hb = _haluskan_hist(hb / max(1.0, hb.sum()))
    pr = (hf / (hf + hb + 1e-12)).ravel()
    pr[(hf + hb).ravel() < 1e-7] = 0.5
    p = yakin_fg.astype(np.float32)
    p[band] = pr[q[band]]
    m = _isi_lubang(_terbesar(cv2.GaussianBlur(p, (0, 0), 2) > 0.5))
    # (3) GrabCut 540×960 berbenih
    sw, sh = W // 2, H // 2
    sm = cv2.resize(rgb, (sw, sh), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(m, (sw, sh), interpolation=cv2.INTER_NEAREST)
    gc = np.full(ms.shape, cv2.GC_BGD, np.uint8)
    gc[cv2.dilate(ms, _elips(21)) > 0] = cv2.GC_PR_BGD
    gc[ms > 0] = cv2.GC_PR_FGD
    gc[cv2.erode(ms, _elips(25)) > 0] = cv2.GC_FGD
    if (gc == cv2.GC_FGD).any() and (gc == cv2.GC_BGD).any():
        bgm, fgm = np.zeros((1, 65)), np.zeros((1, 65))
        cv2.grabCut(cv2.cvtColor(sm, cv2.COLOR_RGB2BGR), gc, None, bgm, fgm, 4, cv2.GC_INIT_WITH_MASK)
        ms = _terbesar((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD))
        m = (cv2.resize(ms.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR) > 0.5).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, _elips(9))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, _elips(15))
    m = cv2.erode(m, _elips(3)).astype(np.float32)
    # (4) guided filter → tepi mengikuti kontur hijab asli; smoothstep + feather 1 px
    g = cv2.ximgproc.guidedFilter(rgb.astype(np.float32) / 255, m, 8, 2e-4)
    return cv2.GaussianBlur(_sst(g, 0.3, 0.7), (0, 0), 1.1)


def temporal(a: np.ndarray, a_lama: np.ndarray | None, rgb: np.ndarray, rgb_lama: np.ndarray | None, kuat: float = 0.5):
    """EMA alpha hanya di piksel yang diam (beda luminans kecil) DAN yang alpha-nya hanya bergeser sedikit (kedip tepi).
    Lompatan besar (serpih salah kelas di frame lama yang kini sudah benar) tidak dibawa → tanpa ekor/serpih menempel."""
    if a_lama is None or rgb_lama is None:
        return a
    beda = cv2.GaussianBlur(np.abs(rgb.astype(np.float32) - rgb_lama.astype(np.float32)).mean(2) / 255, (0, 0), 3)
    kecil = 1 - _sst(np.abs(a - a_lama), 0.15, 0.35)
    w = kuat * (1 - np.clip(beda / 0.06, 0, 1)) * kecil
    return a * (1 - w) + a_lama * w


def dekontaminasi(rgb: np.ndarray, a: np.ndarray) -> np.ndarray:
    """Pita tepi (0 < alpha < 0,97) diisi warna bagian dalam subjek (premultiplied blur) → tanpa halo warna latar."""
    keras = (a > 0.97).astype(np.float32)
    num = cv2.GaussianBlur(rgb.astype(np.float32) * keras[..., None], (0, 0), 5)
    den = cv2.GaussianBlur(keras, (0, 0), 5)[..., None] + 1e-4
    w = ((a > 0.02) & (a < 0.97)).astype(np.float32)[..., None]
    return np.clip(rgb * (1 - w) + (num / den) * w, 0, 255).astype(np.uint8)


def kepala(a: np.ndarray) -> list[float] | None:
    """[puncak_y, cx, lebar] kepala dari alpha (px frame) untuk QA caption vs wajah."""
    baris = np.where((a > 0.5).sum(1) > 6)[0]
    if not len(baris):
        return None
    y0 = int(baris[0])
    yy = min(a.shape[0] - 1, y0 + int(a.shape[0] * 0.06))
    xs = np.where(a[yy] > 0.5)[0]
    if not len(xs):
        return None
    return [float(y0), float(xs.mean()), float(xs[-1] - xs[0])]


def siapkan(p: Proyek, paksa: bool = False) -> dict:
    """Roto semua frame → mask halus → remotion/public/proyek/<id>/talent.webm (VP9 ber-alpha) + latar.mp4 (talent
    di-inpaint, plate bersih menumpuk dari frame yang melihat latar) + cache/panggung/kepala.json."""
    import roto

    if not p.ingest_video.exists():
        raise GagalPipeline("cache/ingest.mp4 belum ada: jalankan video.py ingest <proyek> dulu")
    roto.roto(p, semua=True)
    tujuan = publik(p)
    talent, latar = tujuan / "talent.webm", tujuan / "latar.mp4"
    meta_path = p.cache / "panggung" / "meta.json"
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    cfg = baca_json(p.dir / "panggung.json") or {}
    rcfg = cfg.get("roto", {})
    kunci = {"ingest": sha_file(p.ingest_video), "versi": VERSI_MASK, "roto": rcfg,
             "mask": len(list(p.masks_dir.glob("*.png")))}
    lama = baca_json(meta_path) if meta_path.exists() else None
    if not paksa and lama and lama.get("kunci") == kunci and talent.exists() and latar.exists():
        log("panggung", "aset panggung mutakhir (talent.webm, latar.mp4).")
        return lama
    total = int(round(durasi(p.ingest_video) * p.fps))
    W, H = p.W, p.H
    lw, lh = W // 2, H // 2
    enc_t = subprocess.Popen(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
         "-r", str(p.fps), "-i", "-", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", str(rcfg.get("crf", 22)),
         "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", str(talent)], stdin=subprocess.PIPE)
    enc_l = subprocess.Popen(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{lw}x{lh}",
         "-r", str(p.fps), "-i", "-", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
         "-color_trc", "bt709", "-colorspace", "bt709", str(latar)], stdin=subprocess.PIPE)
    kpl: list = []
    a_lama = rgb_lama = None
    plate = None
    dikenal = np.zeros((lh, lw), np.float32)
    try:
        for i, rgb in roto.baca_frame(p, 0, total):
            mf = p.masks_dir / f"{i:06d}.png"
            conf = cv2.imread(str(mf), cv2.IMREAD_GRAYSCALE)
            if conf is None:
                raise GagalPipeline(f"mask {mf.name} tidak ada — jalankan roto --semua")
            a = haluskan_mask(rgb, conf.astype(np.float32) / 255, int(rcfg.get("pita", 101)))
            a = temporal(a, a_lama, rgb, rgb_lama, float(rcfg.get("temporal", 0.5)))
            a_lama, rgb_lama = a, rgb
            warna = dekontaminasi(rgb, a)
            enc_t.stdin.write(np.dstack([warna, (a * 255 + 0.5).astype(np.uint8)]).tobytes())
            # plate latar: piksel yang terlihat (alpha kecil, dilatasi aman) memperbarui plate; sisanya inpaint
            kecil = cv2.resize(rgb, (lw, lh), interpolation=cv2.INTER_AREA)
            tutup = cv2.dilate((cv2.resize(a, (lw, lh)) > 0.02).astype(np.uint8), _elips(25))
            lihat = (tutup == 0).astype(np.float32)
            plate = kecil.astype(np.float32) if plate is None else plate * (1 - lihat[..., None]) + kecil * lihat[..., None]
            dikenal = np.maximum(dikenal, lihat)
            lubang = ((dikenal < 0.5) | (tutup > 0)).astype(np.uint8)
            # inpaint di ¼ resolusi (latar di-blur 16 px di Remotion) lalu hanya mengisi lubang
            kc = cv2.inpaint(cv2.resize(plate.astype(np.uint8), (lw // 2, lh // 2), interpolation=cv2.INTER_AREA),
                             cv2.resize(lubang * 255, (lw // 2, lh // 2), interpolation=cv2.INTER_NEAREST), 7, cv2.INPAINT_TELEA)
            kc = cv2.resize(kc, (lw, lh), interpolation=cv2.INTER_CUBIC).astype(np.float32)
            lb = cv2.GaussianBlur(lubang.astype(np.float32), (0, 0), 4)[..., None]
            isi = np.clip(plate * (1 - lb) + kc * lb, 0, 255).astype(np.uint8)
            enc_l.stdin.write(isi.tobytes())
            kpl.append(kepala(a))
            if i % 100 == 0:
                log("panggung", f"mask halus {i}/{total}")
    finally:
        for e in (enc_t, enc_l):
            e.stdin.close()
            e.wait()
    if enc_t.returncode or enc_l.returncode:
        raise GagalPipeline("encode talent.webm / latar.mp4 gagal")
    tulis_json(p.cache / "panggung" / "kepala.json", {"fps": p.fps, "kepala": kpl})
    hasil = {"kunci": kunci, "frame": len(kpl)}
    tulis_json(meta_path, hasil)
    log("panggung", f"{len(kpl)} frame → {talent.name} (alpha) + {latar.name}")
    return hasil


# ------------------------------------------------------------------ props

def waktu(nilai, kata):
    return split.resolve_waktu(nilai, kata)


def siapkan_logo(p: Proyek, cfg: dict, kata: list[dict]) -> dict:
    from PIL import Image

    src = p.path_aset(cfg["file"])
    if not src or not src.exists():
        raise GagalPipeline(f"logo '{cfg['file']}' tidak ada")
    shutil.copy(src, publik(p) / src.name)
    w, h = Image.open(src).size
    return {"src": f"proyek/{p.dir.name}/{src.name}", "rasio": h / w, "lebar": cfg.get("lebar", 236), "y": cfg.get("y", 221),
            "lebar_akhir": cfg.get("lebar_akhir", 640), "y_akhir": cfg.get("y_akhir", 760),
            "akhir": waktu(cfg["akhir"], kata) if cfg.get("akhir") is not None else 1e9}


def bangun_props(p: Proyek) -> dict:
    cfg = baca_json(p.dir / "panggung.json")
    if cfg is None:
        raise GagalPipeline(f"panggung.json tidak ada di {p.dir}")
    words = baca_json(p.words_path)
    if not words:
        raise GagalPipeline("transkrip belum ada: jalankan video.py transkrip <proyek>")
    kata = words["kata"]
    dur = durasi(p.ingest_video)
    adegan = []
    for a in cfg["adegan"]:
        mulai = waktu(a["mulai"], kata)
        selesai = waktu(a["selesai"], kata) if a.get("selesai") is not None else dur
        adegan.append({
            "modul": a["modul"], "mulai": mulai, "selesai": selesai,
            "t": {n: waktu(v, kata) for n, v in a.get("t", {}).items()},
            "kamera": a["kamera"],
            "punch": [{"t": waktu(x["t"], kata), "s": x["s"], **({"sampai": waktu(x["sampai"], kata)} if "sampai" in x else {})}
                      for x in a.get("punch", [])],
            **{k: a[k] for k in ("masuk", "keluar", "caption_y") if k in a},
        })
    irama = split.sinkron_ketukan(p, cfg, adegan, dur)
    for e in ("talent.webm", "latar.mp4"):
        if not (publik(p) / e).exists():
            raise GagalPipeline(f"{e} belum ada: jalankan panggung.py siapkan {p.dir.name}")
    cap = p.t("caption")
    rj.siapkan_font(p.tokens)
    return {
        "W": p.W, "H": p.H, "fps": p.fps, "durasiFrame": int(round(dur * p.fps)),
        "tokens": p.tokens, "zona": list(p.zona_aman()), "asal_y": cfg.get("asal_y", 0.42),
        "footage": {"talent": f"proyek/{p.dir.name}/talent.webm", "latar": f"proyek/{p.dir.name}/latar.mp4"},
        "grade": {**GRADE_BAWAAN, **cfg.get("grade", {})},
        "adegan": adegan, "gerak": {**GERAK_BAWAAN, **cfg.get("gerak", {})}, "ketukan": irama,
        "logo": siapkan_logo(p, cfg["logo"], kata) if cfg.get("logo") else None,
        "menyatu": cfg.get("menyatu", {}),
        "kata": [{"w": k["w"], "s": k["s"], "e": k["e"]} for k in kata],
        "caption": {"y": cfg.get("caption_y", 1425), "kata_maks": cap["kata-maks"], "karakter_maks": cap["karakter-maks-baris"],
                    "jeda_pecah": cap["jeda-pecah"]},
    }


def tulis_props(p: Proyek) -> Path:
    props = bangun_props(p)
    path = kerja(p) / "props.json"
    tulis_json(path, props)
    irama = props.get("ketukan")
    if irama:
        log("panggung", f"ketukan {irama['bpm']} BPM: {irama['digeser']}/{irama['potongan']} potongan di-snap, "
                        f"musik mulai di {irama['ofset_musik']:.2f} s")
    log("panggung", f"{len(props['adegan'])} adegan → {path}")
    return path


def still(p: Proyek, detik: list[float]) -> list[Path]:
    props = tulis_props(p)
    d = p.out / "storyboard"
    d.mkdir(parents=True, exist_ok=True)
    hasil = []
    for t in detik:
        out = d / f"panggung_{t:06.2f}.png"
        split._remotion(["still", "src/index.ts", KOMPOSISI, out, f"--props={props}", f"--frame={int(round(t * p.fps))}",
                         "--port=3126", "--log=error"])
        hasil.append(out)
    log("panggung", f"{len(hasil)} still → {d}")
    return hasil


def studio(p: Proyek) -> None:
    split._remotion(["studio", "src/index.ts", f"--props={tulis_props(p)}"])


def render(p: Proyek) -> Path:
    cfg = baca_json(p.dir / "panggung.json")
    props_path = tulis_props(p)
    props = baca_json(props_path)
    k = kerja(p)
    video = k / "video.mp4"
    split._remotion(["render", "src/index.ts", KOMPOSISI, video, f"--props={props_path}", "--codec=h264", "--crf=14", "--muted",
                     "--log=error", "--concurrency=50%", "--port=3126"])
    audio = k / "master.wav"
    lu = split.mix_audio(p, cfg, audio, irama=props.get("ketukan") or {})
    log("panggung", f"audio master {lu['lufs']:.1f} LUFS, TP {lu['true_peak']:.1f} dBTP")
    out = p.out / f"{p.dir.name}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a",
              "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
              "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart",
              "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", out])
    akhir = ukur_loudness(out)
    log("panggung", f"→ {out} ({akhir['lufs']:.1f} LUFS, TP {akhir['true_peak']:.1f} dBTP)")
    return out


# ------------------------------------------------------------------ cek & QA

def modul_pustaka() -> dict[str, float]:
    """Modul di PUSTAKA_PANGGUNG (Adegan.tsx) → y garis match cut (px; bawaan 576)."""
    teks = (rj.DIR / "src" / "panggung" / "Adegan.tsx").read_text(encoding="utf-8")
    blok = re.search(r"export const PUSTAKA_PANGGUNG[^{]*\{(.*?)\n\};", teks, re.S)
    hasil = {}
    for nama, isi in re.findall(r'"([\w-]+)"\s*:\s*\{([^}]*)\}', blok.group(1) if blok else ""):
        g = re.search(r"garis:\s*([\d.]+)", isi)
        hasil[nama] = float(g.group(1)) if g else 576.0
    return hasil


def cek(p: Proyek) -> tuple[list[str], list[str]]:
    """Validasi panggung.json tanpa render (video.py cek & qa): modul ada, transisi & cara kamera dikenal, SFX/musik ada;
    bila transkrip & ingest ada: anchor ter-resolve, adegan berurutan tanpa celah, adegan pertama di 0 s (hook #7)."""
    cfg = baca_json(p.dir / "panggung.json")
    if cfg is None:
        return [], []
    nama = p.dir.name
    masalah, info = [], []
    pustaka = modul_pustaka()
    adg = cfg.get("adegan", [])
    for i, a in enumerate(adg):
        if a.get("modul") not in pustaka:
            masalah.append(f"proyek/{nama}: adegan {i + 1} modul '{a.get('modul')}' tidak ada di PUSTAKA_PANGGUNG")
        for sisi in ("masuk", "keluar"):
            if sisi in a and a[sisi] not in TRANSISI:
                masalah.append(f"proyek/{nama}: adegan {i + 1} {sisi}='{a[sisi]}' (pilihan: {', '.join(sorted(TRANSISI))})")
        kam = a.get("kamera") or {}
        if not isinstance(kam.get("s"), (int, float)) or not isinstance(kam.get("dy"), (int, float)):
            masalah.append(f"proyek/{nama}: adegan {i + 1} butuh kamera {{s, dy}}")
        elif not 0.6 <= kam["s"] <= 1.6:
            masalah.append(f"proyek/{nama}: adegan {i + 1} kamera.s {kam['s']} di luar 0,6–1,6 (rekaman 4K: maks ±2× aman)")
        if kam.get("cara", "halus") not in CARA_KAMERA:
            masalah.append(f"proyek/{nama}: adegan {i + 1} kamera.cara '{kam.get('cara')}' ({', '.join(sorted(CARA_KAMERA))})")
    for s in cfg.get("sfx", []):
        if not (split.SFX_DIR / f"{s.get('jenis')}.wav").exists():
            masalah.append(f"proyek/{nama}: SFX '{s.get('jenis')}' tidak ada di {split.SFX_DIR.relative_to(ROOT)}")
    musik = cfg.get("musik")
    if musik:
        f = musik["file"]
        src = split.MUSIK_DIR / f"{f.split(':', 1)[1]}.wav" if f.startswith("bawaan:") else p.path_aset(f)
        if not src or not src.exists():
            masalah.append(f"proyek/{nama}: musik '{f}' tidak ada (bawaan: python pipeline/scripts/musik.py)")
    n_garis = sum(a.get("masuk", "garis") == "garis" for a in adg[1:])
    info.append(f"proyek/{nama}: panggung {len(adg)} adegan, match cut garis {n_garis}/{max(0, len(adg) - 1)}")
    words = baca_json(p.words_path) if p.words_path.exists() else None
    if not words or not p.ingest_video.exists():
        return masalah, info
    try:
        kata, dur = words["kata"], durasi(p.ingest_video)
        rentang = [(waktu(a["mulai"], kata), waktu(a["selesai"], kata) if a.get("selesai") is not None else dur) for a in adg]
        for a in adg:
            for v in a.get("t", {}).values():
                waktu(v, kata)
            for x in a.get("punch", []):
                waktu(x["t"], kata)
        for s in cfg.get("sfx", []):
            waktu(s["t"], kata)
        if cfg.get("logo", {}).get("akhir") is not None:
            waktu(cfg["logo"]["akhir"], kata)
    except GagalPipeline as e:
        return masalah + [f"proyek/{nama}: {e}"], info
    if rentang and rentang[0][0] > 0.05:
        masalah.append(f"proyek/{nama}: adegan pertama mulai {rentang[0][0]:.2f} s — hook visual harus di frame 0 (#7)")
    for i, ((m0, s0), (m1, _)) in enumerate(zip(rentang, rentang[1:])):
        if s0 <= m0:
            masalah.append(f"proyek/{nama}: adegan {i + 1} selesai ({s0:.2f}) ≤ mulai ({m0:.2f})")
        if abs(m1 - s0) > 0.1:
            masalah.append(f"proyek/{nama}: celah/tumpang {m1 - s0:+.2f} s antara adegan {i + 1} dan {i + 2}")
    if rentang and rentang[-1][1] < dur - 0.1:
        masalah.append(f"proyek/{nama}: adegan terakhir berhenti di {rentang[-1][1]:.2f} s, rekaman {dur:.2f} s")
    return masalah, info


def kamera_pada(adegan: list[dict], t: float, g: dict) -> tuple[float, float]:
    """Cermin kameraPada (remotion/src/panggung/kamera.ts) tanpa easing (nilai akhir tiap gerak) — untuk QA caption."""
    i = 0
    while i < len(adegan) - 1 and adegan[i + 1]["mulai"] <= t:
        i += 1
    a = adegan[i]
    s = a["kamera"]["s"]
    for x in a.get("punch", []):
        if t >= x["t"] and t < x.get("sampai", 1e9):
            s *= x["s"]
    s *= 1 + g["dorong"] * min(1.0, max(0.0, (t - a["mulai"]) / max(0.1, a["selesai"] - a["mulai"])))
    return s, a["kamera"]["dy"]


def qa(p: Proyek) -> bool:
    """QA keluaran PanggungReel → out/qa-report.md + qa.json: ekspor (K07.2), audio (K06.1–2), durasi & sinkron, caption cps,
    hook detik pertama, struktur (cek), match cut, ketukan, ducking, CAPTION vs WAJAH (§10, dari geometri kepala mask)."""
    from PIL import Image, ImageChops, ImageStat

    out = p.out / f"{p.dir.name}.mp4"
    if not out.exists():
        raise GagalPipeline(f"{out.name} belum ada: jalankan panggung.py render dulu")
    info = ffprobe(out)
    v, a = stream(info, "video"), stream(info, "audio")
    hasil: list[tuple[str, str, str, str]] = []

    def catat(i, aturan, ok, detail, lunak=False):
        hasil.append((i, aturan, "LULUS" if ok else ("PERINGATAN" if lunak else "GAGAL"), detail))

    W, H = p.t("format.resolusi")
    tag = (v.get("color_primaries"), v.get("color_transfer"), v.get("color_space"))
    catat("K07.2", "H.264, resolusi format, pix_fmt, tag bt709, AAC",
          v["codec_name"] == "h264" and (v["width"], v["height"]) == (W, H) and v["pix_fmt"] == p.t("ekspor.pix_fmt")
          and all(x == "bt709" for x in tag) and a and a["codec_name"] == "aac",
          f"{v['codec_name']} {v['width']}x{v['height']} {v['pix_fmt']} {tag} audio {a and a['codec_name']}")
    catat("FPS", "fps = format.fps", abs(fps_dari(v) - p.fps) < 0.01, f"{fps_dari(v):.2f}")
    lu = ukur_loudness(out)
    catat("K06.1", "loudness terintegrasi = audio.lufs ± toleransi",
          abs(lu["lufs"] - p.t("audio.lufs")) <= p.t("audio.lufs-toleransi"), f"{lu['lufs']:.1f} LUFS")
    catat("K06.2", "true peak ≤ audio.true-peak", lu["true_peak"] <= p.t("audio.true-peak"), f"{lu['true_peak']:.1f} dBTP")
    dv, dsrc = float(v.get("duration", info["format"]["duration"])), durasi(p.ingest_video)
    catat("DUR", "durasi = rekaman (±0,1 s)", abs(dv - dsrc) <= 0.1, f"{dv:.2f} s vs rekaman {dsrc:.2f} s")
    if a:
        catat("SINK", "audio & video sama panjang (±0,1 s)", abs(float(a.get("duration", dv)) - dv) <= 0.1,
              f"audio {float(a.get('duration', dv)):.2f} s")
    props = baca_json(kerja(p) / "props.json")
    c = props["caption"]
    halaman, kini = [], []
    for k in props["kata"]:
        if kini and (k["s"] - kini[-1]["e"] > c["jeda_pecah"] or len(kini) >= c["kata_maks"]
                     or sum(len(x["w"]) + 1 for x in kini) + len(k["w"]) > c["karakter_maks"]):
            halaman.append(kini)
            kini = []
        kini.append(k)
    halaman.append(kini)
    cps_maks = p.t("qa.karakter-per-detik-maks")
    terpadat = max((sum(len(x["w"]) for x in h) / max(0.3, h[-1]["e"] - h[0]["s"]), " ".join(x["w"] for x in h))
                   for h in halaman)
    catat("K01.cps", "caption ≤ qa.karakter-per-detik-maks", terpadat[0] <= cps_maks,
          f"terpadat {terpadat[0]:.1f} cps (“{terpadat[1]}”), batas {cps_maks}")
    # caption vs wajah (§10): dagu (dari mask, ditransformasi kamera) harus di atas tepi atas caption − 20 px
    kp = baca_json(p.cache / "panggung" / "kepala.json") or {}
    asal = H * props["asal_y"]
    tabrak = []
    for h in halaman:
        t = (h[0]["s"] + h[-1]["e"]) / 2
        i = min(len(kp.get("kepala", [])) - 1, int(t * p.fps))
        g = kp.get("kepala", [])[i] if i >= 0 else None
        if not g:
            continue
        s, dy = kamera_pada(props["adegan"], t, props["gerak"])
        dagu = asal + s * (g[0] + RASIO_DAGU * g[2] - asal) + dy
        ad = next((x for x in props["adegan"] if x["mulai"] <= t < x["selesai"]), props["adegan"][-1])
        cy = ad.get("caption_y", c["y"])
        if dagu > cy - 20:
            tabrak.append(f"{t:.1f}s dagu y{dagu:.0f} vs caption y{cy}")
    catat("§10", "caption tidak menutupi wajah (dagu di atas caption)", not tabrak and bool(kp),
          "; ".join(tabrak[:5]) or ("aman di semua halaman caption" if kp else "kepala.json belum ada (siapkan)"))
    k = kerja(p)
    f0, f5 = k / "frame0.png", k / "frame05.png"
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", out, "-frames:v", 1, f0])
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", "0.5", "-i", out, "-frames:v", 1, f5])
    i0, i5 = Image.open(f0).convert("L"), Image.open(f5).convert("L")
    catat("HOOK", "frame 0 sudah berisi visual (#7)", ImageStat.Stat(i0).stddev[0] >= 12,
          f"stddev luminans {ImageStat.Stat(i0).stddev[0]:.1f}", lunak=True)
    gerak = ImageStat.Stat(ImageChops.difference(i0, i5)).mean[0]
    catat("HOOK.1s", "gerak 0→0,5 s cukup kuat (#7)", gerak >= 6, f"beda rata-rata {gerak:.1f}", lunak=True)
    m_struktur, i_struktur = cek(p)
    catat("STRUKTUR", "panggung.json valid (modul, transisi, kamera, anchor, urutan)", not m_struktur,
          "; ".join(m_struktur) or "; ".join(i_struktur))
    adg = props["adegan"]
    n_match = sum(x.get("masuk", "garis") == "garis" for x in adg[1:])
    catat("MATCH", "≥1 match cut bentuk antar-adegan (#5)", n_match >= 1 or len(adg) < 3,
          f"{n_match}/{max(0, len(adg) - 1)} potongan garis emas", lunak=True)
    irama = props.get("ketukan")
    if irama:
        catat("KETUKAN", "potongan di ketukan + denyut grafis", True,
              f"{irama['bpm']} BPM, {irama['digeser']}/{irama['potongan']} potongan di-snap")
    cfg = baca_json(p.dir / "panggung.json")
    if cfg.get("musik"):
        dk = ducking.konfigurasi(cfg["musik"])
        catat("K08.6", "musik di-duck di bawah ucapan", dk["mode"] != "mati", f"{dk['mode']} {dk['db']} dB")
    gagal = any(s == "GAGAL" for _, _, s, _ in hasil)
    status = "GAGAL" if gagal else "LULUS"
    manual = [
        "§10 mask: putar 1:1 di tepi hijab kiri/kanan (latar gelap) — tanpa serpih batu, halo, atau kedip tepi.",
        "#9 transisi garis emas frame demi frame: tanpa pop/kedip; garis meluncur mulus antar-adegan.",
        "Orbit (adegan 5): ikon depan lewat di dada/bahu, tidak pernah di wajah.",
        "K00 zona aman: logo, pil 'Link di bio', label A1–C2 & Dengar/Bicara/Tulis/Baca di dalam margin 108/315 px.",
        "K07.3 tonton di HP: keterbacaan caption pil emas, sinkron bibir.",
        "K08.5–6 headphone: SFX & ducking musik pulsa (naik di jeda, tidak memompa di tengah kalimat).",
    ]
    md = [f"# QA — {p.dir.name} (layout panggung)", "", f"**Status: {status}**", "",
          f"File: `out/{out.name}` · dicek {dt.datetime.now():%Y-%m-%d %H:%M}", "",
          "| ID | Aturan | Status | Detail |", "|---|---|---|---|",
          *[f"| {i} | {at} | {s} | {d} |" for i, at, s, d in hasil], "",
          "K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.", "",
          "## Checklist manual (dicentang Zar)", *[f"- [ ] {m}" for m in manual], ""]
    (p.out / "qa-report.md").write_text("\n".join(md), encoding="utf-8")
    tulis_json(p.out / "qa.json", {"status": status, "hasil": [dict(zip(("id", "aturan", "status", "detail"), h))
                                                              for h in hasil], "manual": manual})
    p.manifest["qa"] = status
    p.simpan_manifest()
    log("panggung", f"QA {status} → out/qa-report.md")
    return not gagal


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("aksi", choices=["siapkan", "props", "still", "studio", "render", "qa", "cek"])
    ap.add_argument("proyek")
    ap.add_argument("detik", nargs="?", default="")
    ap.add_argument("--paksa", action="store_true")
    arg = ap.parse_args()
    folder = Path(arg.proyek)
    if not folder.exists():
        folder = ROOT / "proyek" / arg.proyek
    p = Proyek(folder)
    if arg.aksi == "siapkan":
        siapkan(p, arg.paksa)
    elif arg.aksi == "props":
        tulis_props(p)
    elif arg.aksi == "still":
        still(p, [float(x) for x in arg.detik.split(",") if x])
    elif arg.aksi == "studio":
        studio(p)
    elif arg.aksi == "qa":
        if not qa(p):
            sys.exit(1)
    elif arg.aksi == "cek":
        masalah, info = cek(p)
        for x in info:
            log("cek", x)
        for x in masalah:
            log("cek", f"MASALAH: {x}")
        if masalah:
            sys.exit(1)
    else:
        render(p)


if __name__ == "__main__":
    main_aman(main)
