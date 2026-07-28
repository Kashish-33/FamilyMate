from fastapi import HTTPException

from app.utils.security import hash_password, verify_password

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from app.schemas.user import UserCreate
from app.schemas.user import UserLogin
from app.database import SessionLocal


from app.utils.jwt_handler import create_access_token
from app.utils.jwt_handler import verify_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def test():
    return {"message": "User Router Working"}


@router.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
    ):
        existing_user = db.query(User).filter(User.email == user.email).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            ) 
        
        new_user = User(
            name=user.name,
            email=user.email,
            password_hash=hash_password(user.password),
            phone=user.phone
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "message": "User created successfully",
            "user_id": new_user.id
        }

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == form_data.username).first()

    if not existing_user:
        raise HTTPException(
            status_code = 401,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, existing_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
              
        )


    access_token = create_access_token(
    data={"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    email = verify_access_token(token)

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone
    }