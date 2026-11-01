// Pustaka adegan "tinta bara" (split-layout): arang hangat + gading + aksen bara oranye (token_override proyek).
// Bahasa visual: sapuan kuas tinta (ensō) yang awalnya goyah & putus lalu menjadi lingkaran utuh di akhir video
// (bookend + match cut), percik bara sebagai "nyala usaha", siluet garis gading untuk manusia. Tanpa teks kecuali segel akhir.
// Area konten adegan: x 108..972, y 300..860 (fade panggung mulai ±880).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { G, Orang, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const CY = 580;
const TAU = Math.PI * 2;

/** Derau halus deterministik (jumlah sinus) untuk goyangan tangan pemula. */
const goyang = (u: number, seed: number) =>
  Math.sin(u * 7.1 + seed) * 0.55 + Math.sin(u * 13.7 + seed * 2.3) * 0.3 + Math.sin(u * 23.3 + seed * 4.1) * 0.15;

/** Sapuan ensō sebagai bidang terisi: jari `r`, sapuan dari sudut `a0` sepanjang `sapu` (rad) × p, tebal meruncing.
 *  `goyah` 0..1 = tangan gemetar (jari & tebal bergoyang), `putus` = celah [u0,u1] dalam 0..1 sapuan (kuas terangkat). */
const jalurEnso = (r: number, p: number, tebal: number, goyah: number, seed: number, a0 = -2.2, sapu = TAU * 0.93,
  putus?: [number, number]) => {
  const n = Math.max(2, Math.round(160 * p));
  const segmen: { x: number; y: number; w: number }[][] = [[]];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * p;
    if (putus && u > putus[0] && u < putus[1]) {
      if (segmen[segmen.length - 1].length) segmen.push([]);
      continue;
    }
    const a = a0 + sapu * u;
    const rr = r * (1 + goyah * 0.07 * goyang(u * 3, seed));
    // kuas: tebal penuh di awal, menipis & pecah di ujung sapuan
    const w = tebal * (0.35 + 0.65 * Math.sin(Math.min(1, u * 6) * Math.PI * 0.5)) * (1 - 0.75 * u ** 2.2) *
      (1 + goyah * 0.35 * goyang(u * 5, seed + 9));
    segmen[segmen.length - 1].push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, w: Math.max(0.6, w) });
  }
  return segmen.filter((s) => s.length > 1).map((s) => {
    const luar = s.map((q) => {
      const l = Math.hypot(q.x, q.y) || 1;
      return `${(q.x + (q.x / l) * q.w * 0.5).toFixed(1)} ${(q.y + (q.y / l) * q.w * 0.5).toFixed(1)}`;
    });
    const dalam = s.slice().reverse().map((q) => {
      const l = Math.hypot(q.x, q.y) || 1;
      return `${(q.x - (q.x / l) * q.w * 0.5).toFixed(1)} ${(q.y - (q.y / l) * q.w * 0.5).toFixed(1)}`;
    });
    return `M ${luar.join(" L ")} L ${dalam.join(" L ")} Z`;
  });
};

