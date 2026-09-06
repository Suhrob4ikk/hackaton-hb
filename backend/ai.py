import json
import logging
import os
import re

import litellm
from dotenv import load_dotenv

from backend.catalog import catalog, estimate_depletion, format_volume
from backend.customers import customer_book
from backend.sessions import Session

load_dotenv()

logger = logging.getLogger("hb-ai")

MODEL = "gemini/gemini-3.5-flash-lite"
MAX_TOOL_ROUNDS = 10

_CATEGORY_LIST = ", ".join(sorted({p["category"] for p in catalog.products}))

SYSTEM_PROMPT = """\
Ты — AI-консультант по косметике интернет-магазина HAYAT BEAUTY (hbshop.tj, \
Душанбе, Таджикистан). Общайся дружелюбно и по-деловому, на языке "{language}" \
(ru = русский, tj = тоҷикӣ / таджикский).

ПРАВИЛО ВЕЖЛИВОСТИ (без исключений): ты всегда доброжелателен и профессионален, \
даже если клиент груб, ругается, раздражён или проявляет агрессию. Никогда не \
грубишь в ответ, не переходишь на резкий или холодный тон, не оправдываешься и \
не споришь. Спокойно продолжай помогать по существу или мягко предложи \
переформулировать вопрос. Твой тон не зависит от тона клиента.

ПРАВИЛО ФОРМАТИРОВАНИЯ (без исключений): никогда не используй markdown-разметку \
в тексте ответа — ни звёздочки для жирного (**текст**), ни решётки для \
заголовков (#, ##), ни другие спецсимволы форматирования (_, `, -, >). Пиши \
только обычным текстом, как в живом человеческом сообщении. Для перечисления \
нескольких товаров используй простые предложения или нумерацию словами/цифрами \
со скобкой, например "1) Название — цена" или просто описывай товары по \
порядку обычным текстом, без */#/_ разметки.

ПРАВИЛО КРАТКОСТИ: отвечай компактно, ориентир — 3-5 предложений на реплику. \
Не повторяй одну и ту же мысль разными словами. Урезать полезную информацию \
(почему товар подходит, важные детали) не нужно — убирай только повторы и воду.
{greeting_instruction}
Твоя задача:
1. Понять проблему/пожелание клиента по коже, волосам или косметике. Если \
   информации мало (не указан тип кожи/волос, для чего нужен продукт, \
   бюджет) — сначала задай 1-2 коротких уточняющих вопроса, не вызывая \
   инструменты вслепую. Если ты задал НЕСКОЛЬКО уточняющих вопросов сразу, а \
   клиент в ответе раскрыл только часть из них — не переспрашивай то, что \
   он уже сказал, и не начинай уточнение заново с нуля. Возьми из истории \
   диалога то, что уже известно, и мягко доспроси именно недостающую часть.
2. Когда достаточно понятно, что искать — вызови search_products, чтобы \
   найти подходящие товары из РЕАЛЬНОГО каталога. Никогда не выдумывай \
   товары, цены или бренды — используй только то, что вернули инструменты.
3. Для каждого рекомендуемого товара обязательно объясни ПОЧЕМУ он подходит \
   именно этому клиенту (тип кожи/волос, проблема, состав, эффект). Ставь на \
   первое место — и в тексте ответа, и в списке items у recommend_products — \
   тот товар, который сам считаешь наиболее подходящим под запрос клиента. \
   Порядок должен отражать твою оценку релевантности, а не алфавит, цену \
   или порядок из результатов search_products.
4. Если клиент говорит, что не может/не хочет купить рекомендованный товар:
   - Причина в цене ("дорого", "дешевле есть?") — вызови \
     find_cheaper_alternative для этого товара и предложи аналог.
   - Причина в аллергии/непереносимости конкретного компонента — исключи из \
     новых рекомендаций товары, которые по твоим общим знаниям вероятно \
     содержат этот компонент, и предложи альтернативы без него. ВАЖНО: у \
     тебя нет точной базы состава товаров, только общие знания о категории \
     продукта. Если не уверен на 100% в составе конкретного товара — честно \
     скажи клиенту, что точный состав нужно уточнить на упаковке или у \
     продавца. Никогда не гарантируй безопасность товара, если не уверен.
5. Если уместно, можешь использовать estimate_depletion, чтобы сказать \
   клиенту примерно на сколько хватит товара (это грубая оценка, всегда \
   говори "приблизительно").
6. Если клиент называет своё имя или ID клиента (например, для персонализации \
   или истории заказов), вызови get_customer_segment, чтобы понять, новый ли \
   это клиент или постоянный, и учти это в тоне общения (постоянным клиентам \
   с хорошей историей можно предлагать более персональные рекомендации).
7. Если клиент явно просит добавить товар в корзину ("добавь", "хочу купить", \
   "беру") — вызови add_to_cart.
8. ЖЁСТКОЕ ПРАВИЛО: если в твоём текстовом ответе клиенту упоминается хотя \
   бы один конкретный товар (название, цена, id) — перед тем как написать \
   этот текст, ты ОБЯЗАН вызвать recommend_products с этими же товарами (их \
   id и коротким reason на языке ответа), В ТОМ ЖЕ ПОРЯДКЕ, в котором они \
   идут в тексте (самый подходящий — первым и в items, и в тексте). Никогда \
   не описывай товары в тексте, не вызвав recommend_products с теми же id — \
   интерфейс клиента показывает карточки товаров ТОЛЬКО из recommend_products, \
   текст сам по себе их не покажет. Если ты просто задаёшь уточняющий вопрос \
   и товары ещё не подобраны — recommend_products вызывать не нужно.
9. ВАЖНО: если клиент задаёт уточняющий или сравнительный вопрос об УЖЕ \
   показанных ранее в этом диалоге товарах (например "какой из них лучше?", \
   "а состав у первого какой?", "а второй подойдёт для..."), и явно НЕ просит \
   показать другие/новые/ещё товары — отвечай ТОЛЬКО текстом, опираясь на \
   историю диалога. В этом случае НЕ вызывай search_products и НЕ вызывай \
   recommend_products — товары уже показаны клиенту в интерфейсе, дублировать \
   или заменять их не нужно, а у тебя нет надёжного способа точно вспомнить \
   их id, чтобы не перепутать. Вызывай search_products и recommend_products \
   заново только если клиент явно просит другие варианты, доп. товары или это \
   действительно новый запрос. Если всё же вызываешь search_products заново — \
   собирай recommend_products СТРОГО по товарам и id из этого нового вызова, \
   а не по данным из более ранних сообщений в истории.

Отвечай только текстом на языке "{language}". Не выдумывай факты о товарах — \
всё берётся из инструментов.

Правила использования search_products, чтобы не тратить попытки впустую:
- Параметр category должен ТОЧНО совпадать с одним из реальных названий \
  категорий каталога (список ниже). Не придумывай свои названия категорий.
- Если после 1-2 вызовов search_products с разными query/category ты не \
  нашёл ничего подходящего — не пытайся бесконечно перебирать варианты. \
  Либо предложи лучшее из того, что нашлось, либо честно скажи, что не \
  нашёл подходящего в каталоге, и вызови recommend_products с пустым \
  списком items.

Реальные категории каталога HAYAT BEAUTY:
{categories}
"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Поиск товаров в каталоге HAYAT BEAUTY по ключевым словам, категории и/или максимальной цене.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Ключевые слова: тип продукта, проблема, бренд и т.д."},
                    "category": {"type": "string", "description": "Название категории каталога (необязательно), например 'Тональный крем', 'Шампунь'."},
                    "max_price": {"type": "number", "description": "Максимальная цена в сомони (необязательно)."},
                    "limit": {"type": "integer", "description": "Сколько товаров вернуть, по умолчанию 5."},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_cheaper_alternative",
            "description": "Найти более дешёвый товар той же категории, что и указанный товар.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string", "description": "ID товара, для которого ищем аналог подешевле."},
                },
                "required": ["product_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_depletion",
            "description": "Приблизительно оценить, через сколько дней/месяцев у клиента закончится товар, по объёму упаковки и категории.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string", "description": "ID товара."},
                },
                "required": ["product_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_segment",
            "description": "Определить сегмент клиента (новый / постоянный с хорошей историей / есть отмены) по имени или ID клиента из истории заказов.",
            "parameters": {
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "ID клиента вида CL-0001, если известен."},
                    "name": {"type": "string", "description": "Имя клиента, если ID неизвестен."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Добавить товар в корзину клиента.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                    "quantity": {"type": "integer", "description": "Количество, по умолчанию 1."},
                },
                "required": ["product_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "recommend_products",
            "description": "Зафиксировать финальный список рекомендованных товаров (0-3 шт.) с объяснением, показать их пользователю в интерфейсе. Вызывай один раз в конце ответа, когда рекомендации готовы.",
            "parameters": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_id": {"type": "string"},
                                "reason": {"type": "string", "description": "Короткое объяснение, почему товар подходит этому клиенту."},
                            },
                            "required": ["product_id", "reason"],
                        },
                    },
                },
                "required": ["items"],
            },
        },
    },
]


def _product_brief(p: dict) -> dict:
    return {
        "id": p["id"],
        "title": p["title"],
        "brand": p.get("brand"),
        "category": p["category"],
        "price": p["price"],
        "volume": format_volume(p.get("volume")),
        "in_stock": p.get("in_stock", 0),
    }


class ToolRuntime:
    """Binds tool implementations to one chat session so add_to_cart etc. can mutate its cart."""

    def __init__(self, session: Session):
        self.session = session
        self.recommended: list[dict] = []
        self.tools_called: set[str] = set()

    def dispatch(self, name: str, args: dict) -> dict:
        handler = getattr(self, f"_tool_{name}", None)
        if handler is None:
            return {"error": f"unknown tool {name}"}
        self.tools_called.add(name)
        try:
            return handler(args)
        except Exception as exc:  # keep the conversation alive even if a tool blows up
            return {"error": str(exc)}

    def _tool_search_products(self, args: dict) -> dict:
        products = catalog.search(
            query=args.get("query", ""),
            category=args.get("category") or None,
            max_price=args.get("max_price"),
            limit=int(args.get("limit") or 5),
        )
        return {"results": [_product_brief(p) for p in products]}

    def _tool_find_cheaper_alternative(self, args: dict) -> dict:
        alt = catalog.find_cheaper_alternative(str(args["product_id"]))
        return {"alternative": _product_brief(alt) if alt else None}

    def _tool_estimate_depletion(self, args: dict) -> dict:
        product = catalog.get(str(args["product_id"]))
        if not product:
            return {"error": "product not found"}
        estimate = estimate_depletion(product["category"], product.get("volume"))
        return {"estimate": estimate or "товар долговременного использования, не расходуется"}

    def _tool_get_customer_segment(self, args: dict) -> dict:
        result = customer_book.segment(client_id=args.get("client_id"), name=args.get("name"))
        if result["found"]:
            self.session.customer_id = result["details"]["client_id"]
        self.session.customer_segment = result["segment"]
        return result

    def _tool_add_to_cart(self, args: dict) -> dict:
        product_id = str(args["product_id"])
        product = catalog.get(product_id)
        if not product:
            return {"error": "product not found"}
        qty = max(int(args.get("quantity") or 1), 1)
        self.session.cart[product_id] = self.session.cart.get(product_id, 0) + qty
        return {"ok": True, "cart_size": sum(self.session.cart.values())}

    def _tool_recommend_products(self, args: dict) -> dict:
        items = args.get("items") or []
        resolved = []
        for item in items[:3]:
            product = catalog.get(str(item.get("product_id")))
            if not product:
                continue
            resolved.append(catalog.to_public(product, reason=item.get("reason", "")))
        self.recommended = resolved
        return {"ok": True, "count": len(resolved)}


def _messages_to_history(session: Session) -> list[dict]:
    return [{"role": m["role"], "content": m["content"]} for m in session.history]


def run_chat_turn(session: Session, user_message: str, language: str) -> tuple[str, list[dict]]:
    if not os.environ.get("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is not set")

    is_first_message = len(session.history) == 0
    session.history.append({"role": "user", "content": user_message})

    greeting_instruction = (
        "Это самое первое сообщение клиента в этой сессии — обязательно "
        "начни свой ответ с тёплого приветствия, даже если сам клиент не "
        "поздоровался.\n"
        if is_first_message
        else ""
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(
                language=language,
                categories=_CATEGORY_LIST,
                greeting_instruction=greeting_instruction,
            ),
        },
        *_messages_to_history(session),
    ]

    runtime = ToolRuntime(session)
    final_text = ""

    for _ in range(MAX_TOOL_ROUNDS):
        response = litellm.completion(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        message = response.choices[0].message
        tool_calls = getattr(message, "tool_calls", None)

        messages.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [tc.model_dump() for tc in tool_calls] if tool_calls else None,
        })

        logger.debug("round: tool_calls=%s content=%r", [tc.function.name for tc in tool_calls] if tool_calls else None, message.content)

        if not tool_calls:
            final_text = message.content or ""
            break

        for tc in tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = runtime.dispatch(tc.function.name, args)
            logger.debug("  call %s(%s) -> %s", tc.function.name, args, result)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, ensure_ascii=False),
            })
    else:
        # Ran out of MAX_TOOL_ROUNDS without a final plain-text turn. If
        # recommend_products already fired on an earlier round this turn,
        # there are real products to show - say something neutral instead of
        # a blanket apology that reads as a failure when it isn't one.
        if runtime.recommended:
            final_text = final_text or (
                "Вот что удалось подобрать:" if language != "tj"
                else "Инак чизҳое, ки барои шумо ёфтам:"
            )
        else:
            final_text = final_text or (
                "Извините, не получилось сформировать ответ. Попробуйте переформулировать вопрос."
                if language != "tj"
                else "Мебахшед, ҷавоб тайёр нашуд. Лутфан саволро дигар хел нависед."
            )

    if not final_text:
        final_text = "Хорошо!" if not runtime.recommended else "Вот что удалось подобрать:"

    fresh_search_this_turn = bool(runtime.tools_called & {"search_products", "find_cheaper_alternative"})
    if not runtime.recommended and fresh_search_this_turn and _mentions_products(final_text):
        _force_recommend_products(messages, runtime)

    session.history.append({"role": "assistant", "content": final_text})
    return final_text, runtime.recommended


def _mentions_products(text: str) -> bool:
    return bool(re.search(r"сомони|somoni|TJS", text, re.IGNORECASE)) and len(text) > 40


def _force_recommend_products(messages: list[dict], runtime: "ToolRuntime") -> None:
    """Self-healing pass: the model described products in prose but forgot to
    call recommend_products, so the frontend would get an empty products list
    even though the reply text clearly names some. Ask it once more, forcing
    the tool call, using the same conversation state it already produced.

    Only ever called when this turn actually ran search_products or
    find_cheaper_alternative (see fresh_search_this_turn in run_chat_turn) -
    otherwise the model has no fresh product ids to draw on and, forced to
    call the tool anyway, ends up guessing ids/reasons that don't match what
    was actually shown (this is what caused the mismatched-reason bug on
    plain follow-up/comparison questions about already-shown products)."""
    nudge_messages = messages + [{
        "role": "user",
        "content": (
            "Вызови recommend_products с id и коротким reason для товаров, "
            "которые ты только что перечислил в своём предыдущем ответе."
        ),
    }]
    try:
        forced = litellm.completion(
            model=MODEL,
            messages=nudge_messages,
            tools=TOOLS,
            tool_choice={"type": "function", "function": {"name": "recommend_products"}},
        )
        for tc in forced.choices[0].message.tool_calls or []:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                continue
            runtime.dispatch(tc.function.name, args)
    except Exception:
        logger.exception("corrective recommend_products call failed")
