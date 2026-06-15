from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.feedback import Feedback
from app.models.message import Message
from app.schemas.feedback_schema import FeedbackRequest, FeedbackResponse


router = APIRouter(prefix="/api", tags=["Feedback"])


@router.post("/feedback", response_model=FeedbackResponse)
def create_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    message = (
        db.query(Message)
        .filter(Message.id == request.message_id)
        .first()
    )

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    feedback = Feedback(
        message_id=request.message_id,
        rating=request.rating,
        comment=request.comment,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        message_id=feedback.message_id,
        rating=feedback.rating,
        comment=feedback.comment,
        status="saved",
    )
