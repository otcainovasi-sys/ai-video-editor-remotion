// Pustaka adegan layout "panggung" (L02) — dipakai PanggungReel lewat panggung.json `adegan[].modul`.
// Tiap modul punya lapis Belakang (di balik talent → tertutup kepala/bahu = kedalaman) dan/atau Depan (melintas di
// depan talent). Koordinat = layar 1080×1920 pada kamera DASAR adegan (sama dengan still storyboard); PanggungReel
// menggeser lapis mengikuti kamera dengan parallax `kedalaman`. Waktu kunci `t.*` dalam detik (anchor kata, panggung.py).
// Warna hanya dari gradien token (#pg-emas…, DefsPanggung) + hitam brand; gerak dari props.gerak (bahasa gerak video).

import React from "react";
import { Easing, random } from "remotion";
import { AdeganPg, Gerak, antara, bz, mix } from "./kamera";
import {
  Bicara, Buku, Cangkir, EMAS, EMAS_R, EMAS_V, G, Gerbang, Kampus, Kunci, Mikrofon, Pena, Pesawat, Segel, Sertifikat,
  Tangan, Telinga, garisEmas, TERANG, DASAR, LATAR, TEKS,
} from "./IkonEmas";

export type KonteksPg = {
  /** detik sekarang */
  t: number;
  a: AdeganPg;
  g: Gerak;
  /** family font judul (token) */
  font: string;
  /** denyut ketukan 0..1 (musik) */
  d: number;
};

export type ModulPanggung = {
  Belakang?: React.FC<{ k: KonteksPg }>;
  Depan?: React.FC<{ k: KonteksPg }>;
  /** parallax lapis grafis terhadap kamera (1 = menempel talent, mis. orbit yang mengelilingi tubuh) */
  kedalaman?: number;
  /** y garis emas match cut (px layar) */
  garis?: number;
};

// ---------- alat ----------
const tk = (k: KonteksPg, nama: string, relatif: number) => k.a.t[nama] ?? k.a.mulai + relatif;
/** masuk 0→1 dengan easing & durasi bahasa gerak */
const masuk = (k: KonteksPg, s: number, d?: number) => antara(k.t, s, d ?? k.g.durasi_masuk, bz(k.g.masuk));
const keluar = (k: KonteksPg, s: number, d?: number) => antara(k.t, s, d ?? k.g.durasi_keluar, bz(k.g.keluar));
const gambar = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - Math.min(1, Math.max(0, p)) });
const INOUT = Easing.inOut(Easing.cubic);

const Cahaya: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 1 }) => (
  <circle cx={x} cy={y} r={r} fill="url(#pg-cahaya)" opacity={o} />
);

/** Debu emas melayang pelan (gerak diam latar, deterministik per seed). */
const Debu: React.FC<{ k: KonteksPg; seed: string; n: number; y0: number; y1: number; o?: number }> = ({ k, seed, n, y0, y1, o = 0.6 }) => {
  const u = masuk(k, k.a.mulai, 0.8);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = 60 + random(`${seed}x${i}`) * 960;
        const kec = 6 + random(`${seed}v${i}`) * 14;
        const h = y1 - y0;
        const y = y0 + ((((random(`${seed}y${i}`) * h - (k.t - k.a.mulai) * kec) % h) + h) % h);
        return <circle key={i} cx={x} cy={y} r={1.5 + random(`${seed}r${i}`) * 3.5} fill={TERANG}
          opacity={u * (0.2 + random(`${seed}o${i}`) * (o - 0.2))} />;
      })}
    </>
  );
};

// ---------- 1. Hook: tembus sertifikat ----------
const PortalBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const u = antara(k.t, 0, 0.9, Easing.out(Easing.exp));
  const hati = tk(k, "hati", 1.97);
  const kejut = antara(k.t, hati, 0.7, Easing.out(Easing.cubic));
  const kilat = Math.exp(-k.t / 0.35);
  return (
    <>
      <Cahaya x={540} y={900} r={mix(380, 640, u)} o={0.55 + 0.45 * kilat + 0.2 * k.d} />
      <g opacity={0.55 * (1 - antara(k.t, 1.2, 1.2, INOUT))}>
        {[[60, 180], [1020, 180], [40, 1700], [1040, 1700], [540, 120], [20, 900], [1060, 900]].map(([x, y], i) => (
          <line key={i} x1={540} y1={900} x2={mix(540, x, u)} y2={mix(900, y, u)} stroke={EMAS_R} strokeWidth={5}
            strokeLinecap="round" />
        ))}
      </g>
      {k.t >= hati ? (
        <circle cx={540} cy={880} r={mix(120, 620, kejut)} fill="none" stroke={EMAS_R} strokeWidth={mix(12, 1, kejut)}
          opacity={1 - kejut} filter="url(#pg-bloom)" />
      ) : null}
    </>
  );
};

