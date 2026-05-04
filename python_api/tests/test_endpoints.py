"""Live FastAPI smoke checks.

This file can be used in two modes:
- `python python_api/tests/test_endpoints.py http://127.0.0.1:8015`
- `MELE_LIVE_API_URL=http://127.0.0.1:8015 pytest python_api/tests/test_endpoints.py`

Plain `pytest python_api/tests` skips this live test unless MELE_LIVE_API_URL is
set. The normal CI endpoint smoke test is `npm test`, which starts the API
itself through `tests/verify-python-api.mjs`.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


DEFAULT_BASE = "http://localhost:8000"


CASES = [
    (
        "numerology",
        {"year": 1990, "month": 5, "day": 15},
        lambda data: data["lifePath"] in {1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33},
    ),
    ("maya", {"year": 1990, "month": 5, "day": 15}, lambda data: 1 <= data["kin"] <= 260),
    (
        "bazi",
        {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0},
        lambda data: all(key in data["pillars"] for key in ["year", "month", "day", "time"]),
    ),
    (
        "ziwei",
        {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0, "gender": "female"},
        lambda data: len(data["palaces"]) == 12,
    ),
    (
        "tarot",
        {"count": 3, "reversed_enabled": True, "spread": "past-present-future"},
        lambda data: len(data["cards"]) == 3,
    ),
    ("runes", {"count": 3, "reversed_enabled": True}, lambda data: len(data["runes"]) == 3),
    (
        "astro",
        {
            "year": 1990,
            "month": 5,
            "day": 15,
            "hour": 12,
            "minute": 0,
            "timezone": 8.0,
            "latitude": 25.033,
            "longitude": 121.5654,
        },
        lambda data: len(data["planets"]) >= 10,
    ),
    (
        "humandesign",
        {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0, "timezone": 8.0},
        lambda data: data["type"] in {"Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector"},
    ),
]


def call(base: str, tool: str, payload: dict) -> tuple[bool, dict | str]:
    url = f"{base}/api/v1/calc/{tool}"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status == 200, json.loads(response.read())
    except urllib.error.HTTPError as error:
        return False, error.read().decode()
    except Exception as error:
        return False, str(error)


def run_checks(base: str) -> int:
    passed = 0
    failed = 0

    def check(name: str, condition: bool, detail: str = ""):
        nonlocal passed, failed
        mark = "\033[32mOK\033[0m" if condition else "\033[31mFAIL\033[0m"
        print(f"  {mark} {name}{' - ' + detail if detail else ''}")
        if condition:
            passed += 1
        else:
            failed += 1

    print(f"\n=== Live API smoke checks against {base} ===\n")

    try:
        with urllib.request.urlopen(f"{base}/health", timeout=5) as response:
            health = json.loads(response.read())
            check("/health", response.status == 200, f"version {health.get('version')}")
    except Exception as error:
        check("/health", False, str(error))
        print("\nAPI is not reachable. Start it first or pass a live API URL.\n")
        return 1

    print()
    for tool, payload, validate in CASES:
        ok, body = call(base, tool, payload)
        if not ok:
            check(f"POST /api/v1/calc/{tool}", False, f"HTTP error: {str(body)[:80]}")
            continue

        has_shell = all(key in body for key in ["tool", "version", "computed_at", "input", "data", "render"])
        check(f"POST /api/v1/calc/{tool} has response shell", has_shell)
        if has_shell:
            check("  data validates", validate(body["data"]))
            check("  render.svg present", bool(body["render"].get("svg")))
            check("  render.speech present", bool(body["render"].get("speech")))
            check("  render.palette present", len(body["render"].get("palette") or []) >= 1)

    print("\n============================")
    print(f"\033[32m{passed} passed\033[0m / \033[31m{failed} failed\033[0m")
    return 0 if failed == 0 else 1


def test_live_api_smoke():
    import pytest

    base = os.environ.get("MELE_LIVE_API_URL")
    if not base:
        pytest.skip("MELE_LIVE_API_URL is not set")
    assert run_checks(base.rstrip("/")) == 0


if __name__ == "__main__":
    base_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE
    sys.exit(run_checks(base_arg.rstrip("/")))
