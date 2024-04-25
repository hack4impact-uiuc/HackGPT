# api/utils/llm_providers/alllama.py

import tiktoken
from openai import AsyncOpenAI
from starlette.config import Config

from api.utils.conversation_utils import update_user_usage

config = Config(".env")
client = AsyncOpenAI(api_key=config("ALLLAMA_API_KEY"))


async def alllama_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    # Count the input tokens
    encoding = tiktoken.encoding_for_model(conversation.model.name)
    input_tokens = sum(len(encoding.encode(message["content"])) for message in messages)

    stream = await client.chat.completions.create(
        max_tokens=1500,
        model=conversation.model.name,
        messages=messages,
        stream=True,
    )

    collected_chunks = []
    output_tokens = 0
    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content is None:
            content = ""
        collected_chunks.append(content)
        output_tokens += len(encoding.encode(content))
        yield content

    # Update the user's usage
    await update_user_usage(
        conversation.user_email, conversation.model.name, input_tokens, output_tokens
    )
