"""
Minimal auth for the demo: JSON-file user store, sha256 password hashing,
token = the user's own email (no real JWT). Good enough to survive a
process restart during the demo; not meant to be production-grade auth.
"""
import hashlib
import json
import threading
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"

_lock = threading.Lock()


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _load() -> dict:
    if not USERS_FILE.exists():
        return {}
    return json.loads(USERS_FILE.read_text(encoding="utf-8"))


def _save(users: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")


class AuthError(Exception):
    pass


def register(email: str, password: str, name: str) -> dict:
    email = email.strip().lower()
    with _lock:
        users = _load()
        if email in users:
            raise AuthError("Пользователь с таким email уже зарегистрирован")
        users[email] = {
            "email": email,
            "name": name,
            "password_hash": _hash_password(password),
        }
        _save(users)
    return {"token": email, "email": email, "name": name}


def login(email: str, password: str) -> dict:
    email = email.strip().lower()
    with _lock:
        users = _load()
    user = users.get(email)
    if not user or user["password_hash"] != _hash_password(password):
        raise AuthError("Неверный email или пароль")
    return {"token": email, "email": email, "name": user["name"]}


def get_user(token: str) -> dict | None:
    """token is just the user's email for this demo."""
    users = _load()
    user = users.get((token or "").strip().lower())
    if not user:
        return None
    return {"email": user["email"], "name": user["name"]}