const PortalDepan: React.FC<{ k: KonteksPg }> = ({ k }) => {
  // frame 0 sudah penuh (hook #7): bingkai sertifikat raksasa terlihat utuh, lalu kamera menembusnya
  const u = antara(k.t, 0, 0.9, Easing.in(Easing.quad));
  const s = mix(0.92, 2.7, u);
  const o = 1 - antara(k.t, 0.55, 0.35, INOUT);
  return (
    <>
      <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`} opacity={o}>
        <rect x={-40} y={140} width={1160} height={1680} rx={34} {...garisEmas(22)} filter="url(#pg-bloom)" />
        <rect x={10} y={190} width={1060} height={1580} rx={22} {...garisEmas(5)} opacity={0.7} />
        <G x={965} y={1690} s={2.2} filter="url(#pg-bloom)"><Segel /></G>
      </g>
      <Debu k={k} seed="portal" n={34} y0={300} y1={1500} o={0.75} />
    </>
  );
};

// ---------- 2. Sertifikat ≠ siap studi ----------
const SertifikatKampusBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tS = tk(k, "sertifikat", 1.0);
  const tK = tk(k, "kampus", 2.0);
  const tB = tk(k, "belum", 2.7);
  const uS = masuk(k, tS);
  const jalur = antara(k.t, tS + 0.3, Math.max(0.4, tB - tS - 0.3), INOUT);
  const putus = masuk(k, tB, 0.35);
  return (
    <>
      <Cahaya x={540} y={620} r={430} o={uS * (0.9 + 0.3 * k.d)} />
      <G x={300} y={mix(660, 600, uS)} r={-7} s={mix(0.9, 1, uS)} o={uS}><Sertifikat font={k.font} /></G>
      {/* jalur sertifikat → kampus; terputus di "belum tentu" (bagian tengah menghilang, lencana ≠ muncul) */}
      <path d="M500 640 C600 520 660 520 720 560" {...garisEmas(7)} strokeDasharray="4 22"
        strokeDashoffset={(1 - jalur) * 300} opacity={jalur * (1 - 0.6 * putus)} />
      <G x={605} y={520} s={mix(0.4, 1, putus)} o={putus} filter="url(#pg-bloom)">
        <circle r={38} fill={LATAR} stroke={EMAS} strokeWidth={5} />
        <path d="M-16 -6 H16 M-16 8 H16 M10 -22 L-10 22" stroke={EMAS} strokeWidth={6} strokeLinecap="round" />
      </G>
      <G x={810} y={640} s={0.9} o={masuk(k, tK, 0.3)}><Kampus p={antara(k.t, tK, 0.9, INOUT)} /></G>
      <Debu k={k} seed="s2" n={20} y0={330} y1={900} />
    </>
  );
};

// ---------- 3. Tangga level A1–C2 ----------
const LEVEL = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TanggaBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tN = tk(k, "naik", 0.7);
  const tD = tk(k, "dicapai", 3.9);
  const jarak = Math.max(0.3, (tD - 0.4 - tN) / 6);
  const dasar = masuk(k, k.a.mulai, 0.7);
  const sorot = masuk(k, tD, 0.5);
  return (
    <>
      <ellipse cx={540} cy={760} rx={520} ry={380} fill="url(#pg-cahaya)" opacity={0.8 + 0.3 * k.d} />
      {LEVEL.map((lab, i) => {
        const x = 150 + i * 140;
        const h = 150 + i * 95;
        const u = masuk(k, tN + i * jarak, 0.45);
        const panas = lab === "B1" || lab === "B2";
        return (
          <g key={lab} opacity={Math.min(1, u * 2)}>
            <rect x={x} y={1080 - h * u} width={92} height={Math.max(0, h * u)} rx={6} fill={LATAR} fillOpacity={0.8}
              stroke={EMAS} strokeWidth={5} />
            {panas ? <rect x={x} y={1080 - h * u} width={92} height={Math.max(0, h * u)} rx={6} fill={EMAS_V} opacity={sorot}
              filter={sorot > 0.01 ? "url(#pg-bloom)" : undefined} /> : null}
            <text x={x + 46} y={1080 - h * u - 22} textAnchor="middle" fontFamily={k.font} fontWeight={800} fontSize={40}
              fill={panas && sorot > 0.5 ? TERANG : DASAR}>{lab}</text>
          </g>
        );
      })}
      <path d="M120 1082 H960" {...garisEmas(7, EMAS_R)} {...gambar(dasar)} />
    </>
  );
};

// ---------- 4. Seberapa siap? (busur ukur) ----------
const UkurBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tT = tk(k, "tapi", 0);
  const tS = tk(k, "siap", 2.6);
  const tA = tk(k, "akademik", 6.2);
  const tH = tk(k, "harian", 7.3);
  const busur = antara(k.t, tT + 0.1, 0.8, bz(k.g.masuk));
  // jarum: naik ke ±135°, lalu ragu (osilasi teredam — inti efek "belum tentu") sejak "seberapa siap"
  const naik = masuk(k, tT + 0.4, 0.9);
  const ragu = k.t > tS ? Math.sin((k.t - tS) * 7) * 14 * Math.exp(-(k.t - tS) / 2.2) : 0;
  const sudut = mix(180, 132, naik) + ragu;
  const r = (sudut * Math.PI) / 180;
  return (
    <>
      <Cahaya x={540} y={600} r={380} o={busur * (0.9 + 0.3 * k.d)} />
      <path d="M300 600 A240 240 0 0 1 780 600" {...garisEmas(14)} {...gambar(busur)} filter="url(#pg-bloom)" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i * Math.PI) / 8;
        return <path key={i} d={`M${540 + 190 * Math.cos(a)} ${600 - 190 * Math.sin(a)} L${540 + 215 * Math.cos(a)} ${600 - 215 * Math.sin(a)}`}
          stroke={TERANG} strokeWidth={5} strokeLinecap="round" opacity={0.8 * masuk(k, tT + 0.3 + (8 - i) * 0.05, 0.3)} />;
      })}
      <g opacity={busur}>
        <path d={`M540 600 L${540 + 170 * Math.cos(r)} ${600 - 170 * Math.sin(r)}`} stroke={TERANG} strokeWidth={9} strokeLinecap="round" />
        <circle cx={540} cy={600} r={16} fill={EMAS} />
      </g>
      <G x={205} y={520} s={mix(0.3, 0.55, masuk(k, tA, 0.4))} o={0.75 * masuk(k, tA, 0.3)}><Kampus /></G>
      <G x={880} y={515} s={mix(0.5, 1, masuk(k, tH, 0.4))} o={0.75 * masuk(k, tH, 0.3)}><Cangkir /></G>
    </>
  );
};

// ---------- 5. Orbit 5 kemampuan kuliah (kedalaman 1: menempel tubuh talent) ----------
const ORBIT = { cx: 500, cy: 1235, rx: 450, ry: 105, rot: -6 };
const IKON_ORBIT: { nama: string; C: React.FC }[] = [
  { nama: "telinga", C: Telinga }, { nama: "buku", C: Buku }, { nama: "diskusi", C: Bicara }, { nama: "tangan", C: Tangan },
  { nama: "mic", C: Mikrofon },
];
const titikOrbit = (a: number) => {
  const x = ORBIT.rx * Math.cos(a);
  const y = ORBIT.ry * Math.sin(a);
  const r = (ORBIT.rot * Math.PI) / 180;
  return { x: ORBIT.cx + x * Math.cos(r) - y * Math.sin(r), y: ORBIT.cy + x * Math.sin(r) + y * Math.cos(r), depan: Math.sin(a) >= 0 };
};
/** Keadaan orbit: sudut tiap ikon + ikon aktif. Ikon aktif berputar ke depan-kanan (sudut 0,9 rad) pada kata kuncinya. */
const keadaanOrbit = (k: KonteksPg) => {
  const target = (j: number) => 0.9 - (j * 2 * Math.PI) / 5;
  let fase = target(0) - 1.2; // sebelum kata pertama: ikon telinga masih di belakang
  let aktif = -1;
  IKON_ORBIT.forEach((ik, j) => {
    const tj = tk(k, ik.nama, 2 + j * 2);
    const u = antara(k.t, tj - 0.25, 0.6, INOUT);
    const dari = j === 0 ? target(0) - 1.2 : target(j - 1);
    if (k.t >= tj - 0.25) fase = mix(dari, target(j), u);
    if (k.t >= tj) aktif = j;
  });
  return { fase, aktif };
};
const IkonOrbit: React.FC<{ k: KonteksPg; lapis: "belakang" | "depan" }> = ({ k, lapis }) => {
  const { fase, aktif } = keadaanOrbit(k);
  const muncul = masuk(k, k.a.mulai + 0.2, 0.8);
  return (
    <>
      {IKON_ORBIT.map((ik, j) => {
        const p = titikOrbit(fase + (j * 2 * Math.PI) / 5);
        if (p.depan !== (lapis === "depan")) return null;
        const nyala = j === aktif ? masuk(k, tk(k, ik.nama, 0), 0.4) : 0;
        const s = (p.depan ? 1.05 : 0.85) * mix(1, 1.38, nyala);
        return (
          <G key={ik.nama} x={p.x} y={p.y} s={s * muncul} o={(p.depan ? 1 : 0.7) * muncul}
            filter={nyala > 0.05 ? "url(#pg-bloom)" : undefined}>
            <circle r={62} fill={LATAR} fillOpacity={0.8} stroke={EMAS} strokeWidth={mix(4, 6, nyala)} />
            <ik.C />
          </G>
        );
      })}
    </>
  );
};
const busurOrbit = (dari: number, ke: number) => {
  const a = titikOrbit(dari);
  const b = titikOrbit(ke);
  return `M${a.x} ${a.y} A${ORBIT.rx} ${ORBIT.ry} ${ORBIT.rot} 0 1 ${b.x} ${b.y}`;
};
const OrbitBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const u = masuk(k, k.a.mulai, 0.9);
  return (
    <>
      <g opacity={0.35 * u}>
        <path d="M160 520 L540 330 L920 520 Z M200 540 V900 M360 540 V900 M720 540 V900 M880 540 V900" {...garisEmas(5)} />
      </g>
      <path d={busurOrbit(Math.PI, 2 * Math.PI)} {...garisEmas(5, EMAS_R)} opacity={0.9} {...gambar(u)} />
      <IkonOrbit k={k} lapis="belakang" />
    </>
  );
};
const OrbitDepan: React.FC<{ k: KonteksPg }> = ({ k }) => (
  <>
    <path d={busurOrbit(0, Math.PI)} {...garisEmas(7, EMAS_R)} {...gambar(masuk(k, k.a.mulai + 0.2, 0.9))} />
    <IkonOrbit k={k} lapis="depan" />
    <Debu k={k} seed="s5" n={10} y0={700} y1={1300} o={0.5} />
  </>
);

// ---------- 6. Jangan hanya level (coret) ----------
const CoretBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const u = masuk(k, tk(k, "kartu", 0.1));
  const redup = masuk(k, tk(k, "coret", 1.0) + 0.3, 0.5);
  return (
    <>
      <Cahaya x={520} y={560} r={360} o={u * (1 - 0.4 * redup)} />
      <G x={520} y={mix(600, 560, u)} s={mix(0.92, 1, u)} o={u * (1 - 0.5 * redup)}>
        <Sertifikat w={460} h={300} bendera={false} label="LEVEL" font={k.font} />
      </G>
    </>
  );
};
const CoretDepan: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const c = antara(k.t, tk(k, "coret", 1.0), 0.22, Easing.out(Easing.cubic));
  return <path d="M180 760 L880 330" stroke={EMAS_R} strokeWidth={16} strokeLinecap="round" {...gambar(c)} filter="url(#pg-bloom)" />;
};

// ---------- 7. Empat kemampuan seimbang ----------
const EMPAT: { nama: string; label: string; C: React.FC; acak: number }[] = [
  { nama: "dengar", label: "Dengar", C: Telinga, acak: 0.55 }, { nama: "bicara", label: "Bicara", C: Bicara, acak: 0.85 },
  { nama: "tulis", label: "Tulis", C: Pena, acak: 0.4 }, { nama: "baca", label: "Baca", C: Buku, acak: 0.7 },
];
const SeimbangBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tS = tk(k, "seimbang", 6.0);
  const rata = antara(k.t, tS, 0.8, INOUT);
  const guna = masuk(k, tk(k, "guna", 7.7), 0.4);
  return (
    <>
      <ellipse cx={540} cy={700} rx={520} ry={360} fill="url(#pg-cahaya)" opacity={0.8 + 0.3 * k.d} />
      {EMPAT.map((e, i) => {
        const x = 210 + i * 220;
        const u = masuk(k, tk(k, e.nama, 1.9 + i * 0.9), 0.5);
        const h = 420 * u * mix(e.acak, 1, rata);
        return (
          <g key={e.nama} opacity={Math.min(1, u * 2)}>
            <rect x={x - 46} y={980 - h} width={92} height={Math.max(0, h)} rx={10} fill={EMAS_V} opacity={0.92}
              filter={rata > 0.5 ? "url(#pg-bloom)" : undefined} />
            <G x={x} y={470}><circle r={56} fill={LATAR} stroke={EMAS} strokeWidth={4} /><e.C /></G>
            <text x={x} y={392} textAnchor="middle" fontFamily={k.font} fontWeight={700} fontSize={34} fill={TERANG}>{e.label}</text>
          </g>
        );
      })}
      <path d="M120 560 H960" {...garisEmas(7, EMAS_R)} strokeDasharray="2 18" opacity={rata} filter="url(#pg-bloom)" />
      <G x={540} y={560} s={mix(0.5, 1, guna)} o={guna} filter="url(#pg-bloom)">
        <circle r={40} fill={LATAR} stroke={EMAS} strokeWidth={5} />
        <path d="M-16 2 L-4 14 L18 -12" {...garisEmas(8)} {...gambar(antara(k.t, tk(k, "guna", 7.7) + 0.1, 0.3, INOUT))} />
      </G>
    </>
  );
};

// ---------- 8. Kunci yang benar-benar terpakai ----------
const KunciBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const bukti = masuk(k, tk(k, "bukti", 2.5), 0.6);
  const pintu = antara(k.t, tk(k, "pintu", 5.5), 0.9, bz(k.g.masuk));
  const busur = "M300 1300 V560 A240 240 0 0 1 780 560 V1300";
  return (
    <>
      <path d={busur} fill="url(#pg-cahaya)" opacity={pintu * (1 + 0.3 * k.d)} />
      <path d={busur} {...garisEmas(9)} {...gambar(pintu)} filter="url(#pg-bloom)" />
      <g opacity={0.5 * pintu} stroke={TERANG} strokeWidth={3}>
        {[0.5, 0.85, 1.2, 1.57, 1.94, 2.3, 2.65].map((a, i) => (
          <path key={i} d={`M540 560 L${540 + 460 * Math.cos(a) * pintu} ${560 - 300 * Math.sin(a) * pintu}`} />
        ))}
      </g>
      {/* sertifikat tinggal bayangan putus-putus: "bukan hanya bukti" */}
      <G x={190} y={470} r={-12} o={mix(0.9, 0.35, bukti) * masuk(k, k.a.mulai, 0.5)}>
        <rect x={-70} y={-48} width={140} height={96} rx={10} {...garisEmas(5)} strokeDasharray={bukti > 0.5 ? "8 10" : undefined} />
      </G>
    </>
  );
};
const KunciDepan: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tK = tk(k, "kunci", 4.1);
  const u = masuk(k, tK, 0.5);
  const putar = antara(k.t, tK + 0.5, 0.45, Easing.inOut(Easing.back(1.2)));
  const klik = Math.exp(-Math.max(0, k.t - (tK + 0.95)) / 0.18) * (k.t >= tK + 0.95 ? 1 : 0);
  return (
    <>
      <G x={860} y={470} r={mix(-75, -28, u) + 90 * putar} s={mix(0.7, 1.15, u) * (1 + 0.08 * klik)} o={u} filter="url(#pg-bloom)">
        <Kunci />
      </G>
      <Debu k={k} seed="s8" n={24} y0={330} y1={1300} o={0.8} />
    </>
  );
};

// ---------- 9. CTA: jalur terbang + link di bio (end card logo di PanggungReel) ----------
const P0: [number, number] = [150, 960];
const P1: [number, number] = [260, 640];
const P2: [number, number] = [520, 470];
const P3: [number, number] = [690, 470];
const bezierPada = (u: number) => {
  const v = 1 - u;
  const b = (i: 0 | 1) => v * v * v * P0[i] + 3 * v * v * u * P1[i] + 3 * v * u * u * P2[i] + u * u * u * P3[i];
  const d = (i: 0 | 1) => 3 * v * v * (P1[i] - P0[i]) + 6 * v * u * (P2[i] - P1[i]) + 3 * u * u * (P3[i] - P2[i]);
  return { x: b(0), y: b(1), sudut: (Math.atan2(d(1), d(0)) * 180) / Math.PI + 90 };
};
const TerbangBelakang: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tL = tk(k, "link", 0);
  const gerbang = antara(k.t, tk(k, "gerbang", 1.8), 1.2, INOUT);
  const jalur = antara(k.t, tL + 0.8, 1.6, INOUT);
  const terbang = antara(k.t, tk(k, "berangkat", 4.0), 1.0, INOUT);
  const akhir = keluar(k, tk(k, "akhir", 4.8), 0.6);
  const p = bezierPada(mix(0.05, 1, terbang));
  return (
    <g opacity={1 - akhir}>
      <Cahaya x={800} y={560} r={330} o={gerbang * (0.9 + 0.3 * k.d)} />
      <G x={800} y={590} s={0.95}><Gerbang p={gerbang} /></G>
      <path d={`M${P0[0]} ${P0[1]} C${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]} ${P3[0]} ${P3[1]}`} {...garisEmas(7)} strokeDasharray="2 22"
        opacity={jalur} />
      <G x={p.x} y={p.y} r={p.sudut} s={1.05} o={masuk(k, tL + 1.2, 0.4)} filter="url(#pg-bloom)"><Pesawat /></G>
    </g>
  );
};
const TerbangDepan: React.FC<{ k: KonteksPg }> = ({ k }) => {
  const tL = tk(k, "link", 0);
  const u = masuk(k, tL, 0.45);
  const tap = antara(k.t, tL + 0.33, 0.12, Easing.out(Easing.quad)) - antara(k.t, tL + 0.45, 0.2, Easing.out(Easing.quad));
  const akhir = keluar(k, tk(k, "akhir", 4.8), 0.6);
  return (
    <g opacity={1 - akhir}>
      <G x={330} y={420} s={mix(0.8, 1, u) * (1 - 0.05 * tap)} o={u}>
        <rect x={-190} y={-50} width={380} height={100} rx={50} fill={EMAS} filter="url(#pg-bloom)" />
        <text x={0} y={16} textAnchor="middle" fontFamily={k.font} fontWeight={800} fontSize={46} fill={LATAR}>Link di bio</text>
        <G x={150 - 14 * tap} y={30 - 10 * tap}>
          <path d="M0 0 l0 70 l18 -16 l14 30 l14 -7 l-14 -29 l24 -2 z" fill={TEKS} stroke={LATAR} strokeWidth={4} strokeLinejoin="round" />
        </G>
      </G>
      <Debu k={k} seed="s9" n={20} y0={330} y1={1000} o={0.7} />
    </g>
  );
};

export const PUSTAKA_PANGGUNG: Record<string, ModulPanggung> = {
  "pg-portal": { Belakang: PortalBelakang, Depan: PortalDepan, garis: 600 },
  "pg-sertifikat-kampus": { Belakang: SertifikatKampusBelakang, garis: 600 },
  "pg-tangga": { Belakang: TanggaBelakang, garis: 1082 },
  "pg-ukur": { Belakang: UkurBelakang, garis: 600 },
  "pg-orbit": { Belakang: OrbitBelakang, Depan: OrbitDepan, kedalaman: 1, garis: 1235 },
  "pg-coret": { Belakang: CoretBelakang, Depan: CoretDepan, garis: 560 },
  "pg-seimbang": { Belakang: SeimbangBelakang, garis: 560 },
  "pg-kunci": { Belakang: KunciBelakang, Depan: KunciDepan, garis: 560 },
  "pg-terbang": { Belakang: TerbangBelakang, Depan: TerbangDepan, garis: 470 },
};
