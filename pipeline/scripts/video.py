"""video — satu pintu untuk semua perintah pipeline.

Pemakaian:
    python pipeline/scripts/video.py baru <nama> --gaya glass-tech --template explainer [--judul "…"]
    python pipeline/scripts/video.py baru <nama> --preset kaca-gelap-tips [--judul "…"]  # gaya+template+beat-sheet awal
    python pipeline/scripts/video.py preset [nama|gaya]          # daftar preset per gaya / detail satu preset
    python pipeline/scripts/video.py katalog [gaya]              # contoh frame tiap gaya → gaya/katalog/*.png
    python pipeline/scripts/video.py pratinjau [preset] [--sumber <proyek>] [--seed N]  # video contoh → preset/pratinjau/*
    python pipeline/scripts/video.py pratinjau-efek [efek] [--gaya g] [--paksa]  # gerak contoh tiap efek → efek/pratinjau/*.gif|png
    python pipeline/scripts/video.py varian <preset> [--n 5] [--seed 0] [--gaya g]  # pilihan slot per seed (tanpa render)
    python pipeline/scripts/video.py referensi <video.mp4> [--nama n]  # analisis referensi → referensi/<n>/ (shot, gerak, teks)
    python pipeline/scripts/video.py pasang   <proyek>         # beat-sheet preset → anchor kata transkrip + hindari wajah
    python pipeline/scripts/video.py wajah    <proyek>         # deteksi wajah → cache/wajah.json
    python pipeline/scripts/video.py laporan  <proyek>         # laporan perangkat per beat + out/kontak.png
    python pipeline/scripts/video.py cek                       # validasi registry & INDEX.md + split.json proyek split
    python pipeline/scripts/video.py status   <proyek>         # modul ter-resolve + status cache
    python pipeline/scripts/video.py semua    <proyek>         # ingest → transkrip → roto → wajah → render → ekspor → qa (+laporan)
                                                               #   butuh persetujuan storyboard (video.py setuju); --tanpa-setuju hanya atas keputusan pengguna
    python pipeline/scripts/video.py ingest|transkrip|roto|render|ekspor|qa|arsip <proyek> [opsi skrip]
    python pipeline/scripts/video.py still    <proyek> 1.5,8   # PNG frame untuk review
    python pipeline/scripts/video.py storyboard <proyek> [--buka]  # pratinjau + timestamp + pra-QA (HTML)
    python pipeline/scripts/video.py setuju   <proyek>         # setujui versi beat-sheet di storyboard

<proyek> = path folder, atau nama folder di proyek/ (mis. 2026-10_skill-vs-sertifikat).
"""
from __future__ import annotations

import datetime as dt
import json
import shutil
import sys
from pathlib import Path

from sistem import (LAPISAN, POLA_NAMA, ROOT, GagalPipeline, Proyek, baca_json, daftar_modul, frontmatter, gabung,
                    log, main_aman, resolve, tulis_json)


def cari_proyek(arg: str) -> Path:
    p = Path(arg)
    if p.exists():
        return p
    q = ROOT / "proyek" / arg
    if q.exists():
        return q
    raise GagalPipeline(f"Proyek '{arg}' tidak ditemukan (path atau proyek/<nama>).")


# ------------------------------------------------------------------ baru

def preset_efektif(data: dict, seed: int | None = None) -> dict:
    """Preset yang merujuk koreografi → gabungkan isi koreografi (template, efek, butuh, aset, manifest, beat_sheet).
    Preset boleh menimpa template/manifest; beat_sheet selalu dari koreografi. Koreografi ber-slot (v0.3) dirakit
    dulu untuk gaya preset (slot.py) — seed: argumen > preset "seed" > 0."""
    if not data.get("koreografi"):
        return data
    k = resolve("koreografi", data["koreografi"])
    kd = baca_json(k.path)
    if data.get("gaya"):
        from slot import rakit
        kd = rakit(kd, data["gaya"], data.get("seed", 0) if seed is None else seed, k.nama)
    hasil = dict(data)
    hasil["_pilihan"] = kd.get("_pilihan", [])
    hasil["_variasi"] = kd.get("_variasi")
    hasil["_seed"] = data.get("seed", 0) if seed is None else seed
    for kunci in ("efek", "butuh", "aset", "beat_sheet"):
        if kunci in kd:
            hasil[kunci] = kd[kunci]
    hasil["template"] = data.get("template") or kd["template"]
    hasil["manifest"] = gabung(kd.get("manifest", {}), data.get("manifest", {}))
    hasil["_koreografi"] = k.ref
    hasil["_konteks_tambahan"] = kd.get("konteks_tambahan", [])
    return hasil


def baru(nama: str, gaya: str | None, template: str | None, judul: str | None, preset: str | None = None,
         seed: int | None = None) -> Path:
    pr = resolve("preset", preset) if preset else None
    data = baca_json(pr.path) if pr else {}
    if pr and gaya:
        data["gaya"] = gaya  # gaya lain untuk koreografi yang sama → slot dirakit ulang untuk gaya itu
    data = preset_efektif(data, seed) if pr else {}
    gaya, template = gaya or data.get("gaya"), template or data.get("template")
    if not gaya or not template:
        raise GagalPipeline("Butuh --preset, atau --gaya dan --template.")
    g, t = resolve("gaya", gaya), resolve("template", template)
    id_ = f"{dt.date.today():%Y-%m}_{nama}"
    tujuan = ROOT / "proyek" / id_
    if tujuan.exists():
        raise GagalPipeline(f"{tujuan} sudah ada.")
    shutil.copytree(ROOT / "proyek" / "_template-proyek", tujuan)
    gfm, _ = frontmatter(g.path)
    mf = tujuan / "manifest.json"
    m = gabung(baca_json(mf), data.get("manifest", {}))
    m.update(proyek=id_, judul=judul or nama.replace("-", " ").title(), gaya=g.ref, template=t.ref,
             konteks=gfm.get("konteks", []) + [k for k in data.get("_konteks_tambahan", []) if k not in gfm.get("konteks", [])],
             preset=pr.ref if pr else None, koreografi=data.get("_koreografi"), seed=data.get("_seed"))
    tulis_json(mf, m)
    if data.get("beat_sheet"):
        tulis_json(tujuan / "beat-sheet.json", data["beat_sheet"])
    from arsip import perbarui_index
    perbarui_index(id_, t.ref, g.ref, "brief")
    dari = (f"preset {pr.ref}" + (f" + koreografi {data['_koreografi']}" if data.get("_koreografi") else "") + ", ") if pr else ""
    log("baru", f"{tujuan.relative_to(ROOT)} dibuat ({dari}gaya {g.ref}, template {t.ref}). Isi brief.md lalu naskah.md.")
    butuh = data.get("butuh", {})
    for x in data.get("_pilihan", []):
        log("baru", f"  slot {x['beat']}/{x['slot']}: {x['dipilih']}  (kandidat cocok: {', '.join(x['lolos'])})")
    if data.get("_pilihan"):
        log("baru", f"Varian seed {data.get('_seed')}: {data.get('_variasi')} perangkat berbeda. Varian lain: "
                    f"video.py varian {pr.nama} --n 5 · buat ulang dengan --seed N.")
    if butuh.get("rekaman", True):
        log("baru", "Taruh rekaman di aset/rekaman/take1.mp4 (atau ubah manifest aset.rekaman), lalu: ingest → transkrip → "
                    "video.py pasang <proyek> (anchor kata otomatis + hindari wajah).")
    else:
        log("baru", "Preset tanpa rekaman: isi manifest aset.musik, semua waktu beat-sheet dalam detik.")
    if butuh.get("remotion"):
        log("baru", "Preset ini memakai Remotion: pastikan `npm install` sudah dijalankan di remotion/.")
    if butuh.get("roto"):
        log("baru", "Preset ini memakai elemen depth → tahap roto akan berjalan (lebih lambat).")
    if data.get("aset"):
        tulis_perlu(Proyek(tujuan), data, pr.ref)
        log("baru", f"Preset butuh {len(data['aset'])} aset buatan (klip/grafis efek) → daftar & prompt di aset/PERLU.md.")
    return tujuan


