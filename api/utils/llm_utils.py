import asyncio
from utils.conversation_utils import add_message
from api.models.conversation import Message
from utils.llm_providers.openai import openai_generate_response
from utils.llm_providers.anthropic import anthropic_generate_response

async def generate_response_stream(conversation):
    collected_chunks = []
    if conversation.model.provider == "openai":
        async for chunk in openai_generate_response(conversation):
            collected_chunks.append(chunk)
            yield f"data: {chunk}"
    elif conversation.model.provider == "anthropic":
        async for chunk in anthropic_generate_response(conversation):
            collected_chunks.append(chunk)
            yield f"data: {chunk}"
    else:
        # Fallback to mock response for other providers
        async def mock_response_generator():
            yield "Hello, this is a mock response from the large language model API.\n"
            await asyncio.sleep(1)
            yield "The response is being streamed back to the user.\n"
            await asyncio.sleep(1)
            yield "This is the final part of the response."

        async for chunk in mock_response_generator():
            collected_chunks.append(chunk)
            yield f"data: {chunk}"

    # Once the streaming is complete, add the assistant's response to the conversation
    assistant_response = ''.join(collected_chunks)
    assistant_message = Message(role='assistant', content=assistant_response)
    await add_message(conversation_id=conversation.id, message=assistant_message)