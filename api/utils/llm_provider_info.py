class LLMProvider:
    def __init__(self, model_name: str, model_provider: str, display_name: str, input_token_cost: float, output_token_cost: float, is_flagship: bool):
        self.model_name = model_name
        self.model_provider = model_provider
        self.display_name = display_name
        self.input_token_cost = input_token_cost
        self.output_token_cost = output_token_cost
        self.is_flagship = is_flagship

LLM_PROVIDERS = [
    LLMProvider("gpt-4-0125-preview", "openai", "gpt-4 turbo", 10 / 1000000, 30 / 1000000, True),
    LLMProvider("gpt-3.5-turbo-0125", "openai", "gpt-3.5 turbo", 0.50 / 1000000, 1.50 / 1000000, False),
    LLMProvider("claude-3-opus-20240229", "anthropic", "claude 3 opus", 15 / 1000000, 75 / 1000000, True),
    LLMProvider("claude-3-sonnet-20240229", "anthropic", "claude 3 sonnet", 3 / 1000000, 15 / 1000000, False),
    LLMProvider("claude-3-haiku-20240307", "anthropic", "claude 3 haiku", 0.25 / 1000000, 1.25 / 1000000, False),
    LLMProvider("llama-3-70b-instruct-iq2xs", "alllama", "llama-3 70B", 0, 0, False),
]