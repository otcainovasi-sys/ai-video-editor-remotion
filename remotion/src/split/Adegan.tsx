// Pustaka adegan split-layout (roadmap #10): tiap modul = ilustrasi separuh atas untuk satu gagasan ucapan.
// Waktu kunci datang dari `a.t` (detik absolut, di-resolve Python dari anchor kata); cadangan relatif ke `a.mulai`.
// Koordinat panggung: lebar W, tinggi p.tinggi; konten di dalam p.atas..p.bawah (zona aman) dan x 60..W-120.
// Match cut (roadmap #5): modul yang bersambung berbagi posisi/bentuk (sosok, lingkaran langit, cakrawala).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import {
  OtcaBuktiGear, OtcaCoret, OtcaKartu, OtcaPesawatPeta, OtcaRadar, OtcaRuangKuliah, OtcaSapa, OtcaSertifikatKampus, OtcaTangga,
  OtcaTimbangan,
} from "./AdeganOtca";
import { BaraBayang, BaraBerjuang, BaraCoba, BaraEnso, BaraPintu, BaraPodium, BaraSabuk, BaraSemalam, BaraSiklus, BaraTitikAwal } from "./AdeganBara";
import { KoeyGuru, KoeyInterview, KoeyKaiwa, KoeyKartu, KoeyLevel, KoeyNilaiPlus, KoeyShare, KoeySimpan, KoeyVisa } from "./AdeganKoey";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import {
  Bendera, Bintang, Cahaya, Centang, G, IkonKecil, Kaca, KilauDef, Langit, Laptop, Mata, Menara, Orang, Perisai,
  Petir, Sorot, Tanya, Target, Timbangan, Warna, garis,
} from "./Ikon";

export type PropsAdegan = { k: Konteks; wr: Warna; font: string };

/** Lantai grid perspektif (khas glass-tech), berpusat di titik hilang (vx, vy). */
const Lantai: React.FC<{ wr: Warna; vy: number; o: number; vx?: number; tinggi: number; W: number }> = ({
  wr, vy, o, vx = 540, tinggi, W,
}) => (
  <g opacity={o}>
    {Array.from({ length: 15 }, (_, i) => {
      const x = mix(-W, W * 2, i / 14);
      return <line key={`v${i}`} x1={vx} y1={vy} x2={x} y2={tinggi} stroke={wr.aksen} strokeOpacity={0.14} strokeWidth={2} />;
    })}
    {Array.from({ length: 7 }, (_, i) => {
      const y = vy + (tinggi - vy) * Math.pow((i + 1) / 7, 2);
      return <line key={`h${i}`} x1={0} x2={W} y1={y} y2={y} stroke={wr.aksen} strokeOpacity={0.1 + 0.03 * i} strokeWidth={2} />;
    })}
    <line x1={0} x2={W} y1={vy} y2={vy} stroke={wr.aksen} strokeOpacity={0.45} strokeWidth={3} />
  </g>
);

