// OfficeOtca — explainer 16:9 "Blueprint AI Office 3D OTCA" (brand OTCA: hitam dominan, emas #CB9D31, Montserrat).
// Bahasa visual: gedung kantor isometrik bergaris emas (lantai = brand, meja = agent), garis gradien emas tebal 7
// sebagai motif & sapuan transisi, satu "paket tugas" emas yang berjalan di jalur. Semua teks & waktu dari props
// (proyek/2026-11_otca-ai-office/explainer.json); file ini hanya menggambar. Audio dicampur terpisah (K06).

import React, { useState } from "react";
import {
  AbsoluteFill, Easing, Img, Sequence, cancelRender, continueRender, delayRender, getRemotionEnvironment, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

type Teks = Record<string, string>;
type Brand = { nama: string; warna: string; aksen?: string; agent: number; meja: number; fokus: string };
type Pos = { nama: string; asli: string; ikon: string; t: number };
type Kartu = { nama: string; kpi: string; ikon: string; tag: string; t: number };
type Langkah = { nama: string; ket: string; ikon: string; t: number };
type Baris = { kerja: string; oleh: string; t: number };
type Amplop = { nama: string; isi: number; ket: string; t: number };
type Level = { kode: string; nama: string; hari: number };
export type AdeganOtca = {
  id: string; mulai: number; durasi: number; teks: Teks;
  pos?: Pos[]; t_server?: number; t_lantai?: number[]; t_hitung?: number; kartu?: Kartu[]; t_catatan?: number;
  catatan?: string; langkah?: Langkah[]; baris?: Baris[]; t_saklar?: number; amplop?: Amplop[]; t_total?: number;
  level?: Level[]; t_mulai?: number; t_mvp?: number;
};
export type OfficeOtcaProps = {
  W: number; H: number; fps: number; logo: string;
  warna: { hitam: string; panel: string; garis: string; emas: string; emas_muda: string; emas_tua: string; putih: string; redup: string };
  brand: Brand[];
  adegan: AdeganOtca[];
};

type W = OfficeOtcaProps["warna"];
type K = { t: number; w: W; a: AdeganOtca; pr: OfficeOtcaProps };

const SANS = "'Montserrat', 'Segoe UI', sans-serif";
const KELUAR = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.inOut(Easing.cubic);
const PANTUL = Easing.bezier(0.34, 1.45, 0.64, 1);
const TRANSISI = 0.45;

// ───────────── font ─────────────
const BERAT: [string, number][] = [["Regular", 400], ["Medium", 500], ["SemiBold", 600], ["Bold", 700], ["ExtraBold", 800]];
const pakaiFont = () => {
  const [h] = useState(() => {
    const id = delayRender("font Montserrat");
    Promise.all(BERAT.map(([n, wt]) => new FontFace("Montserrat", `url(${staticFile(`fonts/Montserrat-${n}.ttf`)})`, { weight: String(wt) })
      .load().then((f) => { document.fonts.add(f); })))
      .then(() => continueRender(id))
      .catch((e) => {
        if (getRemotionEnvironment().isRendering) cancelRender(e);
        continueRender(id);
      });
    return id;
  });
  void h;
};

// ───────────── alat ─────────────
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** 0→1 dari detik s (relatif adegan) selama d detik. */
const p = (k: K, s: number, d = 0.6, e: (x: number) => number = KELUAR) => interpolate(k.t, [s, s + d], [0, 1], { ...clamp, easing: e });
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
const gambar = (u: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - u });

/** Proyeksi isometrik: (x, y, z) dunia → layar, relatif titik asal. */
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z: number) => ({ x: (x - y) * C30, y: (x + y) * 0.5 - z });
const pt = (x: number, y: number, z: number) => {
  const q = iso(x, y, z);
  return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
};

/** Balok isometrik (pusat alas di 0,0,z): atas, kiri, kanan + garis tepi. */
const Balok: React.FC<{ w: number; d: number; h: number; z?: number; atas: string; kiri: string; kanan: string; tepi?: string;
  lebarTepi?: number; o?: number; tepiU?: number }> = ({ w, d, h, z = 0, atas, kiri, kanan, tepi, lebarTepi = 2, o = 1, tepiU = 1 }) => {
  const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2, z1 = z + h;
  return (
    <g opacity={o}>
      <path d={`M ${pt(x0, y1, z)} L ${pt(x1, y1, z)} L ${pt(x1, y1, z1)} L ${pt(x0, y1, z1)} Z`} fill={kiri} />
      <path d={`M ${pt(x1, y0, z)} L ${pt(x1, y1, z)} L ${pt(x1, y1, z1)} L ${pt(x1, y0, z1)} Z`} fill={kanan} />
      <path d={`M ${pt(x0, y0, z1)} L ${pt(x1, y0, z1)} L ${pt(x1, y1, z1)} L ${pt(x0, y1, z1)} Z`} fill={atas} />
      {tepi ? (
        <path d={`M ${pt(x0, y0, z1)} L ${pt(x1, y0, z1)} L ${pt(x1, y1, z1)} L ${pt(x0, y1, z1)} Z M ${pt(x0, y1, z1)} L ${pt(x0, y1, z)}
          L ${pt(x1, y1, z)} L ${pt(x1, y0, z)} L ${pt(x1, y0, z1)} M ${pt(x1, y1, z1)} L ${pt(x1, y1, z)}`}
          fill="none" stroke={tepi} strokeWidth={lebarTepi} strokeLinejoin="round" {...gambar(tepiU)} />
      ) : null}
    </g>
  );
};

