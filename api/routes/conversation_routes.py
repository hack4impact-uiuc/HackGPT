from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from api.models.conversation import Message
from api.utils.conversation_utils import create_conversation, add_message, get_conversation_by_id, rename_conversation, get_conversations_by_user, update_conversation_model
from api.utils.llm_providers.openai import openai_generate_response
from api.utils.llm_utils import generate_response_stream
from api.utils.auth_utils import get_current_user
from api.models.user import User

router = APIRouter()

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
async def create_conversation_route(conversation_create: ConversationCreate, current_user: User = Depends(get_current_user)):
    conversation_id = await create_conversation(current_user.email, conversation_create.name, conversation_create.model_provider, conversation_create.model_name)
    return {"conversation_id": conversation_id}


@router.post("/conversations/{conversation_id}/message")
async def add_message_route(conversation_id: str, message_create: MessageCreate, current_user: User = Depends(get_current_user)):
    user_message = Message(role='user', content=message_create.message)
    await add_message(conversation_id, user_message)
    
    conversation = await get_conversation_by_id(conversation_id, current_user.email)
    if conversation:
        response_stream = generate_response_stream(conversation)
        return StreamingResponse(response_stream, media_type="text/event-stream")
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")
    

@router.patch("/conversations/{conversation_id}")
async def update_conversation_route(
    conversation_id: str,
    conversation_update: ConversationUpdate,
    current_user: User = Depends(get_current_user),
):
    print(conversation_update.model_provider)
    print(conversation_update.model_name)
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
async def get_conversations_route(current_user: User = Depends(get_current_user)):
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
async def get_conversation_route(conversation_id: str, current_user: User = Depends(get_current_user)):
    conversation = await get_conversation_by_id(conversation_id, current_user.email)
    if conversation:
        return conversation
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")
