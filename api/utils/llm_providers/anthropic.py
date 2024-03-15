import json
import os
import httpx
from typing import AsyncIterator

API_URL = "https://api.anthropic.com"

async def anthropic_generate_response(conversation) -> AsyncIterator[str]:
    api_key = os.environ["ANTHROPIC_API_KEY"]
    model_name = conversation.model.name

    headers = {
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "messages-2023-12-15",
        "content-type": "application/json",
        "x-api-key": api_key,
    }

    messages = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]

    data = {
        "model": model_name,
        "messages": messages,
        "max_tokens": 256,  # Adjust as needed
        "stream": True,
    }

    async with httpx.AsyncClient() as client:
        async with client.stream("POST", f"{API_URL}/v1/messages", headers=headers, json=data) as response:
            async for chunk in response.aiter_lines():
                if chunk.startswith("data:"):
                    event_data = chunk[5:].strip()
                    if event_data:
                        event = json.loads(event_data)
                        event_type = event["type"]

                        if event_type == "content_block_delta":
                            delta = event["delta"]
                            if delta["type"] == "text_delta":
                                yield delta["text"]
                        elif event_type == "message_stop":
                            break