// 1. HOOK + "feels lonely": menara masa depan terbangun (gerak terkuat di detik pertama), lalu kamera mundur →
//    sosok sendirian di bawah sorot lampu.
export const MenaraSendiri: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const bangun = tk(a, "bangun", 1.6);
  const masa = tk(a, "masa_depan", 2.2);
  const mimpi = tk(a, "mimpi", 2.9);
  const mundur = tk(a, "mundur", 4.0);
  const sepi = tk(a, "sepi", 4.6);
  const kilat = mix(0.4, 1, prog(k, a.mulai, 0.5)); // frame 0 sudah berisi lantai grid + dasar menara
  const tumbuh = mix(0.25, 0.62, progE(k, a.mulai, 1.0, INOUT)) + mix(0, 0.38, prog(k, bangun, 1.0));
  const nyala = prog(k, masa, 0.9);
  const mu = progE(k, mundur, 0.9, INOUT);
  const so = prog(k, sepi, 0.5);
  const d1 = drift(k, 0.4);
  const d2 = drift(k, 1);
  const tx = mix(p.cx, p.cx + 250, mu);
  const ty = mix(p.bawah - 30, p.bawah - 120, mu);
  return (
    <>
      <defs>
        <KilauDef id="s1-kilau" w={wr} p={prog(k, mimpi, 0.9)} x0={tx - 120} x1={tx + 120} />
      </defs>
      <G x={d1.x} y={d1.y}>
        <Lantai wr={wr} vy={mix(p.bawah - 30, p.bawah - 120, mu)} o={kilat * mix(1, 0.6, mu)} tinggi={p.tinggi} W={p.W} />
        <line x1={0} x2={p.W * kilat} y1={p.bawah - 30} y2={p.bawah - 30} stroke="#FFFFFF" strokeWidth={4}
          opacity={(1 - prog(k, a.mulai + 0.4, 0.4)) * 0.9} />
      </G>
      {/* hook visual detik pertama: gelombang cincin dari dasar menara + berkas cahaya naik */}
      {[0.05, 0.35].map((t0, i) => {
        const r = prog(k, a.mulai + t0, 0.9);
        return r > 0 && r < 1 ? (
          <ellipse key={i} cx={tx} cy={ty} rx={mix(60, 520, r)} ry={mix(14, 120, r)} {...garis(wr.aksen, 6 * (1 - r))}
            opacity={1 - r} />
        ) : null;
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const u = prog(k, a.mulai + 0.05 + i * 0.07, 0.6);
        const x = tx + (i - 3) * 34;
        return u > 0 && u < 1 ? (
          <line key={i} x1={x} x2={x} y1={ty - u * 560} y2={ty - u * 560 + 90} {...garis(i % 2 ? wr.aksen2 : wr.aksen, 4)}
            opacity={1 - u} />
        ) : null;
      })}
      <G x={tx + d1.x} y={ty + d1.y} s={mix(1.15, 0.48, mu)} o={mix(1, 0.55, so)}>
        <G y={-260}>
          <Cahaya r={330} o={0.35 + 0.5 * nyala + 0.5 * (1 - kilat)} />
        </G>
        <Menara id="s1-menara" wr={wr} p={tumbuh} nyala={nyala} stroke="url(#s1-kilau)" />
        <G y={-560} s={prog(k, mimpi, 0.5)} r={detik(k) * 20}>
          <Bintang c={wr.teks} r={34} />
        </G>
      </G>
      <G x={p.cx - 40 + d2.x} y={p.bawah - 70 + d2.y}>
        <Sorot o={so * 0.9} />
        <G s={mix(0.6, 1, prog(k, mundur + 0.2, 0.6))} o={prog(k, mundur + 0.2, 0.4)}>
          <Orang wr={wr} p={prog(k, mundur + 0.2, 0.8)} />
        </G>
      </G>
      <rect x={0} y={0} width={p.W} height={p.tinggi} fill="url(#sr-vignet)" opacity={so * 0.8} />
    </>
  );
};

