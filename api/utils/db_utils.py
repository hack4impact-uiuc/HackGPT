from pymongo import MongoClient
from starlette.config import Config

# Load environment variables
config = Config('.env')

# Replace 'your_mongodb_uri' with your actual MongoDB URI
client = MongoClient(config('MONGODB_URI'))
db = client.your_database_name
users_collection = db["users"]
conversations_collection = db["conversations"]