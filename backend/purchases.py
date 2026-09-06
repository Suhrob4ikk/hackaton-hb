"""
Purchase history per user account, keyed by email (the auth token from
backend/auth.py). JSON file on disk, same lightweight pattern as auth.py -
only product_id/quantity/date are stored; product details (title, price,
category, volume) are looked up live from the catalog when the history is
read, so they're always in sync with the current catalog data.
"""
import json
import threading
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PURCHASES_FILE = DATA_DIR / "purchases.json"

_lock = threading.Lock()


def _load() -> dict:
    if not PURCHASES_FILE.exists():
        return {}
    return json.loads(PURCHASES_FILE.read_text(encoding="utf-8"))


def _save(data: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    PURCHASES_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def add_purchases(email: str, items: list[dict]) -> None:
    """items: list of {"product_id": str, "quantity": int}"""
    if not items:
        return
    email = email.strip().lower()
    purchased_at = datetime.now(timezone.utc).isoformat()
    with _lock:
        data = _load()
        history = data.setdefault(email, [])
        for item in items:
            history.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "purchased_at": purchased_at,
            })
        _save(data)


def get_purchases(email: str) -> list[dict]:
    data = _load()
    return data.get(email.strip().lower(), [])


def get_all_purchases() -> dict:
    """Every user's raw purchase records, keyed by email - used by the admin view."""
    return _load()