// 2. "goals to chase, sacrifices to make": sosok (posisi sama dengan akhir adegan 1 = match cut) mengejar target;
//    chip kaca (main, pesta, tidur) muncul lalu retak & jatuh.
export const TujuanPengorbanan: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const tujuan = tk(a, "tujuan", 0.5);
  const kejar = tk(a, "kejar", 1.1);
  const korban = tk(a, "korban", 2.2);
  const buat = tk(a, "buat", 3.4);
  const tg = prog(k, tujuan, 0.7);
  const kj = progE(k, kejar, 1.2, INOUT);
  const ox = mix(p.cx - 40, p.cx - 230, kj);
  const oy = p.bawah - 70;
  const target = { x: p.cx + 250, y: p.atas + 210 };
  const d = drift(k, 1);
  const jenis = ["main", "pesta", "tidur"] as const;
  return (
    <>
      <defs>
        <KilauDef id="s2-kilau" w={wr} p={prog(k, kejar + 0.4, 1)} x0={target.x - 130} x1={target.x + 130} />
      </defs>
      <G x={target.x + d.x * 0.5} y={target.y + d.y * 0.5} s={mix(0.6, 1, tg)} o={tg}>
        <Cahaya r={240} o={0.6} />
        <Target wr={wr} p={tg} stroke="url(#s2-kilau)" />
      </G>
      <path d={`M ${ox + 40} ${oy - 160} Q ${mix(ox, target.x, 0.4)} ${target.y - 40} ${target.x - 120} ${target.y + 20}`}
        {...garis(wr.aksen, 5)} strokeDasharray="4 22" opacity={0.85}
        {...{ pathLength: 1 }} strokeDashoffset={0} clipPath="url(#s2-panah)" />
      <defs>
        <clipPath id="s2-panah">
          <rect x={0} y={0} width={mix(ox, target.x, kj)} height={p.tinggi} />
        </clipPath>
      </defs>
      <G x={ox + d.x} y={oy + d.y} r={mix(0, 6, kj)}>
        <Sorot o={1 - prog(k, a.mulai, 0.6)} />
        <Orang wr={wr} />
      </G>
      {jenis.map((j, i) => {
        const muncul = prog(k, korban + i * 0.18, 0.45);
        const jatuh = progE(k, buat + i * 0.12, 0.9, (t) => t * t);
        const x = p.cx - 330 + i * 190 + random(`s2r${i}`) * 10;
        const y = p.atas + 120 + jatuh * 420;
        return (
          <G key={j} x={x + d.x} y={y + d.y} s={mix(0.8, 1, muncul)} r={jatuh * (i - 1) * 24} o={muncul * (1 - jatuh)}>
            <Kaca x={-70} y={-70} w={140} h={140} wr={wr} />
            <IkonKecil jenis={j} st={jatuh > 0 ? wr.bahaya : wr.teks} />
            <path d="M -40 -70 L -6 -18 L -26 14 L 8 70" {...garis(wr.bahaya, 4)} {...gambar(prog(k, buat + i * 0.12 - 0.15, 0.2))} />
          </G>
        );
      })}
    </>
  );
};

// 3. "battles that nobody else really sees": sosok berperisai di bawah kubah kaca diserang petir; mata di luar
//    kubah muncul lalu menutup satu per satu.
export const PerisaiSunyi: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const perang = tk(a, "perang", 0.2);
  const takAda = tk(a, "tak_ada", 1.7);
  const lihat = tk(a, "lihat", 3.1);
  const cx = p.cx;
  const gy = p.bawah - 40;
  const kubah = prog(k, a.mulai, 0.7);
  const d = drift(k, 1);
  const petir = [0, 0.55, 1.1].map((o) => perang + o);
  const kena = Math.max(...petir.map((t) => (detik(k) >= t ? 1 - prog(k, t, 0.35) : 0)));
  return (
    <>
      <G x={d.x * 0.4} y={d.y * 0.4}>
        <ellipse cx={cx} cy={gy} rx={300} ry={40} fill={wr.aksen} opacity={0.12} />
        <path d={`M ${cx - 260} ${gy} A 260 260 0 0 1 ${cx + 260} ${gy}`}
          {...garis(wr.aksen, 4)} fill={rgba(wr.aksen, 0.06 + 0.12 * kena)} {...gambar(kubah)} strokeOpacity={0.6 + 0.4 * kena} filter="url(#sr-glow)" />
      </G>
      {petir.map((t, i) => {
        const o = detik(k) >= t ? 1 - prog(k, t + 0.1, 0.3) : 0;
        const x = cx + [-150, 160, 10][i];
        return (
          <G key={i} x={x} y={gy - 330} s={1.2} o={o}>
            <Petir warna={wr.bahaya} p={1} />
          </G>
        );
      })}
      <G x={cx + d.x} y={gy + d.y}>
        <Cahaya r={180} o={0.5} />
        <Orang wr={wr} />
        <G x={52} y={-70} s={0.55 * prog(k, perang - 0.2, 0.5)} r={-8}>
          <Perisai wr={wr} p={prog(k, perang - 0.2, 0.6)} />
        </G>
      </G>
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = Math.PI * (0.12 + i * 0.19);
        const x = cx - Math.cos(ang) * 400;
        const y = gy - Math.sin(ang) * 380;
        const m = prog(k, takAda + i * 0.1, 0.45);
        return (
          <G key={i} x={x + d.x * 0.7} y={y + d.y * 0.7} s={mix(0.7, 1, m)} o={m}>
            <Mata st={wr.teks} tutup={prog(k, lihat - 0.6 + i * 0.15, 0.3)} />
          </G>
        );
      })}
    </>
  );
};

