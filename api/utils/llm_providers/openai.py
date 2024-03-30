from openai import AsyncOpenAI
from starlette.config import Config

config = Config('.env')
client = AsyncOpenAI(api_key=config("OPENAI_API_KEY"))

async def openai_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    stream = await client.chat.completions.create(
        model=conversation.model.name,
        messages=messages,
        stream=True,
    )

    async for chunk in stream:
        content = chunk.choices[0].delta.content 
        if content is None: 
            content = ""
        print(content)
        yield content