/** Gurat bulu kuas kering: garis tipis sejajar sapuan pada jarak `off` dari jari (dipakai Enso sebagai tekstur). */
const guratBulu = (r: number, p: number, off: number, goyah: number, seed: number, a0 = -2.2, sapu = TAU * 0.93) => {
  const n = Math.max(2, Math.round(120 * p));
  const titik = Array.from({ length: n + 1 }, (_, i) => {
    const u = (i / n) * p;
    const rr = r * (1 + goyah * 0.07 * goyang(u * 3, seed)) + off * (1 - 0.75 * u ** 2.2);
    const a = a0 + sapu * u;
    return `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return `M ${titik.join(" L ")}`;
};

/** Ensō: bidang tinta gading + tepi bara bercahaya. Kembalikan juga posisi ujung kuas (untuk percik/kuas). */
const ujungEnso = (r: number, p: number, goyah: number, seed: number, a0 = -2.2, sapu = TAU * 0.93) => {
  const a = a0 + sapu * p;
  const rr = r * (1 + goyah * 0.07 * goyang(p * 3, seed));
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, a };
};

const Enso: React.FC<{ wr: Warna; r: number; p: number; tebal?: number; goyah?: number; seed?: number; putus?: [number, number];
  nyala?: number; isi?: string }> = ({ wr, r, p, tebal = 46, goyah = 0, seed = 1, putus, nyala = 0.6, isi }) => {
  if (p <= 0) return null;
  const d = jalurEnso(r, p, tebal, goyah, seed, undefined, undefined, putus);
  return (
    <g>
      {d.map((s, i) => (
        <path key={`b${i}`} d={s} fill={wr.aksen} opacity={0.55 * nyala} filter="url(#sr-glow)" />
      ))}
      {d.map((s, i) => (
        <path key={`t${i}`} d={s} fill={isi ?? wr.teks} />
      ))}
      {[-0.32, -0.12, 0.08, 0.27].map((o, i) => (
        <path key={`r${i}`} d={guratBulu(r, p * (0.55 + 0.45 * random(`bulu-${seed}-${i}`)), tebal * o, goyah, seed)}
          {...garis(wr.latar, 1.6 + i * 0.4)} opacity={0.4} />
      ))}
    </g>
  );
};

/** Percik bara: partikel naik & memudar dari (0,0) mulai detik t0 (deterministik per seed). */
const Bara: React.FC<{ k: Konteks; t0: number; wr: Warna; n?: number; sebar?: number; seed?: string; durasi?: number }> = ({
  k, t0, wr, n = 14, sebar = 120, seed = "bara", durasi = 1.4,
}) => {
  const t = detik(k) - t0;
  if (t < 0 || t > durasi + 0.6) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const tunda = random(`${seed}-t${i}`) * 0.35;
        const u = (t - tunda) / durasi;
        if (u <= 0 || u >= 1) return null;
        const ax = (random(`${seed}-x${i}`) - 0.5) * 2 * sebar;
        const ay = -60 - random(`${seed}-y${i}`) * sebar * 1.6;
        const x = ax * Math.sqrt(u) + Math.sin(u * 9 + i) * 8;
        const y = ay * u - 20 * u * u * -1;
        const r = 2 + random(`${seed}-r${i}`) * 4;
        return <circle key={i} cx={x} cy={y} r={r * (1 - u * 0.6)} fill={i % 3 ? wr.aksen : wr.aksen2} opacity={(1 - u) ** 1.3}
          filter="url(#sr-glow)" />;
      })}
    </g>
  );
};

/** Kuas: gagang ramping + bulu meruncing; ujung bulu di (0,0), miring `r` derajat. */
const Kuas: React.FC<{ wr: Warna; r?: number; o?: number }> = ({ wr, r = -35, o = 1 }) => (
  <G r={r} o={o}>
    <path d="M 0 0 C -10 -22 -14 -48 -11 -70 L 11 -70 C 14 -48 10 -22 0 0 Z" fill={wr.teks} />
    <rect x={-13} y={-92} width={26} height={22} rx={4} fill={wr.aksen} />
    <rect x={-8} y={-300} width={16} height={210} rx={8} {...garis(wr.teks, 3)} fill={wr.panel} />
  </G>
);

/** Noda tinta (kesalahan): gumpalan tak beraturan + percikan, tumbuh p 0→1. */
const Noda: React.FC<{ wr: Warna; p: number; seed: string; r?: number }> = ({ wr, p, seed, r = 34 }) => {
  if (p <= 0) return null;
  const n = 11;
  const titik = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const rr = r * (0.7 + random(`${seed}-${i}`) * 0.6) * p;
    return `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return (
    <g>
      <path d={`M ${titik.join(" L ")} Z`} fill={wr.bahaya} stroke={wr.bahaya} strokeWidth={10} strokeLinejoin="round" opacity={0.92} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = random(`${seed}-a${i}`) * TAU;
        const jauh = r * (1.4 + random(`${seed}-j${i}`) * 0.9) * p;
        return <circle key={i} cx={Math.cos(a) * jauh} cy={Math.sin(a) * jauh} r={3 + random(`${seed}-s${i}`) * 6 * p} fill={wr.bahaya} />;
      })}
    </g>
  );
};

/** Lapisan kabut tinta tipis yang bergeser pelan (latar kedalaman semua adegan bara). */
const Kabut: React.FC<{ k: Konteks; wr: Warna; o?: number }> = ({ k, wr, o = 1 }) => {
  const d = drift(k, 0.4);
  return (
    <g opacity={o} filter="url(#bara-kabut)">
      <defs>
        <filter id="bara-kabut" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="70" />
        </filter>
      </defs>
      <ellipse cx={240 + d.x * 3} cy={CY + 160} rx={420} ry={130} fill={rgba(wr.aksen, 0.07)} />
      <ellipse cx={820 - d.x * 2} cy={CY - 190} rx={360} ry={120} fill={rgba(wr.teks, 0.04)} />
    </g>
  );
};

// ───────────────────────────────── adegan ─────────────────────────────────