// 4. "others enjoying their lives / you're spending your nights / become someone you're not yet":
//    matahari → bulan di posisi yang sama (match cut siang → malam), sosok di meja laptop, siluet diri masa depan.
export const SiangMalam: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const lain = tk(a, "orang_lain", 0.3);
  const nikmati = tk(a, "nikmati", 1.0);
  const malam = tk(a, "malam", 4.3);
  const jadi = tk(a, "jadi", 5.9);
  const belum = tk(a, "belum", 7.5);
  const naik = prog(k, a.mulai, 0.9);
  const ml = progE(k, malam - 0.9, 1.1, INOUT);
  const langit = { x: p.cx + 260, y: mix(p.atas + 260, p.atas + 110, naik) };
  const gy = p.bawah - 50;
  const d = drift(k, 1);
  const kelompok = [0, 1, 2, 3];
  return (
    <>
      <rect x={0} y={0} width={p.W} height={p.tinggi} fill={wr.latar} opacity={ml * 0.55} />
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={random(`bx${i}`) * p.W} cy={p.atas - 120 + random(`by${i}`) * 420} r={1.5 + random(`br${i}`) * 2.5}
          fill={wr.teks} opacity={ml * (0.3 + 0.5 * random(`bo${i}`))} />
      ))}
      <G x={langit.x + d.x * 0.3} y={langit.y + d.y * 0.3}>
        <Cahaya r={260} o={mix(0.8, 0.4, ml)} ungu={ml > 0.5} />
        <Langit id="s4-langit" wr={wr} bulan={ml} />
      </G>
      <line x1={60} x2={p.W - 120} y1={gy} y2={gy} stroke={wr.aksen} strokeOpacity={0.4} strokeWidth={3} />
      {kelompok.map((i) => {
        const m = prog(k, lain + i * 0.12, 0.45);
        const pergi = ml;
        const lompat = detik(k) > nikmati ? Math.abs(Math.sin((detik(k) - nikmati) * 5 + i)) * 14 * (1 - pergi) : 0;
        return (
          <G key={i} x={p.cx + 40 + i * 95 + pergi * 300 + d.x} y={gy - lompat + d.y} s={0.62} o={m * (1 - pergi)}>
            <Orang wr={wr} stroke={wr.aksen2} />
          </G>
        );
      })}
      {Array.from({ length: 18 }, (_, i) => {
        const t0 = nikmati + random(`kf${i}`) * 0.6;
        const u = prog(k, t0, 1.4);
        const x = p.cx + 100 + random(`kx${i}`) * 300;
        const y = gy - 200 - u * 120 + u * u * 220;
        return (
          <rect key={i} x={x} y={y} width={10} height={16} rx={2} fill={i % 2 ? wr.aksen : wr.aksen2}
            transform={`rotate(${u * 360 * (i % 2 ? 1 : -1)} ${x + 5} ${y + 8})`}
            opacity={(u > 0 ? 1 - u : 0) * (1 - ml)} />
        );
      })}
      <G x={mix(p.cx - 300, p.cx - 170, ml) + d.x} y={gy + d.y}>
        <G x={mix(0, 360, prog(k, jadi, 0.8))} s={1.75} o={prog(k, jadi, 0.6) * 0.85}>
          <Orang wr={wr} stroke={wr.aksen2} putus />
        </G>
        <Orang wr={wr} stroke={ml > 0.5 ? wr.aksen : wr.garis} isi={wr.panel} />
        <G x={130} s={mix(0.6, 1, ml)} o={ml}>
          <Laptop wr={wr} p={ml} layar={ml} />
          <G y={-60}>
            <Cahaya r={150} o={ml * 0.7} />
          </G>
        </G>
      </G>
      <G x={60} y={p.atas + 20} o={prog(k, belum - 0.3, 0.4)}>
        <Kaca x={0} y={0} w={380} h={46} r={23} wr={wr} />
        <rect x={8} y={8} width={364 * 0.38 * prog(k, belum - 0.1, 0.9)} height={30} rx={15} fill={wr.aksen2} />
      </G>
    </>
  );
};

