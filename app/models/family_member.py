from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"))

    name = Column(String, nullable=False)
    relation = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    phone = Column(String)

    family = relationship("Family", back_populates="members")
    documents = relationship("Document", back_populates="member")