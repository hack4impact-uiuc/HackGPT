from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from api.utils.db_utils import get_db
from api.models.user import User
from starlette.config import Config

config = Config('.env')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
SECRET_KEY = config('SECRET_KEY')

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        db = await get_db()
        users_collection = db["users"]
        user_dict = await users_collection.find_one({"email": email})

        if user_dict is None:
            raise HTTPException(status_code=401, detail="User not found")

        user = User(**user_dict)
        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")