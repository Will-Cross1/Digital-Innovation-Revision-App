from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/quiz",
    tags=["quiz"]
)

class QuizDetails(BaseModel):
    flashcard_id: int
    score: float
    total_questions: int

# Protected
@router.get("/") # Done
def get_quiz_results_all(user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Flashcard_id, Score, Total_questions, Completed_date
                FROM QuizResults
                WHERE User_id = %s;
                """,
                (user_id,)
            )
            quizes = cursor.fetchall()

            return quizes
    finally:
        conn.close()

# Protected
@router.get("/{quiz_id}") # Done
def get_quiz_results_id(quiz_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Flashcard_id, Score, Total_questions, Completed_date
                FROM QuizResults
                WHERE ID = %s AND User_id = %s;
                """,
                (quiz_id, user_id)
            )
            quiz = cursor.fetchone()

            if quiz is None:
                raise HTTPException(
                    status_code=404,
                    detail="Quiz not found"
                )

            return {
                "id": quiz[0],
                "flashcard_id": quiz[1],
                "score": quiz[2],
                "total_questions": quiz[3],
                "completed_date": quiz[4]
            }
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
@router.delete("/{quiz_id}") # Done
def delete_quiz_result(quiz_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM QuizResults
                WHERE ID = %s AND User_id = %s;
                """,
                (quiz_id, user_id)
            )

            conn.commit()
            return("quiz deleted")
    finally:
        conn.close()



# TODO
# COMPLETED
# UNTESTED


# THESE WILL BE DONE IN THE FRONTEND! (both are public though (if you can access the flashcard you can take the quiz))
# generate quiz from flashcard (flashcard id, check the person doing it has access to that flashcard)
# take quiz