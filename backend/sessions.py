from dataclasses import dataclass, field


@dataclass
class Session:
    history: list[dict] = field(default_factory=list)
    cart: dict[str, int] = field(default_factory=dict)  # product_id -> quantity
    customer_id: str | None = None
    customer_segment: str | None = None
    last_order: dict | None = None  # snapshot of the most recently completed demo order


_sessions: dict[str, Session] = {}


def get_session(session_id: str) -> Session:
    if session_id not in _sessions:
        _sessions[session_id] = Session()
    return _sessions[session_id]
