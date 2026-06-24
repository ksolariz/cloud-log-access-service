from pydantic import BaseModel


class LogFile(BaseModel):
    name: str
    size: int
    last_modified: str