// 5. "wonder if all this struggle will be worth it": bulan → gelembung tanya (posisi sama), timbangan: beban
//    perjuangan di kiri, tanda tanya di kanan; balok bergoyang tak pasti lalu diam.
export const TimbanganRagu: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const heran = tk(a, "heran", 1.6);
  const beban = tk(a, "beban", 3.6);
  const layak = tk(a, "layak", 4.7);
  const d = drift(k, 1);
  const gelembung = prog(k, a.mulai, 0.6);
  // timbangan hadir sejak awal adegan (jangan kosong menunggu "wonder"), gelembung tanya sudah dari match cut
  const tb = prog(k, Math.min(heran, a.mulai + 0.4), 0.8);
  const jatuh = [0, 1, 2].map((i) => progE(k, beban + i * 0.2, 0.35, (t) => t * t));
  const berat = jatuh.reduce((s, j) => s + j, 0);
  const dt = Math.max(0, detik(k) - layak);
  const goyang = detik(k) > layak ? Math.sin(dt * 5) * 9 * Math.exp(-dt * 1.4) : 0;
  const sudut = -5 * berat + mix(0, 9, prog(k, layak, 0.8)) + goyang;
  const kiri = (
    <g>
      {jatuh.map((j, i) => (
        <rect key={i} x={-34 + (i % 2) * 8} y={-30 - i * 30 - (1 - j) * 260} width={60} height={26} rx={6}
          fill={wr.panel} stroke={wr.aksen} strokeWidth={4} opacity={j > 0 ? 1 : 0} />
      ))}
    </g>
  );
  const kanan = (
    <G y={-46} s={prog(k, layak, 0.5)}>
      <Cahaya r={70} o={0.8} ungu />
      <text x={0} y={22} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={64} fill={wr.teks}>?</text>
    </G>
  );
  return (
    <>
      <G x={p.cx + 260 + d.x * 0.3} y={p.atas + 110 + d.y * 0.3} s={mix(0.6, 0.8, gelembung)} o={gelembung}>
        <Tanya wr={wr} p={gelembung} font={font} />
      </G>
      <G x={p.cx - 40 + d.x} y={p.bawah - 30 + d.y} s={1.05} o={tb}>
        <Timbangan wr={wr} p={tb} sudut={sudut} kiri={kiri} kanan={kanan} />
      </G>
    </>
  );
};

/** Garis tengah jalan perspektif dari bawah panggung (u=0) ke cakrawala (u=1). */
const titikJalan = (u: number, cx: number, bawah: number, vy: number) => ({
  x: cx + Math.sin(u * Math.PI * 1.4) * 140 * (1 - u) + 40 * u,
  y: mix(bawah, vy, 1 - Math.pow(1 - u, 1.6)),
  w: mix(330, 8, Math.pow(u, 0.7)),
});

