// Ikon & objek garis emas untuk pustaka adegan panggung (koordinat lokal berpusat 0,0 — sama dengan storyboard
// OTCA "Satu Garis Emas"). Isian/garis memakai gradien global dari <DefsPanggung> (PanggungReel):
//   #pg-emas   objectBoundingBox (ikon ber-luas)    #pg-emas-v  vertikal (batang, pita)
//   #pg-emas-r userSpaceOnUse selebar frame (garis lurus — bbox tinggi 0 tidak bisa memakai objectBoundingBox)

import React from "react";

export const EMAS = "url(#pg-emas)";
export const EMAS_V = "url(#pg-emas-v)";
export const EMAS_R = "url(#pg-emas-r)";
/** warna padat token (gradien satu warna userSpaceOnUse — aman juga untuk garis lurus) */
export const TERANG = "url(#pg-terang)";
export const DASAR = "url(#pg-dasar)";
export const LATAR = "url(#pg-latar)";
export const TEKS = "url(#pg-teks)";
/** Bendera Jerman = isi konten (fakta), bukan warna gaya — sengaja literal. */
const BENDERA = ["#111111", "#D40000", "#F3CF45"];

export const garisEmas = (lebar = 7, stroke = EMAS) => ({
  fill: "none",
  stroke,
  strokeWidth: lebar,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Grup ber-transform (posisi, skala, rotasi derajat, opasitas). Skala 0 dijaga agar SVG tidak menghilangkan filter. */
export const G: React.FC<{ x?: number; y?: number; s?: number; r?: number; o?: number; filter?: string; children: React.ReactNode }> = ({
  x = 0, y = 0, s = 1, r = 0, o = 1, filter, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${Math.max(s, 0.0001)})`} opacity={o} filter={filter}>
    {children}
  </g>
);

export const Segel: React.FC = () => (
  <>
    <circle r={34} fill={EMAS} />
    <circle r={22} fill="none" stroke={LATAR} strokeOpacity={0.35} strokeWidth={4} />
    <path d="M-18 28 L-26 70 L-8 58 L0 74 L8 58 L26 70 L18 28" fill={EMAS_V} />
  </>
);

export const Telinga: React.FC = () => (
  <>
    <path d="M-14 22 C-30 6 -24 -30 4 -30 C26 -30 32 -6 20 8 C12 18 8 20 8 30 C8 40 -4 42 -10 34" {...garisEmas(7)} />
    <path d="M-4 -8 C-2 -18 14 -16 12 -4" {...garisEmas(6)} />
  </>
);

export const Buku: React.FC = () => (
  <path d="M0 -20 C-14 -30 -34 -30 -44 -24 V26 C-34 20 -14 20 0 30 C14 20 34 20 44 26 V-24 C34 -30 14 -30 0 -20 Z M0 -20 V30"
    {...garisEmas(6)} />
);

export const Bicara: React.FC = () => (
  <>
    <rect x={-44} y={-30} width={54} height={38} rx={10} {...garisEmas(6)} />
    <path d="M-30 8 L-36 22 L-18 8" {...garisEmas(6)} />
    <rect x={-6} y={-8} width={50} height={36} rx={10} fill={EMAS} />
    <path d="M30 28 L36 40 L20 28" fill={EMAS} />
  </>
);

export const Tangan: React.FC = () => (
  <path d="M-16 34 V-6 M-16 -6 V-30 C-16 -38 -4 -38 -4 -30 V-4 M-4 -30 V-36 C-4 -44 8 -44 8 -36 V-4 M8 -32 C8 -40 20 -40 20 -32 V-2 M20 -22 C20 -30 30 -30 30 -22 V10 C30 26 18 36 4 36 H-10 C-20 36 -28 26 -32 16 L-38 0 C-40 -8 -30 -12 -26 -4 L-16 12"
    {...garisEmas(6)} />
);

export const Mikrofon: React.FC = () => (
  <>
    <rect x={-14} y={-38} width={28} height={48} rx={14} fill={EMAS} />
    <path d="M-26 -4 C-26 16 -14 26 0 26 C14 26 26 16 26 -4 M0 26 V40 M-16 40 H16" {...garisEmas(6)} />
  </>
);

export const Pena: React.FC = () => (
  <path d="M-26 30 L-20 8 L14 -26 C20 -32 30 -22 24 -16 L-10 18 Z M-20 8 L-10 18" {...garisEmas(6)} />
);

/** Gedung kampus (pediment + 4 kolom); `p` 0→1 menggambar garis berurutan. */
export const Kampus: React.FC<{ p?: number }> = ({ p = 1 }) => {
  const g = (i: number) => Math.min(1, Math.max(0, p * 4 - i));
  const dash = (v: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - v });
  return (
    <>
      <path d="M-130 -40 L0 -110 L130 -40 Z" {...garisEmas(7)} {...dash(g(0))} />
      <path d="M-120 -40 H120 M-120 110 H120 M-140 132 H140" {...garisEmas(7, EMAS_R)} {...dash(g(1))} />
      <path d="M-90 -20 V95 M-30 -20 V95 M30 -20 V95 M90 -20 V95" {...garisEmas(12, EMAS_V)} {...dash(g(2))} />
    </>
  );
};

export const Cangkir: React.FC = () => (
  <>
    <path d="M-40 -20 H30 V30 C30 50 -40 50 -40 30 Z M30 -6 C56 -6 56 22 30 22" {...garisEmas(7)} />
    <path d="M-22 -40 C-28 -50 -16 -56 -22 -66 M0 -40 C-6 -50 6 -56 0 -66" {...garisEmas(5)} />
  </>
);

export const Gerbang: React.FC<{ p?: number }> = ({ p = 1 }) => {
  const dash = (v: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - Math.min(1, Math.max(0, v)) });
  return (
    <>
      <path d="M-170 -60 H170 M-150 -60 V-90 H150 V-60 M-40 -90 V-120 H40 V-90" {...garisEmas(7)} {...dash(p * 2)} />
      <path d="M-140 -40 V140 M-84 -40 V140 M-28 -40 V140 M28 -40 V140 M84 -40 V140 M140 -40 V140" {...garisEmas(14, EMAS_V)}
        {...dash(p * 2 - 0.6)} />
      <path d="M-170 160 H170" {...garisEmas(7, EMAS_R)} {...dash(p * 2 - 1)} />
      <path d="M-14 -120 L0 -150 L14 -120" {...garisEmas(6)} {...dash(p * 2 - 1)} />
    </>
  );
};

export const Pesawat: React.FC = () => (
  <path d="M0 -40 C6 -40 8 -30 8 -20 V-6 L44 14 V24 L8 12 V30 L20 40 V46 L0 40 L-20 46 V40 L-8 30 V12 L-44 24 V14 L-8 -6 V-20 C-8 -30 -6 -40 0 -40 Z"
    fill={EMAS} />
);

export const Kunci: React.FC = () => (
  <>
    <circle cx={-52} cy={0} r={34} {...garisEmas(10)} />
    <circle cx={-52} cy={0} r={10} fill={EMAS} />
    <path d="M-18 0 H96 M60 0 V30 M84 0 V22" {...garisEmas(12)} />
  </>
);

/** Kartu sertifikat: bingkai emas, bendera Jerman kecil opsional, baris teks, segel; `label` = pil emas (mis. LEVEL). */
export const Sertifikat: React.FC<{ w?: number; h?: number; bendera?: boolean; label?: string; font?: string }> = ({
  w = 370, h = 250, bendera = true, label, font,
}) => (
  <>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} {...garisEmas(7)} fill={LATAR} fillOpacity={0.85} />
    {bendera ? (
      <>
        <rect x={-w / 2 + 25} y={-h / 2 + 25} width={62} height={14} fill={BENDERA[0]} />
        <rect x={-w / 2 + 25} y={-h / 2 + 38} width={62} height={14} fill={BENDERA[1]} />
        <rect x={-w / 2 + 25} y={-h / 2 + 52} width={62} height={13} fill={BENDERA[2]} />
      </>
    ) : null}
    {label ? (
      <g transform={`translate(${-w / 2 + 145} ${-h / 2 + 72})`}>
        <rect x={-105} y={-32} width={210} height={64} rx={32} fill={EMAS} />
        <text x={0} y={14} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill={LATAR}>{label}</text>
      </g>
    ) : null}
    <path d={`M${-w / 2 + 25} ${label ? 10 : -20} H${w / 2 - 110} M${-w / 2 + 25} ${label ? 54 : 14} H${w / 2 - 140}${label ? "" : ` M${-w / 2 + 25} 46 H${w / 2 - 180}`}`}
      stroke={DASAR} strokeOpacity={0.5} strokeWidth={label ? 12 : 10} strokeLinecap="round" />
    <G x={w / 2 - 67} y={h / 2 - 63}><Segel /></G>
  </>
);
