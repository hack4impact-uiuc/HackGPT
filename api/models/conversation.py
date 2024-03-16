from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls):
        return {"type": "string"}

class Message(BaseModel):
    role: str
    content: str
    hidden: bool = False

class LanguageModel(BaseModel):
    provider: str
    name: str

class Conversation(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_email: str
    name: str
    created_at: datetime
    model: LanguageModel
    messages: List[Message] = []
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}