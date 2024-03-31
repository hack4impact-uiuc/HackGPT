from anthropic import AsyncAnthropic
from starlette.config import Config
from api.utils.conversation_utils import update_user_usage

config = Config('.env')
client = AsyncAnthropic(api_key=config("ANTHROPIC_API_KEY"))

async def anthropic_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    input_tokens = 0
    output_tokens = 0

    stream = await client.messages.create(
        model=conversation.model.name,
        messages=messages,
        max_tokens=1500,
        stream=True,
    )

    async for event in stream:
        if event.type == "message_start":
            input_tokens = event.message.usage.input_tokens
        elif event.type == "message_delta":
            output_tokens = event.usage.output_tokens
        elif event.type == "content_block_delta":
            content = event.delta.text
            yield content

    # Update the user's usage
    await update_user_usage(conversation.user_email, conversation.model.name, input_tokens, output_tokens)

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