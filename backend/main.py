import logging
import random
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from backend.ai import run_chat_turn
from backend.catalog import catalog
from backend.pdf_instructions import generate_instruction_pdf
from backend.schemas import (
    AlternativeRequest,
    AlternativeResponse,
    CartAddRequest,
    CartItemOut,
    CartResponse,
    CatalogTopResponse,
    ChatRequest,
    ChatResponse,
    CheckoutRequest,
    CheckoutResponse,
    ProductOut,
)
from backend.sessions import get_session

logger = logging.getLogger("hb-ai")


def generate_order_id() -> str:
    year = datetime.now(timezone.utc).year
    return f"HB-{year}-{random.randint(0, 99999):05d}"

app = FastAPI(title="HAYAT BEAUTY AI Consultant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_cart_response(session) -> CartResponse:
    items = []
    total = 0.0
    for product_id, qty in session.cart.items():
        product = catalog.get(product_id)
        if not product:
            continue
        subtotal = round(product["price"] * qty, 2)
        total += subtotal
        items.append(CartItemOut(
            id=product["id"],
            title=product["title"],
            price=product["price"],
            volume=catalog.to_public(product)["volume"],
            image_url=(product.get("images") or [None])[0],
            quantity=qty,
            subtotal=subtotal,
        ))
    return CartResponse(cart=items, total=round(total, 2))


@app.get("/api/catalog/top", response_model=CatalogTopResponse)
def catalog_top(limit: int = 8):
    groups = catalog.top_products_by_group(limit=limit)
    return CatalogTopResponse(groups={g: [ProductOut(**p) for p in items] for g, items in groups.items()})


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session = get_session(req.session_id)

    try:
        reply, products = run_chat_turn(session, req.message, req.language)
        return ChatResponse(reply=reply, products=[ProductOut(**p) for p in products])
    except Exception:
        logger.exception("AI chat turn failed, falling back to catalog stub")
        fallback_products = catalog.search(req.message, limit=3) or catalog.products[:3]
        reply = (
            "Извините, сейчас не получается связаться с AI-ассистентом. "
            "Вот несколько товаров из каталога, которые могут быть интересны."
            if req.language != "tj"
            else "Мебахшед, ҳоло пайваст шудан бо AI имконнопазир аст. "
            "Инак якчанд маҳсулот аз каталог."
        )
        session.history.append({"role": "assistant", "content": reply})
        return ChatResponse(
            reply=reply,
            products=[
                ProductOut(**catalog.to_public(p, reason="Популярный товар из каталога"))
                for p in fallback_products
            ],
        )


@app.post("/api/cart/add", response_model=CartResponse)
def cart_add(req: CartAddRequest):
    if not catalog.get(req.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    session = get_session(req.session_id)
    session.cart[req.product_id] = session.cart.get(req.product_id, 0) + max(req.quantity, 1)
    return build_cart_response(session)


@app.get("/api/cart", response_model=CartResponse)
def cart_get(session_id: str):
    session = get_session(session_id)
    return build_cart_response(session)


@app.post("/api/cart/alternative", response_model=AlternativeResponse)
def cart_alternative(req: AlternativeRequest):
    get_session(req.session_id)  # ensure session exists
    alt = catalog.find_cheaper_alternative(req.product_id)
    if not alt:
        return AlternativeResponse(alternative=None)
    return AlternativeResponse(
        alternative=ProductOut(**catalog.to_public(alt, reason="Более дешёвый аналог в той же категории"))
    )


@app.post("/api/cart/checkout", response_model=CheckoutResponse)
def cart_checkout(req: CheckoutRequest):
    session = get_session(req.session_id)
    snapshot = build_cart_response(session)
    if not snapshot.cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_id = generate_order_id()
    created_at = datetime.now(timezone.utc).isoformat()
    session.last_order = {
        "id": order_id,
        "items": [item.model_dump() for item in snapshot.cart],
        "total": snapshot.total,
        "created_at": created_at,
        "status": "completed",
    }
    session.cart.clear()

    return CheckoutResponse(
        success=True,
        order_id=order_id,
        total=snapshot.total,
        items=snapshot.cart,
        created_at=created_at,
    )


@app.get("/api/order/instructions")
def order_instructions(session_id: str, language: Literal["ru", "tj"] = "ru"):
    session = get_session(session_id)
    order = session.last_order
    if not order:
        raise HTTPException(status_code=404, detail="No completed order found for this session")

    try:
        pdf_bytes = generate_instruction_pdf(order, language, catalog)
    except Exception:
        logger.exception("Failed to generate instruction PDF")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

    filename = f"HAYAT-BEAUTY-instruction-{order['id']}-{language}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
