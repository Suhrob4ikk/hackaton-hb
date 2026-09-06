from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# One file per month; "Отчет_по_клиентам_*" and "orders_2026_*" turned out to
# carry identical per-client aggregates for the same month, so only one file
# per month is loaded to avoid double-counting.
MONTH_FILES = [
    DATA_DIR / "orders_2026_07.xlsx",
    DATA_DIR / "orders_2026_08.xlsx",
]

COLUMNS = {
    "Клиент": "name",
    "ID клиента": "client_id",
    "Заказов": "orders",
    "Сумма всего, сомони": "total_amount",
    "Выполнено, шт": "completed",
    "Отменено, шт": "cancelled",
}

GOOD_HISTORY_MIN_ORDERS = 3
GOOD_HISTORY_MAX_CANCEL_RATE = 0.3


def _load_month(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path, header=1)
    df = df.dropna(subset=["ID клиента"])
    df = df[list(COLUMNS)].rename(columns=COLUMNS)
    return df


class CustomerBook:
    def __init__(self):
        frames = [_load_month(p) for p in MONTH_FILES if p.exists()]
        if not frames:
            self.by_id: dict[str, dict] = {}
            self.name_index: dict[str, list[str]] = {}
            return

        combined = pd.concat(frames, ignore_index=True)
        agg = combined.groupby("client_id").agg(
            name=("name", "last"),
            orders=("orders", "sum"),
            total_amount=("total_amount", "sum"),
            completed=("completed", "sum"),
            cancelled=("cancelled", "sum"),
        ).reset_index()

        self.by_id = {}
        self.name_index: dict[str, list[str]] = {}
        for _, row in agg.iterrows():
            client_id = row["client_id"]
            cancel_rate = (row["cancelled"] / row["orders"]) if row["orders"] else 0.0
            self.by_id[client_id] = {
                "client_id": client_id,
                "name": row["name"],
                "orders": int(row["orders"]),
                "total_amount": float(row["total_amount"]),
                "completed": int(row["completed"]),
                "cancelled": int(row["cancelled"]),
                "cancel_rate": round(cancel_rate, 3),
            }
            key = str(row["name"]).strip().lower()
            self.name_index.setdefault(key, []).append(client_id)

    def find(self, client_id: str | None = None, name: str | None = None) -> dict | None:
        if client_id:
            record = self.by_id.get(client_id.strip().upper())
            if record:
                return record
        if name:
            key = name.strip().lower()
            ids = self.name_index.get(key)
            if not ids:
                # fallback: substring match
                ids = [
                    cid for n, cids in self.name_index.items()
                    if key in n or n in key
                    for cid in cids
                ]
            if ids:
                return self.by_id.get(ids[0])
        return None

    def segment(self, client_id: str | None = None, name: str | None = None) -> dict:
        record = self.find(client_id=client_id, name=name)
        if not record:
            return {
                "found": False,
                "segment": "new",
                "segment_label": "новый клиент (истории заказов нет)",
                "details": None,
            }

        if record["orders"] >= GOOD_HISTORY_MIN_ORDERS and record["cancel_rate"] <= GOOD_HISTORY_MAX_CANCEL_RATE:
            segment, label = "loyal_good", "постоянный клиент с хорошей историей заказов"
        elif record["orders"] >= GOOD_HISTORY_MIN_ORDERS:
            segment, label = "loyal_risky", "постоянный клиент, но много отменённых заказов"
        else:
            segment, label = "occasional", "клиент с небольшой историей заказов"

        return {
            "found": True,
            "segment": segment,
            "segment_label": label,
            "details": record,
        }


customer_book = CustomerBook()
