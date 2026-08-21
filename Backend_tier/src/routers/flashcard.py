from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/flashcard",
    tags=["flashcard"]
)

class FlashcardDetails(BaseModel):
    questions_dict: dict | None = None
    answers_dict: dict | None = None
    subject_id: int | None = None
    is_public: bool | None = None

# Unprotected
@router.get("/public/{flashcard_id}") # Done
def get_flashcard_id_public(flashcard_id: int):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Questions_dict, Answers_dict, Subject_id, Is_public
                FROM Flashcards
                WHERE ID = %s AND Is_public = True;
                """,
                (flashcard_id,)
            )
            flashcard = cursor.fetchone()

            if flashcard is None:
                raise HTTPException(
                    status_code=404,
                    detail="Flashcard not found"
                )

            return {
                "id": flashcard[0],
                "questions_dict": flashcard[1],
                "answers_dict": flashcard[2],
                "subject_id": flashcard[3],
                "is_public": flashcard[4]
            }
    finally:
        conn.close()

# Protected
@router.get("/private/{flashcard_id}") # Done
def get_flashcard_id_private(flashcard_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Questions_dict, Answers_dict, Subject_id, Is_public
                FROM Flashcards
                WHERE ID = %s AND (User_id = %s OR Is_public = True);
                """,
                (flashcard_id, user_id)
            )
            flashcard = cursor.fetchone()

            if flashcard is None:
                raise HTTPException(
                    status_code=404,
                    detail="Flashcard not found"
                )

            return {
                "id": flashcard[0],
                "questions_dict": flashcard[1],
                "answers_dict": flashcard[2],
                "subject_id": flashcard[3],
                "is_public": flashcard[4]
            }
    finally:
        conn.close()

# Unprotected
@router.get("/public") # Done
def get_flashcard_all_public():
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Questions_dict, Answers_dict, Subject_id, Is_public
                FROM Flashcards
                WHERE Is_public = True;
                """
            )
            flashcard = cursor.fetchall()

            return flashcard
    finally:
        conn.close()

# Protected
@router.get("/private") # Done
def get_flashcard_all_private(user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Questions_dict, Answers_dict, Subject_id, Is_public
                FROM Flashcards
                WHERE User_id = %s;
                """,
                (user_id,)
            )
            flashcard = cursor.fetchall()

            return flashcard
    finally:
        conn.close()

# Protected
@router.post("/") # Done
def add_flashcard(flashcard: FlashcardDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Flashcards (Questions_dict, Answers_dict, User_id, Subject_id, Is_public)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING ID;
                """,
                (flashcard.questions_dict, flashcard.answers_dict, user_id, flashcard.subject_id, flashcard.is_public)
            )
            conn.commit()

            return "Flashcard created"
    finally:
        conn.close()

# Protected
@router.patch("/{flashcard_id}") # Done
def update_flashcard(flashcard_id: int, flashcard: FlashcardDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            updates=[]
            if flashcard.questions_dict is not None:
                cursor.execute(
                    """
                    UPDATE Flashcards
                    SET Questions_dict = %s
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (flashcard.questions_dict, flashcard_id, user_id)
                )
                updates.append("questions")

            if flashcard.answers_dict is not None:
                cursor.execute(
                    """
                    UPDATE Flashcards
                    SET Answers_dict = %s
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (flashcard.answers_dict, flashcard_id, user_id)
                )
                updates.append("answers")

            if flashcard.subject_id is not None:
                cursor.execute(
                    """
                    UPDATE Flashcards
                    SET Subject_id = %s
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (flashcard.subject_id, flashcard_id, user_id)
                )
                updates.append("subject_id")
            
            if flashcard.is_public is not None:
                cursor.execute(
                    """
                    UPDATE Flashcards
                    SET Is_public = %s
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (flashcard.is_public, flashcard_id, user_id)
                )
                updates.append("publicity")

            conn.commit()
            return("flashcard updated", updates)
    finally:
        conn.close()

# Protected
@router.delete("/{flashcard_id}")
def delete_flashcard(flashcard_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM Flashcards
                WHERE ID = %s AND User_id = %s;
                """,
                (flashcard_id, user_id)
            )

            conn.commit()
            return("flashcard deleted")
    finally:
        conn.close()



# Protected
@router.get("/favourite") # Done
def get_flashcard_favourite(user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:            
            cursor.execute(
                """
                SELECT ID, Questions_dict, Answers_dict, Subject_id, Is_public
                FROM Flashcards
                INNER JOIN Favourites
                ON Flashcards.ID = Favourites.Flashcard_id
                WHERE Favourites.User_id = %s
                """,
                (user_id,)
            )
            flashcards = cursor.fetchall()

            return flashcards
    finally:
        conn.close()
        

# Protected
@router.post("/favourite/{flashcard_id}") # Done
def favourite_flashcard(flashcard_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT User_id, Is_public
                FROM Flashcards
                WHERE ID = %s;
                """,
                (flashcard_id,)
            )
            flashcard_info = cursor.fetchone()
            if flashcard_info is None:
                raise HTTPException(
                    status_code=404,
                    detail="Flashcard not found"
                )
            
            if flashcard_info[0] == user_id or flashcard_info[1] == True:
                cursor.execute(
                    """
                    INSERT INTO Favourites (Flashcard_id, User_id)
                    VALUES (%s, %s)
                    """,
                    (flashcard_id, user_id)
                )
                conn.commit()

                return ("flashcard favourited")
            raise HTTPException(
                status_code=404,
                detail="Flashcard not found"
            )
    finally:
        conn.close()


# TODO
# COMPLETED
# UNTESTED