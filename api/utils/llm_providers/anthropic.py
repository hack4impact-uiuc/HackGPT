from anthropic import Anthropic
from starlette.config import Config

config = Config('.env')
client = Anthropic(api_key=config("ANTHROPIC_API_KEY"))

async def anthropic_generate_response(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    with client.messages.stream(
        model=conversation.model.name,
        messages=messages,
        max_tokens=1024,
    ) as stream:
        for text in stream.text_stream:
            yield text