const G: React.FC<{ x?: number; y?: number; s?: number; r?: number; o?: number; children: React.ReactNode }> = ({
  x = 0, y = 0, s = 1, r = 0, o = 1, children,
}) => <g transform={`translate(${x} ${y}) rotate(${r}) scale(${Math.max(0.0001, s)})`} opacity={o}>{children}</g>;

/** Ikon garis 64×64 berpusat di (0,0). */
const Ikon: React.FC<{ n: string; c: string; s?: number; lebar?: number }> = ({ n, c, s = 1, lebar = 4 }) => {
  const st = { fill: "none", stroke: c, strokeWidth: lebar / s, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const d: Record<string, React.ReactNode> = {
    perisai: <path d="M 0 -28 L 24 -18 V 2 Q 24 20 0 30 Q -24 20 -24 2 V -18 Z M -10 0 L -2 8 L 12 -8" {...st} />,
    lonceng: <path d="M -22 14 H 22 M -18 14 Q -18 -18 0 -18 Q 18 -18 18 14 M 0 -18 V -24 M -6 22 H 6" {...st} />,
    orang: <><circle cx={0} cy={-14} r={11} {...st} /><path d="M -22 26 Q -22 2 0 2 Q 22 2 22 26" {...st} /></>,
    buku: <path d="M -26 -18 Q -12 -24 0 -16 Q 12 -24 26 -18 V 22 Q 12 16 0 24 Q -12 16 -26 22 Z M 0 -16 V 24" {...st} />,
    koin: <><ellipse cx={0} cy={-10} rx={22} ry={9} {...st} /><path d="M -22 -10 V 14 Q 0 28 22 14 V -10 M -22 2 Q 0 16 22 2" {...st} /></>,
    kamera: <><rect x={-26} y={-14} width={36} height={26} rx={5} {...st} /><path d="M 10 -6 L 26 -14 V 18 L 10 10 M -14 12 V 26" {...st} /></>,
    pena: <path d="M -20 24 L -16 8 L 12 -20 L 22 -10 L -6 18 Z M 6 -14 L 16 -4 M -20 24 L -8 20" {...st} />,
    film: <><rect x={-26} y={-18} width={52} height={36} rx={5} {...st} /><path d="M -8 -8 L 10 0 L -8 8 Z" {...st} /></>,
    chat: <path d="M -24 -18 H 24 V 10 H 2 L -10 22 V 10 H -24 Z M -12 -4 H 12" {...st} />,
    target: <><circle r={24} {...st} /><circle r={13} {...st} /><circle r={3} fill={c} /></>,
    kalender: <><rect x={-24} y={-18} width={48} height={42} rx={5} {...st} /><path d="M -24 -6 H 24 M -12 -26 V -12 M 12 -26 V -12 M -10 10 L -2 16 L 12 2" {...st} /></>,
    cabang: <><circle cx={-18} cy={0} r={6} {...st} /><circle cx={18} cy={-18} r={6} {...st} /><circle cx={18} cy={18} r={6} {...st} /><path d="M -12 0 H 0 Q 4 -18 12 -18 M 0 0 Q 4 18 12 18" {...st} /></>,
    layar: <><rect x={-28} y={-20} width={56} height={34} rx={4} {...st} /><path d="M -10 26 H 10 M 0 14 V 26 M -14 -4 H 2 M -14 4 H 10" {...st} /></>,
    centang: <><circle r={25} {...st} /><path d="M -12 0 L -3 9 L 13 -9" {...st} /></>,
    kirim: <path d="M -24 -2 L 24 -22 L 12 24 L 2 6 Z M 2 6 L 24 -22" {...st} />,
  };
  return <g transform={`scale(${s})`}>{d[n] ?? <circle r={20} {...st} />}</g>;
};

const Def: React.FC<{ w: W }> = ({ w }) => (
  <defs>
    <linearGradient id="oo-emas" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={w.emas} />
      <stop offset="0.5" stopColor={w.emas_muda} />
      <stop offset="1" stopColor={w.emas_tua} />
    </linearGradient>
    <radialGradient id="oo-cahaya">
      <stop offset="0" stopColor={w.emas} stopOpacity={0.45} />
      <stop offset="1" stopColor={w.emas} stopOpacity={0} />
    </radialGradient>
    <filter id="oo-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

/** Teks HTML yang muncul dari balik masker (naik + pudar). */
const Naik: React.FC<{ u: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ u, children, style }) => (
  <div style={{ overflow: "hidden", paddingBottom: 6, ...style }}>
    <div style={{ translate: `0 ${mix(110, 0, u)}%`, opacity: Math.min(1, u * 1.4) }}>{children}</div>
  </div>
);

const emasTeks: React.CSSProperties = {
  backgroundImage: "linear-gradient(100deg, #CB9D31 0%, #FDF1A4 48%, #B3822C 100%)", WebkitBackgroundClip: "text",
  backgroundClip: "text", color: "transparent",
};

const Judul: React.FC<{ k: K; teks: string; t0?: number; ukuran?: number; x?: number; y?: number; lebar?: number }> = ({
  k, teks, t0 = 0.2, ukuran = 96, x = 120, y = 110, lebar = 1100,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: lebar, fontFamily: SANS, fontWeight: 800, fontSize: ukuran,
    lineHeight: 1.04, color: k.w.putih, letterSpacing: -1.5 }}>
    {teks.split("\n").map((b, i) => <Naik key={i} u={p(k, t0 + i * 0.25, 0.7)}>{b}</Naik>)}
  </div>
);

