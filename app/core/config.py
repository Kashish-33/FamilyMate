import os
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = "uploads"



GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")