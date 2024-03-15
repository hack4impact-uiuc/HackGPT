from datetime import datetime
from db_utils import conversations_collection
from models.message import Message
from bson import ObjectId

async def create_conversation(user_email: str):
    conversation = {
        "user_email": user_email,
        "created_at": datetime.utcnow(),
        "messages": []
    }
    result = await conversations_collection.insert_one(conversation)
    return str(result.inserted_id)

async def add_message(conversation_id: str, message: Message):
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$push": {"messages": message.dict()}}
    )