const Sub: React.FC<{ k: K; teks: string; t0: number; x?: number; y: number; lebar?: number; emas?: boolean; ukuran?: number }> = ({
  k, teks, t0, x = 120, y, lebar = 900, emas, ukuran = 40,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: lebar, fontFamily: SANS, fontWeight: emas ? 700 : 500, fontSize: ukuran,
    lineHeight: 1.3, color: emas ? k.w.emas : k.w.redup }}>
    <Naik u={p(k, t0, 0.7)}>{teks}</Naik>
  </div>
);

/** Latar: hitam + kisi titik isometrik yang bergeser pelan + cahaya emas lembut. */
const Latar: React.FC<{ w: W }> = ({ w }) => {
  const f = useCurrentFrame();
  const { width: Wd, height: Hd, fps } = useVideoConfig();
  const t = f / fps;
  const geser = (t * 6) % 60;
  return (
    <AbsoluteFill style={{ background: w.hitam }}>
      <svg width={Wd} height={Hd} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="oo-kisi" width={104} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${geser * 1.73} ${geser})`}>
            <circle cx={0} cy={0} r={1.6} fill={w.putih} opacity={0.13} />
            <circle cx={52} cy={30} r={1.6} fill={w.putih} opacity={0.13} />
          </pattern>
          <radialGradient id="oo-latar" cx="0.68" cy="0.45" r="0.6">
            <stop offset="0" stopColor={w.emas} stopOpacity={0.12} />
            <stop offset="1" stopColor={w.emas} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={Wd} height={Hd} fill="url(#oo-kisi)" />
        <rect width={Wd} height={Hd} fill="url(#oo-latar)" />
      </svg>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 260px ${w.hitam}` }} />
    </AbsoluteFill>
  );
};

/** Sapuan transisi: garis gradien emas tebal 7 melintas diagonal + kilau, menutupi potongan antar-adegan. */
const Sapuan: React.FC<{ potong: number[]; w: W }> = ({ potong, w }) => {
  const f = useCurrentFrame();
  const { fps, width: Wd, height: Hd } = useVideoConfig();
  const t = f / fps;
  const c = potong.find((x) => Math.abs(t - x) < TRANSISI);
  if (c === undefined) return null;
  const u = interpolate(t, [c - TRANSISI, c + TRANSISI], [0, 1], { ...clamp, easing: INOUT });
  const x = mix(-500, Wd + 500, u);
  return (
    <svg width={Wd} height={Hd} style={{ position: "absolute", inset: 0 }}>
      <Def w={w} />
      <g transform={`translate(${x} ${Hd / 2}) rotate(18)`}>
        <rect x={-160} y={-900} width={320} height={1800} fill={w.emas} opacity={0.07 * Math.sin(u * Math.PI)} />
        <rect x={-3.5} y={-900} width={7} height={1800} fill="url(#oo-emas)" filter="url(#oo-glow)" />
        <rect x={40} y={-900} width={2} height={1800} fill={w.emas_muda} opacity={0.5} />
      </g>
    </svg>
  );
};

// ───────────── adegan ─────────────

