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
