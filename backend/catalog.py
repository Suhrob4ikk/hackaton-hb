import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CATALOG_FILE = DATA_DIR / "catalog.json"

# category keyword -> (typical days a single unit lasts one person, reference
# volume in ml/g the "typical days" assumes). Approximate figures for a demo,
# not a real consumption model. Checked in order, first substring match wins.
DEPLETION_RULES = [
    ("расческ", None), ("щетк", None), ("зеркал", None), ("пинцет", None),
    ("ножниц", None), ("бигуди", None), ("накладные ресниц", None),
    ("аппликатор", None), ("спонж", None), ("набор", None),

    ("шампунь", (60, 400)), ("кондиционер", (60, 400)),
    ("бальзам для волос", (60, 300)), ("маска для волос", (90, 250)),
    ("масло для волос", (120, 100)), ("краска для волос", (180, 60)),
    ("гель для душа", (45, 400)), ("мыло", (45, 100)),
    ("дезодорант", (60, 150)), ("парфюм", (365, 50)), ("духи", (365, 50)),

    ("тональн", (60, 30)), ("bb крем", (60, 30)), ("cc крем", (60, 30)),
    ("пудра", (90, 15)), ("консилер", (90, 10)), ("корректор", (90, 10)),
    ("хайлайтер", (180, 10)), ("румян", (180, 10)), ("контуринг", (150, 15)),
    ("праймер", (120, 30)),

    ("тушь", (90, 10)), ("подводка", (120, 5)), ("карандаш для глаз", (180, 3)),
    ("карандаш для бров", (180, 3)), ("карандаш для губ", (180, 3)),
    ("тени для век", (180, 5)),

    ("помада", (90, 4)), ("блеск для губ", (90, 6)), ("тинт для губ", (90, 6)),
    ("бальзам для губ", (60, 5)),

    ("сыворотка", (60, 30)), ("крем для лица", (45, 50)),
    ("маска для лица", (60, 100)), ("тоник для лица", (60, 200)),
    ("пенка для умывания", (60, 150)), ("лосьон", (60, 200)),

    ("лак для ногт", (120, 12)),
]

DEFAULT_DEPLETION = (60, None)


def format_volume(volume: dict | None) -> str | None:
    if not volume:
        return None
    value = volume.get("value")
    unit = volume.get("unit")
    if value is None or not unit:
        return None
    if float(value).is_integer():
        value = int(value)
    return f"{value} {unit}"


def estimate_depletion(category: str, volume: dict | None) -> str | None:
    category_lower = (category or "").lower()
    for keyword, rule in DEPLETION_RULES:
        if keyword in category_lower:
            if rule is None:
                return None  # durable good, not consumed
            base_days, reference = rule
            break
    else:
        base_days, reference = DEFAULT_DEPLETION

    days = base_days
    if reference and volume and volume.get("value"):
        try:
            days = round(base_days * (float(volume["value"]) / reference))
        except (TypeError, ZeroDivisionError):
            days = base_days
    days = max(days, 7)

    if days < 45:
        text = f"~{days} дней"
    else:
        months = round(days / 30)
        text = f"~{months} мес." if months >= 2 else f"~{days} дней"
    return f"{text} (приблизительно, при обычном использовании)"


class Catalog:
    def __init__(self, path: Path = CATALOG_FILE):
        data = json.loads(path.read_text(encoding="utf-8"))
        self.categories = data["categories"]
        self.products: list[dict] = data["products"]
        self.by_id: dict[str, dict] = {p["id"]: p for p in self.products}

    def get(self, product_id: str) -> dict | None:
        return self.by_id.get(str(product_id))

    def to_public(self, product: dict, reason: str = "") -> dict:
        return {
            "id": product["id"],
            "title": product["title"],
            "price": product["price"],
            "volume": format_volume(product.get("volume")),
            "reason": reason,
            "image_url": (product.get("images") or [None])[0],
        }

    def search(
        self,
        query: str = "",
        category: str | None = None,
        max_price: float | None = None,
        limit: int = 5,
    ) -> list[dict]:
        pool = self.products
        if category:
            category = category.lower()
            pool = [p for p in pool if category in p["category"].lower()]
        if max_price:
            pool = [p for p in pool if p["price"] <= float(max_price)]

        query = (query or "").strip().lower()
        if not query:
            return pool[:limit]

        terms = [t for t in re.split(r"\s+", query) if t]
        scored = []
        for p in pool:
            haystack = f"{p['title']} {p['category']} {p.get('brand') or ''}".lower()
            score = sum(haystack.count(t) for t in terms)
            if score:
                scored.append((score, p.get("number_of_sales", 0), p))
        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        if scored:
            return [p for _, _, p in scored[:limit]]

        # no keyword hit: fall back to category/price-filtered pool as-is
        return pool[:limit]

    def find_cheaper_alternative(self, product_id: str) -> dict | None:
        product = self.get(product_id)
        if not product:
            return None
        candidates = [
            p for p in self.products
            if p["category"] == product["category"]
            and p["id"] != product["id"]
            and p["price"] < product["price"]
            and p.get("in_stock", 0) > 0
        ]
        if not candidates:
            return None
        candidates.sort(key=lambda p: (-p.get("number_of_sales", 0), product["price"] - p["price"]))
        return candidates[0]


catalog = Catalog()