/** Gedung isometrik 4 lantai (brand). `u[i]` = muncul lantai i (0..1), `lampu` = nyala meja. */
const Gedung: React.FC<{ k: K; u: number[]; lampu?: number; skala?: number }> = ({ k, u, lampu = 1, skala = 1 }) => {
  const { pr } = k;
  const tinggi = 64;
  const jarak = 118;
  return (
    <g transform={`scale(${skala})`}>
      <ellipse cx={0} cy={60} rx={560} ry={170} fill="url(#oo-cahaya)" opacity={0.6} />
      {pr.brand.map((b, i) => {
        const ui = u[i] ?? 0;
        if (ui <= 0) return null;
        const z = i * jarak + mix(-80, 0, ui);
        const tepi = b.aksen ?? b.warna;
        const n = b.meja;
        return (
          <g key={b.nama} opacity={Math.min(1, ui * 1.5)}>
            <Balok w={520} d={340} h={tinggi} z={z} atas="#141414" kiri="#0A0A0A" kanan="#060606" tepi={tepi} lebarTepi={3} tepiU={ui} />
            {/* garis brand di tepi depan lantai */}
            <path d={`M ${pt(-260, 170, z + tinggi * 0.5)} L ${pt(260, 170, z + tinggi * 0.5)} L ${pt(260, -170, z + tinggi * 0.5)}`}
              fill="none" stroke={b.warna} strokeWidth={7} strokeLinecap="round" filter="url(#oo-glow)" {...gambar(ui)} />
            {Array.from({ length: n }, (_, j) => {
              const kol = j % 3;
              const bar = Math.floor(j / 3);
              const x = -150 + kol * 150;
              const y = -80 + bar * 150;
              const nyala = Math.min(1, Math.max(0, lampu * 1.4 - j * 0.08));
              const q = iso(x, y, z + tinggi + 34);
              return (
                <g key={j}>
                  <g transform={`translate(${iso(x, y, 0).x} ${iso(x, y, 0).y})`}>
                    <Balok w={84} d={50} h={30} z={z + tinggi} atas="#262626" kiri="#151515" kanan="#101010" />
                  </g>
                  <circle cx={q.x} cy={q.y - 10} r={12} fill={b.aksen ?? b.warna} opacity={0.25 + 0.75 * nyala}
                    filter={nyala > 0.5 ? "url(#oo-glow)" : undefined} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

const Hook: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const garis = p(k, -0.5, 1.6, INOUT);
  const isi = p(k, 1.1, 0.7);
  const pisah = p(k, 2.0, 1.4, INOUT);
  const lantaiU = [0, 1, 2, 3].map((i) => p(k, 2.1 + i * 0.18, 0.7));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        <G x={1380} y={mix(600, 650, pisah)}>
          <circle r={mix(240, 420, isi)} fill="url(#oo-cahaya)" opacity={0.5 + 0.3 * isi} />
          <g opacity={1 - pisah}>
            <Balok w={300} d={300} h={300} z={-150} atas={isi > 0 ? "url(#oo-emas)" : "none"} kiri="#0B0B0B" kanan="#050505"
              tepi={w.emas} lebarTepi={7} tepiU={garis} o={1} />
          </g>
          <g opacity={pisah}>
            <Gedung k={k} u={lantaiU} lampu={p(k, 3.0, 1.6)} skala={0.62} />
          </g>
        </G>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 330, fontFamily: SANS }}>
        <Naik u={p(k, 0.2, 0.6)}>
          <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: w.emas }}>{a.teks.eyebrow}</div>
        </Naik>
        <Naik u={p(k, 0.45, 0.8)}>
          <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 1.0, color: w.putih, letterSpacing: -3 }}>{a.teks.judul}</div>
        </Naik>
        <Naik u={p(k, 0.85, 0.8)}>
          <div style={{ fontWeight: 800, fontSize: 150, lineHeight: 1.0, letterSpacing: -2, ...emasTeks }}>{a.teks.brand}</div>
        </Naik>
        <Naik u={p(k, 1.5, 0.7)}>
          <div style={{ fontWeight: 500, fontSize: 44, color: w.redup, marginTop: 18 }}>{a.teks.sub}</div>
        </Naik>
      </div>
    </AbsoluteFill>
  );
};

const Kantor: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const pelat = p(k, 0.2, 0.9);
  const ts = a.t_server ?? 6.5;
  const susut = p(k, ts, 1.0, INOUT);
  const server = p(k, ts + 0.5, 0.8);
  const pos = a.pos ?? [];
  return (
    <AbsoluteFill>
      <Judul k={k} teks={a.teks.judul} ukuran={76} lebar={940} y={150} />
      <Sub k={k} teks={a.teks.sub} t0={0.9} y={345} lebar={640} emas ukuran={42} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        <G x={1330} y={mix(580, 620, susut)} s={mix(0.8, 0.2, susut)} o={1 - susut * 0.9}>
          <Balok w={900} d={620} h={40} z={mix(-60, 0, pelat)} atas="#121212" kiri="#0A0A0A" kanan="#070707" tepi={w.emas} lebarTepi={3}
            tepiU={pelat} o={pelat} />
          {pos.map((s, i) => {
            const u = p(k, s.t, 0.6, PANTUL);
            const kol = i % 3;
            const bar = Math.floor(i / 3);
            const x = -280 + kol * 280;
            const y = -140 + bar * 280;
            const q = iso(x, y, 40);
            return (
              <g key={s.nama} opacity={Math.min(1, u * 2)}>
                <g transform={`translate(${q.x} ${q.y + 20})`}>
                  <Balok w={150} d={90} h={mix(0, 46, u)} atas="#2A2A2A" kiri="#161616" kanan="#101010" tepi={w.emas} lebarTepi={2} />
                </g>
                <G x={q.x} y={q.y - 150 - 10 * u}>
                  <circle r={46} fill={w.panel} stroke={w.emas} strokeWidth={3} filter="url(#oo-glow)" />
                  <Ikon n={s.ikon} c={w.emas} s={1.05} />
                </G>
              </g>
            );
          })}
        </G>
        <G x={1300} y={640} s={mix(0.4, 1, server)} o={server}>
          <ellipse cx={0} cy={40} rx={320} ry={110} fill="url(#oo-cahaya)" />
          <Balok w={260} d={200} h={360} z={0} atas="#1A1A1A" kiri="#0C0C0C" kanan="#080808" tepi={w.emas} lebarTepi={3} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${pt(-110, 100, 40 + i * 52)} L ${pt(110, 100, 40 + i * 52)}`} stroke={i % 2 ? w.emas : w.emas_muda}
              strokeWidth={5} strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(k.t * 3 + i))} filter="url(#oo-glow)" />
          ))}
        </G>
      </svg>
      {/* label pos (HTML, di atas svg) */}
      {pos.map((s, i) => {
        const u = p(k, s.t + 0.15, 0.5);
        const kol = i % 3;
        const bar = Math.floor(i / 3);
        const q = iso(-280 + kol * 280, -140 + bar * 280, 40);
        return (
          <div key={s.nama} style={{ position: "absolute", left: 1330 + q.x * 0.8 - 130, top: 580 + q.y * 0.8 - 40, width: 260,
            textAlign: "center", fontFamily: SANS, opacity: u * (1 - susut), translate: `0 ${mix(14, 0, u)}px` }}>
            <div style={{ fontWeight: 700, fontSize: 30, color: w.putih }}>{s.nama}</div>
            <div style={{ fontWeight: 500, fontSize: 24, color: w.emas }}>{s.asli}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", fontFamily: SANS, fontWeight: 700,
        fontSize: 40, color: w.putih, opacity: p(k, ts + 0.8, 0.6) }}>
        {a.teks.akhir}
      </div>
    </AbsoluteFill>
  );
};

const GedungBrand: React.FC<{ k: K }> = ({ k }) => {
  const { w, a, pr } = k;
  const tl = a.t_lantai ?? [0.5, 1.3, 2.1, 2.9];
  const u = tl.map((t) => p(k, t, 0.8));
  const hitung = Math.round(interpolate(k.t, [a.t_hitung ?? 3.5, (a.t_hitung ?? 3.5) + 1.2], [0, 14], { ...clamp, easing: KELUAR }));
  const gx = 1180;
  const gy = 800;
  const sk = 0.86;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1.04,
        color: w.putih, letterSpacing: -1.5, width: 700 }}>
        <Naik u={p(k, 0.2, 0.7)}>4 brand.</Naik>
        <Naik u={p(k, 0.45, 0.7)}><span style={emasTeks}>{hitung}</span> agent.</Naik>
      </div>
      <Sub k={k} teks={a.teks.sub} t0={1.0} y={390} lebar={620} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        <G x={gx} y={gy}>
          <Gedung k={k} u={u} lampu={p(k, 3.2, 2.0)} skala={sk} />
        </G>
      </svg>
      {pr.brand.map((b, i) => {
        const z = i * 118 + 32;
        const q = iso(260, -170, z);
        const ui = p(k, tl[i] + 0.35, 0.6);
        return (
          <div key={b.nama} style={{ position: "absolute", left: gx + q.x * sk + 40, top: gy + q.y * sk - 40, fontFamily: SANS,
            opacity: ui, translate: `${mix(-20, 0, ui)}px 0`, whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 800, fontSize: 32, color: b.aksen ? b.warna : b.warna }}>{b.nama}</div>
            <div style={{ fontWeight: 500, fontSize: 24, color: w.redup }}>{b.agent} agent + Manager</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const AgentLima: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const kartu = a.kartu ?? [];
  const sapu = p(k, 4.6, 1.4, INOUT);
  return (
    <AbsoluteFill>
      <Judul k={k} teks={a.teks.judul} y={110} />
      <Sub k={k} teks={a.teks.sub} t0={0.6} y={230} lebar={1200} />
      {kartu.map((c, i) => {
        const u = p(k, c.t, 0.8);
        const x = 120 + i * 344;
        const kilau = Math.max(0, 1 - Math.abs(sapu * 6 - i - 0.5) * 1.2);
        return (
          <div key={c.nama} style={{ position: "absolute", left: x, top: 360, width: 320, height: 440, borderRadius: 22,
            background: `linear-gradient(180deg, #151515, ${w.panel})`, border: `2px solid ${kilau > 0.05 ? w.emas : w.garis}`,
            boxShadow: kilau > 0.05 ? `0 0 ${40 * kilau}px rgba(203,157,49,${0.45 * kilau})` : "none",
            opacity: Math.min(1, u * 1.5), translate: `0 ${mix(70, 0, u)}px`, fontFamily: SANS, padding: "34px 28px",
            boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
            <svg width={96} height={96} style={{ overflow: "visible" }}>
              <Def w={w} />
              <G x={48} y={48}>
                <circle r={46} fill="none" stroke="url(#oo-emas)" strokeWidth={3} />
                <Ikon n={c.ikon} c={w.emas} s={1.1} />
              </G>
            </svg>
            <div style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: w.putih, minHeight: 80 }}>{c.nama}</div>
            <div style={{ fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: w.redup }}>{c.kpi}</div>
            <div style={{ flex: 1 }} />
            {c.tag ? (
              <div style={{ alignSelf: "flex-start", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 22,
                ...(c.tag === "OTCA" ? { border: `2px solid ${w.emas}`, color: w.emas } : { background: w.emas, color: w.hitam }) }}>
                {c.tag === "OTCA" ? "Khusus OTCA" : c.tag}
              </div>
            ) : null}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 120, top: 860, width: 1680, fontFamily: SANS, fontWeight: 500, fontSize: 30,
        color: w.putih, opacity: p(k, a.t_catatan ?? 6, 0.6), display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 60, height: 7, borderRadius: 4, background: "linear-gradient(90deg,#CB9D31,#FDF1A4,#B3822C)" }} />
        {a.catatan}
      </div>
    </AbsoluteFill>
  );
};

