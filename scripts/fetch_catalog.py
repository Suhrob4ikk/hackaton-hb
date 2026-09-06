"""
One-off scraper for hbshop.tj product catalog.

hbshop.tj is a React SPA; its internal REST API lives at https://hbshop.tj/api
(Django REST Framework). Key endpoints discovered by inspecting the compiled
JS bundle (/static/js/main.*.js):

    GET /api/items/?limit=1000&page=N   -> paginated product list
    GET /api/categories/                -> nested category tree
    GET /api/items/{id}/                -> single product detail (not used
                                            here - would need 11k+ requests)

Known data quirk: Cyrillic text in the API responses is INTERMITTENTLY
mangled by a UTF-8 -> CP1251 -> UTF-8 double-encoding bug on the server
(observed to come and go between requests, presumably a flaky cache/backend
instance upstream). Fixed by re-encoding the affected string as utf-8 bytes
and decoding those bytes as cp1251 - but ONLY when the string actually shows
the tell-tale corruption signature (see MOJIBAKE_SIGNATURE below), since
blindly applying this transform to already-correct text silently destroys
it (cp1251 decodes almost any byte sequence without raising).

Run once, output committed... no wait, data/catalog.json is local cache used
by the FastAPI backend. Re-run manually if the catalog needs refreshing.
"""
import json
import re
import time
import sys
from pathlib import Path

import requests

API_BASE = "https://hbshop.tj/api"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUT_FILE = DATA_DIR / "catalog.json"

VOLUME_RE = re.compile(
    r"(\d+[.,]?\d*)\s*(мл|ml|мг|mg|гр|гram|г\b|g\b|кг|kg|л\b|l\b|шт|pcs)",
    re.IGNORECASE,
)


# Codepoints from CP1251's 0x80-0x9F block. These only show up in real text
# if a UTF-8 continuation byte in that range got misread as CP1251 - normal
# product/category names never legitimately contain them, so their presence
# is a reliable signal that a string needs the fix (and their absence is a
# reliable signal that it must NOT be touched).
MOJIBAKE_SIGNATURE = set(
    "ЂЃ‚ѓ„…†‡€‰"
    "Љ‹ЊЌЋЏђ‘’“"
    "”•™љ›њќћџ"
)


def is_mojibake(s: str) -> bool:
    return any(ch in MOJIBAKE_SIGNATURE for ch in s)


def fix_mojibake(s):
    if not isinstance(s, str) or not s or not is_mojibake(s):
        return s
    try:
        fixed = s.encode("utf-8").decode("cp1251")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s
    return fixed


def extract_volume(name: str):
    if not name:
        return None
    m = VOLUME_RE.search(name)
    if not m:
        return None
    value, unit = m.groups()
    value = value.replace(",", ".")
    try:
        value = float(value)
    except ValueError:
        return None
    unit = unit.lower()
    unit_map = {
        "ml": "мл", "мл": "мл",
        "mg": "мг", "мг": "мг",
        "gr": "г", "гram": "г", "г": "г", "g": "г",
        "kg": "кг", "кг": "кг",
        "l": "л", "л": "л",
        "pcs": "шт", "шт": "шт",
    }
    return {"value": value, "unit": unit_map.get(unit, unit)}


def fetch_all_items():
    items = []
    page = 1
    while True:
        resp = requests.get(
            f"{API_BASE}/items/",
            params={"limit": 1000, "page": page},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        items.extend(data["results"])
        print(f"  page {page}: +{len(data['results'])} (total {len(items)}/{data['count']})", file=sys.stderr)
        if not data.get("next"):
            break
        page += 1
        time.sleep(0.2)
    return items


def fetch_categories():
    resp = requests.get(f"{API_BASE}/categories/", timeout=30)
    resp.raise_for_status()
    return resp.json()


def fix_category_tree(node):
    node["name"] = fix_mojibake(node.get("name"))
    for child in node.get("childrens") or []:
        fix_category_tree(child)
    return node


def normalize_item(raw):
    name = fix_mojibake(raw.get("name", "")).strip()
    category_name = fix_mojibake(raw.get("category_name", "")).strip()
    brand_name = fix_mojibake(raw.get("brand_name"))
    colors = []
    for c in raw.get("colors") or []:
        colors.append({
            "id": c.get("id"),
            "name": fix_mojibake(c.get("name")),
            "hex_value": c.get("hex_value"),
            "amount": c.get("amount"),
        })
    price = float(raw.get("price") or 0)
    old_price = float(raw.get("old_price") or price)
    return {
        "id": str(raw["id"]),
        "good_id": raw.get("good_id"),
        "title": name,
        "brand": brand_name,
        "category": category_name,
        "price": price,
        "old_price": old_price,
        "discount": raw.get("discount") or 0,
        "volume": extract_volume(name),
        "in_stock": raw.get("amount") or 0,
        "number_of_sales": raw.get("number_of_sales") or 0,
        "is_hit": raw.get("is_hit", False),
        "is_new": raw.get("is_new", False),
        "images": raw.get("images") or [],
        "colors": colors,
    }


def main():
    DATA_DIR.mkdir(exist_ok=True)

    print("Fetching categories...", file=sys.stderr)
    categories = fetch_categories()
    categories = [fix_category_tree(c) for c in categories]

    print("Fetching items...", file=sys.stderr)
    raw_items = fetch_all_items()

    seen = {}
    for raw in raw_items:
        item = normalize_item(raw)
        seen[item["id"]] = item
    products = list(seen.values())

    catalog = {
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source": "https://hbshop.tj/api",
        "count": len(products),
        "categories": categories,
        "products": products,
    }

    OUT_FILE.write_text(json.dumps(catalog, ensure_ascii=False, indent=None), encoding="utf-8")
    print(f"Wrote {len(products)} products to {OUT_FILE}", file=sys.stderr)


if __name__ == "__main__":
    main()
