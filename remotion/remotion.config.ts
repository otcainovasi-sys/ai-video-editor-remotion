import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// Hanya untuk CLI/Studio (npm run studio/render). Pipeline Python merender lewat render-server.mjs (Node API),
// yang TIDAK membaca file ini — setelan overlay (PNG → ProRes 4444 ber-alpha, bt709) ditulis eksplisit di sana.
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);
// VIDEO_CHROME = Chrome lokal; mesin cloud → Chrome bawaan (lihat render-server.mjs)
const CHROME_CLOUD = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
Config.setBrowserExecutable(process.env.VIDEO_CHROME || (fs.existsSync(CHROME_CLOUD) ? CHROME_CLOUD : null));