const Alur: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const lk = a.langkah ?? [];
  const X0 = 170;
  const dx = (1920 - 2 * X0) / (lk.length - 1);
  const Y = 610;
  // posisi paket: berjalan dari simpul i-1 ke i menjelang t_i
  let px = X0 - 120;
  for (let i = 0; i < lk.length; i++) {
    const u = p(k, lk[i].t - 0.6, 0.6, INOUT);
    if (u > 0) px = mix(i === 0 ? X0 - 120 : X0 + (i - 1) * dx, X0 + i * dx, u);
  }
  const garisU = Math.max(0, (px - X0) / (dx * (lk.length - 1)));
  return (
    <AbsoluteFill>
      <Judul k={k} teks={a.teks.judul} y={110} />
      <div style={{ position: "absolute", left: 120, top: 236, fontFamily: SANS, fontWeight: 600, fontSize: 34, color: w.emas,
        opacity: p(k, 0.7, 0.6), translate: `${mix(-30, 0, p(k, 0.7, 0.6))}px 0` }}>{a.teks.tugas}</div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        <path d={`M ${X0} ${Y} H ${1920 - X0}`} stroke={w.garis} strokeWidth={4} />
        <path d={`M ${X0} ${Y} H ${1920 - X0}`} stroke="url(#oo-emas)" strokeWidth={7} strokeLinecap="round" filter="url(#oo-glow)"
          {...gambar(Math.min(1, garisU))} />
        {lk.map((s, i) => {
          const x = X0 + i * dx;
          const muncul = p(k, 1.0 + i * 0.08, 0.5);
          const aktif = p(k, s.t, 0.35, PANTUL);
          const riak = p(k, s.t, 0.9);
          return (
            <G key={s.nama} x={x} y={Y} s={mix(0.6, 1, muncul) * (1 + 0.12 * Math.sin(Math.min(1, aktif) * Math.PI))} o={muncul}>
              {riak > 0 && riak < 1 ? <circle r={mix(56, 110, riak)} fill="none" stroke={w.emas} strokeWidth={3} opacity={1 - riak} /> : null}
              <circle r={56} fill={aktif > 0.5 ? "#1C1608" : w.panel} stroke={aktif > 0.5 ? w.emas : w.garis} strokeWidth={4}
                filter={aktif > 0.5 ? "url(#oo-glow)" : undefined} />
              <Ikon n={s.ikon} c={aktif > 0.5 ? w.emas_muda : w.redup} s={1} />
              <text y={i % 2 ? 108 : -82} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30}
                fill={aktif > 0.5 ? w.putih : w.redup}>{`${i + 1}`}</text>
            </G>
          );
        })}
        {/* paket tugas */}
        <G x={px} y={Y}>
          <rect x={-34} y={-22} width={68} height={44} rx={10} fill="url(#oo-emas)" filter="url(#oo-glow)"
            opacity={p(k, 0.9, 0.4)} />
          <path d="M -18 -6 H 18 M -18 6 H 8" stroke={w.hitam} strokeWidth={4} strokeLinecap="round" opacity={p(k, 0.9, 0.4)} />
        </G>
      </svg>
      {lk.map((s, i) => {
        const x = X0 + i * dx;
        const u = p(k, s.t + 0.05, 0.5);
        const atas = i % 2 === 0;
        return (
          <div key={s.nama} style={{ position: "absolute", left: x - 190, width: 380, top: atas ? Y - 250 : Y + 150, textAlign: "center",
            fontFamily: SANS, opacity: u, translate: `0 ${mix(atas ? 16 : -16, 0, u)}px` }}>
            <div style={{ fontWeight: 800, fontSize: 32, color: w.putih }}>{s.nama}</div>
            <div style={{ fontWeight: 500, fontSize: 25, color: w.redup, lineHeight: 1.3 }}>{s.ket}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Approval: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const [b1, b2] = a.teks.judul.split(". ");
  const ts = a.t_saklar ?? 5;
  const saklar = p(k, ts, 0.45, PANTUL);
  const kunci = p(k, ts - 0.7, 0.6);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 200, width: 860, fontFamily: SANS, fontWeight: 800, fontSize: 84,
        lineHeight: 1.05, letterSpacing: -1.5 }}>
        <Naik u={p(k, 0.2, 0.7)} style={{ color: w.redup }}>{`${b1}.`}</Naik>
        <Naik u={p(k, 0.7, 0.7)} style={{ color: w.putih }}><span style={emasTeks}>{b2}</span></Naik>
      </div>
      <Sub k={k} teks={a.teks.sub} t0={1.3} y={560} lebar={760} ukuran={34} />
      {(a.baris ?? []).map((r, i) => {
        const u = p(k, r.t, 0.6);
        return (
          <div key={r.kerja} style={{ position: "absolute", left: 1040, top: 190 + i * 112, width: 760, height: 92, borderRadius: 16,
            background: w.panel, border: `2px solid ${w.garis}`, display: "flex", alignItems: "center", padding: "0 30px",
            boxSizing: "border-box", fontFamily: SANS, opacity: u, translate: `${mix(50, 0, u)}px 0`, gap: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 30, color: w.putih, width: 300 }}>{r.kerja}</div>
            <div style={{ width: 54, height: 7, borderRadius: 4, background: "linear-gradient(90deg,#CB9D31,#FDF1A4,#B3822C)" }} />
            <div style={{ fontWeight: 600, fontSize: 28, color: w.emas }}>{r.oleh}</div>
          </div>
        );
      })}
      {/* saklar iklan */}
      <div style={{ position: "absolute", left: 1040, top: 690, width: 760, height: 200, borderRadius: 22, border: `2px solid ${
        saklar > 0.5 ? w.emas : w.garis}`, background: w.panel, display: "flex", alignItems: "center", padding: "0 40px", gap: 36,
        boxSizing: "border-box", fontFamily: SANS, opacity: p(k, 3.9, 0.6) }}>
        <div style={{ width: 170, height: 84, borderRadius: 999, background: saklar > 0.5 ? w.emas : "#2A2A2A", position: "relative",
          boxShadow: saklar > 0.5 ? "0 0 40px rgba(203,157,49,0.6)" : "none" }}>
          <div style={{ position: "absolute", top: 8, left: mix(8, 94, saklar), width: 68, height: 68, borderRadius: 999, background: w.putih }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 36, color: w.putih }}>Iklan Meta: {saklar > 0.5 ? "AKTIF" : "MATI"}</div>
          <div style={{ fontWeight: 500, fontSize: 26, color: saklar > 0.5 ? w.emas : w.redup, opacity: 0.4 + 0.6 * kunci }}>
            dinyalakan oleh Budget Approver
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Budget: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const am = a.amplop ?? [];
  const tt = a.t_total ?? 5;
  const total = p(k, tt, 0.8);
  return (
    <AbsoluteFill>
      <Judul k={k} teks={a.teks.judul} y={110} lebar={1680} />
      <Sub k={k} teks={a.teks.sub} t0={0.6} y={232} lebar={1300} emas />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        {am.map((e, i) => {
          const u = p(k, e.t, 0.7, PANTUL);
          const x = 440 + i * 520;
          const y = mix(380, 560, Math.min(1, u));
          const buka = p(k, e.t + 0.5, 0.5);
          return (
            <G key={e.nama} x={x} y={y} o={Math.min(1, u * 2)}>
              <rect x={-190} y={-120} width={380} height={240} rx={18} fill={w.panel} stroke="url(#oo-emas)" strokeWidth={4} />
              <path d={`M -190 -102 L 0 ${mix(30, -60, buka)} L 190 -102`} fill="none" stroke={w.emas} strokeWidth={4}
                strokeLinejoin="round" />
              <text y={50} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={92} fill="url(#oo-emas)">
                {`$${Math.round(interpolate(k.t, [e.t + 0.3, e.t + 1.2], [0, e.isi], { ...clamp, easing: KELUAR }))}`}
              </text>
            </G>
          );
        })}
      </svg>
      {am.map((e, i) => {
        const u = p(k, e.t + 0.4, 0.6);
        return (
          <div key={e.nama} style={{ position: "absolute", left: 440 + i * 520 - 230, width: 460, top: 700, textAlign: "center",
            fontFamily: SANS, opacity: u }}>
            <div style={{ fontWeight: 800, fontSize: 34, color: w.putih }}>{e.nama}</div>
            <div style={{ fontWeight: 500, fontSize: 25, color: w.redup }}>{e.ket}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", fontFamily: SANS, opacity: total,
        scale: String(mix(0.9, 1, total)) }}>
        <span style={{ fontWeight: 800, fontSize: 76, ...emasTeks }}>{a.teks.total}</span>
        <span style={{ fontWeight: 500, fontSize: 30, color: w.redup, marginLeft: 24 }}>{a.teks.total_ket}</span>
      </div>
    </AbsoluteFill>
  );
};

const Roadmap: React.FC<{ k: K }> = ({ k }) => {
  const { w, a } = k;
  const lv = a.level ?? [];
  const totalHari = lv.reduce((n, l) => n + l.hari, 0);
  const X0 = 120;
  const L = 1680;
  const Y = 560;
  const t0 = a.t_mulai ?? 0.8;
  const isi = interpolate(k.t, [t0, t0 + 5.2], [0, totalHari], { ...clamp, easing: INOUT });
  let hari = 0;
  const mvpHari = (lv[0]?.hari ?? 0) + (lv[1]?.hari ?? 0);
  const mvp = p(k, a.t_mvp ?? 3.2, 0.6, PANTUL);
  return (
    <AbsoluteFill>
      <Judul k={k} teks={a.teks.judul} y={130} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        {lv.map((l, i) => {
          const x = X0 + (hari / totalHari) * L;
          const lebar = (l.hari / totalHari) * L;
          const terisi = Math.max(0, Math.min(1, (isi - hari) / l.hari));
          hari += l.hari;
          const atas = i % 2 === 0;
          return (
            <g key={l.kode}>
              <rect x={x + 3} y={Y - 26} width={lebar - 6} height={52} rx={10} fill={w.panel} stroke={w.garis} strokeWidth={2} />
              <rect x={x + 3} y={Y - 26} width={Math.max(0, (lebar - 6) * terisi)} height={52} rx={10} fill="url(#oo-emas)"
                opacity={0.9} />
              <text x={x + lebar / 2} y={Y + 11} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26}
                fill={terisi > 0.5 ? w.hitam : w.redup}>{l.kode}</text>
              <path d={`M ${x + lebar / 2} ${atas ? Y - 34 : Y + 34} V ${atas ? Y - 70 : Y + 70}`} stroke={w.garis} strokeWidth={2}
                opacity={terisi > 0 ? 1 : 0.3} />
              <text x={x + lebar / 2} y={atas ? Y - 84 : Y + 104} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={25}
                fill={terisi > 0 ? w.putih : w.redup}>{l.nama}</text>
              <text x={x + lebar / 2} y={atas ? Y - 118 : Y + 136} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={21}
                fill={w.redup}>{`${l.hari} hari`}</text>
            </g>
          );
        })}
        {/* penanda MVP */}
        <G x={X0 + (mvpHari / totalHari) * L} y={Y + 210} s={mix(0.4, 1, mvp)} o={Math.min(1, mvp * 2)}>
          <path d={`M 0 -150 V 0`} stroke="url(#oo-emas)" strokeWidth={7} strokeLinecap="round" filter="url(#oo-glow)" />
          <circle cy={-150} r={12} fill={w.emas_muda} filter="url(#oo-glow)" />
        </G>
      </svg>
      <div style={{ position: "absolute", left: X0 + (mvpHari / totalHari) * L - 30, top: Y + 230, fontFamily: SANS, fontWeight: 800,
        fontSize: 40, color: w.emas, opacity: mvp, whiteSpace: "nowrap" }}>{a.teks.mvp}</div>
      <div style={{ position: "absolute", left: 120, top: 920, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: w.redup,
        opacity: p(k, 6.6, 0.6) }}>
        Hari ke-<span style={{ color: w.putih }}>{Math.max(1, Math.round(isi))}</span> dari {totalHari}
      </div>
    </AbsoluteFill>
  );
};

const Penutup: React.FC<{ k: K }> = ({ k }) => {
  const { w, a, pr } = k;
  const logo = p(k, 0.3, 0.9);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Def w={w} />
        <G x={1660} y={900} o={0.5}>
          <Gedung k={k} u={[1, 1, 1, 1]} lampu={p(k, 0.2, 1.5)} skala={0.58} />
        </G>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 250, fontFamily: SANS }}>
        <div style={{ opacity: logo, translate: `0 ${mix(20, 0, logo)}px` }}>
          <Img src={staticFile(pr.logo)} style={{ width: 470 }} />
        </div>
        <Naik u={p(k, 0.9, 0.7)} style={{ marginTop: 50 }}>
          <div style={{ fontWeight: 800, fontSize: 104, color: w.putih, letterSpacing: -2 }}>{a.teks.judul}</div>
        </Naik>
        <Naik u={p(k, 1.3, 0.7)}>
          <div style={{ fontWeight: 800, fontSize: 64, ...emasTeks }}>{a.teks.sub}</div>
        </Naik>
        <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 20, opacity: p(k, 2.0, 0.6) }}>
          <div style={{ width: mix(0, 120, p(k, 2.0, 0.8)), height: 7, borderRadius: 4,
            background: "linear-gradient(90deg,#CB9D31,#FDF1A4,#B3822C)" }} />
          <div style={{ fontWeight: 600, fontSize: 28, color: w.redup }}>{a.teks.kaki}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ADEGAN: Record<string, React.FC<{ k: K }>> = {
  hook: Hook, kantor: Kantor, gedung: GedungBrand, agent: AgentLima, alur: Alur, approval: Approval, budget: Budget,
  roadmap: Roadmap, penutup: Penutup,
};