def _prompt_efek(path: Path) -> str:
    """Isi bagian '## Prompt' modul efek (tanpa tanda kutip blok)."""
    _, isi = frontmatter(path)
    bagian = isi.split("## Prompt", 1)
    if len(bagian) < 2:
        return ""
    teks = bagian[1].split("\n## ", 1)[0]
    return " ".join(b.lstrip("> ").strip() for b in teks.strip().splitlines() if b.strip())


def _rasio(teks: str) -> float:
    """'4:5' → tinggi/lebar = 1.25."""
    a, _, b = str(teks).partition(":")
    return float(b) / float(a)


def tulis_perlu(p: Proyek, data: dict, ref: str) -> None:
    """aset/PERLU.md: checklist aset yang harus dibuat sebelum render, dengan spesifikasi & prompt dari modul efek."""
    zx0, _, zx1, _ = p.zona_aman()
    lebar_el = {e["file"]: e.get("lebar", 1.0) for b in data["beat_sheet"]["beats"] for e in b.get("elemen", [])
                if e.get("tipe") == "gambar"}
    baris = [f"# Aset yang perlu disiapkan (preset {ref})", "",
             "Render gagal bila file di bawah belum ada. Centang setelah file diletakkan di path-nya.", ""]
    for a in data["aset"]:
        ef = resolve("efek", a["efek"])
        fm, _ = frontmatter(ef.path)
        rentang = f"{fm['durasi'][0]}–{fm['durasi'][1]} s" if fm.get("durasi") else "mengikuti narasi"
        if a["file"].endswith(".mp4"):
            spek = f"MP4 {p.W}×{p.H} (rasio sama, boleh lebih besar), {p.fps} fps, bt709, durasi {rentang}"
        else:
            lw = int((zx1 - zx0) * lebar_el.get(a["file"], 1.0))
            spek = (f"PNG rasio {a.get('rasio', '?')} — tampil {lw}×{int(lw * _rasio(a.get('rasio', '1:1')))} px "
                    f"(boleh dibuat 2× lebih besar), latar transparan. Rasio lain bisa keluar zona aman (K00.1).")
        baris += [f"## [ ] `{a['file']}`",
                  f"- Efek: **{ef.nama}** ({ef.id}, dukungan {fm.get('dukungan')}) — {ef.rel()}",
                  f"- Isi: {a.get('keterangan', '')}",
                  f"- Spesifikasi: {spek}"]
        if prompt := _prompt_efek(ef.path):
            baris.append(f"- Prompt AI video/gambar: {prompt}")
        baris.append("")
    (p.dir / "aset" / "PERLU.md").write_text("\n".join(baris), encoding="utf-8")


# ------------------------------------------------------------------ preset

def cek_koreografi(m) -> tuple[list[str], list[str]]:
    """Validasi koreografi: struktur, beat_wajib template, dan ritme K09.1–K09.4 pada kerangka beat-sheet-nya."""
    from beat import TIPE_SEMUA
    from perangkat import cek_ritme
    masalah = []
    d = baca_json(m.path)
    for kunci in ("label", "deskripsi", "template", "butuh", "variasi_min", "beat_sheet"):
        if kunci not in d:
            masalah.append(f"{m.rel()}: butuh field '{kunci}'")
    if masalah:
        return masalah, []
    try:
        tfm, _ = frontmatter(resolve("template", d["template"]).path)
    except GagalPipeline as e:
        return [f"{m.rel()}: {e}"], []
    beats = d["beat_sheet"].get("beats", [])
    if kurang := [w for w in tfm.get("beat_wajib", []) if w not in [b.get("id") for b in beats]]:
        masalah.append(f"{m.rel()}: beat_wajib template belum ada: {', '.join(kurang)}")
    plat = baca_json(resolve("tokens", "platform").path)
    k = plat["koreografi"]
    from slot import KANDIDAT
    slot_ok = set(plat.get("slot", {})) | {"transisi", "reveal"}
    ber_slot = False
    for b in beats:
        for e in b.get("elemen", []):
            if "slot" in e:
                ber_slot = True
                if e["slot"] not in slot_ok:
                    masalah.append(f"{m.rel()} beat {b.get('id')}: slot {e['slot']!r} tidak ada di token platform slot")
                if e["slot"] not in ("transisi", "reveal", "kamera") and e["slot"] not in k["fungsi"]:
                    masalah.append(f"{m.rel()} beat {b.get('id')}: slot {e['slot']!r} bukan fungsi K09 ({', '.join(k['fungsi'])})")
                for nk in e.get("kandidat", []):
                    if nk not in KANDIDAT:
                        masalah.append(f"{m.rel()} beat {b.get('id')}: kandidat {nk!r} tidak dikenal (slot.KANDIDAT)")
                continue
            if e.get("tipe") not in TIPE_SEMUA:
                masalah.append(f"{m.rel()} beat {b.get('id')}: tipe {e.get('tipe')!r} tidak dikenal")
            if e.get("efek"):
                try:
                    resolve("efek", e["efek"])
                except GagalPipeline as ex:
                    masalah.append(f"{m.rel()} beat {b.get('id')}: {ex}")
    if not ber_slot:  # koreografi lama: ritme dicek di sini; ber-slot: dicek per preset setelah dirakit (cek_preset)
        for aturan, (ok, pesan) in cek_ritme([(b["id"], b.get("elemen", [])) for b in beats], k["bukan-perangkat"],
                                              k["fungsi"], int(d["variasi_min"])).items():
            if not ok:
                masalah.append(f"{m.rel()}: {aturan} — {'; '.join(pesan)}")
    return masalah, []


