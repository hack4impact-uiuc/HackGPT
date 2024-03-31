#api/models/user.py
from pydantic import BaseModel

class User(BaseModel):
    email: str
    first_name: str
    last_name: str