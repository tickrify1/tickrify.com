import json
from pathlib import Path
from backend.signal_utils import interpret_model_output


def test_golden_signals_dataset():
    dataset_path = Path(__file__).parent / "golden_signals.json"
    data = json.loads(dataset_path.read_text())
    for row in data:
        parsed = interpret_model_output(row["text"])
        assert parsed["signal"] == row["expected"], f"text='{row['text']}' parsed='{parsed['signal']}' expected='{row['expected']}'"


