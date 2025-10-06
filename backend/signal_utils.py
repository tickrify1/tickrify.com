import re
import json
from datetime import datetime, timezone
from typing import Dict, Optional


def softmax(logits):
    import numpy as np
    e = np.exp(logits - np.max(logits))
    return e / e.sum()


def interpret_model_output(model_out_text: Optional[str] = None, model_logits=None) -> Dict:
    """
    Return canonical response:
    { "signal": "BUY"|"SELL"|"WAIT", "confidence": 0.0-1.0, "reason": "short human readable" }
    """
    # 1) If logits available -> use probabilities
    if model_logits is not None:
        probs = softmax(model_logits)
        import numpy as np
        idx = int(np.argmax(probs))
        labels = ["BUY", "SELL", "WAIT"]
        conf = float(probs[idx])
        signal = labels[idx]
        if conf < 0.55:
            signal = "WAIT"
        return {"signal": signal, "confidence": round(conf, 4), "reason": "probabilistic classifier"}

    # 2) Else parse text
    t = (model_out_text or "").lower()
    if re.search(r"\b(buy|long|compra)\b", t):
        sig = "BUY"
    elif re.search(r"\b(sell|short|venda)\b", t):
        sig = "SELL"
    elif re.search(r"\b(wait|hold|esperar)\b", t):
        sig = "WAIT"
    else:
        sig = "WAIT"

    # confidence heuristic
    conf = 0.7
    if "strong" in t or "confident" in t:
        conf = 0.92
    elif "weak" in t or "slight" in t:
        conf = 0.6
    return {"signal": sig, "confidence": round(conf, 4), "reason": "parsed from text"}


def canonical_signal_response(signal: str, confidence: float, reason: str, model_version: Optional[str] = None,
                              explainability: Optional[Dict] = None) -> Dict:
    return {
        "signal": signal,
        "confidence": float(max(0.0, min(1.0, confidence))),
        "reason": reason[:200],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_version": model_version,
        **({"explainability": explainability} if explainability is not None else {})
    }


