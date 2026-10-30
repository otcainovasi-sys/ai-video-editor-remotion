import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { Uji, ujiDefault } from "./compositions/Uji";
import { Checklist, ChecklistProps } from "./compositions/Checklist";
import { PromptUI, PromptUIProps } from "./compositions/PromptUI";
import { Penghitung, PenghitungProps } from "./compositions/Penghitung";
import { Terminal, TerminalProps } from "./compositions/Terminal";
import { Coret, CoretProps } from "./compositions/Coret";
import { Timeline, TimelineProps } from "./compositions/Timeline";
import { GridVariasi, GridVariasiProps } from "./compositions/GridVariasi";
import { FormGanti, FormGantiProps } from "./compositions/FormGanti";
import { Partikel, PartikelProps } from "./compositions/Partikel";
import { AksenGaya, AksenGayaProps } from "./compositions/AksenGaya";
import { Sapuan, SapuanProps } from "./compositions/Sapuan";
import { ChartGrow, ChartGrowProps } from "./compositions/ChartGrow";
import { GlassType, GlassTypeProps } from "./compositions/GlassType";
import { CoverStory, CoverStoryProps } from "./compositions/CoverStory";
import { DoodleBoil, DoodleBoilProps } from "./compositions/DoodleBoil";
import { HeadlineWall, HeadlineWallProps } from "./compositions/HeadlineWall";
import { Orbit, OrbitProps } from "./compositions/Orbit";
import { CouchWall, CouchWallProps } from "./compositions/CouchWall";
import { UIWorld, UIWorldProps } from "./compositions/UIWorld";
import { PaperCut, PaperCutProps } from "./compositions/PaperCut";
import { JudulGaya, JudulGayaProps } from "./compositions/JudulGaya";
import { Callout, CalloutElemen, Langkah, LangkahElemen, Linimasa, LinimasaElemen, LowerThird, LowerThirdElemen,
         SebelumSesudah, SebelumSesudahElemen } from "./compositions/Penjelas";
import { GrowthCurve, GrowthCurveElemen, HeadlineStorm, HeadlineStormElemen, LiquidGlass, LiquidGlassElemen, StudioSet,
         StudioSetElemen } from "./compositions/EfekBaru";
import { BabBaru, BabBaruElemen, DuaLinimasa, DuaLinimasaElemen, KinetikKata, KinetikKataElemen, Lintasan,
         LintasanElemen } from "./compositions/Reflektif";
import { SplitReel, SplitReelProps } from "./split/SplitReel";
import { PanggungReel, PanggungReelProps } from "./panggung/PanggungReel";
import { PropsDasar, Tokens } from "./lib/kontrak";
import platform from "../../tokens/TOKEN_00_platform_v0.4.json";
import glass from "../../tokens/TOKEN_01_glass-tech_v0.3.json";

const [W, H] = platform.format.resolusi;
const z = platform["zona-aman"];

// Default hanya untuk Remotion Studio. Render dari pipeline selalu lewat --props (token gabungan proyek).
const dasar = <E,>(elemen: PropsDasar<E>["elemen"], detik: number): PropsDasar<E> => ({
  W, H, fps: platform.format.fps, durasiFrame: Math.round(detik * platform.format.fps), skala: 1,
  zona: [z.kiri, z.atas, W - z.kanan, H - z.bawah],
  tokens: { ...platform, ...glass } as unknown as Tokens,
  elemen,
});

