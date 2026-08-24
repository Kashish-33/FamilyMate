from datetime import datetime

from sqlalchemy import Column, String, Integer, ForeignKey, Date, DateTime, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=False)

    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)

    expiry_date = Column(Date, nullable=True)

    extracted_data = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("FamilyMember", back_populates="medicines")