import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import Base, engine
from backend import models
from backend.routers import users, inspections
from backend.database import engine


print(engine.url) #查找資料庫

app = FastAPI(title="SafeTrack API")

# frontend path
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")

# static files
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.penguinthesnow.com",
        "https://penguinthesnow.com",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 建立資料表
# Base是declarative base; Base.metadata是所有模型的資料表資訊集合; _create_all()會根據models建立資料表
Base.metadata.create_all(bind=engine)

# routers
app.include_router(users.router)
app.include_router(inspections.router)

# frontend routes
@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(frontend_path, "index.html"))

@app.get("/index.html")
def serve_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))

# debug
print("AWS_REGION =", os.getenv("AWS_REGION"))
print("S3_BUCKET_NAME =", os.getenv("S3_BUCKET_NAME"))
print("HAS ACCESS KEY =", bool(os.getenv("AWS_ACCESS_KEY_ID")))

