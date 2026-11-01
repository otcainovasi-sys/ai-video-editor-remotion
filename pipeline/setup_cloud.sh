#!/usr/bin/env bash
# Setup mesin cloud (Linux) — dijalankan otomatis tiap mesin baru (setup script environment).
# Idempoten: lewati langkah yang sudah terpasang. Laptop Windows tetap pakai README (Persiapan).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
if ! .venv/bin/python -c "import whisperx, mediapipe, cv2" 2>/dev/null; then
  .venv/bin/pip install -q --upgrade pip
  # versi persis (tanpa resolve ulang; resolve dari requirements.txt butuh ~35 menit)
  .venv/bin/pip install -q -r pipeline/requirements-linux.lock
fi

if [ ! -d remotion/node_modules ]; then
  (cd remotion && npm ci --no-audit --no-fund)
fi

# musik & SFX bawaan (di-.gitignore, dibuat ulang dari kode)
[ -d pipeline/aset-bawaan/sfx/v2 ] || .venv/bin/python pipeline/scripts/sfx.py > /dev/null
[ -d pipeline/aset-bawaan/musik ] || .venv/bin/python pipeline/scripts/musik.py > /dev/null

mkdir -p .sementara
echo "setup_cloud: siap"
