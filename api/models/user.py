#api/models/user.py
from datetime import date
from pydantic import BaseModel

class User(BaseModel):
    email: str
    first_name: str
    last_name: str
    daily_flagship_usage: float = 0.0
    daily_usage: float = 0.0
    last_usage_update: date = None