class _Tok:
    """Akses token bertitik (seperti Proyek.t) untuk cek tanpa proyek."""
    def __init__(self, tok: dict):
        self.tokens = tok

    def t(self, kunci: str, default=None):
        node = self.tokens
        for k in kunci.split("."):
            if not isinstance(node, dict) or k not in node:
                return default
            node = node[k]
        return node


def cek_jadwal(tok: dict, el: list[dict]) -> list[str]:
    """Hitung jadwal perangkat Remotion (perangkat.py) pada waktu contoh → durasi elemen yang terlalu pendek ketahuan saat cek."""
    from perangkat import PERANGKAT
    pt = _Tok(tok)
    out = []
    for i, e in enumerate(el):
        if e.get("tipe") != "remotion" or not e.get("efek"):
            continue
        a, z = e.get("mulai"), e.get("selesai")
        if not isinstance(a, (int, float)) or not isinstance(z, (int, float)):
            continue
        komp = frontmatter(resolve("efek", e["efek"]).path)[0].get("remotion")
        spek = PERANGKAT.get(komp)
        if not spek:
            continue
        an = {"d_in": float(e.get("durasi_masuk", pt.t("durasi.masuk", 0.35))), "d_out": float(e.get("durasi_keluar", pt.t("durasi.keluar", 0.25)))}
        try:
            spek.jadwal(dict(e, _id=f"{e['efek']}#{i}"), an, pt, z - a)
        except GagalPipeline as ex:
            out.append(str(ex))
    return out


def efek_khas(gaya_nama: str, el: list[dict]) -> list[str]:
    """Efek dipakai yang KHAS gaya ini (modul efek mencantumkan gaya di gaya_cocok yang tidak kosong) — K09.6."""
    khas = []
    for e in el:
        ref = e.get("efek")
        if not ref:
            continue
        try:
            fm, _ = frontmatter(resolve("efek", ref).path)
        except GagalPipeline:
            continue
        if fm.get("gaya_cocok") and gaya_nama in fm["gaya_cocok"]:
            n = str(ref).partition("@")[0]
            if n not in khas:
                khas.append(n)
    return khas


