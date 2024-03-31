# api/models/conversation.py

from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from bson import ObjectId


class Message(BaseModel):
    role: str
    content: str
    hidden: bool = False

class LanguageModel(BaseModel):
    provider: str
    name: str

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_email: str
    name: str
    created_at: datetime
    model: LanguageModel
    messages: List[Message] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}