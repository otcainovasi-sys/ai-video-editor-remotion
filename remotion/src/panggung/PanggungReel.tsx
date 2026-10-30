// PanggungReel — layout "panggung" (L02): talking-head satu frame penuh dengan kedalaman 4 lapis.
//   latar bersih (talent di-inpaint, panggung.py) → grafis Belakang → talent ber-alpha (roto bersih) → grafis Depan
// Kamera virtual (kamera.ts) bergerak per adegan + punch-in, tiap lapis ber-parallax. Antar-adegan disambung match cut
// "garis emas": adegan lama menyempit menjadi satu garis emas 7 px (pola brand OTCA), adegan baru membuka dari garis itu.
// Waktu dari props (panggung.py, anchor kata); warna/font dari token; bahasa gerak dari props.gerak.
// Audio TIDAK di sini: suara, musik ber-ducking, dan SFX dicampur & di-master oleh panggung.py (K06).

import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Tokens, rgba } from "../lib/kontrak";
import { pakaiFontToken } from "../lib/font";
import { denyut } from "../split/alat";
import { Warna, ambilWarna } from "../split/Ikon";
import { AdeganPg, Gerak, antara, bz, kameraPada, lapis, mix } from "./kamera";
import { KonteksPg, PUSTAKA_PANGGUNG } from "./Adegan";

export type Kata = { w: string; s: number; e: number };

export type PanggungReelProps = {
  W: number;
  H: number;
  fps: number;
  durasiFrame: number;
  tokens: Tokens;
  zona: [number, number, number, number];
  /** titik asal skala kamera (fraksi tinggi frame) — dekat wajah agar punch-in tidak memotong kepala */
  asal_y: number;
  footage: { talent: string; latar: string };
  /** grade lapis: latar gelap & kabur (brand hitam dominan), rim light aksen di tepi talent (K10 menyatu) */
  grade: { latar_terang: number; latar_blur: number; latar_saturasi: number; rim: number; bayangan: number };
  adegan: AdeganPg[];
  gerak: Gerak;
  ketukan?: { bpm: number; titik?: number[]; denyut?: number } | null;
  /** logo klien: kecil di pita atas sepanjang video, besar di tengah (end card) mulai `akhir` */
  logo?: { src: string; rasio: number; lebar: number; y: number; lebar_akhir: number; y_akhir: number; akhir: number } | null;
  menyatu?: { grain?: boolean; sapuan?: boolean };
  kata: Kata[];
  caption: { y: number; kata_maks: number; karakter_maks: number; jeda_pecah: number };
};

const GARIS_TUTUP = 0.3;
const GARIS_BUKA = 0.45;

// ---------- caption ----------
const halaman = (kata: Kata[], c: PanggungReelProps["caption"]) => {
  const hasil: Kata[][] = [];
  let kini: Kata[] = [];
  for (const k of kata) {
    const akhir = kini[kini.length - 1];
    const panjang = kini.reduce((n, x) => n + x.w.length + 1, 0) + k.w.length;
    if (akhir && (k.s - akhir.e > c.jeda_pecah || kini.length >= c.kata_maks || panjang > c.karakter_maks)) {
      hasil.push(kini);
      kini = [];
    }
    kini.push(k);
  }
  if (kini.length) hasil.push(kini);
  return hasil;
};

/** Caption brand: kata diucapkan putih, kata aktif hitam di pil gradien emas (highlight resmi OTCA). Selalu di bawah
 *  dagu (y per adegan, panggung.json) dan di dalam zona aman. */
const Caption: React.FC<{ pr: PanggungReelProps; wr: Warna; tok: Tokens; hal: Kata[][]; y: number }> = ({ pr, wr, tok, hal, y }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const idx = hal.findIndex((h, i) => {
    const lanjut = hal[i + 1];
    const akhir = lanjut ? Math.min(lanjut[0].s, h[h.length - 1].e + 0.6) : h[h.length - 1].e + 0.8;
    return t >= h[0].s - 0.05 && t < akhir;
  });
  if (idx < 0) return null;
  const h = hal[idx];
  const cap = tok.caption as { redup: number };
  const masuk = antara(t, h[0].s - 0.08, 0.22, bz(pr.gerak.masuk));
  return (
    <div style={{ position: "absolute", top: y, left: pr.zona[0], width: pr.zona[2] - pr.zona[0], display: "flex",
      justifyContent: "center", flexWrap: "wrap", gap: "6px 18px", translate: `0px ${mix(16, 0, masuk)}px`, opacity: masuk,
      fontFamily: tok.font.caption.family, fontWeight: tok.font.caption.weight, fontSize: tok.ukuran.caption, lineHeight: 1.2 }}>
      {h.map((w, i) => {
        const aktif = t >= w.s && t < Math.max(w.e, h[i + 1]?.s ?? w.e + 0.3);
        const u = antara(t, w.s - 0.04, 0.14, bz(pr.gerak.masuk));
        return (
          <span key={i} style={{ position: "relative", padding: "2px 16px", color: aktif ? wr.latar : wr.teks,
            opacity: t >= w.s ? 1 : cap.redup, textShadow: aktif ? "none" : `0 3px 14px ${rgba(wr.latar, 0.85)}` }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: 14, opacity: aktif ? u : 0, scale: String(mix(0.82, 1, u)),
              background: `linear-gradient(90deg, ${wr.aksen}, ${wr.aksen2} 55%, ${wr.bahaya})`,
              boxShadow: `0 8px 22px ${rgba(wr.aksen, 0.45)}` }} />
            <span style={{ position: "relative" }}>{w.w}</span>
          </span>
        );
      })}
    </div>
  );
};

// ---------- gradien & filter bersama (semua dari token) ----------
const DefsPanggung: React.FC<{ wr: Warna; W: number }> = ({ wr, W }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="pg-emas" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={wr.aksen} /><stop offset="0.5" stopColor={wr.aksen2} /><stop offset="1" stopColor={wr.bahaya} />
      </linearGradient>
      <linearGradient id="pg-emas-v" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={wr.aksen2} /><stop offset="0.45" stopColor={wr.aksen} /><stop offset="1" stopColor={wr.bahaya} />
      </linearGradient>
      <linearGradient id="pg-emas-r" gradientUnits="userSpaceOnUse" x1="0" x2={W} y1="0" y2="0">
        <stop offset="0" stopColor={wr.aksen} /><stop offset="0.5" stopColor={wr.aksen2} /><stop offset="1" stopColor={wr.bahaya} />
      </linearGradient>
      {([["pg-terang", wr.aksen2], ["pg-dasar", wr.aksen], ["pg-latar", wr.latar], ["pg-teks", wr.teks]] as const).map(([id, c]) => (
        <linearGradient key={id} id={id} gradientUnits="userSpaceOnUse" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c} /><stop offset="1" stopColor={c} />
        </linearGradient>
      ))}
      <radialGradient id="pg-cahaya">
        <stop offset="0" stopColor={wr.aksen2} stopOpacity={0.55} />
        <stop offset="0.4" stopColor={wr.aksen} stopOpacity={0.22} />
        <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
      </radialGradient>
      <filter id="pg-bloom" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="9" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

// ---------- lapis grafis per adegan ----------
const keadaanGaris = (pr: PanggungReelProps, i: number, t: number) => {
  const a = pr.adegan[i];
  const m = PUSTAKA_PANGGUNG[a.modul];
  const y = m?.garis ?? pr.H * 0.3;
  const n = pr.adegan[i + 1];
  const masukGaris = i > 0 && a.masuk !== "potong";
  const keluarGaris = !!n && a.keluar !== "potong";
  // buka: 0 (garis) → 1 (penuh); tutup: 1 → 0 di akhir adegan
  const buka = masukGaris ? antara(t, a.mulai, GARIS_BUKA, Easing.out(Easing.cubic)) : 1;
  const tutup = keluarGaris ? 1 - antara(t, a.selesai - GARIS_TUTUP, GARIS_TUTUP, Easing.in(Easing.cubic)) : 1;
  return { y, buka: Math.min(buka, tutup) };
};

