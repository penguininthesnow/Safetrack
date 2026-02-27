from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.routers import users, inspections
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine

print(engine.url) #查找資料庫

app = FastAPI(title="SafeTrack API")

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

app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("frontend/index.html")