def cek_preset(m) -> tuple[list[str], list[str]]:
    """Validasi satu preset: modul yang dirujuk ada & cocok, beat-sheet awal lolos aturan template/efek."""
    from beat import TIPE_SEMUA
    masalah, info = [], []
    try:
        d = preset_efektif(baca_json(m.path))
        g, t = resolve("gaya", d["gaya"]), resolve("template", d["template"])
    except (KeyError, GagalPipeline) as e:
        return [f"{m.rel()}: gaya/template: {e}"], info
    gfm, _ = frontmatter(g.path)
    tfm, _ = frontmatter(t.path)
    if not d.get("format"):
        masalah.append(f"{m.rel()}: butuh field 'format' (mis. tips, explainer, teks)")
    elif m.nama != f"{g.nama}-{d['format']}":
        masalah.append(f"{m.rel()}: nama preset harus '<gaya>-<format>' = '{g.nama}-{d['format']}'")
    if not d.get("label"):
        masalah.append(f"{m.rel()}: butuh field 'label' (nama tampilan, mis. \"Kaca Gelap · Tips 30–45 s\")")
    for jenis, mod in (("gaya", g), ("template", t)):
        terbaru = resolve(jenis, mod.nama)
        if terbaru.versi != mod.versi:
            info.append(f"preset {m.nama}: memakai {jenis} {mod.ref}, versi aktif {terbaru.versi}")
    if g.nama not in tfm.get("gaya_cocok", []):
        masalah.append(f"{m.rel()}: gaya {g.nama} tidak ada di gaya_cocok template {t.nama}")
    konteks_gaya = {str(k).partition("@")[0] for k in gfm.get("konteks", []) + d.get("_konteks_tambahan", [])}
    bs = d.get("beat_sheet", {})
    beats = bs.get("beats", [])
    ids = [b.get("id") for b in beats]
    if kurang := [w for w in tfm.get("beat_wajib", []) if w not in ids]:
        masalah.append(f"{m.rel()}: beat_wajib template belum ada di beat_sheet: {', '.join(kurang)}")
    efek_dipakai = set()
    for b in beats:
        for e in b.get("elemen", []):
            k = f"{m.rel()} beat {b.get('id')} ({e.get('tipe')})"
            if e.get("tipe") not in TIPE_SEMUA:
                masalah.append(f"{k}: tipe tidak dikenal")
            if e.get("tipe") == "depth" and "depth-typography" not in konteks_gaya:
                masalah.append(f"{k}: elemen depth butuh konteks depth-typography di gaya {g.nama}")
            if e.get("efek"):
                try:
                    ef = resolve("efek", e["efek"])
                except GagalPipeline as ex:
                    masalah.append(f"{k}: {ex}")
                    continue
                efek_dipakai.add(ef.nama)
                efm, _ = frontmatter(ef.path)
                if e.get("tipe") == "remotion" and not efm.get("remotion"):
                    masalah.append(f"{k}: efek {ef.nama} tidak punya Composition Remotion")
                pesan = f"preset {m.nama}: efek {ef.nama} tidak mencantumkan gaya {g.nama} di gaya_cocok"
                if efm.get("gaya_cocok") and g.nama not in efm["gaya_cocok"] and pesan not in info:
                    info.append(pesan)
    for ref in d.get("efek", []):
        try:
            if resolve("efek", ref).nama not in efek_dipakai:
                masalah.append(f"{m.rel()}: efek {ref} tercantum tapi tidak dipakai di beat_sheet")
        except GagalPipeline as ex:
            masalah.append(f"{m.rel()}: {ex}")
    tok = {}
    for r in gfm.get("tokens", []):
        tok = gabung(tok, baca_json(resolve("tokens", r).path))
    za, (rw, rh) = tok["zona-aman"], tok["format"].get("resolusi-referensi", tok["format"]["resolusi"])
    zona_w, zona_h = rw - za["kiri"] - za["kanan"], rh - za["atas"] - za["bawah"]
    rasio_aset = {a.get("file"): a.get("rasio") for a in d.get("aset", [])}
    for b in beats:
        for e in b.get("elemen", []):
            k = f"{m.rel()} beat {b.get('id')} ({e.get('tipe')})"
            if e.get("tipe") == "gambar":
                if not rasio_aset.get(e.get("file")):
                    masalah.append(f"{k}: aset {e.get('file')} butuh 'rasio' (mis. \"1:1\") agar muat zona aman bisa dicek")
                else:
                    lw = zona_w * e.get("lebar", 1.0)
                    lh = lw * _rasio(rasio_aset[e["file"]])
                    if lh > zona_h:
                        masalah.append(f"{k}: {lw:.0f}×{lh:.0f} px melebihi tinggi zona aman {zona_h} px (K00.1) — kecilkan 'lebar'")
            if d.get("butuh", {}).get("rekaman", True) and e.get("tipe") in ("judul", "teks") \
                    and e.get("latar") != "panel" and not e.get("stroke"):
                masalah.append(f"{k}: teks di atas video butuh \"stroke\": true atau \"latar\": \"panel\" (K01.4)")
    file_bs = {e["file"] for b in beats for e in b.get("elemen", []) if e.get("tipe") in ("broll", "gambar") and e.get("file")}
    file_aset = {a.get("file") for a in d.get("aset", [])}
    for f in sorted(file_bs - file_aset):
        masalah.append(f"{m.rel()}: {f} dipakai di beat_sheet tapi tidak ada di daftar aset")
    for f in sorted(file_aset - file_bs):
        masalah.append(f"{m.rel()}: aset {f} tidak dipakai di beat_sheet")
    for a in d.get("aset", []):
        try:
            if resolve("efek", a.get("efek", "")).nama not in efek_dipakai:
                masalah.append(f"{m.rel()}: aset {a.get('file')} merujuk efek {a.get('efek')} yang tidak dipakai")
        except GagalPipeline as ex:
            masalah.append(f"{m.rel()}: aset {a.get('file')}: {ex}")
    butuh = d.get("butuh", {})
    from roto import butuh_mask
    semua_el = [e for b in beats for e in b.get("elemen", [])]
    if butuh.get("roto") != any(butuh_mask(e) for e in semua_el):
        masalah.append(f"{m.rel()}: butuh.roto harus true tepat bila ada elemen yang butuh mask (depth/belakang/kamera mask)")
    pakai_remotion = any(e.get("tipe") == "remotion" for e in semua_el) or \
        any(e.get("tipe") == "transisi" and e.get("jenis") in ("kertas", "coretan") for e in semua_el)
    if butuh.get("remotion") != pakai_remotion:
        masalah.append(f"{m.rel()}: butuh.remotion harus true tepat bila ada elemen remotion / transisi sapuan")
    if d.get("_koreografi"):  # K09 pada beat-sheet hasil rakit + K09.6 efek khas gaya
        from perangkat import cek_ritme
        kp = tok["koreografi"]
        kd = baca_json(resolve("koreografi", d["_koreografi"]).path)
        for aturan, (ok, pesan) in cek_ritme([(b["id"], b.get("elemen", [])) for b in beats], kp["bukan-perangkat"],
                                              kp["fungsi"], int(kd.get("variasi_min", 3))).items():
            if not ok:
                masalah.append(f"{m.rel()}: {aturan} — {'; '.join(pesan)}")
        masalah += [f"{m.rel()}: {x}" for x in cek_jadwal(tok, semua_el)]
        khas = efek_khas(g.nama, semua_el)
        if len(khas) < int(kp.get("khas-min", 2)):
            masalah.append(f"{m.rel()}: K09.6 — efek khas gaya {g.nama} {len(khas)} ({', '.join(khas) or '—'}) "
                           f"< {kp.get('khas-min', 2)}: tambah slot yang punya kandidat khas gaya ini")
        else:
            info.append(f"preset {m.nama}: efek khas {', '.join(khas)} · seed {d.get('_seed')}: {d.get('_variasi')} perangkat")
        for s in (1, 2):  # varian lain juga harus bisa dirakit
            try:
                dv = preset_efektif(baca_json(m.path), s)
                masalah += [f"{m.rel()}: seed {s}: {x}" for x in
                            cek_jadwal(tok, [e for b in dv["beat_sheet"]["beats"] for e in b.get("elemen", [])])]
            except GagalPipeline as ex:
                masalah.append(f"{m.rel()}: seed {s}: {ex}")
    if not butuh.get("rekaman", True):
        if bs.get("caption", {}).get("aktif", True):
            masalah.append(f"{m.rel()}: tanpa rekaman → caption.aktif harus false")
        if beats and beats[-1].get("selesai") is None:
            masalah.append(f"{m.rel()}: tanpa rekaman → beat terakhir wajib punya selesai")
        if '"kata"' in json.dumps(bs):
            masalah.append(f"{m.rel()}: tanpa rekaman → anchor kata tidak bisa dipakai")
    return masalah, info


PRATINJAU = ROOT / "preset" / "pratinjau"
DASAR_PRATINJAU = ROOT / "proyek" / "_pratinjau" / "_dasar"


def _dasar_pratinjau(sumber: str | None) -> Path:
    """Footage contoh untuk preset talking head: ingest + transkrip proyek sumber, diulang sampai ≥ 90 s."""
    cache = DASAR_PRATINJAU / "cache"
    if (cache / "ingest.mp4").exists() and not sumber:
        return cache
    if not sumber:
        raise GagalPipeline("Footage contoh belum ada: jalankan sekali `video.py pratinjau --sumber <proyek>` "
                            "(proyek yang sudah di-ingest & ditranskrip).")
    src = Proyek(cari_proyek(sumber))
    if not (src.ingest_video.exists() and src.words_path.exists()):
        raise GagalPipeline(f"{sumber}: butuh cache/ingest.mp4 dan cache/words.json (jalankan ingest & transkrip).")
    from sistem import durasi, jalankan
    cache.mkdir(parents=True, exist_ok=True)
    d = durasi(src.ingest_video)
    ulang = max(1, int(90 // d))
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stream_loop", ulang, "-i", src.ingest_video,
              "-c", "copy", cache / "ingest.mp4"])
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stream_loop", ulang, "-i", src.ingest_audio,
              "-c", "copy", cache / "audio.wav"])
    w = baca_json(src.words_path)
    kata = [dict(k, s=round(k["s"] + i * d, 3), e=round(k["e"] + i * d, 3)) for i in range(ulang + 1) for k in w["kata"]]
    tulis_json(cache / "words.json", dict(w, kata=kata))
    tulis_json(DASAR_PRATINJAU / "sumber.json", {"proyek": sumber, "durasi_asli": d, "ulang": ulang + 1})
    log("pratinjau", f"footage contoh dari {sumber} ({d:.1f} s × {ulang + 1})")
    return cache


