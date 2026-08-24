from fastapi import APIRouter, Depends, HTTPException

from app.services.agent_service import chat_with_agent

from app.services.agent_tools import get_family_members, get_medicines, get_medicine_reminders, get_documents, get_notifications
from app.core.database import SessionLocal
from app.routers.user import get_current_user
from app.models.user import User
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat")
def chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent_response = chat_with_agent(
        chat_request.message,
        current_user.id,
        db
    )

    if isinstance(agent_response, dict):
        response = agent_response.get("message") or agent_response.get("response")
    else:
        response = agent_response

    if not isinstance(response, str):
        raise HTTPException(
            status_code=502,
            detail="The AI assistant returned an invalid response."
        )

    return {
        "response": response
    }


@router.get("/test-family-members")
def test_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_family_members(
        user_id=current_user.id,
        db=db
    )

@router.get("/test-medicines")
def test_medicines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_medicines(
        user_id=current_user.id,
        db=db
    )

@router.get("/test-medicine-reminders")
def test_medicine_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_medicine_reminders(
        user_id=current_user.id,
        db=db
    )
