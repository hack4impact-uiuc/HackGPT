#api/index.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.config import Config
from api.routes.auth_routes import router as auth_router
from api.routes.conversation_routes import router as conversation_router
from api.utils.db_utils import connect_and_init_db, close_db_connection

config = Config('.env')

origins = [
    config('FRONTEND_URL')
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=config('SECRET_KEY'),
)

# Include the authentication routes
app.include_router(auth_router, prefix="/api")
app.include_router(conversation_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    await connect_and_init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection()