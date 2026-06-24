from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.dependencys import env_vars, r

security = HTTPBearer()

SECRET_KEY = env_vars.get("auth_key")
ALGORITHM = env_vars.get("algorithm")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        jti = payload.get("jti")

        if not jti:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        session = r.get(f"session:{jti}")

        if not session:
            raise HTTPException(
                status_code=401,
                detail="Session expired or revoked"
            )

        return {
            "username": payload["sub"],
            "role": payload["role"],
            "jti": payload["jti"]
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )