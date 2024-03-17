import asyncio
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

async def generate_conversation_name(conversation):
    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]
    messages.append({"role": "user", "content": "Please give a short, concise name for the above conversation."})
    
    def sync_create_message():
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            system="You are a conversation namer. Give a short, concise name for the given conversation.", 
            messages=messages,
            max_tokens=10,
        )
        return response
    
    response = await asyncio.to_thread(sync_create_message)
    
    return response.content[0].text