/** Wadah adegan: waktu lokal, masuk/keluar pudar + skala halus (sapuan emas menutupi potongan). Adegan pertama penuh di frame 0. */
const Wadah: React.FC<{ a: AdeganOtca; pr: OfficeOtcaProps; pertama: boolean; terakhir: boolean }> = ({ a, pr, pertama, terakhir }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps - (pertama ? 0 : TRANSISI);
  const Isi = ADEGAN[a.id];
  if (!Isi) throw new Error(`adegan tidak dikenal: ${a.id}`);
  const masuk = pertama ? 1 : interpolate(t, [-TRANSISI * 0.6, 0.15], [0, 1], { ...clamp, easing: KELUAR });
  const keluar = terakhir ? 0 : interpolate(t, [a.durasi - 0.2, a.durasi + TRANSISI * 0.6], [0, 1], { ...clamp, easing: INOUT });
  return (
    <AbsoluteFill style={{ opacity: masuk * (1 - keluar), scale: String(mix(1.03, 1, masuk) * mix(1, 0.97, keluar)),
      filter: masuk < 0.99 || keluar > 0.01 ? `blur(${((1 - masuk) + keluar) * 10}px)` : undefined }}>
      <Isi k={{ t, w: pr.warna, a, pr }} />
    </AbsoluteFill>
  );
};

