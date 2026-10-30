// Kamera virtual 2.5D untuk PanggungReel (layout "panggung", L02): satu frame penuh, talent hasil roto di depan latar
// bersih, grafis di lapis belakang (tertutup talent = oklusi) dan depan. Semua waktu dalam DETIK (di-resolve
// pipeline/scripts/panggung.py dari anchor kata); bahasa gerak (easing & durasi) dari props.gerak (panggung.json).

import { Easing, interpolate } from "remotion";

export type Bezier = [number, number, number, number];

/** Bahasa gerak satu video (storyboard): masuk expo-out, keluar cepat, tanpa overshoot. */
export type Gerak = {
  masuk: Bezier;
  keluar: Bezier;
  durasi_masuk: number;
  durasi_keluar: number;
  /** durasi snap punch-in kamera (s) */
  snap: number;
  /** durasi gerak kamera halus antar-adegan (s) */
  halus: number;
  /** dorong pelan per adegan: skala 1 → 1 + dorong (linear disengaja, gerak kamera konstan — pengecualian K05.1) */
  dorong: number;
};

export type CaraKamera = "potong" | "snap" | "halus";

/** Kamera dasar adegan: skala & geser vertikal (px) terhadap rekaman asli, titik asal (W/2, H·asal_y). */
export type Kamera = { s: number; dy: number; cara?: CaraKamera };

/** Punch-in sementara di dalam adegan: pengali skala, snap di detik `t`, bertahan sampai `sampai` (bawaan akhir adegan). */
export type Punch = { t: number; s: number; sampai?: number };

export type AdeganPg = {
  modul: string;
  mulai: number;
  selesai: number;
  t: Record<string, number>;
  kamera: Kamera;
  punch?: Punch[];
  /** match cut "garis": adegan menyempit jadi garis emas horizontal di y `garis` lalu adegan baru membuka dari garis itu. */
  masuk?: "garis" | "potong";
  keluar?: "garis" | "potong";
  /** posisi caption (px, tengah baris) khusus adegan ini */
  caption_y?: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const bz = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 dari detik `s` selama `d` detik dengan easing `e`. */
export const antara = (t: number, s: number, d: number, e: (x: number) => number) =>
  interpolate(t, [s, s + Math.max(d, 1e-3)], [0, 1], { ...clamp, easing: e });

const durasiCara = (g: Gerak, c: CaraKamera | undefined) => (c === "potong" ? 0 : c === "snap" ? g.snap : g.halus);
const easingCara = (c: CaraKamera | undefined) => (c === "snap" ? Easing.out(Easing.exp) : Easing.inOut(Easing.cubic));

/** Pengali punch aktif di adegan `a` pada detik t (snap masuk; keluar lagi bila `sampai` diisi). */
const punchPada = (a: AdeganPg, t: number, g: Gerak) => {
  let m = 1;
  for (const p of a.punch ?? []) {
    const masuk = antara(t, p.t, g.snap, Easing.out(Easing.exp));
    const keluar = p.sampai !== undefined ? antara(t, p.sampai, g.halus, Easing.inOut(Easing.cubic)) : 0;
    m *= mix(1, p.s, masuk * (1 - keluar));
  }
  return m;
};

/** Kamera efektif di detik t: transisi dari kamera akhir adegan sebelumnya (termasuk punch) ke kamera adegan ini
 *  sesuai `cara`, dikali punch & dorong pelan. Mengembalikan juga indeks adegan aktif. */
export const kameraPada = (adegan: AdeganPg[], t: number, g: Gerak): { s: number; dy: number; i: number } => {
  let i = 0;
  while (i < adegan.length - 1 && adegan[i + 1].mulai <= t) i++;
  const a = adegan[i];
  const dorong = (sc: AdeganPg, tt: number) =>
    1 + g.dorong * Math.min(1, Math.max(0, (tt - sc.mulai) / Math.max(0.1, sc.selesai - sc.mulai)));
  let s = a.kamera.s;
  let dy = a.kamera.dy;
  if (i > 0) {
    const b = adegan[i - 1];
    const sb = b.kamera.s * punchPada(b, a.mulai, g) * dorong(b, a.mulai);
    const u = antara(t, a.mulai, durasiCara(g, a.kamera.cara), easingCara(a.kamera.cara));
    s = mix(sb, a.kamera.s, u);
    dy = mix(b.kamera.dy, a.kamera.dy, u);
  }
  return { s: s * punchPada(a, t, g) * dorong(a, t), dy, i };
};

/** Transform CSS satu lapis: grafis digambar di koordinat layar pada kamera DASAR adegannya (`dasar`); lapis ber-
 *  kedalaman k (0 = diam, 1 = menempel talent) mengikuti kamera sekarang relatif ke dasar → parallax. */
export const lapis = (kini: { s: number; dy: number }, dasar: { s: number; dy: number }, k: number) => {
  const r = kini.s / dasar.s;
  return { s: 1 + (r - 1) * k, ty: k * (kini.dy - r * dasar.dy) };
};
