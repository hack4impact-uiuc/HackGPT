class LLMProvider:
    def __init__(self, model_name: str, model_provider: str, display_name: str, input_token_cost: float, output_token_cost: float, is_flagship: bool):
        self.model_name = model_name
        self.model_provider = model_provider
        self.display_name = display_name
        self.input_token_cost = input_token_cost
        self.output_token_cost = output_token_cost
        self.is_flagship = is_flagship

LLM_PROVIDERS = [
    LLMProvider("gpt-4-0125-preview", "openai", "gpt-4 turbo", 0.03 / 1000, 0.06 / 1000, True),
    LLMProvider("gpt-3.5-turbo-0125", "openai", "gpt-3.5 turbo", 0.002 / 1000, 0.002 / 1000, False),
    LLMProvider("claude-3-opus-20240229", "anthropic", "claude 3 opus", 0.02 / 1000, 0.04 / 1000, True),
    LLMProvider("claude-3-sonnet-20240229", "anthropic", "claude 3 sonnet", 0.001 / 1000, 0.001 / 1000, False),
    LLMProvider("claude-3-haiku-20240307", "anthropic", "claude 3 haiku", 0.001 / 1000, 0.001 / 1000, False),
]