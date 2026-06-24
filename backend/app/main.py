from fastapi import FastAPI
from app.routes import *

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(loginrouter)
app.include_router(logsrouter)