/** S1 hook: kuas pemula menggambar ensō yang goyah; "not good" → tinta tersendat & putus; "stop" → kuas berhenti,
 *  bara meredup; "trying" → kuas menyambung lagi, percik bara. Frame 0 sudah bergerak (sapuan sedang berjalan). */
export const BaraCoba: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const tidak = tk(a, "tidak", 2.4);
  const stop = tk(a, "stop", 5.6);
  const coba = tk(a, "coba", 6.08);
  // sapuan maju cepat (hook) → tersendat di "not good" → berhenti total di "stop" → lanjut di "trying"
  const maju1 = progE(k, a.mulai - 0.35, tidak - a.mulai + 0.35, (u) => 1 - (1 - u) ** 1.6) * 0.46;
  const sendat = prog(k, tidak + 0.2, 1.6) * 0.1;
  const maju2 = progE(k, coba, a.selesai - coba - 0.15, INOUT) * 0.38;
  const pp = Math.min(1, maju1 + sendat + maju2);
  const diam = t > stop - 0.1 && t < coba ? 1 : 0;
  const redup = 1 - 0.55 * prog(k, stop - 0.1, 0.25) * (1 - prog(k, coba, 0.3));
  const r = 250;
  const u = ujungEnso(r, pp, 1, 3);
  const getar = t < coba ? Math.sin(t * 38) * 3 * (1 - diam) : 0;
  const d = drift(k, 1);
  const tekan = prog(k, a.mulai, 0.5);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <G x={p.cx + d.x} y={CY + d.y} s={mix(1.12, 1, tekan)}>
        <circle r={r * 1.45} fill="url(#sr-cahaya)" opacity={0.35 * redup} />
        <Enso wr={wr} r={r} p={pp} tebal={54} goyah={1} seed={3} putus={[0.47, 0.53]} nyala={redup} />
        <G x={u.x + getar} y={u.y} o={1}>
          <Kuas wr={wr} r={(u.a * 180) / Math.PI + 60} />
        </G>
        <G x={u.x} y={u.y}>
          <Bara k={k} t0={coba} wr={wr} n={18} sebar={110} seed="s1" />
        </G>
        {diam ? <circle cx={u.x} cy={u.y} r={mix(20, 70, (t - stop) % 0.8 / 0.8)} {...garis(wr.aksen, 3)}
          opacity={1 - ((t - stop) % 0.8) / 0.8} /> : null}
      </G>
    </>
  );
};

/** S2: banyak titik awal di "tanah"; tiap titik menumbuhkan jalurnya sendiri ke atas — titik tengah bara (kamu). */
export const BaraTitikAwal: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const mulai = tk(a, "mulai", 0.9);
  const mana = tk(a, "mana", 1.4);
  const dasar = CY + 190;
  const n = 9;
  const tumbuh = prog(k, mana - 0.1, 1.1);
  const muncul = prog(k, a.mulai, 0.6);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <path d={`M 130 ${dasar} H 950`} {...garis(wr.teks, 3)} opacity={0.35 * muncul} {...gambar(muncul)} />
      {Array.from({ length: n }, (_, i) => {
        const x = mix(170, 910, i / (n - 1));
        const kamu = i === 4;
        const tinggi = 180 + random(`ta-h${i}`) * 200 + (kamu ? 120 : 0);
        const belok = (random(`ta-b${i}`) - 0.5) * 160;
        const pi = prog(k, a.mulai + 0.08 * Math.abs(i - 4), 0.35);
        const ti = Math.max(0, Math.min(1, tumbuh * 1.15 - random(`ta-d${i}`) * 0.15));
        const c = kamu ? wr.aksen : wr.teks;
        return (
          <g key={i}>
            <path d={`M ${x} ${dasar} C ${x} ${dasar - tinggi * 0.4} ${x + belok} ${dasar - tinggi * 0.6} ${x + belok * 0.8} ${dasar - tinggi}`}
              {...garis(c, kamu ? 7 : 4)} opacity={kamu ? 1 : 0.55} {...gambar(ti)} filter={kamu ? "url(#sr-glow)" : undefined} />
            <circle cx={x} cy={dasar} r={(kamu ? 16 : 9) * pi} fill={c} filter="url(#sr-glow)" />
            {kamu ? <circle cx={x} cy={dasar} r={mix(16, 90, prog(k, mulai, 0.9, "keluar"))} {...garis(wr.aksen, 4)}
              opacity={(1 - prog(k, mulai, 0.9, "keluar")) * (detik(k) > mulai ? 1 : 0)} /> : null}
          </g>
        );
      })}
      <G x={p.cx} y={dasar}>
        <Bara k={k} t0={mulai} wr={wr} n={10} sebar={50} seed="s2" />
      </G>
    </>
  );
};

