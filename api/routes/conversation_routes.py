from fastapi import APIRouter, Depends
from models.message import Message
from utils.conversation_utils import create_conversation, add_message
from utils.auth_utils import get_current_user
from models.user import User

router = APIRouter()

@router.post("/conversations")
async def create_conversation_route(current_user: User = Depends(get_current_user)):
    conversation_id = await create_conversation(current_user.email)
    return {"conversation_id": conversation_id}

@router.post("/conversations/{conversation_id}/messages")
async def add_message_route(conversation_id: str, message: Message, current_user: User = Depends(get_current_user)):
    await add_message(conversation_id, message, current_user.email)
    return {"status": "success"}