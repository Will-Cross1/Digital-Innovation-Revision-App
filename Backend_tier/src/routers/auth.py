from fastapi import APIRouter, HTTPException
from src.common import connect
from pydantic import BaseModel
import os
import jwt
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

password_hash = PasswordHash.recommended()

class LoginDetails(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: LoginDetails):
    conn = connect()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT ID, PasswordHash
                FROM Users
                WHERE Email = %s;
                """,
                (user.email,)
            )
            result = cursor.fetchone()

            if result is None:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password"
                )

            user_id = result[0]
            stored_hash = result[1]

            if not password_hash.verify(user.password, stored_hash):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password"
                )

            token = jwt.encode(
                {
                    "user_id": user_id,
                    "exp": datetime.now(timezone.utc) + timedelta(hours=3)
                },
                os.environ["SECRET_KEY"],
                algorithm=os.environ["ALGORITHM"]
            )

            return {
                "access_token": token,
                "token_type": "bearer"
            }

    finally:
        conn.close()
