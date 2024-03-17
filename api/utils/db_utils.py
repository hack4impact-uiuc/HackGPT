import motor.motor_asyncio
from starlette.config import Config

# Load environment variables
config = Config('.env')

# Replace 'your_mongodb_uri' with your actual MongoDB URI
client = motor.motor_asyncio.AsyncIOMotorClient(config('MONGODB_URI'))
db = client.your_database_name
users_collection = db["users"]
conversations_collection = db["conversations"]