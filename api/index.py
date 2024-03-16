from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from starlette.config import Config
from api.routes.auth_routes import router as auth_router
from api.routes.conversation_routes import router as conversation_router


config = Config('.env')

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=config('SECRET_KEY'),  # Replace with your own secret key
)

# Include the authentication routes
app.include_router(auth_router)
app.include_router(conversation_router)