/** S3: siklus malam-siang cepat (bulan melintas berkali-kali) tapi tunas di pot hanya tumbuh sedikit; bintang
 *  "hebat" hanya garis putus di atas — belum tercapai. Tally hari bertambah. */
export const BaraSemalam: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const hebat = tk(a, "hebat", 1.6);
  const semalam = tk(a, "semalam", 1.9);
  const lama = a.selesai - a.mulai;
  const fase = Math.max(0, t - semalam) * 1.25; // putaran bulan per detik setelah "overnight"
  const putar = fase % 1;
  const bx = mix(90, 990, putar);
  const by = CY - 120 - Math.sin(putar * Math.PI) * 220;
  const hari = Math.floor(fase);
  const tunas = Math.min(1, 0.15 + 0.1 * hari + 0.12 * prog(k, a.mulai, lama));
  const bintang = prog(k, hebat, 0.6);
  const px = p.cx;
  const py = CY + 120;
  return (
    <>
      <Kabut k={k} wr={wr} />
      {t > semalam ? (
        <g opacity={Math.sin(putar * Math.PI)}>
          <circle cx={bx} cy={by} r={42} fill={wr.teks} />
          <circle cx={bx + 18} cy={by - 10} r={38} fill={wr.latar} />
        </g>
      ) : null}
      <G x={px} y={CY - 210} s={mix(0.6, 1, bintang)} o={bintang}>
        <path d="M 0 -70 L 18 -22 L 68 -22 L 28 8 L 44 58 L 0 28 L -44 58 L -28 8 L -68 -22 L -18 -22 Z" {...garis(wr.aksen2, 4)}
          strokeDasharray="10 12" strokeDashoffset={-t * 18} />
        <circle r={110} fill="url(#sr-cahaya2)" opacity={0.6} />
      </G>
      <path d={`M ${px} ${py - 200} L ${px} ${CY - 120}`} {...garis(wr.teks, 2)} strokeDasharray="3 14" opacity={0.3 * bintang} />
      {/* pot + tunas */}
      <G x={px} y={py} s={1.45}>
        <path d="M -70 0 L 70 0 L 52 110 L -52 110 Z" {...garis(wr.teks, 5)} fill={wr.panel} />
        <path d="M -82 0 H 82" {...garis(wr.teks, 7)} />
        <path d={`M 0 0 C 0 ${-40 * tunas} 4 ${-70 * tunas} 0 ${-110 * tunas}`} {...garis(wr.aksen, 6)} filter="url(#sr-glow)" />
        <G y={-110 * tunas} s={tunas}>
          <path d="M 0 0 C -30 -6 -50 -30 -52 -48 C -26 -44 -6 -26 0 0 Z" fill={wr.aksen} />
          <path d="M 0 0 C 30 -6 50 -30 52 -48 C 26 -44 6 -26 0 0 Z" fill={wr.aksen2} />
        </G>
      </G>
      {/* tally hari */}
      {Array.from({ length: Math.min(hari, 9) }, (_, i) => (
        <path key={i} d={`M ${770 + (i % 5) * 26} ${py + 40 + (i >= 5 ? 90 : 0)} l 0 70`} {...garis(wr.teks, 6)}
          opacity={0.7} />
      ))}
    </>
  );
};

