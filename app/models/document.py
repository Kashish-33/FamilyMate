from datetime import datetime

from sqlalchemy import Column, String, Integer, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("family_members.id"))
    document_type = Column(String, nullable=False)
    custom_document_name = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    reminder_days_before = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("FamilyMember", back_populates="documents")