// app/llm_providers.tsx
export const LLMProviders = [
  {
    model_name: "gpt-4-0125-preview",
    model_provider: "openai",
    display_name: "gpt-4 turbo",
    isFlagship: true,
  },
  {
    model_name: "gpt-3.5-turbo-0125",
    model_provider: "openai",
    display_name: "gpt-3.5 turbo",
    isFlagship: false,
  },
  {
    model_name: "claude-3-opus-20240229",
    model_provider: "anthropic",
    display_name: "claude 3 opus",
    isFlagship: true,
  },
  {
    model_name: "claude-3-sonnet-20240229",
    model_provider: "anthropic",
    display_name: "claude 3 sonnet",
    isFlagship: false,
  },
  {
    model_name: "claude-3-haiku-20240307",
    model_provider: "anthropic",
    display_name: "claude 3 haiku",
    isFlagship: false,
  },
  {
    model_name: "llama-3-70b-instruct-iq2xs",
    model_provider: "alllama",
    display_name: "llama-3 70B",
    isFlagship: false,
  },
];