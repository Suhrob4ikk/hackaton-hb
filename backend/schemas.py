from typing import Literal, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: Literal["ru", "tj"] = "ru"


class ProductOut(BaseModel):
    id: str
    title: str
    price: float
    volume: Optional[str] = None
    reason: Optional[str] = None
    image_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    products: list[ProductOut] = []


class CartAddRequest(BaseModel):
    session_id: str
    product_id: str
    quantity: int = 1


class CartItemOut(BaseModel):
    id: str
    title: str
    price: float
    volume: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    cart: list[CartItemOut]
    total: float


class AlternativeRequest(BaseModel):
    session_id: str
    product_id: str


class AlternativeResponse(BaseModel):
    alternative: Optional[ProductOut] = None


class CheckoutRequest(BaseModel):
    session_id: str
    items: Optional[list[dict]] = None
    token: Optional[str] = None


class CheckoutResponse(BaseModel):
    success: bool = True


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    email: str
    name: str


class PurchaseOut(BaseModel):
    id: str
    title: str
    price: float
    volume: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    purchased_at: str
    depletion_estimate: Optional[str] = None
    depletion_days: Optional[int] = None
    days_since_purchase: int = 0


class PurchaseHistoryResponse(BaseModel):
    purchases: list[PurchaseOut]


class AdminUserOut(BaseModel):
    email: str
    name: str
    purchases: list[PurchaseOut]


class AdminUsersResponse(BaseModel):
    users: list[AdminUserOut]
