#api/utils/llm_utils.py

import asyncio
from api.utils.conversation_utils import add_message, get_conversation_by_id, update_conversation_model
from api.models.conversation import Message
from api.utils.llm_providers.openai import openai_generate_response
from api.utils.llm_providers.anthropic import anthropic_generate_response, generate_conversation_name
from api.utils.llm_providers.alllama import alllama_generate_response

async def generate_response_stream(conversation):
    visible_messages = [message for message in conversation.messages if not message.hidden]
    # Merge adjacent messages with the same role
    merged_messages = []
    for message in visible_messages:
        if merged_messages and merged_messages[-1].role == message.role:
            merged_messages[-1].content += "\n" + message.content
        else:
            merged_messages.append(message)
    
    conversation.messages = merged_messages
    collected_chunks = []
    if conversation.model.provider == "openai":
        async for chunk in openai_generate_response(conversation):
            if chunk:
                collected_chunks.append(chunk)
                yield chunk
    elif conversation.model.provider == "anthropic":
        async for chunk in anthropic_generate_response(conversation):
            if chunk:
                collected_chunks.append(chunk)
                yield chunk
    elif conversation.model.provider == "alllama":
        async for chunk in alllama_generate_response(conversation):
            if chunk:
                collected_chunks.append(chunk)
                yield chunk
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
            yield chunk


    # Once the streaming is complete, add the assistant's response to the conversation
    assistant_response = "".join(collected_chunks)
    assistant_message = Message(role='assistant', content=assistant_response)
    await add_message(conversation_id=conversation.id, message=assistant_message)

    if len(conversation.messages) <= 2:
        conversation = await get_conversation_by_id(conversation.id, conversation.user_email)
        # Generate a name for the conversation using Anthropic's Haiku model
        conversation_name = await generate_conversation_name(conversation)
        
        # Update the conversation name in the database
        await update_conversation_model(conversation_id=conversation.id, model_provider=None, model_name=None, user_email=conversation.user_email, new_name=conversation_name)