// Ukuran, fps, dan durasi mengikuti props dari Python.
const dariProps = <P extends PropsDasar<unknown>,>(): CalculateMetadataFunction<P> => ({ props }) => ({
  durationInFrames: props.durasiFrame, fps: props.fps, width: props.W, height: props.H,
});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Uji" component={Uji} width={W} height={H} fps={platform.format.fps}
                 durationInFrames={90} defaultProps={ujiDefault} />
    <Composition
      id="Checklist"
      component={Checklist}
      calculateMetadata={dariProps<ChecklistProps>()}
      defaultProps={dasar(
        { judul: "Ringkasan", item: ["Bangun *portofolio*", "Tunjukkan hasil", "Sertifikat pelengkap"],
          stagger: 0.8, posisi: "tengah", durasi_masuk: 0.38, durasi_keluar: 0.24 },
        5,
      ) as ChecklistProps}
    />
    <Composition
      id="PromptUI"
      component={PromptUI}
      calculateMetadata={dariProps<PromptUIProps>()}
      defaultProps={dasar(
        { label: "1 Hari 1 Kata Prompt · #4", teks: "Editkan, pakai *rotoscope*.", lampiran: "video-kamu.mp4",
          posisi: "atas", durasi_masuk: 0.38, durasi_keluar: 0.24,
          jadwal: { ketik: Array.from({ length: 26 }, (_, i) => 0.6 + i / 22), lampiran: 0.23, kirim: 2.05,
                    ciut: 4.4, durasi_ciut: 0.45 } },
        6,
      ) as PromptUIProps}
    />
    <Composition id="Penghitung" component={Penghitung} calculateMetadata={dariProps<PenghitungProps>()}
      defaultProps={dasar({ judul: "hypit-ai / hypit", sub: "Clone any viral video with AI agents", ke: 23877, label: "bintang",
        durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9, jadwal: { mulai_hitung: 0.53, durasi_hitung: 1.6 } }, 4) as PenghitungProps} />
    <Composition id="Terminal" component={Terminal} calculateMetadata={dariProps<TerminalProps>()}
      defaultProps={dasar({ judul: "Claude Code", perintah: "klon reel ini jadi workflow",
        keluaran: ["membaca reel.mp4", "memetakan tiap potongan", "✓ workflow siap"], durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9,
        jadwal: { ketik: Array.from({ length: 27 }, (_, i) => 0.6 + i / 22), enter: 2.1, baris: [2.25, 2.6, 2.95] } }, 5) as TerminalProps} />
    <Composition id="Coret" component={Coret} calculateMetadata={dariProps<CoretProps>()}
      defaultProps={dasar({ judul: "naskah.txt", teks: "naskahnya", durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9,
        jadwal: { coret: 0.8, durasi_coret: 0.35, silang: 1.15 } }, 3) as CoretProps} />
    <Composition id="Timeline" component={Timeline} calculateMetadata={dariProps<TimelineProps>()}
      defaultProps={dasar({ chip: ["semua", "pas", "dengan", "tiap", "kata"], catatan: "ditambatkan ke kata", durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9,
        jadwal: { trek: [0.58, 1.08, 1.58], chip: [2.2, 2.5, 2.8, 3.1, 3.4], playhead: [0.38, 5.5] } }, 6) as TimelineProps} />
    <Composition id="GridVariasi" component={GridVariasi} calculateMetadata={dariProps<GridVariasiProps>()}
      defaultProps={dasar({ judul: "ship", ke: 60, durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9,
        jadwal: { ubin: Array.from({ length: 60 }, (_, i) => 0.7 + 1.8 * (0.5 - Math.sin(Math.asin(1 - 2 * ((i + 1) / 60)) / 3))) } }, 4.5) as GridVariasiProps} />
    <Composition id="FormGanti" component={FormGanti} calculateMetadata={dariProps<FormGantiProps>()}
      defaultProps={dasar({ baris: [{ label: "host", lama: "Host asli", baru: "Host kamu" }, { label: "hook", lama: "“Tunggu dulu…”", baru: "“Stop scroll!”" },
        { label: "bahasa", lama: "English", baru: "Indonesia" }], durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9, jadwal: { ganti: [0.78, 1.48, 2.18] } }, 4.5) as FormGantiProps} />
    <Composition id="Partikel" component={Partikel} calculateMetadata={dariProps<PartikelProps>()}
      defaultProps={dasar({ x: 0.5, y: 0.35, durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9, jadwal: { ledak: 0 } }, 1.2) as PartikelProps} />
    <Composition id="AksenGaya" component={AksenGaya} calculateMetadata={dariProps<AksenGayaProps>()}
      defaultProps={dasar({ x: 0.5, y: 0.35, durasi_masuk: 0.3, durasi_keluar: 0.2, jadwal: { mulai: 0.1 } }, 1.6) as AksenGayaProps} />
    <Composition id="Sapuan" component={Sapuan} calculateMetadata={dariProps<SapuanProps>()}
      defaultProps={dasar({ jenis: "kertas", durasi_masuk: 0, durasi_keluar: 0 }, 0.9) as SapuanProps} />
    <Composition id="ChartGrow" component={ChartGrow} calculateMetadata={dariProps<ChartGrowProps>()}
      defaultProps={dasar({ judul: "retensi per bulan", nilai: [22, 31, 38, 54, 73], label: ["Jan", "Feb", "Mar", "Apr", "Mei"], akhiran: "%",
        catatan: "naik *3×* sejak konsisten", durasi_masuk: 0.38, durasi_keluar: 0.24, opasitas: 0.9,
        jadwal: { batang: [0.6, 0.85, 1.1, 1.35, 1.6], durasi_batang: 0.5, catatan: 2.3 } }, 4.5) as ChartGrowProps} />
    <Composition id="GlassType" component={GlassType} calculateMetadata={dariProps<GlassTypeProps>()}
      defaultProps={dasar({ teks: "FOKUS\n*SATU*", y: 0.32, durasi_masuk: 0.38, durasi_keluar: 0.24,
        jadwal: { huruf: Array.from({ length: 9 }, (_, i) => 0.2 + i * 0.06), kilau: 1.2 } }, 3) as GlassTypeProps} />
    <Composition id="CoverStory" component={CoverStory} calculateMetadata={dariProps<CoverStoryProps>()}
      defaultProps={dasar({ masthead: "KREATOR", judul_utama: "Rahasia *retensi*", baris: ["3 hook yang *bekerja*", "Audio jernih tanpa alat mahal"],
        edisi: "Edisi 04 · Okt 2026", durasi_masuk: 0.38, durasi_keluar: 0.24,
        jadwal: { masthead: 0.1, judul: 1.4, baris: [0.7, 0.95], barcode: 1.8 } }, 4) as CoverStoryProps} />
    <Composition id="DoodleBoil" component={DoodleBoil} calculateMetadata={dariProps<DoodleBoilProps>()}
      defaultProps={dasar({ anotasi: [{ jenis: "lingkar", x: 0.5, y: 0.3, w: 0.5, h: 0.2 }, { jenis: "panah", x: 0.62, y: 0.42, arah: 30, teks: "ini kuncinya!" },
        { jenis: "bintang", x: 0.25, y: 0.22, w: 0.08 }], durasi_masuk: 0.2, durasi_keluar: 0.2,
        jadwal: { gores: [0.2, 0.8, 1.3], durasi_gores: 0.5 } }, 3) as DoodleBoilProps} />
    <Composition id="HeadlineWall" component={HeadlineWall} calculateMetadata={dariProps<HeadlineWallProps>()}
      defaultProps={dasar({ judul_judul: ["Kreator kecil *tumbuh 3×*", "Algoritma suka konsistensi", "Video pendek kuasai 2026",
        "Retensi > jumlah posting", "Hook 3 detik pertama", "Caption naikkan tontonan"], sorot: 3, durasi_masuk: 0.3, durasi_keluar: 0.3,
        jadwal: { kartu: [0.2, 0.35, 0.5, 0.65, 0.8, 0.95], sorot: 2.2 } }, 4.5) as HeadlineWallProps} />
    <Composition id="Orbit" component={Orbit} calculateMetadata={dariProps<OrbitProps>()}
      defaultProps={dasar({ pusat: "Reel *Kit*", sub: "satu workflow, semua format", satelit: ["Caption", "SFX", "B-roll", "Musik", "Ekspor"],
        durasi_masuk: 0.3, durasi_keluar: 0.3, jadwal: { masuk: 0.1 } }, 4) as OrbitProps} />
    <Composition id="CouchWall" component={CouchWall} calculateMetadata={dariProps<CouchWallProps>()}
      defaultProps={dasar({ konten: [{ judul: "Mulai dari *satu* ide" }, { judul: "Rekam *tanpa* naskah", sub: "cukup poin" }, { judul: "Edit *15 menit*" }],
        durasi_masuk: 0.3, durasi_keluar: 0.3, jadwal: { ganti: [0.2, 2.6, 5.0] } }, 7.5) as CouchWallProps} />
    <Composition id="UIWorld" component={UIWorld} calculateMetadata={dariProps<UIWorldProps>()}
      defaultProps={dasar({ judul: "Semua *terhubung*", sub: "data · tim · progres", durasi_masuk: 0.3, durasi_keluar: 0.3,
        jadwal: { tiba: 3.6 } }, 5) as UIWorldProps} />
    <Composition id="PaperCut" component={PaperCut} calculateMetadata={dariProps<PaperCutProps>()}
      defaultProps={dasar({ judul: "Cerita *dimulai* di sini", sub: "bab 1", durasi_masuk: 0.3, durasi_keluar: 0.3,
        jadwal: { lapis: [0.1, 0.3, 0.5, 0.7], kartu: 1.5 } }, 4) as PaperCutProps} />
    <Composition id="JudulGaya" component={JudulGaya} calculateMetadata={dariProps<JudulGayaProps>()}
      defaultProps={dasar({ teks: "Jangan upload sebelum\n*baca ini*", posisi: "atas", stroke: true, durasi_masuk: 0.4, durasi_keluar: 0.25,
        jadwal: { huruf: Array.from({ length: 30 }, (_, i) => 0.2 + i / 22), selesai_masuk: 1.6 } }, 3) as JudulGayaProps} />
    <Composition id="LowerThird" component={LowerThird} calculateMetadata={dariProps<PropsDasar<LowerThirdElemen>>()}
      defaultProps={dasar({ nama: "Rina *Pratama*", peran: "Konten kreator edukasi", durasi_masuk: 0.3, durasi_keluar: 0.3,
        jadwal: { pita: 0.1, nama: 0.35, peran: 0.55 } }, 3) as PropsDasar<LowerThirdElemen>} />
    <Composition id="Langkah" component={Langkah} calculateMetadata={dariProps<PropsDasar<LangkahElemen>>()}
      defaultProps={dasar({ item: ["Ide", "Skrip", "*Render*"], posisi: "atas", durasi_masuk: 0.35, durasi_keluar: 0.25,
        jadwal: { langkah: [0.5, 1.1, 1.7] } }, 4) as PropsDasar<LangkahElemen>} />
    <Composition id="SebelumSesudah" component={SebelumSesudah} calculateMetadata={dariProps<PropsDasar<SebelumSesudahElemen>>()}
      defaultProps={dasar({ sebelum: "Edit manual berjam-jam", sesudah: "Cukup *ngobrol* dengan AI", durasi_masuk: 0.35, durasi_keluar: 0.25,
        jadwal: { wipe: 1.0, durasi_wipe: 0.8 } }, 4) as PropsDasar<SebelumSesudahElemen>} />
    <Composition id="Callout" component={Callout} calculateMetadata={dariProps<PropsDasar<CalloutElemen>>()}
      defaultProps={dasar({ x: 0.7, y: 0.6, teks: "Klik *di sini*", durasi_masuk: 0.3, durasi_keluar: 0.25,
        jadwal: { lingkar: 0.1, label: 0.5 } }, 3) as PropsDasar<CalloutElemen>} />
    <Composition id="Linimasa" component={Linimasa} calculateMetadata={dariProps<PropsDasar<LinimasaElemen>>()}
      defaultProps={dasar({ titik: [{ tahun: "2022", label: "Mulai" }, { tahun: "2024", label: "Tumbuh" }, { tahun: "2026", label: "Skala" }],
        durasi_masuk: 0.35, durasi_keluar: 0.25, jadwal: { garis: 0.4, titik: [0.5, 1.0, 1.5] } }, 4) as PropsDasar<LinimasaElemen>} />
    <Composition id="LiquidGlass" component={LiquidGlass} calculateMetadata={dariProps<PropsDasar<LiquidGlassElemen>>()}
      defaultProps={dasar({ judul: "Efek *kaca cair*", sub: "membiaskan video di belakangnya", posisi: "atas", opasitas: 0.24,
        durasi_masuk: 0.3, durasi_keluar: 0.25, jadwal: { morf: 0.1 } }, 3) as PropsDasar<LiquidGlassElemen>} />
    <Composition id="HeadlineStorm" component={HeadlineStorm} calculateMetadata={dariProps<PropsDasar<HeadlineStormElemen>>()}
      defaultProps={dasar({ judul_judul: ["Harga *naik* lagi", "Kreator bingung", "Algoritma berubah", "Semua panik"], utama: "Tenang, ini *solusinya*",
        durasi_masuk: 0.2, durasi_keluar: 0.3, jadwal: { potongan: Array.from({ length: 16 }, (_, i) => 0.1 + i * 0.12), utama: 2.4 } }, 4.2) as PropsDasar<HeadlineStormElemen>} />
    <Composition id="GrowthCurve" component={GrowthCurve} calculateMetadata={dariProps<PropsDasar<GrowthCurveElemen>>()}
      defaultProps={dasar({ judul: "penonton per minggu", ke: 12000, akhiran: "", label_x: ["Jan", "Jun"],
        tonggak: [{ x: 0.4, label: "konsisten" }, { x: 0.75, label: "viral" }], catatan: "naik *12×* dalam 6 bulan",
        durasi_masuk: 0.35, durasi_keluar: 0.25, jadwal: { gambar: 0.5, durasi_gambar: 2.0, catatan: 2.7 } }, 4.5) as PropsDasar<GrowthCurveElemen>} />
    <Composition id="StudioSet" component={StudioSet} calculateMetadata={dariProps<PropsDasar<StudioSetElemen>>()}
      defaultProps={dasar({ lubang: [0.2, 0.12, 0.8, 0.72], judul: "STUDIO", durasi_masuk: 0, durasi_keluar: 0, jadwal: {} }, 3) as PropsDasar<StudioSetElemen>} />
    <Composition id="KinetikKata" component={KinetikKata} calculateMetadata={dariProps<PropsDasar<KinetikKataElemen>>()}
      defaultProps={dasar({ frasa: [[{ w: "still", aksen: false }, { w: "finding", aksen: false }, { w: "your", aksen: true }, { w: "way", aksen: true }],
                                    [{ w: "honestly,", aksen: false }, { w: "it", aksen: true }, { w: "hurts.", aksen: true }]],
        posisi: "atas", durasi_masuk: 0.3, durasi_keluar: 0.3,
        jadwal: { kata: [[0.1, 0.35, 0.7, 0.9], [2.2, 2.6, 2.75]], frasa: [[0.1, 2.1], [2.2, 4.0]] } }, 4) as PropsDasar<KinetikKataElemen>} />
    <Composition id="Lintasan" component={Lintasan} calculateMetadata={dariProps<PropsDasar<LintasanElemen>>()}
      defaultProps={dasar({ judul: "Not the same *destination*", sub: "life isn't a race", tujuan: ["career", "family", "*your path*", "travel"],
        durasi_masuk: 0, durasi_keluar: 0, jadwal: { judul: 0.1, garis: [0.3, 0.45, 0.6, 0.75], pelari: 0.9, tujuan: [1.4, 1.55, 1.7, 1.85] } }, 4.5) as PropsDasar<LintasanElemen>} />
    <Composition id="DuaLinimasa" component={DuaLinimasa} calculateMetadata={dariProps<PropsDasar<DuaLinimasaElemen>>()}
      defaultProps={dasar({ judul: "Your *own* timeline", sub: "not someone else's", label_a: "theirs", label_b: "yours",
        titik_a: ["degree", "job", "house"], titik_b: ["learn", "fail", "grow", "bloom"], durasi_masuk: 0, durasi_keluar: 0,
        jadwal: { garis_a: [0.4, 1.4], garis_b: [0.6, 3.0], a: [0.65, 0.95, 1.25], b: [0.9, 1.7, 2.2, 2.9], akhir: 3.2 } }, 4.4) as PropsDasar<DuaLinimasaElemen>} />
    <Composition id="BabBaru" component={BabBaru} calculateMetadata={dariProps<PropsDasar<BabBaruElemen>>()}
      defaultProps={dasar({ judul: "A *different* chapter", sub: "of your life", kepala: "Chapter", nomor: "II", durasi_masuk: 0,
        durasi_keluar: 0, jadwal: { balik: [0.4, 0.8, 1.2], judul: 1.9, dorong: 1.8 } }, 5.5) as PropsDasar<BabBaruElemen>} />
    {/* Layout split talking-head (pipeline/scripts/split.py). Studio: split.py studio <proyek> mengisi --props. */}
    <Composition id="SplitReel" component={SplitReel}
      calculateMetadata={({ props }: { props: SplitReelProps }) => ({ durationInFrames: props.durasiFrame, fps: props.fps,
        width: props.W, height: props.H })}
      defaultProps={{ W, H, fps: platform.format.fps, durasiFrame: 90, tokens: { ...platform, ...glass } as unknown as Tokens,
        zona: [z.kiri, z.atas, W - z.kanan, H - z.bawah], tinggi_panggung: 930, gradasi: 320,
        footage: { src: "proyek/contoh/talent.mp4", geser_y: 560, titik_zoom_y: 950 }, zoom: [[0, 1], [99, 1]],
        adegan: [{ modul: "menara-sendiri", mulai: 0, selesai: 3, t: {} }], kata: [],
        caption: { y: 930, kata_maks: 4, karakter_maks: 18, jeda_pecah: 0.35 } } as SplitReelProps} />
    {/* Layout panggung (L02, pipeline/scripts/panggung.py): satu frame penuh, talent roto + kedalaman 4 lapis + kamera
        virtual. Studio: panggung.py studio <proyek> mengisi --props (footage proyek ada di public/proyek/<id>/). */}
    <Composition id="PanggungReel" component={PanggungReel}
      calculateMetadata={({ props }: { props: PanggungReelProps }) => ({ durationInFrames: props.durasiFrame, fps: props.fps,
        width: props.W, height: props.H })}
      defaultProps={{ W, H, fps: platform.format.fps, durasiFrame: 90, tokens: { ...platform, ...glass } as unknown as Tokens,
        zona: [z.kiri, z.atas, W - z.kanan, H - z.bawah], asal_y: 0.42,
        footage: { talent: "proyek/contoh/talent.webm", latar: "proyek/contoh/latar.mp4" },
        grade: { latar_terang: 0.32, latar_blur: 16, latar_saturasi: 0.45, rim: 0.45, bayangan: 0.55 },
        adegan: [{ modul: "pg-portal", mulai: 0, selesai: 3, t: {}, kamera: { s: 1.06, dy: 0 } }],
        gerak: { masuk: [0.16, 1, 0.3, 1], keluar: [0.7, 0, 0.84, 0], durasi_masuk: 0.6, durasi_keluar: 0.33, snap: 0.2,
          halus: 0.7, dorong: 0.04 },
        kata: [], caption: { y: 1425, kata_maks: 2, karakter_maks: 18, jeda_pecah: 0.35 } } as PanggungReelProps} />
  </>
);
