from openai import OpenAI
from starlette.config import Config

config = Config('.env')

client = OpenAI(api_key=config("OPENAI_API_KEY"))

async def openai_generate_response(conversation):

    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    response = client.chat.completions.create(model=conversation.model.name,
    messages=messages,
    stream=True)

    for chunk in response:
        # Extract the content from the chunk
        content = chunk.choices[0].delta.content
        yield content
