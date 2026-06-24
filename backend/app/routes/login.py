from datetime import datetime, timedelta
from app.dependencys import env_vars, r
from fastapi import APIRouter, HTTPException, Depends
from jose import jwt
from app.schemas import LoginRequest
import uuid
from app.dependencys.auth import get_current_user

loginrouter = APIRouter()

SECRET_KEY = env_vars.get('auth_key')
ALGORITHM = env_vars.get('algorithm')
ACCESS_TOKEN_EXPIRE_MINUTES = 60


@loginrouter.post("/login", tags=["Users"])
async def post_token(data: LoginRequest):
 
    username = data.username
    password = data.password

    if username != "admin" or password != "admin123":
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    jti = str(uuid.uuid4())

    payload = {
        "jti": jti,
        "sub": username,
        "role": "admin",
        "exp": expire
    }

    access_token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    r.set(
        f"session:{jti}",
        username,
        ex=3600
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "username": username,
            "role": "admin"
        }
    }

@loginrouter.post("/logout", tags=["Users"])
async def logout(user=Depends(get_current_user)):
    
    r.delete(
        f"session:{user['jti']}"
    )

    return {
        "message": "Successfully logged out"
    }

    