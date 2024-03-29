from anthropic import AsyncAnthropic
from starlette.config import Config

config = Config('.env')
client = AsyncAnthropic(api_key=config("ANTHROPIC_API_KEY"))

async def anthropic_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    stream = await client.messages.create(
        model=conversation.model.name,
        messages=messages,
        max_tokens=1024,
        stream=True,
    )

    async for event in stream:
        if event.type == "content_block_delta":
            content = event.delta.text
            yield content

async def generate_conversation_name(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
        if message.content.strip()  # Filter out messages with empty content
    ]
    messages.append({"role": "user", "content": "Please give a short, concise name for the above conversation."})

    response = await client.messages.create(
        model="claude-3-haiku-20240307",
        system="You are a conversation namer. Give a short, concise name for the given conversation.",
        messages=messages,
        max_tokens=10,
    )

    return response.content[0].text