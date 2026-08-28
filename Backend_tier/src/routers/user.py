from fastapi import APIRouter, HTTPException, Depends
from src.common import connect, get_current_user, hash_password
from pydantic import BaseModel


# FULLY USED


router = APIRouter(
    prefix="/user",
    tags=["user"]
)

class UserDetails(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str | None = None

# protected
@router.get("/")
def get_user(user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, Username, Email
                FROM Users
                WHERE ID = %s;
                """,
                (user_id,)
            )
            user = cursor.fetchone()

            if user is None:
                raise HTTPException(
                    status_code=404,
                    detail="User not found"
                )

            return {
                "id": user[0],
                "username": user[1],
                "email": user[2]
            }
    finally:
        conn.close()

# Unprotected
@router.post("/")
def add_user(user: UserDetails):
    conn = connect()
    hashed_password = hash_password(user.password)

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Users (Username, Email, PasswordHash)
                VALUES (%s, %s, %s)
                RETURNING ID;
                """,
                (user.username, user.email, hashed_password)
            )
            conn.commit()

            return "User created"
    finally:
        conn.close()

# Protected
@router.patch("/")
def update_user(user: UserDetails, user_id: int = Depends(get_current_user)):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            updates=[]
            if user.username is not None:
                cursor.execute(
                    """
                    UPDATE Users
                    SET Username = %s
                    WHERE ID = %s;
                    """,
                    (user.username, user_id)
                )
                updates.append("username")

            if user.email is not None:
                cursor.execute(
                    """
                    UPDATE Users
                    SET Email = %s
                    WHERE ID = %s;
                    """,
                    (user.email, user_id)
                )
                updates.append("email")

            if user.password is not None:
                hashed_password = hash_password(user.password)
                cursor.execute(
                    """
                    UPDATE Users
                    SET PasswordHash = %s
                    WHERE ID = %s;
                    """,
                    (hashed_password, user_id)
                )
                updates.append("password")

            conn.commit()
            return("user updated", updates)
    finally:
        conn.close()

# Protected
@router.delete("/")
def delete_user(user_id: int = Depends(get_current_user)):
    conn = connect()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM Users
                WHERE ID = %s;
                """,
                (user_id,)
            )

            conn.commit()
            return("user deleted")
    finally:
        conn.close()
