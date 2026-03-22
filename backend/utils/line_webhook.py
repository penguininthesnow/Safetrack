from fastapi import APIRouter, Request

router = APIRouter(prefix="/api/line", tags=["line"])

@router.post("/webhook")
async def line_webhook(request: Request):
    body = await request.json()
    print("LINE webhook body:", body)
    return {"status": "ok"}