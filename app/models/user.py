from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True,  nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, unique=True,  nullable=False)

    family = relationship("Family", back_populates="owner")