/** S4: sosok mendorong batu menanjak (struggle) → noda tinta jatuh di jalur (mistakes) → bar progres macet & mundur. */
export const BaraBerjuang: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const susah = tk(a, "susah", 0.7);
  const salah = tk(a, "salah", 2.4);
  const progres = tk(a, "progres", 6.0);
  const muncul = prog(k, a.mulai, 0.6);
  // lereng dari kiri bawah ke kanan atas
  const x0 = 150;
  const y0 = CY + 170;
  const x1 = 930;
  const y1 = CY - 150;
  const maju = 0.32 + 0.06 * Math.sin((t - a.mulai) * 1.3) * Math.exp(-(t - a.mulai) * 0.1) + 0.04 * prog(k, a.mulai, 3);
  const mundur = prog(k, progres + 0.35, 0.5, "keluar") * 0.05;
  const u = maju - mundur;
  const sx = mix(x0, x1, u);
  const sy = mix(y0, y1, u);
  const sudut = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  const bar = prog(k, progres - 0.6, 0.6);
  const isi = 0.12 + 0.02 * Math.sin(t * 3) - 0.04 * prog(k, progres + 0.3, 0.4);
  const getar = Math.sin(t * 30) * 2 * prog(k, susah, 0.4);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <path d={`M ${x0 - 40} ${y0 + 20} L ${x1 + 40} ${y1 - 20}`} {...garis(wr.teks, 5)} opacity={0.6} {...gambar(muncul)} />
      {[0.5, 0.62, 0.74].map((v, i) => (
        <G key={i} x={mix(x0, x1, v)} y={mix(y0, y1, v) + 4}>
          <Noda wr={wr} p={prog(k, salah + i * 0.28, 0.25, "keluar")} seed={`n${i}`} r={22 + i * 4} />
        </G>
      ))}
      <G x={sx + getar} y={sy} s={1.5}>
        <G r={sudut}>
          <circle cx={78} cy={-62} r={62} {...garis(wr.teks, 6)} fill={wr.panel} />
          <path d="M 50 -96 Q 80 -110 104 -86" {...garis(wr.teks, 3)} opacity={0.5} />
        </G>
        <G r={sudut + 18} x={-4} y={0} s={0.95}>
          <Orang wr={wr} stroke={wr.teks} langkah={(t - a.mulai) * 2.2} />
        </G>
      </G>
      {/* bar progres macet */}
      <G x={540} y={CY + 250} o={bar}>
        <rect x={-260} y={-14} width={520} height={28} rx={14} {...garis(wr.teks, 3)} fill={wr.panel} />
        <rect x={-254} y={-8} width={508 * isi} height={16} rx={8} fill={wr.aksen} filter="url(#sr-glow)" />
        <G x={300} y={0} r={(t * 360) % 360}>
          <path d="M 0 -18 A 18 18 0 1 1 -18 0" {...garis(wr.teks, 4)} />
        </G>
      </G>
    </>
  );
};

/** S5: awan tinta "malu" di atas sosok menunduk → simpul sabuk putih (pemula) tergambar & menyala → awan luruh jadi
 *  percik bara, sosok tegak. */
export const BaraSabuk: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const ingat = tk(a, "ingat", 0.4);
  const pemula = tk(a, "pemula", 2.2);
  const malu = tk(a, "malu", 3.9);
  const t = detik(k);
  const sabuk = prog(k, pemula - 0.1, 0.9);
  const luruh = prog(k, malu + 0.3, 0.9);
  const tegak = progE(k, malu + 0.4, 0.8, INOUT);
  const awan = prog(k, ingat - 0.2, 0.7) * (1 - luruh);
  const d = drift(k, 1);
  const ox = p.cx + 210;
  return (
    <>
      <Kabut k={k} wr={wr} />
      {/* sosok + awan malu */}
      <G x={ox + d.x * 0.5} y={CY + 230}>
        <G r={mix(16, 0, tegak)} s={1.6}>
          <Orang wr={wr} stroke={wr.teks} />
        </G>
        <G y={-330} o={awan}>
          {[-50, 0, 48].map((x, i) => (
            <circle key={i} cx={x + Math.sin(t * 1.4 + i) * 6} cy={i === 1 ? -18 : 0} r={i === 1 ? 54 : 42} fill={rgba(wr.bahaya, 0.55)} />
          ))}
          <path d="M -40 40 l -6 26 M 0 46 l -6 30 M 38 40 l -6 26" {...garis(wr.bahaya, 4)} opacity={0.8} />
        </G>
        <G y={-330}>
          <Bara k={k} t0={malu + 0.3} wr={wr} n={20} sebar={90} seed="s5" />
        </G>
      </G>
      {/* simpul sabuk */}
      <G x={p.cx - 170 + d.x} y={CY + 10 + d.y} s={mix(0.8, 1.1, sabuk)}>
        <circle r={190} fill="url(#sr-cahaya)" opacity={0.5 * sabuk} />
        <path d="M -230 -30 Q -100 -42 -40 -26 M 40 -26 Q 100 -42 230 -30" {...garis(wr.teks, 34)} strokeLinecap="butt"
          {...gambar(sabuk)} opacity={0.95} />
        <path d="M -230 -30 Q -100 -42 -40 -26 M 40 -26 Q 100 -42 230 -30" {...garis(wr.aksen, 3)} {...gambar(sabuk)}
          transform="translate(0 -15)" opacity={0.8} />
        <g opacity={Math.max(0, sabuk * 2 - 1)}>
          <path d="M -26 -10 L -78 150 L -34 158 L 4 30 Z" fill={wr.teks} />
          <path d="M 22 -10 L 86 140 L 44 156 L -4 30 Z" fill={wr.teks} />
          <rect x={-46} y={-62} width={92} height={70} rx={18} fill={wr.teks} />
          <path d="M -46 -30 H 46" {...garis(wr.latar, 3)} opacity={0.25} />
        </g>
      </G>
    </>
  );
};

