from fastapi import FastAPI, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from starlette.config import Config

from pymongo import MongoClient

# Load environment variables
config = Config('.env')

# Replace 'your_mongodb_uri' with your actual MongoDB URI
client = MongoClient('your_mongodb_uri')
db = client.your_database_name


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

app = FastAPI()

@app.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/auth')
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = await oauth.google.parse_id_token(request, token)
    # Perform additional actions, like creating a user session or storing the user in the database
    return user

@app.get('/logout')
async def logout(request: Request):
    # Implement logout logic, like clearing the user session
    return RedirectResponse(url='/')
