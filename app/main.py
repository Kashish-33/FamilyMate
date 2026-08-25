from fastapi import FastAPI
import os

from app.routers.user import router as user_router
from app.routers.family import router as family_router
from app.routers.family_member import router as family_member_router
from app.routers.document import router as document_router
from app.routers.medicine import router as medicine_router
from app.routers.notification import router as notification_router
from app.routers.ai import router as ai_router

from app.core.database import Base, engine
from app.models.user import User
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.document import Document
from app.models.medicine import Medicine
from app.models.notification import Notification

from apscheduler.schedulers.background import BackgroundScheduler
from app.services.reminder_scheduler import check_all_reminders

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        FRONTEND_URL,
    ] if FRONTEND_URL else [
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

check_all_reminders()

scheduler.add_job(
    check_all_reminders,
    "interval",
    hours=24
)

scheduler.start()

app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)

app.include_router(
    family_router,
    prefix="/families",
    tags=["Families"]
)

app.include_router(
    family_member_router,
    prefix="/family-members",
    tags=["Family Members"]
)

app.include_router(
    document_router,
    prefix="/documents",
    tags=["Documents"]
)

app.include_router(
    medicine_router,
    prefix="/medicines",
    tags=["Medicines"]
)

app.include_router(
    notification_router,
    prefix="/notifications",
    tags=["Notifications"]
)

app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"]
)


@app.get("/")
def root():
    return {"message": " AI Family Copilot Backend Running"}