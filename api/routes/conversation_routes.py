from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from api.models.conversation import Message
from api.utils.conversation_utils import create_conversation, add_message, get_conversation_by_id, rename_conversation, get_conversations_by_user
from api.utils.llm_utils import generate_response_stream
from api.utils.auth_utils import get_current_user
from api.models.user import User

router = APIRouter()

@router.post("/conversations")
async def create_conversation_route(model_provider:str, model_name:str,name: str = "Untitled", current_user: User = Depends(get_current_user)):
    conversation_id = await create_conversation(current_user.email, name, model_provider, model_name)
    return {"conversation_id": conversation_id}


@router.post("/conversations/{conversation_id}/message")
async def add_message_route(conversation_id: str, message: str, current_user: User = Depends(get_current_user)):
    user_message = Message(role='user', content=message)
    await add_message(conversation_id, user_message)
    
    conversation = await get_conversation_by_id(conversation_id, current_user.email)
    if conversation:
        response_stream = generate_response_stream(conversation)
        return StreamingResponse(response_stream, media_type="text/event-stream")
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")
    

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
    

@router.get("/conversations")
async def get_conversations_route(current_user: User = Depends(get_current_user)):
    conversations = await get_conversations_by_user(current_user.email)
    return [{"id": str(conv["_id"]), "name": conv["name"]} for conv in conversations]

@router.get("/conversations/{conversation_id}")
async def get_conversation_route(conversation_id: str, current_user: User = Depends(get_current_user)):
    conversation = await get_conversation_by_id(conversation_id, current_user.email)
    if conversation:
        return conversation
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")