import asyncio
from utils.conversation_utils import add_message
from api.models.conversation import Message

async def generate_response_stream(conversation):
    # TODO: Implement the logic to send the conversation to the large language model API
    # and retrieve the streaming response. This will depend on the specific API you are using.
    # For demonstration purposes, let's simulate a streaming response.

    async def mock_response_generator():
        yield "Hello, this is a mock response from the large language model API.\n"
        await asyncio.sleep(1)
        yield "The response is being streamed back to the user.\n"
        await asyncio.sleep(1)
        yield "This is the final part of the response."

    # Simulating the streaming response
    async for chunk in mock_response_generator():
        yield f"data: {chunk}\n\n"

    # Once the streaming is complete, add the assistant's response to the conversation
    assistant_response = "This is the complete response from the assistant."
    assistant_message = Message(role='assistant', content=assistant_response)
    await add_message(conversation_id=conversation._id, message=assistant_message)