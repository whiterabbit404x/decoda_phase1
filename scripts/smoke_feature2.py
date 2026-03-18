from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_URL = 'http://127.0.0.1:3000'


def run_step(command: list[str]) -> int:
    print(f"\n>>> Running: {' '.join(command)}")
    completed = subprocess.run(command, cwd=REPO_ROOT)
    return completed.returncode


def ensure_frontend_is_running() -> None:
    try:
        with urlopen(FRONTEND_URL, timeout=3.0) as response:
            if response.status >= 400:
                raise RuntimeError(f'Frontend responded with HTTP {response.status}.')
    except (URLError, RuntimeError) as exc:
        raise SystemExit(
            'Feature 2 smoke suite requires the Next.js app to be running first on '
            f'{FRONTEND_URL}. Start it with "npm run dev --workspace apps/web" and retry. '\
            f'Underlying check: {exc}'
        )


if __name__ == '__main__':
    backend_rc = run_step([sys.executable, '-m', 'pytest', 'services/api/tests/test_feature2_smoke.py', '-q'])
    if backend_rc != 0:
        raise SystemExit(backend_rc)

    ensure_frontend_is_running()

    frontend_rc = run_step(['npx', 'playwright', 'test', 'apps/web/tests/feature2-smoke.spec.ts'])
    raise SystemExit(frontend_rc)