/** S6: podium 2-1-3 dengan piala bersorot di "best"; di "today" sorot bergeser turun ke satu anak tangga kecil di depan. */
export const BaraPodium: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const terbaik = tk(a, "terbaik", 1.4);
  const hari = tk(a, "hari", 1.85);
  const naik = prog(k, a.mulai, 0.6);
  const sorot = prog(k, terbaik - 0.2, 0.4);
  const geser = progE(k, hari, 0.7, INOUT);
  const anak = prog(k, hari + 0.25, 0.5);
  const yb = CY + 180;
  const kolom: [number, number][] = [[-210, 150], [0, 240], [210, 100]];
  const sx = mix(p.cx, p.cx - 250, geser);
  const sy = mix(CY - 60, yb + 40, geser);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <g opacity={mix(1, 0.35, geser)}>
        {kolom.map(([x, h], i) => (
          <rect key={i} x={p.cx + x - 90} y={yb - h * naik} width={180} height={h * naik} {...garis(wr.teks, 5)} fill={wr.panel} />
        ))}
        <G x={p.cx} y={yb - 240 * naik - 70} o={naik}>
          <path d="M -44 -60 H 44 Q 44 10 0 20 Q -44 10 -44 -60 Z" {...garis(wr.aksen2, 6)} fill={rgba(wr.aksen2, 0.25)} />
          <path d="M -44 -48 Q -80 -44 -60 -14 M 44 -48 Q 80 -44 60 -14 M 0 20 V 44 M -26 50 H 26" {...garis(wr.aksen2, 6)} />
        </G>
      </g>
      {/* kerucut sorot */}
      <path d={`M ${p.cx - 40} 250 L ${sx - 150} ${sy + 60} L ${sx + 150} ${sy + 60} L ${p.cx + 40} 250 Z`} fill="url(#sr-sorot)"
        opacity={0.5 * sorot} />
      <ellipse cx={sx} cy={sy + 60} rx={150} ry={22} fill={rgba(wr.aksen2, 0.35 * sorot)} />
      {/* anak tangga pertama */}
      <G x={p.cx - 250} y={yb + 100} s={mix(0.6, 1, anak)} o={anak}>
        <rect x={-80} y={-50} width={160} height={50} rx={6} fill={wr.aksen} filter="url(#sr-glow)" />
        <rect x={-80} y={-50} width={160} height={10} rx={5} fill={wr.aksen2} />
      </G>
    </>
  );
};

/** S7: cincin siklus tiga simpul — buku (learn), panah naik (improve), panah putar (try again); komet bara mengorbit,
 *  simpul menyala di kata masing-masing. */
export const BaraSiklus: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const mau = tk(a, "mau", 1.6);
  const belajar = tk(a, "belajar", 2.25);
  const baik = tk(a, "baik", 3.2);
  const lagi = tk(a, "lagi", 4.6);
  const R = 210;
  const cincin = prog(k, mau - 0.4, 0.9);
  const sudutKomet = -Math.PI / 2 + Math.max(0, t - mau) * 2.6;
  const simpul = [
    { a: -Math.PI / 2, t0: belajar, jenis: 0 },
    { a: Math.PI / 6, t0: baik, jenis: 1 },
    { a: (5 * Math.PI) / 6, t0: lagi, jenis: 2 },
  ];
  const d = drift(k, 1);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <G x={p.cx + d.x} y={CY + d.y}>
        <circle r={R} {...garis(wr.teks, 4)} opacity={0.4} {...gambar(cincin)} />
        <circle r={R} {...garis(wr.aksen, 4)} strokeDasharray={`${R * 0.6} ${R * TAU}`}
          strokeDashoffset={-sudutKomet * R - R * Math.PI * 0.5} opacity={cincin} filter="url(#sr-glow)" />
        <circle cx={Math.cos(sudutKomet) * R} cy={Math.sin(sudutKomet) * R} r={12 * cincin} fill={wr.aksen2} filter="url(#sr-glow)" />
        {simpul.map((s, i) => {
          const on = prog(k, s.t0 - 0.1, 0.35);
          const x = Math.cos(s.a) * R;
          const y = Math.sin(s.a) * R;
          const c = on > 0.5 ? wr.aksen : wr.teks;
          return (
            <G key={i} x={x} y={y} s={mix(0.7, 1, prog(k, mau - 0.2 + i * 0.12, 0.4)) * (1 + 0.15 * Math.sin(on * Math.PI))}>
              <circle r={70} {...garis(c, 5)} fill={wr.panel} filter={on > 0.5 ? "url(#sr-glow)" : undefined} />
              {s.jenis === 0 ? (
                <path d="M -34 -20 Q -16 -30 0 -20 Q 16 -30 34 -20 V 24 Q 16 14 0 24 Q -16 14 -34 24 Z M 0 -20 V 24" {...garis(c, 5)} />
              ) : s.jenis === 1 ? (
                <path d="M -32 26 L -8 0 L 8 14 L 32 -16 M 14 -18 H 32 V 0" {...garis(c, 6)} />
              ) : (
                <path d="M 26 -6 A 28 28 0 1 1 10 -26 M 10 -26 L 8 -42 M 10 -26 L 26 -22" {...garis(c, 6)} />
              )}
            </G>
          );
        })}
      </G>
    </>
  );
};

