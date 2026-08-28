from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user
from pydantic import BaseModel


# FULLY USED


router = APIRouter(
    prefix="/quiz",
    tags=["quiz"]
)

class QuizDetails(BaseModel):
    flashcard_id: int
    score: float
    total_questions: int

# Protected
@router.get("/{flashcard_id}") # Done
def get_quiz_all_flashcard(flashcard_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Flashcard_id, Score, Total_questions, Completed_date
                FROM QuizResults
                WHERE Flashcard_id = %s AND User_id = %s;
                """,
                (flashcard_id, user_id)
            )
            quizes = cursor.fetchall()
            
            quizes_list = []
            for quiz in quizes:
                quizes_list.append({
                    "id": quiz[0],
                    "flashcard_id": quiz[1],
                    "score": quiz[2],
                    "total_questions": quiz[3],
                    "completed_date": quiz[4]
                })

            return quizes_list
    finally:
        conn.close()

# Protected
@router.post("/") # Done
def add_quiz_result(quiz: QuizDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID
                FROM Flashcards
                WHERE ID = %s AND (User_id = %s OR Is_public = True);
                """,
                (quiz.flashcard_id, user_id)
            )
            flashcard = cursor.fetchone()

            if flashcard is None:
                raise HTTPException(
                    status_code=404,
                    detail="Flashcard not found"
                )

            cursor.execute(
                """
                INSERT INTO QuizResults (User_id, Flashcard_id, Score, Total_questions)
                VALUES (%s, %s, %s, %s)
                RETURNING ID;
                """,
                (user_id, quiz.flashcard_id, quiz.score, quiz.total_questions)
            )
            conn.commit()

            return "quiz created"
    finally:
        conn.close()

# Protected
@router.delete("/{flashcard_id}") # Done
def delete_quiz_all_flashcard(flashcard_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM QuizResults
                WHERE Flashcard_id = %s AND User_id = %s;
                """,
                (flashcard_id, user_id)
            )

            conn.commit()
            return("quiz deleted")
    finally:
        conn.close()
