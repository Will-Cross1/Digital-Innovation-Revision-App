import os
import psycopg
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
import jwt
from pwdlib import PasswordHash

def connect():
    # PostgreSQL connection (using docker container environment variables (.env is for docker-compose))
    conn = psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.environ["DB_PORT"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"]
    )
    return(conn)


security = HTTPBearer()
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, os.environ["SECRET_KEY"], algorithms=[(os.environ["ALGORITHM"])])
        return payload["user_id"]

    except (jwt.InvalidTokenError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


password_hash = PasswordHash.recommended()
def hash_password(password: str) -> str:
    return password_hash.hash(password)