def pratinjau(nama: str | None = None, sumber: str | None = None, resolusi: tuple[int, int] = (540, 960),
              seed: int | None = None) -> None:
    """Video contoh tiap preset (resolusi pratinjau) → preset/pratinjau/<preset>.mp4 (dengan suara), .gif, .png.
    seed ≠ None → nama berkas <preset>-s<seed>.* (varian lain dari preset yang sama)."""
    import render
    from sistem import durasi, jalankan
    daftar = [m for m in daftar_modul("preset", termasuk_arsip=False) if not nama or m.nama == nama]
    if not daftar:
        raise GagalPipeline(f"preset '{nama}' tidak ada.")
    PRATINJAU.mkdir(parents=True, exist_ok=True)
    cache_dasar = None
    for m in daftar:
        d = preset_efektif(baca_json(m.path), seed)
        akhiran = f"-s{seed}" if seed is not None else ""
        g, t = resolve("gaya", d["gaya"]), resolve("template", d["template"])
        gfm, _ = frontmatter(g.path)
        tujuan = ROOT / "proyek" / "_pratinjau" / m.nama
        shutil.rmtree(tujuan, ignore_errors=True)
        shutil.copytree(ROOT / "proyek" / "_template-proyek", tujuan)
        mf = gabung(baca_json(tujuan / "manifest.json"), d.get("manifest", {}))
        mf.update(proyek=f"pratinjau-{m.nama}", gaya=g.ref, template=t.ref, preset=m.ref, koreografi=d.get("_koreografi"),
                  konteks=gfm.get("konteks", []) + [k for k in d.get("_konteks_tambahan", []) if k not in gfm.get("konteks", [])],
                  token_override={"format": {"resolusi": list(resolusi)}})
        tulis_json(tujuan / "beat-sheet.json", d["beat_sheet"])
        if d.get("butuh", {}).get("rekaman", True):
            cache_dasar = cache_dasar or _dasar_pratinjau(sumber)
            (tujuan / "cache").mkdir(exist_ok=True)
            for f in ("ingest.mp4", "audio.wav", "words.json"):
                shutil.copy(cache_dasar / f, tujuan / "cache" / f)
            mf["aset"]["rekaman"] = "pratinjau (footage contoh)"
        tulis_json(tujuan / "manifest.json", mf)
        p = Proyek(tujuan)
        if d.get("butuh", {}).get("roto"):
            import roto
            roto.roto(p)
        log("pratinjau", f"{m.id} {m.nama}: render {resolusi[0]}×{resolusi[1]} …")
        render.Renderer(p).render()
        akhir = max(b["selesai"] for b in beat_selesai(p))
        dur = min(akhir + 0.5, durasi(p.master_path))
        mp4, gif, png = (PRATINJAU / f"{m.nama}{akhiran}.{x}" for x in ("mp4", "gif", "png"))
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", p.master_path, "-t", f"{dur:.2f}",
                  "-c:v", "libx264", "-crf", 27, "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                  "-movflags", "+faststart", mp4])
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", mp4, "-vf",
                  "setpts=PTS/2.5,fps=10,scale=270:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer",
                  gif])
        titik = titik_pratinjau(p)[:7]
        kepingan = []
        for i, x in enumerate(titik):  # satu frame per beat (titik tengah, setelah animasi masuk)
            f = tujuan / f"keping_{i}.png"
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{min(x, dur - 0.1):.2f}", "-i", mp4,
                      "-frames:v", 1, "-vf", "scale=270:-1", f])
            kepingan.append(f)
        masuk = sum((["-i", f] for f in kepingan), [])
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *masuk, "-filter_complex",
                  "".join(f"[{i}]" for i in range(len(kepingan))) + f"hstack={len(kepingan)}", png])
        import laporan
        rows = laporan.elemen_laporan(p, baca_json(p.layout_path))
        laporan.kontak(p, baca_json(p.layout_path), rows, sumber=mp4, lebar=200).replace(PRATINJAU / f"{m.nama}{akhiran}.kontak.png")
        tulis_json(PRATINJAU / f"{m.nama}{akhiran}.json", {
            "preset": m.ref, "seed": d.get("_seed"), "variasi": d.get("_variasi"), "efek": d.get("efek", []),
            "pilihan": d.get("_pilihan", []),
            "perangkat": [{k: r[k] for k in ("beat", "perangkat", "efek", "fungsi", "mulai", "selesai", "luas_layar")} for r in rows]})
        log("pratinjau", f"→ preset/pratinjau/{m.nama}{akhiran}.mp4 · .gif · .png · .kontak.png · .json ({dur:.1f} s)")
        shutil.rmtree(tujuan, ignore_errors=True)


def varian(nama: str, seed: int = 0, n: int = 3, gaya: str | None = None) -> None:
    """Tampilkan pilihan slot untuk beberapa seed (tanpa render) → pilih seed lalu `baru --seed` / `pratinjau --seed`."""
    m = resolve("preset", nama)
    data = baca_json(m.path)
    if gaya:
        data["gaya"] = gaya
    for s in range(seed, seed + n):
        d = preset_efektif(data, s)
        khas = efek_khas(resolve("gaya", d["gaya"]).nama, [e for b in d["beat_sheet"]["beats"] for e in b["elemen"]])
        print(f"■ seed {s}: {d.get('_variasi')} perangkat berbeda · efek khas gaya: {', '.join(khas) or '—'}")
        for x in d.get("_pilihan", []):
            print(f"    {x['beat']:12} {x['slot']:10} → {x['dipilih']:18} (cocok: {', '.join(x['lolos'])})")
    print(f"\nPakai: video.py baru <nama> --preset {m.nama} --seed N   ·   pratinjau: video.py pratinjau {m.nama} --seed N")