const LapisAdegan: React.FC<{ pr: PanggungReelProps; i: number; sisi: "Belakang" | "Depan"; font: string; d: number }> = ({
  pr, i, sisi, font, d,
}) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const a = pr.adegan[i];
  const m = PUSTAKA_PANGGUNG[a.modul];
  if (!m) throw new Error(`modul adegan panggung tidak dikenal: ${a.modul}`);
  const Komp = m[sisi];
  if (!Komp || t < a.mulai - 0.02 || t > a.selesai + 0.02) return null;
  const kini = kameraPada(pr.adegan, t, pr.gerak);
  const l = lapis(kini, a.kamera, m.kedalaman ?? 0.8);
  const asal = pr.H * pr.asal_y;
  const { y, buka } = keadaanGaris(pr, i, t);
  // klip menyempit/membuka ke garis y (match cut garis emas); tanpa pudar agar bentuk terbaca satu gerak
  const atas = y * (1 - buka);
  const bawah = (pr.H - y) * (1 - buka);
  const k: KonteksPg = { t, a, g: pr.gerak, font, d };
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${pr.W / 2}px ${asal}px`, scale: String(l.s),
      translate: `0px ${l.ty}px`, clipPath: buka < 0.999 ? `inset(${atas}px 0px ${bawah}px 0px)` : undefined,
      opacity: buka < 0.02 ? 0 : 1 }}>
      <svg viewBox={`0 0 ${pr.W} ${pr.H}`} width={pr.W} height={pr.H} style={{ overflow: "visible" }}>
        <Komp k={k} />
      </svg>
    </div>
  );
};

/** Garis emas yang "membawa" match cut: memanjang saat adegan lama menyempit, meluncur ke y adegan baru, lalu memudar
 *  saat adegan baru membuka — benang merah video (pola brand: garis gradien emas tebal 7). */
const GarisMatch: React.FC<{ pr: PanggungReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  for (let i = 1; i < pr.adegan.length; i++) {
    const a = pr.adegan[i];
    const b = pr.adegan[i - 1];
    if (a.masuk === "potong" || b.keluar === "potong") continue;
    if (t < a.mulai - GARIS_TUTUP || t > a.mulai + GARIS_BUKA) continue;
    const yb = PUSTAKA_PANGGUNG[b.modul]?.garis ?? pr.H * 0.3;
    const ya = PUSTAKA_PANGGUNG[a.modul]?.garis ?? pr.H * 0.3;
    const tutup = antara(t, a.mulai - GARIS_TUTUP, GARIS_TUTUP, Easing.in(Easing.cubic));
    const buka = antara(t, a.mulai, GARIS_BUKA, Easing.out(Easing.cubic));
    const y = mix(yb, ya, antara(t, a.mulai - 0.08, 0.2, Easing.inOut(Easing.cubic)));
    const lebar = mix(240, pr.zona[2] - pr.zona[0], tutup) * mix(1, 0.6, buka);
    const o = t < a.mulai ? tutup : 1 - buka;
    return (
      <svg width={pr.W} height={pr.H} style={{ position: "absolute", inset: 0 }}>
        <line x1={pr.W / 2 - lebar / 2} x2={pr.W / 2 + lebar / 2} y1={y} y2={y} stroke="url(#pg-emas-r)" strokeWidth={7}
          strokeLinecap="round" opacity={o} filter="url(#pg-bloom)" />
        <circle cx={pr.W / 2} cy={y} r={mix(8, 70, tutup) * (1 - buka)} fill={rgba(wr.aksen2, 0.35)} opacity={o} />
      </svg>
    );
  }
  return null;
};

// ---------- latar & talent ----------
const Latar: React.FC<{ pr: PanggungReelProps; wr: Warna; kini: { s: number; dy: number } }> = ({ pr, wr, kini }) => {
  const l = lapis(kini, { s: 1, dy: 0 }, 0.5);
  const g = pr.grade;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${pr.W / 2}px ${pr.H * pr.asal_y}px`,
        scale: String(l.s * 1.04), translate: `0px ${l.ty}px` }}>
        <OffthreadVideo src={staticFile(pr.footage.latar)} muted style={{ width: pr.W, height: pr.H,
          filter: `blur(${g.latar_blur}px) brightness(${g.latar_terang}) saturate(${g.latar_saturasi})` }} />
      </div>
      {/* brand hitam dominan: zona grafis atas jatuh ke hitam, vignet di tepi (K10 menyatu) */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${wr.latar} 0%, ${rgba(wr.latar, 0.85)} 22%, ${rgba(wr.latar, 0.15)} 55%, ${rgba(wr.latar, 0.35)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 55%, ${rgba(wr.latar, 0)} 40%, ${rgba(wr.latar, 0.85)} 100%)` }} />
    </>
  );
};

const Talent: React.FC<{ pr: PanggungReelProps; wr: Warna; kini: { s: number; dy: number }; redup: number }> = ({ pr, wr, kini, redup }) => {
  const g = pr.grade;
  const grade = pr.tokens.grade as { kontras: number; saturasi: number } | undefined;
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${pr.W / 2}px ${pr.H * pr.asal_y}px`, scale: String(kini.s),
      translate: `0px ${kini.dy}px` }}>
      <OffthreadVideo src={staticFile(pr.footage.talent)} transparent muted style={{ width: pr.W, height: pr.H,
        filter: [
          `contrast(${1 + (grade?.kontras ?? 0.06)})`, `saturate(${grade?.saturasi ?? 1})`, `brightness(${mix(0.96, 0.16, redup)})`,
          // rim light aksen tipis di tepi hijab/bahu + bayangan kontak ke latar (talent "berdiri" di panggung)
          `drop-shadow(0px 0px 3px ${rgba(wr.aksen, g.rim * (1 - redup))})`,
          `drop-shadow(0px 30px 60px ${rgba(wr.latar, g.bayangan)})`,
        ].join(" ") }} />
    </div>
  );
};