// 6. "part of the journey / not everyone will understand / that's okay / keep going when nobody is watching":
//    jalan berliku ke cakrawala; sosok lain berpaling; sosok berjalan sendiri, lampu sorot padam, cahayanya sendiri.
export const JalanSendiri: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const perjalanan = tk(a, "perjalanan", 2.6);
  const tidakSemua = tk(a, "tidak_semua", 5.0);
  const jalanmu = tk(a, "jalanmu", 6.8);
  const oke = tk(a, "oke", 8.8);
  const terus = tk(a, "terus", 10.3);
  const takLihat = tk(a, "tak_lihat", 12.4);
  const vy = p.atas + 60;
  const bawah = p.tinggi + 20;
  const gb = progE(k, perjalanan - 1.2, 1.8, INOUT);
  const N = 40;
  const sisi = (s: number) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const u = (i / N) * gb;
      const t = titikJalan(u, p.cx, bawah, vy);
      return `${i ? "L" : "M"} ${t.x + (s * t.w) / 2} ${t.y}`;
    }).join(" ");
  const tengah = Array.from({ length: N + 1 }, (_, i) => {
    const t = titikJalan((i / N) * gb, p.cx, bawah, vy);
    return `${i ? "L" : "M"} ${t.x} ${t.y}`;
  }).join(" ");
  const d = drift(k, 1);
  const cakrawala = titikJalan(1, p.cx, bawah, vy);
  const jalan = progE(k, terus, Math.max(0.5, a.selesai - terus), (t) => t);
  const posU = mix(0.05, 0.62, jalan);
  const o = titikJalan(posU, p.cx, bawah, vy);
  const skala = mix(1.0, 0.32, Math.pow(posU / 0.62, 0.8));
  const lampu = [0.18, 0.36, 0.52];
  return (
    <>
      <defs>
        <KilauDef id="s6-kilau" w={wr} p={prog(k, jalanmu, 1.2)} x0={p.cx - 200} x1={p.cx + 200} />
      </defs>
      <G x={d.x * 0.3} y={d.y * 0.3}>
        <line x1={0} x2={p.W} y1={vy} y2={vy} stroke={wr.aksen} strokeOpacity={0.35 * prog(k, a.mulai, 0.6)} strokeWidth={3} />
        <G x={cakrawala.x} y={vy}>
          <Cahaya r={mix(160, 300, prog(k, a.mulai, 1.5))} o={0.7} />
        </G>
      </G>
      <G x={d.x * 0.6} y={d.y * 0.6}>
        <path d={sisi(-1)} {...garis("url(#s6-kilau)")} filter="url(#sr-glow)" />
        <path d={sisi(1)} {...garis("url(#s6-kilau)")} filter="url(#sr-glow)" />
        <path d={tengah} {...garis(wr.teks, 4)} strokeDasharray="18 26" opacity={0.45} />
      </G>
      {[0, 1, 2, 3].map((i) => {
        const u = 0.2 + i * 0.12;
        const t = titikJalan(u, p.cx, bawah, vy);
        const s = i % 2 ? 1 : -1;
        const m = prog(k, tidakSemua + i * 0.12, 0.4);
        const paling = prog(k, tidakSemua + 0.8 + i * 0.12, 0.6);
        return (
          <G key={i} x={t.x + s * (t.w / 2 + 70 + paling * 60) + d.x} y={t.y + d.y} s={mix(0.75, 0.4, u)}
            o={m * mix(1, 0.25, paling) * (1 - prog(k, terus, 0.4))}>
            <Orang wr={wr} stroke={paling > 0.5 ? wr.garis : wr.aksen2} />
          </G>
        );
      })}
      <G x={cakrawala.x + 230} y={vy + 40} s={0.65 * prog(k, oke, 0.5)} o={1 - prog(k, terus - 0.4, 0.4)}>
        <Centang wr={wr} p={prog(k, oke, 0.7)} />
      </G>
      {lampu.map((u, i) => {
        const t = titikJalan(u, p.cx, bawah, vy);
        const padam = prog(k, takLihat + i * 0.35, 0.25);
        return (
          <G key={i} x={t.x + d.x} y={t.y + d.y} s={mix(0.9, 0.5, u)}>
            <Sorot o={prog(k, terus, 0.5) * (1 - padam) * 0.8} lebar={110} tinggi={480} />
          </G>
        );
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const u = 0.05 + i * 0.06;
        if (u > posU - 0.02) return null;
        const t = titikJalan(u, p.cx, bawah, vy);
        return <ellipse key={i} cx={t.x + (i % 2 ? 14 : -14) * (1 - u)} cy={t.y} rx={10 * (1 - u)} ry={4 * (1 - u)}
          fill={wr.aksen} opacity={0.7} />;
      })}
      <G x={o.x + d.x} y={o.y + d.y} s={skala} o={prog(k, terus, 0.4)}>
        <G y={-80}>
          <Cahaya r={160} o={0.3 + 0.6 * prog(k, takLihat + 0.7, 0.8)} />
        </G>
        {/* berjalan sungguhan: lengan & kaki berayun, ritme langkah mengikuti laju sepanjang jalan */}
        <Orang wr={wr} langkah={Math.max(0, detik(k) - terus) * 7} />
      </G>
    </>
  );
};

