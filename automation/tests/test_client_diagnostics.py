from pydantic import BaseModel

from app.clients import ProviderError, _provider_error


class ExampleSchema(BaseModel):
    value: str


def test_provider_diagnostic_names_schema_without_sensitive_payload(capsys):
    error = _provider_error(ExampleSchema, "temporarily unavailable (429)")

    captured = capsys.readouterr().out
    assert isinstance(error, ProviderError)
    assert str(error) == "temporarily unavailable (429)"
    assert captured.strip() == "Gemini ExampleSchema provider error: temporarily unavailable (429)"
    assert "api_key" not in captured.casefold()
    assert "prompt" not in captured.casefold()
