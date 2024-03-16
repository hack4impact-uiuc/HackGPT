import os
import httpx
from fastapi import APIRouter, Request
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from starlette.config import Config
from datetime import datetime, timedelta
from jose import jwt

from utils.db_utils import users_collection

# Load environment variables
config = Config('.env')


# OAuth2 configuration
oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=config('GOOGLE_CLIENT_ID'),
    client_secret=config('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)

router = APIRouter()

@router.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

# JWT configuration
SECRET_KEY = config('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
FRONTEND_URL = config('FRONTEND_URL')

@router.get('/auth')
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)

    # Extract user email from Google OAuth
    email = user_info.get('email')

    # Make a request to the members API to retrieve user information
    async with httpx.AsyncClient() as client:
        response = await client.post('https://members.h4i.app/api/members', json={'secret': os.environ['SESSION_SECRET']})
        members_data = response.json()

    # Find the user in the members data based on email
    user = next((member for member in members_data['result'] if member['email'] == email), None)

    if user:
        # Extract additional user information from the members data
        first_name = user['firstName']
        last_name = user['lastName']


        # Create or update the user in the database
        user_data = {'email': email, 'first_name': first_name, 'last_name': last_name}
        users_collection.update_one({'email': email}, {'$set': user_data}, upsert=True)

        # Generate JWT token
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_at = datetime.now(datetime.UTC) + expires_delta
        token_data = {
            "sub": email,
            "exp": expires_at,
            "iat": datetime.now(datetime.UTC),
            "first_name": first_name,
            "last_name": last_name
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

        # Redirect the user back to the frontend with the JWT token
        redirect_url = f'{FRONTEND_URL}/dashboard?token={token}'
        return RedirectResponse(url=redirect_url)
    else:
        # User not found in the members data, handle accordingly (e.g., redirect to an error page)
        error_url = f'{FRONTEND_URL}/error'
        return RedirectResponse(url=error_url)

@router.get('/logout')
async def logout():
    # Clear the user session
    response = RedirectResponse(url='/')
    response.delete_cookie('token')
    return response