// 7. "one day you'll thank yourself for not giving up when you had every reason to": matahari terbit di titik
//    cakrawala yang sama (match cut), menara dari hook kini utuh & menyala (bookend), bendera di puncak,
//    alasan-alasan untuk menyerah pecah menjadi partikel.
export const PuncakFajar: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const hari = tk(a, "suatu_hari", 0.6);
  const terima = tk(a, "terima_kasih", 2.4);
  const tak = tk(a, "tak_menyerah", 3.6);
  const alasan = tk(a, "alasan", 5.9);
  const d1 = drift(k, 0.3);
  const d2 = drift(k, 1);
  const fajar = progE(k, a.mulai, 1.8, INOUT);
  const gy = p.bawah - 20;
  const mn = prog(k, Math.min(hari, a.mulai + 0.3), 1.2);
  const skala = 0.9;
  const puncak = gy - 520 * skala;
  return (
    <>
      <defs>
        <KilauDef id="s7-kilau" w={wr} p={prog(k, terima, 1.4)} x0={p.cx - 120} x1={p.cx + 120} />
        <clipPath id="s7-fajar">
          <rect x={0} y={0} width={p.W} height={p.atas + 300} />
        </clipPath>
      </defs>
      <G x={d1.x} y={d1.y}>
        <G x={p.cx + 40} y={mix(p.atas + 420, p.atas + 230, fajar)}>
          <Cahaya r={460} o={0.9} />
          <g clipPath="url(#s7-fajar)" transform={`translate(${-(p.cx + 40)} ${-mix(p.atas + 420, p.atas + 230, fajar)})`}>
            <circle cx={p.cx + 40} cy={mix(p.atas + 420, p.atas + 230, fajar)} r={130} fill={wr.aksen} opacity={0.35} />
          </g>
        </G>
        <line x1={0} x2={p.W} y1={p.atas + 300} y2={p.atas + 300} stroke={wr.aksen} strokeOpacity={0.4} strokeWidth={3} />
      </G>
      <G x={p.cx + d2.x} y={gy + d2.y} s={skala} o={mn}>
        <Menara id="s7-menara" wr={wr} p={mix(0.4, 1, mn)} nyala={prog(k, hari + 0.4, 1.2)} stroke="url(#s7-kilau)" />
      </G>
      <G x={p.cx - 230 + d2.x} y={gy + d2.y} s={0.6} o={prog(k, terima, 0.5) * 0.7}>
        <Orang wr={wr} stroke={wr.garis} />
      </G>
      <path d={`M ${p.cx - 230} ${gy - 100} Q ${p.cx - 260} ${puncak - 80} ${p.cx} ${puncak - 150}`}
        {...garis(wr.aksen2, 4)} {...gambar(prog(k, terima + 0.2, 1))} filter="url(#sr-glow)" opacity={0.85} />
      <G x={p.cx + d2.x} y={puncak - 50 + d2.y} s={0.5} o={prog(k, terima, 0.5)}>
        <Cahaya r={200} o={0.8} />
        <Orang wr={wr} />
      </G>
      <G x={p.cx + 34 + d2.x} y={puncak - 50 + d2.y} s={0.55}>
        <Bendera wr={wr} p={prog(k, tak, 0.8)} kibar={Math.sin(detik(k) * 6)} />
      </G>
      {Array.from({ length: 6 }, (_, i) => {
        const ang = (i / 6) * Math.PI * 2 + detik(k) * 0.6;
        const m = prog(k, alasan - 0.9 + i * 0.08, 0.4);
        const pecah = prog(k, alasan + 0.3 + i * 0.06, 0.7);
        const x = p.cx + Math.cos(ang) * 300;
        const y = gy - 260 + Math.sin(ang) * 120;
        return (
          <G key={i} o={m}>
            <G x={x} y={y - pecah * 40} o={1 - pecah}>
              <rect x={-36} y={-20} width={72} height={40} rx={10} fill={wr.panel} stroke={wr.bahaya} strokeWidth={4} />
              <path d="M -10 -8 L 10 8 M 10 -8 L -10 8" {...garis(wr.bahaya, 4)} />
            </G>
            {Array.from({ length: 5 }, (_, j) => (
              <circle key={j} cx={x + (random(`p${i}${j}`) - 0.5) * 120 * pecah} cy={y - pecah * (80 + random(`q${i}${j}`) * 160)}
                r={3 + random(`r${i}${j}`) * 3} fill={wr.aksen2} opacity={pecah > 0 ? 1 - pecah : 0} />
            ))}
          </G>
        );
      })}
    </>
  );
};

