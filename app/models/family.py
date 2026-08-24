from sqlalchemy import Column, String, Integer, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship


class Family(Base):
    __tablename__ = "families"
    
    id = Column(Integer, primary_key=True, index=True)
    family_name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True)

    owner = relationship("User", back_populates="family")
    members = relationship("FamilyMember", back_populates="family")   