def titik_pratinjau(p: Proyek) -> list[float]:
    """Satu waktu per beat: tengah bagian diam perangkat utama (bukan judul/teks/latar/dekoratif), atau tengah beat."""
    L = baca_json(p.layout_path)
    hasil = []
    for b in L["beats"]:
        el = [e for e in L["elemen"] if e.get("beat") == b["id"] and not e.get("induk") and not e.get("dekoratif")
              and e["tipe"] not in ("judul", "teks", "caption", "latar")]
        if el:
            e = max(el, key=lambda e: e["selesai"] - e["mulai"])
            a = e["mulai"] + e.get("delay", 0) + e.get("durasi_masuk", 0)
            z = e["selesai"] - e.get("durasi_keluar", 0)
            hasil.append(round(a + (z - a) * 0.6, 2))
        else:
            hasil.append(round((b["mulai"] + b["selesai"]) / 2, 2))
    return hasil


def beat_selesai(p: Proyek) -> list[dict]:
    """Batas beat ter-resolve dari layout.json render terakhir."""
    return baca_json(p.layout_path)["beats"]


KATALOG = ROOT / "gaya" / "katalog"


def _ciri_palet(gaya_ref: str) -> tuple[str, str]:
    """Ciri pengenal (frontmatter gaya) + palet latar/aksen/aksen-2 (token gaya)."""
    g = resolve("gaya", gaya_ref)
    fm, _ = frontmatter(g.path)
    tok = {}
    for r in fm.get("tokens", []):
        tok = gabung(tok, baca_json(resolve("tokens", r).path))
    w = tok.get("warna", {})
    return ", ".join(fm.get("ciri", [])) or "—", " ".join(w.get(k, "") for k in ("latar", "aksen", "aksen-2"))


def daftar_preset(nama: str | None) -> None:
    semua_p = [(m, preset_efektif(baca_json(m.path))) for m in daftar_modul("preset", termasuk_arsip=False)]
    gaya_aktif = {g.nama for g in daftar_modul("gaya", termasuk_arsip=False)}
    if nama and nama not in gaya_aktif:
        m = resolve("preset", nama)
        d = preset_efektif(baca_json(m.path))
        ciri, palet = _ciri_palet(d["gaya"])
        print(f"{m.id} {d.get('label', m.nama)}   [{m.ref}]  ({m.rel()})")
        for k in ("deskripsi", "kapan", "gaya", "_koreografi", "template"):
            print(f"  {k.lstrip('_'):10}: {d.get(k)}")
        print(f"  {'ciri':10}: {ciri}   palet {palet}")
        print(f"  {'efek':10}: {', '.join(d.get('efek', [])) or '—'}")
        print(f"  {'butuh':10}: {', '.join(k for k, v in d.get('butuh', {}).items() if v) or '—'}")
        print(f"  {'beats':10}: {' → '.join(b['id'] for b in d.get('beat_sheet', {}).get('beats', []))}")
        for a in d.get("aset", []):
            print(f"  {'aset':10}: {a['file']}  ({a['efek']}) {a.get('keterangan', '')}")
        gambar = KATALOG / f"{resolve('gaya', d['gaya']).nama}.png"
        if gambar.exists():
            print(f"  {'contoh':10}: {gambar.relative_to(ROOT).as_posix()}")
        print(f"\n  Pakai: video.py baru <nama> --preset {m.nama}")
        return
    per_gaya: dict[str, list] = {}
    for m, d in semua_p:
        per_gaya.setdefault(resolve("gaya", d["gaya"]).nama, []).append((m, d))
    for gnama in sorted(per_gaya, key=lambda n: resolve("gaya", n).nomor):
        if nama and gnama != nama:
            continue
        ciri, palet = _ciri_palet(gnama)
        print(f"■ {gnama}  —  {ciri}   [{palet}]")
        for m, d in per_gaya[gnama]:
            butuh = [k for k, v in d.get("butuh", {}).items() if v]
            if d.get("aset"):
                butuh.append(f"{len(d['aset'])} aset buatan")
            print(f"  {m.id:5} {m.nama:28} {d.get('label', ''):40} butuh: {', '.join(butuh) or '—'}")
    print("\nDetail: video.py preset <nama-preset>  ·  Per gaya: video.py preset <gaya>  ·  Contoh visual: gaya/katalog/katalog.png")


