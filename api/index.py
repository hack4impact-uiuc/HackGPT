from fastapi import FastAPI
from api.routes.auth_routes import router as auth_router
# Import other necessary modules and dependencies

app = FastAPI()

# Include the authentication routes
app.include_router(auth_router)
