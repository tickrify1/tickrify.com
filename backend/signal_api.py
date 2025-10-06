from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from .signal_utils import interpret_model_output, canonical_signal_response

router = APIRouter()


class SignalResp(BaseModel):
    signal: str
    confidence: float
    reason: str
    timestamp: str
    model_version: Optional[str] = None


async def generate_signal_from_model():
    """
    Placeholder deterministic generator. In production, wrap real model calls.
    Returns (text, logits) where one may be None.
    """
    # For now, return a neutral WAIT suggestion to be deterministic without external deps
    return ("Recommendation: WAIT due to mixed signals.", None)


def get_model_version_or_none() -> Optional[str]:
    return "v1"


@router.get("/api/signal", response_model=SignalResp)
async def api_signal():
    try:
        model_text, logits = await generate_signal_from_model()
        parsed = interpret_model_output(model_text, model_logits=logits)
    except Exception as e:
        parsed = {"signal": "WAIT", "confidence": 0.0, "reason": f"error: {str(e)[:150]}"}
    return canonical_signal_response(
        parsed["signal"],
        parsed["confidence"],
        parsed["reason"],
        model_version=get_model_version_or_none(),
    )


