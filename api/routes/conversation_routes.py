from fastapi import APIRouter, Depends
from models.message import Message
from utils.conversation_utils import create_conversation, add_message

router = APIRouter()

@router.post("/conversations")
async def create_conversation_route(user_email: str):
    conversation_id = await create_conversation(user_email)
    return {"conversation_id": conversation_id}

@router.post("/conversations/{conversation_id}/messages")
async def add_message_route(conversation_id: str, message: Message):
    await add_message(conversation_id, message)
    return {"status": "success"}