/** S8: sosok kecil + bayangan raksasa di dinding (fear) yang menumbuhkan cakar di "bad"; di "stop" jeruji turun. */
export const BaraBayang: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const takut = tk(a, "takut", 1.8);
  const buruk = tk(a, "buruk", 2.6);
  const henti = tk(a, "henti", 4.2);
  const tumbuh = progE(k, takut - 0.2, 1.0, INOUT);
  const cakar = prog(k, buruk, 0.5);
  const jeruji = prog(k, henti - 0.05, 0.3, "keluar");
  const napas = 1 + 0.02 * Math.sin(t * 2.4);
  const lantai = CY + 220;
  const ox = p.cx - 230;
  return (
    <>
      <path d={`M 110 ${lantai} H 970`} {...garis(wr.teks, 3)} opacity={0.35} />
      {/* bayangan */}
      <G x={p.cx + 120} y={lantai} s={mix(0.9, 2.1, tumbuh) * napas}>
        <path d="M -60 0 L -64 -110 Q -66 -160 -30 -170 Q -50 -210 -20 -240 Q 0 -262 20 -240 Q 50 -210 30 -170 Q 66 -160 64 -110 L 60 0 Z"
          fill={rgba("#000000", 0.75)} stroke={rgba(wr.bahaya, 0.55)} strokeWidth={2} />
        <g opacity={cakar}>
          <path d="M -64 -120 l -30 -14 l 14 12 l -26 0 l 22 10 M 64 -120 l 30 -14 l -14 12 l 26 0 l -22 10" {...garis(wr.bahaya, 3)} />
          <circle cx={-12} cy={-222} r={4} fill={wr.bahaya} />
          <circle cx={12} cy={-222} r={4} fill={wr.bahaya} />
        </g>
      </G>
      {/* sosok kecil + cahaya lilin */}
      <G x={ox} y={lantai}>
        <circle cx={-70} cy={-40} r={120} fill="url(#sr-cahaya)" opacity={0.5} />
        <path d="M -70 0 V -36" {...garis(wr.teks, 8)} />
        <path d={`M -70 -40 q ${-8 + Math.sin(t * 9) * 2} -14 0 -28 q ${8 + Math.sin(t * 7) * 2} 14 0 28`} fill={wr.aksen} filter="url(#sr-glow)" />
        <G s={0.8}>
          <Orang wr={wr} stroke={wr.teks} />
        </G>
      </G>
      {/* jeruji */}
      <g opacity={jeruji}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M ${p.cx - 330 + i * 110} ${mix(240, lantai, jeruji) - 560} V ${mix(240, lantai, jeruji)}`}
            {...garis(wr.teks, 9)} opacity={0.85} />
        ))}
        <path d={`M ${p.cx - 360} ${mix(240, lantai, jeruji) - 540} H ${p.cx + 360}`} {...garis(wr.teks, 9)} opacity={0.85} />
      </g>
    </>
  );
};

/** S9: pintu gelap terbuka (discovering) → cahaya bara membanjir; di "capable" bayangan sosok di lantai berubah jadi
 *  siluet tinggi bertabur bintang (potensi). Titik iris keluar = pusat cahaya pintu. */
export const BaraPintu: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const temukan = tk(a, "temukan", 0.5);
  const mampu = tk(a, "mampu", 2.1);
  const buka = progE(k, temukan - 0.1, 0.9, INOUT);
  const potensi = prog(k, mampu - 0.1, 0.9);
  const lantai = CY + 220;
  const px = p.cx;
  const lebar = 220;
  const tinggi = 400;
  return (
    <>
      <path d={`M 110 ${lantai} H 970`} {...garis(wr.teks, 3)} opacity={0.35} />
      {/* sinar dari celah pintu */}
      <g opacity={buka}>
        {Array.from({ length: 9 }, (_, i) => {
          const s = (i - 4) * 0.16 + Math.sin(t * 0.8 + i) * 0.02;
          return <path key={i} d={`M ${px} ${lantai - tinggi / 2} L ${px + Math.sin(s) * 900} ${lantai - tinggi / 2 + Math.cos(s) * 900}`}
            stroke={rgba(wr.aksen2, 0.16)} strokeWidth={46} />;
        })}
        <circle cx={px} cy={lantai - tinggi / 2} r={320} fill="url(#sr-cahaya)" opacity={0.9} />
      </g>
      <rect x={px - lebar / 2} y={lantai - tinggi} width={lebar} height={tinggi} fill={mix(0, 1, buka) > 0.5 ? wr.aksen2 : wr.panel}
        opacity={0.25 + 0.75 * buka} />
      <rect x={px - lebar / 2} y={lantai - tinggi} width={lebar} height={tinggi} {...garis(wr.teks, 6)} />
      {/* daun pintu berayun (skala x) */}
      <G x={px - lebar / 2} y={lantai - tinggi}>
        <g transform={`scale(${Math.max(0.02, 1 - buka * 0.92)} 1)`}>
          <rect x={0} y={0} width={lebar} height={tinggi} {...garis(wr.teks, 5)} fill={wr.panel} />
          <circle cx={lebar - 30} cy={tinggi / 2} r={9} fill={wr.aksen} />
        </g>
      </G>
      {/* sosok di ambang + bayangan potensi */}
      <G x={px} y={lantai}>
        <G s={0.85}>
          <Orang wr={wr} stroke={wr.latar} isi={wr.latar} />
        </G>
        <g opacity={potensi} transform={`scale(1 ${-mix(0.6, 1.6, potensi)})`}>
          <path d="M -46 0 L -46 -40 Q -46 -82 0 -82 Q 46 -82 46 -40 L 46 0 Z" fill={rgba(wr.aksen, 0.25)} />
          <circle cx={0} cy={-116} r={25} fill={rgba(wr.aksen, 0.25)} />
        </g>
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={(random(`pt-x${i}`) - 0.5) * 120} cy={(random(`pt-y${i}`) * 220 + 10) * mix(0.6, 1.6, potensi)}
            r={2 + random(`pt-r${i}`) * 3} fill={wr.aksen2} opacity={potensi * (0.5 + 0.5 * Math.sin(t * 4 + i))} />
        ))}
      </G>
    </>
  );
};

/** S10 penutup (bookend S1): kuas yang sama kini menggambar ensō utuh, mantap & tanpa goyah, sepanjang kalimat;
 *  di "try" ensō menyala penuh + segel bara (hanko) "TRY" + percik. */
export const BaraEnso: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const lebih = tk(a, "lebih", 2.2);
  const coba = tk(a, "coba", 7.2);
  const pp = progE(k, a.mulai + 0.2, coba - a.mulai - 0.25, INOUT);
  const nyala = 0.5 + 0.5 * prog(k, coba, 0.5);
  const segel = prog(k, coba + 0.05, 0.3, "keluar");
  const tumbuh = prog(k, lebih, 2.5);
  const r = mix(230, 260, tumbuh);
  const u = ujungEnso(r, pp, 0, 7);
  const kuas = 1 - prog(k, coba, 0.4);
  return (
    <>
      <Kabut k={k} wr={wr} />
      <G x={p.cx} y={CY}>
        <circle r={r * 1.5} fill="url(#sr-cahaya)" opacity={0.25 + 0.5 * prog(k, coba, 0.6)} />
        <Enso wr={wr} r={r} p={pp} tebal={58} goyah={0} seed={7} nyala={nyala} />
        <G x={u.x} y={u.y} o={kuas}>
          <Kuas wr={wr} r={(u.a * 180) / Math.PI + 60} />
        </G>
        <G x={u.x} y={u.y}>
          <Bara k={k} t0={coba} wr={wr} n={26} sebar={160} seed="s10" durasi={1.8} />
        </G>
        <G x={r * 0.62} y={r * 0.62} s={mix(1.8, 1, segel)} o={segel} r={-6}>
          <rect x={-58} y={-58} width={116} height={116} rx={12} fill={wr.aksen} filter="url(#sr-glow)" />
          <rect x={-48} y={-48} width={96} height={96} rx={8} {...garis(wr.latar, 4)} opacity={0.6} />
          <text x={0} y={16} textAnchor="middle" fontFamily={font} fontSize={50} fill={wr.latar}>TRY</text>
        </G>
        {t > coba ? <circle r={mix(r, r * 1.9, prog(k, coba, 1.2, "keluar"))} {...garis(wr.aksen, 3)}
          opacity={1 - prog(k, coba, 1.2, "keluar")} /> : null}
      </G>
    </>
  );
};
