from typing import Optional
import os
import json
from datetime import datetime
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
    text = "Recommendation: WAIT due to mixed signals."
    # model_debug_mode: persist raw outputs for auditing
    if os.getenv("MODEL_DEBUG_MODE", "").lower() in {"1", "true", "yes", "on"}:
        try:
            os.makedirs("logs/model_debug", exist_ok=True)
            payload = {"timestamp": datetime.utcnow().isoformat() + "Z", "text": text, "logits": None}
            with open(f"logs/model_debug/{datetime.utcnow().strftime('%Y%m%dT%H%M%S%f')}.json", "w") as f:
                json.dump(payload, f)
        except Exception:
            pass
    return (text, None)


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


