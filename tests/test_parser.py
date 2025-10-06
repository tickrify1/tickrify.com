from backend.signal_utils import interpret_model_output


def test_parser_buy_keywords():
    parsed = interpret_model_output("Strong buy signal based on momentum")
    assert parsed["signal"] == "BUY"
    assert 0 <= parsed["confidence"] <= 1


def test_parser_sell_keywords():
    parsed = interpret_model_output("Suggest to sell due to weakness")
    assert parsed["signal"] == "SELL"


def test_parser_wait_default():
    parsed = interpret_model_output("No clear edge here")
    assert parsed["signal"] == "WAIT"


