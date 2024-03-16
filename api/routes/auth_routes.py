import os
import httpx
from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from starlette.config import Config
from datetime import datetime, timedelta, timezone
from jose import jwt

from api.utils.db_utils import users_collection

# Load environment variables
config = Config('.env')


# OAuth2 configuration
oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=config('GOOGLE_CLIENT_ID'),
    client_secret=config('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://oauth2.googleapis.com/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params={'access_type': 'offline', 'prompt': 'consent'},
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
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
    
    # Retrieve the access token from the token response
    access_token = token.get('access_token')
    
    if access_token:
        # Make a request to the userinfo endpoint to retrieve user information
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info = response.json()
        
        # Extract user email from the user information
        email = user_info.get('email')

        print(f"EMAIL: {email}")
        
        # Make a request to the members API to retrieve user information by email
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'https://members.h4i.app/api/members/email/{email}',
                json={'secret': config('MEMBERDB_SECRET')}
            )
            if response.status_code == 200:
                member_data = response.json()
                print(f"MEMBER DATA")
                print(member_data)
                if member_data['success']:
                    user = member_data['result']
                    first_name = user['firstName']
                    last_name = user['lastName']
                    
                    # Create or update the user in the database
                    user_data = {'email': email, 'first_name': first_name, 'last_name': last_name}
                    users_collection.update_one({'email': email}, {'$set': user_data}, upsert=True)
                    
                    # Generate JWT token
                    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                    expires_at = datetime.now(timezone.utc) + expires_delta
                    token_data = {
                        "sub": email,
                        "exp": expires_at,
                        "iat": datetime.now(timezone.utc),
                        "first_name": first_name,
                        "last_name": last_name
                    }
                    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
                    
                    # Redirect the user back to the frontend with the JWT token
                    redirect_url = f'{FRONTEND_URL}?token={token}'
                    return RedirectResponse(url=redirect_url)
                else:
                    # User not found in the members data, handle accordingly (e.g., redirect to an error page)
                    error_url = f'{FRONTEND_URL}/error'
                    return RedirectResponse(url=error_url)
            else:
                # Handle the case when the members API request fails
                error_message = f"Failed to retrieve user information from the members API. Status code: {response.status_code}"
                raise HTTPException(status_code=500, detail=error_message)
    else:
        # Handle the case when access token is missing
        raise HTTPException(status_code=400, detail="Access token missing in the response")

@router.get('/logout')
async def logout():
    # Clear the user session
    response = RedirectResponse(url='/')
    response.delete_cookie('token')
    return response