def katalog(hanya: str | None = None) -> None:
    """Render 1 contoh frame per gaya (judul + kartu + CTA di atas latar gradien) → gaya/katalog/<gaya>.png + katalog.png."""
    import tempfile

    from PIL import Image, ImageDraw, ImageFont

    import render
    from sistem import SETPARAMS_BT709, cari_font, jalankan
    latar = ROOT / "pipeline" / "aset-bawaan" / "katalog-latar.mp4"
    if not latar.exists():
        latar.parent.mkdir(parents=True, exist_ok=True)
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                  "gradients=s=1080x1920:r=30:d=4:c0=0x1d2b64:c1=0xf8cdda:c2=0x3a7bd5:c3=0xff9a3c:n=4:speed=0.01",
                  "-vf", SETPARAMS_BT709, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
                  "-color_trc", "bt709", "-colorspace", "bt709", latar])
    KATALOG.mkdir(parents=True, exist_ok=True)
    daftar = [g for g in daftar_modul("gaya", termasuk_arsip=False) if not hanya or g.nama == hanya]
    if not daftar:
        raise GagalPipeline(f"gaya '{hanya}' tidak ada.")
    for g in daftar:
        fm, _ = frontmatter(g.path)
        teks_video = {"latar": "panel"} if fm.get("teks_di_video", "panel") == "panel" else {"stroke": True}
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp) / "katalog"
            shutil.copytree(ROOT / "proyek" / "_template-proyek", d)
            m = baca_json(d / "manifest.json")
            m.update(proyek=f"katalog-{g.nama}", gaya=g.ref, template="explainer", konteks=[])
            m["aset"]["rekaman"] = None
            tulis_json(d / "manifest.json", m)
            tulis_json(d / "beat-sheet.json", {"caption": {"aktif": False}, "beats": [
                {"id": "hook", "beat": "Hook", "mulai": 0, "selesai": 4.0, "elemen": [
                    {"tipe": "broll", "file": str(latar)},
                    {"tipe": "judul", "teks": f"{g.nama.replace('-', ' ').title()}\n*{(fm.get('ciri') or ['gaya'])[0]}*",
                     "posisi": "atas", **teks_video},
                    {"tipe": "kartu", "judul": "Contoh kartu", "item": ["Poin *penting*", "Langkah kedua", "Langkah ketiga"],
                     "penanda": "•", "posisi": "tengah", "mulai": 0.3},
                    {"tipe": "cta", "teks": "Ikuti untuk lanjut", "posisi": "bawah", "mulai": 0.6}]}]})
            render.Renderer(Proyek(d)).still([3.0])
            shutil.copy(d / "out" / "still_003.00.png", KATALOG / f"{g.nama}.png")
        log("katalog", f"{g.id} {g.nama} → gaya/katalog/{g.nama}.png")
    # lembar kontak semua gaya
    semua_g = [g for g in daftar_modul("gaya", termasuk_arsip=False) if (KATALOG / f"{g.nama}.png").exists()]
    kol, tw, th, label = 5, 270, 480, 64
    baris = (len(semua_g) + kol - 1) // kol
    lembar = Image.new("RGB", (kol * tw, baris * (th + label)), "#111111")
    huruf = ImageFont.truetype(str(cari_font("Montserrat-Bold.ttf")), 18)
    huruf2 = ImageFont.truetype(str(cari_font("Montserrat-Regular.ttf")), 14)
    gb = ImageDraw.Draw(lembar)
    for i, g in enumerate(semua_g):
        x, y = (i % kol) * tw, (i // kol) * (th + label)
        lembar.paste(Image.open(KATALOG / f"{g.nama}.png").convert("RGB").resize((tw, th)), (x, y))
        gb.text((x + 10, y + th + 8), f"{g.id} {g.nama}", font=huruf, fill="#FFFFFF")
        gb.text((x + 10, y + th + 34), ", ".join(frontmatter(g.path)[0].get("ciri", []))[:34], font=huruf2, fill="#BBBBBB")
    lembar.save(KATALOG / "katalog.png")
    log("katalog", f"lembar kontak {len(semua_g)} gaya → gaya/katalog/katalog.png")


# ------------------------------------------------------------------ cek registry

def cek_registry() -> int:
    masalah, info = [], []
    index = (ROOT / "INDEX.md").read_text(encoding="utf-8")
    for jenis, (folder, prefix, ext) in LAPISAN.items():
        aktif = daftar_modul(jenis, termasuk_arsip=False)
        nama = {}
        for f in (ROOT / folder).glob(f"*{ext}"):
            if f.name.startswith("_") or f.name == "README.md":
                continue
            if not POLA_NAMA.match(f.stem):
                masalah.append(f"{f.relative_to(ROOT)}: nama tidak sesuai pola {prefix}_NN_nama_vX.Y{ext}")
        for m in aktif:
            if m.nama in nama:
                masalah.append(f"{jenis}: nama pendek '{m.nama}' dipakai 2 file ({nama[m.nama].name}, {m.path.name})")
            nama[m.nama] = m.path
            if m.rel() not in index:
                masalah.append(f"{m.rel()} belum terdaftar di INDEX.md")
            if ext == ".md":
                fm, _ = frontmatter(m.path)
                if str(fm.get("versi")) != m.versi:
                    masalah.append(f"{m.rel()}: versi frontmatter {fm.get('versi')} ≠ nama file {m.versi}")
                if fm.get("nama") != m.nama:
                    masalah.append(f"{m.rel()}: nama frontmatter {fm.get('nama')!r} ≠ nama file {m.nama!r}")
                if fm.get("id") != m.id:
                    masalah.append(f"{m.rel()}: id frontmatter {fm.get('id')!r} ≠ {m.id}")
                root_tsx = ROOT / "remotion" / "src" / "Root.tsx"
                if fm.get("remotion") and f'id="{fm["remotion"]}"' not in root_tsx.read_text(encoding="utf-8"):
                    masalah.append(f"{m.rel()}: Composition Remotion '{fm['remotion']}' tidak terdaftar di remotion/src/Root.tsx")
                for jenis_ref, kunci in (("tokens", "tokens"), ("konteks", "konteks")):
                    for ref in fm.get(kunci, []) if jenis == "gaya" else []:
                        try:
                            resolve(jenis_ref, ref)
                        except GagalPipeline as e:
                            masalah.append(f"{m.rel()}: {e}")
            else:
                meta = baca_json(m.path).get("_meta", {})
                if meta.get("versi") != m.versi or meta.get("id") != m.nama:
                    masalah.append(f"{m.rel()}: _meta id/versi tidak cocok dengan nama file")
            if jenis in ("preset", "koreografi"):
                mp, ip = (cek_preset if jenis == "preset" else cek_koreografi)(m)
                masalah += mp
                info += ip
        info.append(f"{jenis}: {len(aktif)} modul aktif")
    for d in sorted((ROOT / "proyek").iterdir()):
        if d.is_dir() and not d.name.startswith("_"):
            try:
                pr = Proyek(d)
            except Exception as e:
                masalah.append(f"proyek/{d.name}: {e}")
                continue
            if (d / "split.json").exists():  # layout split: QA struktur split.py (modul, transisi, anchor, hook)
                import split
                mp, ip = split.cek(pr)
                masalah += mp
                info += ip
            if (d / "panggung.json").exists():  # layout panggung (L02): modul, transisi garis, kamera, anchor, hook
                import panggung
                mp, ip = panggung.cek(pr)
                masalah += mp
                info += ip
    for i in info:
        log("cek", i)
    for m in masalah:
        log("cek", f"MASALAH: {m}")
    log("cek", "OK" if not masalah else f"{len(masalah)} masalah")
    return 1 if masalah else 0


# ------------------------------------------------------------------ status

def status(p: Proyek) -> None:
    m = p.manifest
    print(f"Proyek  : {m['proyek']} — {m.get('judul', '')}  [status: {m.get('status')}]")
    print(f"Gaya    : {p.gaya.ref:28} {p.gaya.rel()}")
    print(f"Template: {p.template.ref:28} {p.template.rel()}")
    if m.get("preset"):
        print(f"Preset  : {m['preset']:28} (titik awal; manifest & beat-sheet boleh sudah diubah)")
    for k in p.konteks:
        print(f"Konteks : {k.ref:28} {k.rel()}")
    for t in p.token_modul:
        print(f"Tokens  : {t.ref:28} {t.rel()}")
    print(f"Format  : {p.W}x{p.H}@{p.fps}, zona aman {p.zona_aman()}")
    cek = [("rekaman", p.path_aset(m.get("aset", {}).get("rekaman"))), ("ingest", p.ingest_video),
           ("audio", p.ingest_audio), ("words", p.words_path), ("beat-sheet", p.beat_sheet_path),
           ("layout", p.layout_path), ("master", p.master_path), ("qa", p.out / "qa.json")]
    for nama, f in cek:
        print(f"  {'✓' if f and f.exists() else '·'} {nama:10} {f.relative_to(p.dir) if f and f.is_relative_to(p.dir) else f}")
    if p.masks_dir.exists():
        print(f"  ✓ masks      {len(list(p.masks_dir.glob('*.png')))} frame")


# ------------------------------------------------------------------ semua

def semua(p: Proyek, paksa: bool = False, tanpa_setuju: bool = False) -> int:
    import ekspor
    import ingest
    import qa
    import render
    import roto
    import storyboard
    import transkrip
    storyboard.wajib_persetujuan(p, tanpa_setuju)  # sebelum tahap berat: gagal cepat
    ada_rekaman = bool(p.manifest.get("aset", {}).get("rekaman"))
    if ada_rekaman:
        ingest.ingest(p, paksa)
    bs_mentah = baca_json(p.beat_sheet_path)
    caption = bs_mentah.get("caption", {}).get("aktif", True)
    if ada_rekaman and caption:
        transkrip.transkrip(p, paksa)
    butuh_roto = any(roto.butuh_mask(e) for b in bs_mentah["beats"] for e in b.get("elemen", []))
    if ada_rekaman and butuh_roto:
        roto.roto(p, paksa)
    if ada_rekaman:
        import wajah
        try:
            wajah.wajah(p, paksa)  # fokus digital-zoom + cek K00.3 (menutupi wajah)
        except GagalPipeline as e:
            log("semua", f"PERINGATAN: deteksi wajah dilewati ({e})")
    render.render(p)
    ekspor.ekspor(p)
    hasil = qa.qa(p)
    if hasil["status"] != "LULUS":
        log("semua", "QA GAGAL — lihat out/qa-report.md. Jangan serahkan hasil sebelum lulus.")
        return 1
    log("semua", "QA LULUS. Selesaikan checklist manual di out/qa-report.md, lalu: video.py arsip <proyek>")
    return 0


def split_satu_pintu(p: Proyek, cmd: str) -> int:
    """Proyek layout split (split.json): render/qa lewat split.py agar satu pintu video.py tetap berlaku."""
    import split
    if cmd == "semua":
        raise GagalPipeline("proyek split: setelah storyboard (split.py still) disetujui Zar, jalankan "
                            "video.py render <proyek> lalu video.py qa <proyek>.")
    if cmd == "render":
        split.render(p)
        return 0
    return 0 if split.qa(p) else 1


def panggung_satu_pintu(p: Proyek, cmd: str) -> int:
    """Proyek layout panggung (panggung.json): render/qa lewat panggung.py (satu pintu video.py tetap berlaku)."""
    import panggung
    if cmd == "semua":
        raise GagalPipeline("proyek panggung: setelah storyboard disetujui Zar, jalankan panggung.py siapkan <proyek>, "
                            "lalu video.py render <proyek> dan video.py qa <proyek>.")
    if cmd == "render":
        panggung.render(p)
        return 0
    return 0 if panggung.qa(p) else 1


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, arg = sys.argv[1], sys.argv[2:]
    if cmd == "baru":
        import argparse
        ap = argparse.ArgumentParser(prog="video.py baru")
        ap.add_argument("nama")
        ap.add_argument("--preset", help="nama preset (video.py preset); --gaya/--template menimpa pilihannya")
        ap.add_argument("--gaya")
        ap.add_argument("--template")
        ap.add_argument("--judul")
        ap.add_argument("--seed", type=int, help="varian slot (default: seed preset, 0)")
        a = ap.parse_args(arg)
        baru(a.nama, a.gaya, a.template, a.judul, a.preset, a.seed)
        return 0
    if cmd == "varian":
        import argparse
        ap = argparse.ArgumentParser(prog="video.py varian")
        ap.add_argument("preset")
        ap.add_argument("--seed", type=int, default=0)
        ap.add_argument("--n", type=int, default=3)
        ap.add_argument("--gaya", help="rakit koreografi preset untuk gaya lain")
        a = ap.parse_args(arg)
        varian(a.preset, a.seed, a.n, a.gaya)
        return 0
    if cmd == "referensi":
        import referensi
        sys.argv = ["referensi.py", *arg]
        return referensi.main()
    if cmd == "cek":
        return cek_registry()
    if cmd == "preset":
        daftar_preset(arg[0] if arg else None)
        return 0
    if cmd == "katalog":
        katalog(arg[0] if arg else None)
        return 0
    if cmd == "pratinjau":
        import argparse
        ap = argparse.ArgumentParser(prog="video.py pratinjau")
        ap.add_argument("preset", nargs="?")
        ap.add_argument("--sumber", help="proyek ber-ingest & transkrip sebagai footage contoh (sekali saja)")
        ap.add_argument("--seed", type=int, help="varian slot → <preset>-s<seed>.*")
        a = ap.parse_args(arg)
        pratinjau(a.preset, a.sumber, seed=a.seed)
        return 0
    if cmd == "pratinjau-efek":
        import argparse
        from pratinjau_efek import pratinjau_efek
        ap = argparse.ArgumentParser(prog="video.py pratinjau-efek")
        ap.add_argument("efek", nargs="?")
        ap.add_argument("--gaya", help="gaya untuk semua efek (default: gaya_cocok pertama, lalu glass-tech)")
        ap.add_argument("--paksa", action="store_true", help="render ulang walau pratinjau sudah mutakhir")
        a = ap.parse_args(arg)
        return 1 if pratinjau_efek(a.efek, a.gaya, a.paksa) else 0
    if not arg:
        raise GagalPipeline(f"'{cmd}' butuh <proyek>.")
    folder = cari_proyek(arg[0])
    if cmd == "status":
        status(Proyek(folder))
        return 0
    if (folder / "split.json").exists() and cmd in ("render", "qa", "semua"):
        return split_satu_pintu(Proyek(folder), cmd)
    if (folder / "panggung.json").exists() and cmd in ("render", "qa", "semua"):
        return panggung_satu_pintu(Proyek(folder), cmd)
    if cmd == "semua":
        return semua(Proyek(folder), "--paksa" in arg, "--tanpa-setuju" in arg)
    if cmd == "setuju":
        import storyboard
        storyboard.setuju(Proyek(folder))
        return 0
    if cmd == "still":
        import render
        render.Renderer(Proyek(folder)).still([float(x) for x in arg[1].split(",")])
        return 0
    skrip = {"ingest", "transkrip", "roto", "render", "ekspor", "qa", "arsip", "storyboard", "wajah", "laporan", "pasang"}
    if cmd not in skrip:
        raise GagalPipeline(f"perintah '{cmd}' tidak dikenal. Lihat: video.py --help")
    mod = __import__(cmd)
    sys.argv = [f"{cmd}.py", str(folder), *arg[1:]]
    return mod.main()


if __name__ == "__main__":
    main_aman(main)