export const OfficeOtca: React.FC<OfficeOtcaProps> = (pr) => {
  pakaiFont();
  const { fps } = useVideoConfig();
  const potong = pr.adegan.slice(1).map((a) => a.mulai);
  return (
    <AbsoluteFill style={{ background: pr.warna.hitam }}>
      <Latar w={pr.warna} />
      {pr.adegan.map((a, i) => {
        const dari = Math.max(0, Math.round((a.mulai - (i ? TRANSISI : 0)) * fps));
        return (
          <Sequence key={a.id} name={a.id} from={dari} durationInFrames={Math.round((a.durasi + (i ? TRANSISI : 0) + TRANSISI) * fps)}
            premountFor={fps}>
            <Wadah a={a} pr={pr} pertama={i === 0} terakhir={i === pr.adegan.length - 1} />
          </Sequence>
        );
      })}
      <Sapuan potong={potong} w={pr.warna} />
      {/* logo kecil permanen pojok kiri atas (kecuali hook & penutup yang menampilkan brand besar) */}
      <LogoKecil pr={pr} />
    </AbsoluteFill>
  );
};

const LogoKecil: React.FC<{ pr: OfficeOtcaProps }> = ({ pr }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const a0 = pr.adegan[1]?.mulai ?? 6;
  const a1 = pr.adegan[pr.adegan.length - 1]?.mulai ?? 80;
  const o = interpolate(t, [a0, a0 + 0.6, a1 - 0.4, a1], [0, 1, 1, 0], clamp);
  return o > 0 ? <Img src={staticFile(pr.logo)} style={{ position: "absolute", right: 110, top: 70, width: 190, opacity: o * 0.9 }} /> : null;
};
