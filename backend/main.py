import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.routers import users, inspections
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine
from fastapi.staticfiles import StaticFiles


print(engine.url) #查找資料庫

app = FastAPI(title="SafeTrack API")

frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")

app.mount("/static", StaticFiles(directory=frontend_path), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base是declarative base; Base.metadata是所有模型的資料表資訊集合; _create_all()會根據models建立資料表
Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(inspections.router)


# @app.get("/")
# def serve_frontend():
#     return FileResponse("frontend/index.html")
# 回傳 index.html
@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(frontend_path, "index.html"))

@app.get("/index.html")
def serve_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))



print("AWS_REGION =", os.getenv("AWS_REGION"))
print("S3_BUCKET_NAME =", os.getenv("S3_BUCKET_NAME"))
print("HAS ACCESS KEY =", bool(os.getenv("AWS_ACCESS_KEY_ID")))