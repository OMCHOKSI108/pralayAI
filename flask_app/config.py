import os

class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET", "pralayai-flask-secret-change-me")

    
    API_BASE = os.getenv("PRALAY_API_URL", "http://127.0.0.1:8000")
