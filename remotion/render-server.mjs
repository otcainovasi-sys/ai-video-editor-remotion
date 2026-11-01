// render-server — proses Node berumur panjang untuk pipeline Python (remotion_jembatan.py).
// Bundle webpack SEKALI (di-cache per sidik sumber di .bundle/<kunci>) + SATU browser untuk semua overlay,
// alih-alih `remotion render` per overlay (bundle + Chrome cold start tiap kali).
//
// Pemakaian (oleh Python):  node render-server.mjs --bundle .bundle/<kunci>
// Protokol: stdin satu JSON per baris {id, komposisi, props, out}
//           stdout baris berawalan "@@J " + JSON: {siap} | {id, ok, error?}
// Log Remotion/Chrome dialihkan ke stderr agar stdout hanya berisi protokol.
// Catatan: remotion.config.ts TIDAK berlaku untuk Node API — setelan render ditulis eksplisit di bawah.
import { bundle } from "@remotion/bundler";
import { ensureBrowser, openBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

console.log = (...a) => console.error(...a);
const kirim = (obj) => process.stdout.write(`@@J ${JSON.stringify(obj)}\n`);

const DIR = path.dirname(fileURLToPath(import.meta.url));
const arg = process.argv.indexOf("--bundle");
if (arg < 0) {
  console.error("butuh --bundle <dir>");
  process.exit(2);
}
const dirBundle = path.resolve(DIR, process.argv[arg + 1]);

const siapkanBundle = async () => {
  if (fs.existsSync(path.join(dirBundle, "index.html"))) return dirBundle;
  const tmp = `${dirBundle}.tmp`;
  fs.rmSync(tmp, { recursive: true, force: true });
  await bundle({ entryPoint: path.join(DIR, "src", "index.ts"), outDir: tmp, publicDir: path.join(DIR, "public"),
                 rootDir: DIR, enableCaching: true });
  // bundle lama tidak dipakai lagi (sidik sumber berubah) → hapus agar .bundle tidak menumpuk
  for (const d of fs.readdirSync(path.dirname(dirBundle))) {
    const p = path.join(path.dirname(dirBundle), d);
    if (p !== tmp && p !== dirBundle && fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
  }
  fs.renameSync(tmp, dirBundle);
  return dirBundle;
};

const serveUrl = await siapkanBundle();
// VIDEO_CHROME = Chrome lokal; mesin cloud (tidak bisa mengunduh Chrome Headless Shell Remotion) → Chrome bawaan
const CHROME_CLOUD = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.VIDEO_CHROME || (fs.existsSync(CHROME_CLOUD) ? CHROME_CLOUD : null);
await ensureBrowser({ browserExecutable });
const browser = await openBrowser("chrome", { browserExecutable, logLevel: "error" });

const render = async ({ komposisi, props, out }) => {
  const composition = await selectComposition({ serveUrl, id: komposisi, inputProps: props, puppeteerInstance: browser,
                                                logLevel: "error" });
  await renderMedia({
    composition, serveUrl, inputProps: props, puppeteerInstance: browser, outputLocation: out, overwrite: true,
    // overlay ber-alpha untuk dikomposit Python: PNG per frame → ProRes 4444, ruang warna bt709 DITANDAI
    // (sama dengan ingest/master; tanpa tanda, pembaca harus menebak matriks warna)
    codec: "prores", proResProfile: "4444", pixelFormat: "yuva444p10le", imageFormat: "png", colorSpace: "bt709",
    muted: true, logLevel: "error",
  });
};

// Antrean berurutan: satu overlay pada satu waktu (renderMedia sendiri sudah paralel per frame).
let antre = Promise.resolve();
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (baris) => {
  if (!baris.trim()) return;
  antre = antre.then(async () => {
    let req;
    try {
      req = JSON.parse(baris);
      await render(req);
      kirim({ id: req.id, ok: true });
    } catch (e) {
      kirim({ id: req?.id ?? null, ok: false, error: String(e?.stack ?? e) });
    }
  });
});
rl.on("close", () => {
  antre.finally(async () => {
    await browser.close({ silent: true }).catch(() => undefined);
    process.exit(0);
  });
});
kirim({ siap: true });
