import os
import openai

async def openai_generate_response(conversation):
    openai.api_key = os.environ["OPENAI_API_KEY"]

    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    response = openai.ChatCompletion.create(
        model=conversation.model.name,
        messages=messages,
        stream=True,
    )

    for chunk in response:
        # Extract the content from the chunk
        content = chunk.choices[0].delta.get('content', '')
        yield content
