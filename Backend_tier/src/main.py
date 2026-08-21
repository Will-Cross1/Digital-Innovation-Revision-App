from fastapi import FastAPI
from src.routers import user, auth, note, subject, flashcard, quiz

app = FastAPI()

# Add all routers
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(note.router)
app.include_router(subject.router)
app.include_router(flashcard.router)
app.include_router(quiz.router)
