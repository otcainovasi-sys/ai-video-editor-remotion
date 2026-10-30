"""Tes layout panggung (L02): mask halus, isi lubang, kamera (cermin kamera.ts), pustaka modul, temporal tanpa ekor."""
import sys
import unittest
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import panggung as pg  # noqa: E402


def _adegan_sintetis():
    """Frame 'talent' lilac berbentuk kepala+badan di depan 'dinding batu' abu bertekstur + serpih batu menempel."""
    rng = np.random.default_rng(0)
    H, W = 480, 270
    batu = (90 + rng.normal(0, 18, (H, W, 1)).repeat(3, 2) * np.array([1.0, 1.05, 0.9])).clip(0, 255).astype(np.uint8)
    rgb = batu.copy()
    benar = np.zeros((H, W), np.uint8)
    cv2.ellipse(benar, (135, 170), (55, 70), 0, 0, 360, 1, -1)
    cv2.rectangle(benar, (60, 230), (210, H - 1), 1, -1)
    rgb[benar > 0] = (176, 150, 170)
    conf = cv2.GaussianBlur(cv2.dilate(benar.astype(np.float32), np.ones((15, 15))), (0, 0), 5)  # mask kasar melebar
    return rgb, conf, benar


class TesMaskHalus(unittest.TestCase):
    def test_tepi_kembali_ke_bentuk_benar(self):
        rgb, conf, benar = _adegan_sintetis()
        a = pg.haluskan_mask(rgb, conf, pita=31)
        salah = np.abs((a > 0.5).astype(int) - benar.astype(int)).mean()
        salah_awal = np.abs((conf > 0.5).astype(int) - benar.astype(int)).mean()
        self.assertLess(salah, salah_awal * 0.5)
        self.assertLess(salah, 0.01)

    def test_isi_lubang_hanya_kecil(self):
        m = np.ones((400, 200), np.uint8)
        m[50:54, 50:54] = 0          # lubang kecil salah kelas → diisi
        m[150:300, 40:160] = 0       # celah besar (antara lengan & badan) → tetap latar
        h = pg._isi_lubang(m)
        self.assertTrue(h[51, 51])
        self.assertFalse(h[200, 100])

    def test_temporal_tidak_membawa_serpih(self):
        rgb = np.full((40, 40, 3), 100, np.uint8)
        lama = np.zeros((40, 40), np.float32)
        lama[:, :10] = 1.0           # serpih di frame lama
        kini = np.zeros((40, 40), np.float32)
        hasil = pg.temporal(kini, lama, rgb, rgb, 0.5)
        self.assertLess(hasil[:, :10].max(), 0.05)
        kecil = np.full((40, 40), 0.1, np.float32)   # kedip kecil di tepi → diredam
        self.assertGreater(pg.temporal(np.zeros_like(kecil), kecil, rgb, rgb, 0.5).mean(), 0.03)

    def test_dekontaminasi_tepi(self):
        rgb = np.zeros((60, 60, 3), np.uint8)
        rgb[:, :30] = (200, 180, 200)
        rgb[:, 30:] = (40, 60, 40)
        a = np.zeros((60, 60), np.float32)
        a[:, :28] = 1
        a[:, 28:33] = 0.5
        out = pg.dekontaminasi(rgb, a)
        self.assertGreater(out[30, 31, 0], 150)  # pita tepi diisi warna subjek, bukan hijau batu


class TesKamera(unittest.TestCase):
    def test_punch_dan_dorong(self):
        adg = [{"mulai": 0, "selesai": 3, "kamera": {"s": 1.06, "dy": 0}, "punch": [{"t": 2.0, "s": 1.15}]},
               {"mulai": 3, "selesai": 9, "kamera": {"s": 0.86, "dy": 170}}]
        g = {"dorong": 0.04}
        s, dy = pg.kamera_pada(adg, 2.5, g)
        self.assertAlmostEqual(s, 1.06 * 1.15 * (1 + 0.04 * 2.5 / 3), places=4)
        s, dy = pg.kamera_pada(adg, 3.0, g)
        self.assertAlmostEqual(s, 0.86, places=4)
        self.assertEqual(dy, 170)


class TesPustaka(unittest.TestCase):
    def test_modul_terdaftar_dengan_garis(self):
        m = pg.modul_pustaka()
        for nama in ("pg-portal", "pg-orbit", "pg-terbang"):
            self.assertIn(nama, m)
        self.assertEqual(m["pg-orbit"], 1235.0)


if __name__ == "__main__":
    unittest.main()
