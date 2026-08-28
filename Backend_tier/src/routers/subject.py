from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user
from pydantic import BaseModel


# FULLY USED


router = APIRouter(
    prefix="/subject",
    tags=["subject"]
)

class SubjectDetails(BaseModel):
    name: str
    description: str

# Unprotected
@router.get("/")
def get_subjects():
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Name, Description
                FROM Subjects;
                """
            )
            subjects = cursor.fetchall()
            
            subjects_list = []
            for subject in subjects:
                subjects_list.append({
                    "id": subject[0],
                    "name": subject[1],
                    "description": subject[2]
                })

            return subjects_list
    finally:
        conn.close()


# Protected
@router.post("/")
def add_subject(subject: SubjectDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Subjects (Name, Description)
                VALUES (%s, %s)
                RETURNING ID;
                """,
                (subject.name, subject.description)
            )
            conn.commit()

            return "Subject created"
    finally:
        conn.close()
