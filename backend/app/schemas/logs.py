from datetime import datetime
from pydantic import BaseModel


class LogFile(BaseModel):
    filename: str
    size: int
    last_modified: datetime

class PresignRequest(BaseModel):
    expires_in: int = 300