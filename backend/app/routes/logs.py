from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.schemas.logs import LogFile
from app.dependencys.roles import require_role

from app.services.s3 import S3Service
s3_service = S3Service()

logsrouter = APIRouter()

MOCK_LOGS = [
    {
        "name": "application.log",
        "size": 1024,
        "last_modified": "2026-06-24T12:00:00Z"
    },
    {
        "name": "nginx.log",
        "size": 2048,
        "last_modified": "2026-06-24T11:30:00Z"
    },
    {
        "name": "security.log",
        "size": 4096,
        "last_modified": "2026-06-24T10:15:00Z"
    }
]

@logsrouter.get("/logs",response_model=list[LogFile],tags=["Logs"])
async def list_logs(user=Depends(require_role("admin"))):
    return s3_service.list_logs()

@logsrouter.get("/logs/{filename}")
async def download_log(filename: str, user=Depends(require_role("admin"))):
    
    content = s3_service.download_log(filename)

    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )