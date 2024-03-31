#api/routes/conversation_routes.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from starlette.config import Config
from pydantic import BaseModel
from api.models.conversation import Message
from api.utils.conversation_utils import update_conversation_messages, create_conversation, add_message, get_conversation_by_id, get_conversations_by_user, update_conversation_model
from api.utils.llm_utils import generate_response_stream
from api.utils.llm_provider_info import LLM_PROVIDERS
from api.utils.auth_utils import get_current_user
from api.models.user import User
from api.utils.db_utils import get_db


router = APIRouter()
config = Config('.env')

class ConversationCreate(BaseModel):
    model_provider: str
    model_name: str
    name: str = "Untitled"

class ConversationUpdate(BaseModel):
    model_provider: str = None
    model_name: str = None
    name: str = None

class MessageCreate(BaseModel):
    message: str

@router.post("/conversations")
async def create_conversation_route(conversation_create: ConversationCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    conversation_id = await create_conversation(current_user.email, conversation_create.name, conversation_create.model_provider, conversation_create.model_name)
    return {"conversation_id": conversation_id}

@router.post("/conversations/{conversation_id}/message")
async def add_message_route(conversation_id: str, message_create: MessageCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    daily_flagship_usage_limit = float(config('DAILY_FLAGSHIP_USAGE_LIMIT', default='1.0'))
    daily_usage_limit = float(config('DAILY_USAGE_LIMIT', default='2.0'))

    conversation = await get_conversation_by_id(conversation_id, current_user.email)

    # Check if the user has exceeded their daily flagship limit
    if current_user.daily_flagship_usage >= daily_flagship_usage_limit:
        if any(p.model_name == conversation.model.name and p.is_flagship for p in LLM_PROVIDERS):
            raise HTTPException(status_code=429, detail="Daily flagship usage limit exceeded")

    # Check if the user has exceeded their daily general limit
    if current_user.daily_usage >= daily_usage_limit:
        raise HTTPException(status_code=429, detail="Daily usage limit exceeded")

    user_message = Message(role='user', content=message_create.message)

    await add_message(conversation_id, user_message)
    conversation = await get_conversation_by_id(conversation_id, current_user.email)

    if conversation:
        return StreamingResponse(generate_response_stream(conversation), media_type="text/event-stream")
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")

@router.put("/conversations/{conversation_id}/messages")
async def update_messages_route(
    conversation_id: str,
    updated_messages: List[Message],
    current_user: User = Depends(get_current_user),
):
    success = await update_conversation_messages(conversation_id, updated_messages, current_user.email)
    if success:
        return {"message": "Messages updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")

@router.patch("/conversations/{conversation_id}")
async def update_conversation_route(
    conversation_id: str,
    conversation_update: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    success = await update_conversation_model(
        conversation_id, 
        conversation_update.model_provider, 
        conversation_update.model_name, 
        current_user.email, 
        conversation_update.name
    )
    if success:
        return {"message": "Conversation updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")

@router.get("/conversations")
async def get_conversations_route(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    conversations = await get_conversations_by_user(current_user.email)
    return [
        {
            "id": str(conv["_id"]),
            "name": conv["name"],
            "created_at": conv["created_at"].isoformat(),
        }
        for conv in conversations
    ]

@router.get("/conversations/{conversation_id}")
async def get_conversation_route(conversation_id: str, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    conversation = await get_conversation_by_id(conversation_id, current_user.email)
    if conversation:
        return conversation
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")


@router.get("/usage")
async def get_usage_route(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    return {
        "daily_flagship_usage": current_user.daily_flagship_usage,
        "daily_usage": current_user.daily_usage,
        "last_usage_update": current_user.last_usage_update.isoformat() if current_user.last_usage_update else None,
    }