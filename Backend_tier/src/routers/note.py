from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/note",
    tags=["note"]
)

class NoteDetails(BaseModel):
    title: str | None = None
    content: str | None = None
    subject_id: int | None = None

# Protected
@router.post("/")
def add_note(note: NoteDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Notes (Title, Content, User_id, Subject_id)
                VALUES (%s, %s, %s, %s)
                RETURNING ID;
                """,
                (note.title, note.content, user_id, note.subject_id)
            )
            conn.commit()

            return "Note created"
    finally:
        conn.close()

# Protected
@router.get("/")
def get_note_all(user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Title, Content, Subject_id, Created_at, Updated_at
                FROM Notes
                WHERE User_id = %s;
                """,
                (user_id,)
            )
            notes = cursor.fetchall()

            return notes
    finally:
        conn.close()

# Protected
@router.get("/{note_id}")
def get_note_id(note_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Title, Content, Subject_id, Created_at, Updated_at
                FROM Notes
                WHERE ID = %s AND User_id = %s;
                """,
                (note_id, user_id)
            )
            note = cursor.fetchone()

            if note is None:
                raise HTTPException(
                    status_code=404,
                    detail="Note not found"
                )

            return {
                "id": note[0],
                "title": note[1],
                "content": note[2],
                "subject_id": note[3],
                "created_at": note[4],
                "updated_at": note[5]
            }
    finally:
        conn.close()

# Protected
@router.patch("/{note_id}")
def update_note(note_id: int, note: NoteDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            updates=[]
            if note.title is not None:
                cursor.execute(
                    """
                    UPDATE Notes
                    SET Title = %s, Updated_at = CURRENT_TIMESTAMP
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (note.title, note_id, user_id)
                )
                updates.append("title")

            if note.content is not None:
                cursor.execute(
                    """
                    UPDATE Notes
                    SET Content = %s, Updated_at = CURRENT_TIMESTAMP
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (note.content, note_id, user_id)
                )
                updates.append("content")

            if note.subject_id is not None:
                cursor.execute(
                    """
                    UPDATE Notes
                    SET Subject_id = %s, Updated_at = CURRENT_TIMESTAMP
                    WHERE ID = %s AND User_id = %s;
                    """,
                    (note.subject_id, note_id, user_id)
                )
                updates.append("subject_id")

            conn.commit()
            return("note updated", updates)
    finally:
        conn.close()

# Protected
@router.delete("/{note_id}")
def delete_note(note_id: int, user_id: int = Depends(get_current_user)):
    conn = connect()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM Notes
                WHERE ID = %s AND User_id = %s;
                """,
                (note_id, user_id)
            )

            conn.commit()
            return("note deleted")
    finally:
        conn.close()




# TODO
# COMPLETED
# UNTESTED