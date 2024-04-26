# api/utils/llm_providers/alllama.py
from openai import AsyncOpenAI
from starlette.config import Config

config = Config(".env")
client = AsyncOpenAI(
    base_url=config("ALLLAMA_API_BASE_URL"), api_key=config("ALLLAMA_API_KEY")
)

async def alllama_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    stream = await client.chat.completions.create(
        max_tokens=1500,
        model=conversation.model.name,
        messages=messages,
        stream=True,
    )

    collected_chunks = []
    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content is None:
            content = ""
        collected_chunks.append(content)
        yield content

