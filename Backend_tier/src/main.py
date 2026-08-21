from fastapi import FastAPI
from src.routers import user, auth

app = FastAPI()

# Add all routers
app.include_router(user.router)
app.include_router(auth.router)

