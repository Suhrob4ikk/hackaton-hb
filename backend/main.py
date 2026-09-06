import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend import auth, purchases
from backend.ai import run_chat_turn
from backend.catalog import catalog, estimate_depletion
from backend.schemas import (
    AdminUserOut,
    AdminUsersResponse,
    AlternativeRequest,
    AlternativeResponse,
    AuthResponse,
    CartAddRequest,
    CartItemOut,
    CartResponse,
    ChatRequest,
    ChatResponse,
    CheckoutRequest,
    CheckoutResponse,
    LoginRequest,
    ProductOut,
    PurchaseHistoryResponse,
    PurchaseOut,
    RegisterRequest,
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


def build_purchase_history(email: str) -> PurchaseHistoryResponse:
    records = purchases.get_purchases(email)
    items = []
    for record in records:
        product = catalog.get(record["product_id"])
        if not product:
            continue
        items.append(PurchaseOut(
            id=product["id"],
            title=product["title"],
            price=product["price"],
            volume=catalog.to_public(product)["volume"],
            image_url=(product.get("images") or [None])[0],
            quantity=record["quantity"],
            purchased_at=record["purchased_at"],
            depletion_estimate=estimate_depletion(product["category"], product.get("volume")),
        ))
    items.sort(key=lambda p: p.purchased_at, reverse=True)
    return PurchaseHistoryResponse(purchases=items)


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
    if req.token and auth.get_user(req.token):
        purchases.add_purchases(
            req.token,
            [{"product_id": pid, "quantity": qty} for pid, qty in session.cart.items()],
        )
    session.cart.clear()
    return CheckoutResponse(success=True)


@app.post("/api/auth/register", response_model=AuthResponse)
def auth_register(req: RegisterRequest):
    try:
        result = auth.register(req.email, req.password, req.name)
    except auth.AuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return AuthResponse(**result)


@app.post("/api/auth/login", response_model=AuthResponse)
def auth_login(req: LoginRequest):
    try:
        result = auth.login(req.email, req.password)
    except auth.AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return AuthResponse(**result)


@app.get("/api/account/purchases", response_model=PurchaseHistoryResponse)
def account_purchases(token: str):
    if not auth.get_user(token):
        raise HTTPException(status_code=401, detail="Не авторизован")
    return build_purchase_history(token)


@app.get("/api/admin/users", response_model=AdminUsersResponse)
def admin_users():
    users = [
        AdminUserOut(email=u["email"], name=u["name"], purchases=build_purchase_history(u["email"]).purchases)
        for u in auth.list_users()
    ]
    return AdminUsersResponse(users=users)
