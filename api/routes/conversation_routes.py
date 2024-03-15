from fastapi import APIRouter, Depends, HTTPException
from api.models.conversation import Message
from utils.conversation_utils import create_conversation, add_message, rename_conversation
from utils.auth_utils import get_current_user
from models.user import User

router = APIRouter()

@router.post("/conversations")
async def create_conversation_route(model_provider:str, model_name:str,name: str = "Untitled", current_user: User = Depends(get_current_user)):
    conversation_id = await create_conversation(current_user.email, name, model_provider, model_name)
    return {"conversation_id": conversation_id}

@router.post("/conversations/{conversation_id}/messages")
async def add_message_route(conversation_id: str, message: Message, current_user: User = Depends(get_current_user)):
    await add_message(conversation_id, message, current_user.email)
    return {"status": "success"}

@router.patch("/conversations/{conversation_id}")
async def rename_conversation_route(
    conversation_id: str,
    new_name: str,
    current_user: User = Depends(get_current_user),
):
    success = await rename_conversation(conversation_id, new_name, current_user.email)
    if success:
        return {"message": "Conversation renamed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")