const Grain: React.FC<{ pr: PanggungReelProps }> = ({ pr }) => {
  const f = useCurrentFrame();
  const g = pr.tokens.grain as { kekuatan: number; ukuran: number };
  return (
    <svg width={pr.W} height={pr.H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: g.kekuatan * 0.04 }}>
      <filter id="pg-grain">
        <feTurbulence type="fractalNoise" baseFrequency={0.9 / g.ukuran} numOctaves={2} seed={f} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={pr.W} height={pr.H} filter="url(#pg-grain)" />
    </svg>
  );
};

/** Sapuan cahaya aksen diagonal melintasi frame tepat setelah tiap match cut garis (cahaya sama menyentuh talent &
 *  grafis → satu ruang, K10). */
const SapuanCahaya: React.FC<{ pr: PanggungReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const a = pr.adegan.find((x, i) => i > 0 && t >= x.mulai - 0.05 && t < x.mulai + 0.9);
  if (!a) return null;
  const u = antara(t, a.mulai - 0.05, 0.95, Easing.inOut(Easing.quad));
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: Math.sin(u * Math.PI) * 0.8,
      background: `linear-gradient(105deg, transparent 38%, ${rgba(wr.aksen, 0.2)} 48%, ${rgba(wr.teks, 0.1)} 50%, ${rgba(wr.aksen, 0.2)} 52%, transparent 62%)`,
      translate: `${mix(-pr.W, pr.W, u)}px 0px` }} />
  );
};

const Logo: React.FC<{ pr: PanggungReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const l = pr.logo;
  if (!l) return null;
  const t = f / pr.fps;
  const u = interpolate(t, [l.akhir, l.akhir + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic) });
  const lebar = mix(l.lebar, l.lebar_akhir, u);
  const y = mix(l.y, l.y_akhir, u);
  return (
    <Img src={staticFile(l.src)} style={{ position: "absolute", left: pr.W / 2 - lebar / 2, top: y - (lebar * l.rasio) / 2, width: lebar,
      filter: `drop-shadow(0 0 ${mix(6, 34, u)}px ${rgba(wr.aksen, mix(0.25, 0.7, u))})` }} />
  );
};

export const PanggungReel: React.FC<PanggungReelProps> = (pr) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const tok = pakaiFontToken(pr.tokens);
  const wr = ambilWarna(tok);
  const hal = React.useMemo(() => halaman(pr.kata, pr.caption), [pr.kata, pr.caption]);
  const kini = kameraPada(pr.adegan, t, pr.gerak);
  // hook #7: frame 0 sudah bergerak — kamera maju menembus bingkai sertifikat (pg-portal) dari 0,9× → kamera adegan 1
  const hook = mix(0.9, 1, antara(t, 0, 0.9, Easing.out(Easing.exp)));
  const kam = { s: kini.s * hook, dy: kini.dy };
  const d = denyut(t, pr.ketukan?.titik) * (pr.ketukan?.denyut ?? 1);
  const redup = pr.logo ? antara(t, pr.logo.akhir, 0.8, Easing.inOut(Easing.cubic)) : 0;
  const a = pr.adegan[kini.i];
  const font = tok.font.judul.family;
  return (
    <AbsoluteFill style={{ backgroundColor: wr.latar }}>
      <DefsPanggung wr={wr} W={pr.W} />
      <Latar pr={pr} wr={wr} kini={kam} />
      {pr.adegan.map((_, i) => <LapisAdegan key={`b${i}`} pr={pr} i={i} sisi="Belakang" font={font} d={d} />)}
      <Talent pr={pr} wr={wr} kini={kam} redup={redup} />
      {pr.adegan.map((_, i) => <LapisAdegan key={`d${i}`} pr={pr} i={i} sisi="Depan" font={font} d={d} />)}
      <GarisMatch pr={pr} wr={wr} />
      {pr.menyatu?.sapuan !== false ? <SapuanCahaya pr={pr} wr={wr} /> : null}
      {pr.menyatu?.grain !== false ? <Grain pr={pr} /> : null}
      <Logo pr={pr} wr={wr} />
      <Caption pr={pr} wr={wr} tok={tok} hal={hal} y={a?.caption_y ?? pr.caption.y} />
    </AbsoluteFill>
  );
};
