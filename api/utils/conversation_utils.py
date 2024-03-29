from datetime import datetime, timezone
from typing import List

from api.utils.db_utils import get_db
from api.models.conversation import Message, Conversation, LanguageModel
from bson import ObjectId
from fastapi import HTTPException

async def create_conversation(user_email: str, name: str, model_provider: str, model_name: str):
    db = await get_db()
    conversations_collection = db["conversations"]
    model = LanguageModel(provider=model_provider, name=model_name)
    conversation = Conversation(user_email=user_email, name=name, model=model, created_at=datetime.now(timezone.utc))
    result = await conversations_collection.insert_one(conversation.dict())
    return str(result.inserted_id)

async def add_message(conversation_id: str, message: Message):
    db = await get_db()
    conversations_collection = db["conversations"]
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$push": {"messages": message.dict()}}
    )

async def rename_conversation(conversation_id: str, new_name: str, user_email: str):
    db = await get_db()
    conversations_collection = db["conversations"]
    try:
        conversation = await conversations_collection.find_one(
            {"_id": ObjectId(conversation_id), "user_email": user_email}
        )

        if conversation:
            await conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"name": new_name}},
            )
            return True
        else:
            return False
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid conversation ID")

async def get_conversation_by_id(conversation_id: str, user_email: str):
    db = await get_db()
    conversations_collection = db["conversations"]
    conversation_dict = await conversations_collection.find_one(
        {"_id": ObjectId(conversation_id), "user_email": user_email}
    )
    if conversation_dict:
        conversation_dict["_id"] = str(conversation_dict["_id"])
        return Conversation(**conversation_dict)
    else:
        return None

async def get_conversations_by_user(user_email: str):
    db = await get_db()
    conversations_collection = db["conversations"]
    conversations = await conversations_collection.find({"user_email": user_email}).to_list(length=None)
    return conversations

async def update_conversation_model(conversation_id: str, model_provider: str, model_name: str, user_email: str, new_name: str = None):
    db = await get_db()
    conversations_collection = db["conversations"]
    conversation = await get_conversation_by_id(conversation_id, user_email)
    if conversation:
        update_fields = {}
        if model_provider and model_name:
            update_fields["model"] = {"provider": model_provider, "name": model_name}
        if new_name:
            update_fields["name"] = new_name

        if update_fields:
            result = await conversations_collection.update_one(
                {"_id": ObjectId(conversation_id), "user_email": user_email},
                {"$set": update_fields}
            )
            return result.modified_count > 0
    return False

async def update_conversation_messages(conversation_id: str, updated_messages: List[Message], user_email: str):
    db = await get_db()
    conversations_collection = db["conversations"]
    conversation = await get_conversation_by_id(conversation_id, user_email)
    if conversation:
        await conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"messages": [message.dict() for message in updated_messages]}},
        )
        return True
    else:
        return False