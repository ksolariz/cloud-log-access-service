from fastapi import Depends, HTTPException

from app.dependencys.auth import get_current_user


def require_role(*allowed_roles):

    async def role_checker(
        user=Depends(get_current_user)
    ):

        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )

        return user

    return role_checker