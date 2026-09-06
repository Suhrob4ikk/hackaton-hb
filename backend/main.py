import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.ai import run_chat_turn
from backend.catalog import catalog
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
    session.cart.clear()
    return CheckoutResponse(success=True)