// 8. Kartu akhir: judul di panel kaca + sapuan cahaya; ikon menara kecil sebagai tanda tangan visual.
export const KartuAkhir: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const m = prog(k, a.mulai, 0.6);
  const sapu = prog(k, a.mulai + 0.5, 1.0);
  const baris = [a.teks?.baris1 ?? "", a.teks?.baris2 ?? ""];
  const cy = (p.atas + p.bawah) / 2;
  return (
    <>
      <defs>
        <KilauDef id="s8-kilau" w={wr} p={sapu} x0={p.cx - 380} x1={p.cx + 380} dasar={wr.teks} />
        <KilauDef id="s8-kilau-m" w={wr} p={sapu} x0={p.cx - 140} x1={p.cx + 140} />
      </defs>
      {!baris[0] && !baris[1] ? (
        // tanpa teks (split-layout murni ilustrasi): menara utuh sebagai emblem + sosok di puncak + cincin cahaya
        <G x={p.cx} y={p.bawah - 20} s={mix(0.82, 0.9, m)} o={m}>
          <G y={-260}>
            <Cahaya r={420} o={0.9} />
          </G>
          {[0, 0.5].map((t0, i) => {
            const r = prog(k, a.mulai + 0.2 + t0, 1.2);
            return r > 0 && r < 1 ? (
              <ellipse key={i} cx={0} cy={0} rx={mix(140, 560, r)} ry={mix(30, 120, r)} {...garis(wr.aksen, 6 * (1 - r))}
                opacity={1 - r} />
            ) : null;
          })}
          <Menara id="s8-menara" wr={wr} p={1} nyala={1} stroke="url(#s8-kilau-m)" />
          <G y={-575} s={0.55}>
            <Cahaya r={200} o={0.9} />
            <Orang wr={wr} />
          </G>
          <G x={38} y={-575} s={0.6}>
            <Bendera wr={wr} p={1} kibar={Math.sin(detik(k) * 6)} />
          </G>
        </G>
      ) : (
      <G x={p.cx} y={cy} s={mix(0.94, 1, m)} o={m}>
        <Cahaya r={420} o={0.5} />
        <Kaca x={-400} y={-170} w={800} h={340} r={36} wr={wr} />
        <G y={-90} s={0.18}>
          <Menara id="s8-menara" wr={wr} p={1} nyala={1} />
        </G>
        <text x={0} y={20} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={64} fill={wr.teks} opacity={0.8}>
          {baris[0]}
        </text>
        <text x={0} y={104} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={76} fill="url(#s8-kilau)">
          {baris[1]}
        </text>
      </G>
      )}
    </>
  );
};

export const PUSTAKA: Record<string, React.FC<PropsAdegan>> = {
  "menara-sendiri": MenaraSendiri,
  "tujuan-pengorbanan": TujuanPengorbanan,
  "perisai-sunyi": PerisaiSunyi,
  "siang-malam": SiangMalam,
  "timbangan-ragu": TimbanganRagu,
  "jalan-sendiri": JalanSendiri,
  "puncak-fajar": PuncakFajar,
  "kartu-akhir": KartuAkhir,
  "otca-sapa": OtcaSapa,
  "otca-sertifikat-kampus": OtcaSertifikatKampus,
  "otca-tangga": OtcaTangga,
  "otca-timbangan": OtcaTimbangan,
  "otca-ruang-kuliah": OtcaRuangKuliah,
  "otca-coret": OtcaCoret,
  "otca-radar": OtcaRadar,
  "otca-bukti-gear": OtcaBuktiGear,
  "otca-pesawat-peta": OtcaPesawatPeta,
  "otca-kartu": OtcaKartu,
  "bara-coba": BaraCoba,
  "bara-titik-awal": BaraTitikAwal,
  "bara-semalam": BaraSemalam,
  "bara-berjuang": BaraBerjuang,
  "bara-sabuk": BaraSabuk,
  "bara-podium": BaraPodium,
  "bara-siklus": BaraSiklus,
  "bara-bayang": BaraBayang,
  "bara-pintu": BaraPintu,
  "bara-enso": BaraEnso,
  "koey-visa": KoeyVisa,
  "koey-nilai-plus": KoeyNilaiPlus,
  "koey-interview": KoeyInterview,
  "koey-level": KoeyLevel,
  "koey-guru": KoeyGuru,
  "koey-kaiwa": KoeyKaiwa,
  "koey-simpan": KoeySimpan,
  "koey-share": KoeyShare,
  "koey-kartu": KoeyKartu,
};
