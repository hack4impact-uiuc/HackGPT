from motor.motor_asyncio import AsyncIOMotorClient
from starlette.config import Config

config = Config('.env')

db_client = None

async def get_db():
    return db_client[config('DATABASE_NAME')]

async def connect_and_init_db():
    global db_client
    db_client = AsyncIOMotorClient(config('MONGODB_URI'))

async def close_db_connection():
    global db_client
    if db_client:
        db_client.close()
        db_client = None