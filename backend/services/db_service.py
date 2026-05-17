import os
import logging
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import bcrypt
import jwt

# Setup logger
logger = logging.getLogger(__name__)

# Retrieve environmental configs
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./aurafit.db"
    connect_args = {"check_same_thread": False}
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {}

JWT_SECRET = os.getenv("JWT_SECRET", "aurafit-super-secret-key-hackathon")
JWT_ALGORITHM = "HS256"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------------------------------------------
# DATABASE MODELS
# ----------------------------------------------------

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tryons = relationship("TryOn", back_populates="user", cascade="all, delete-orphan")

class TryOn(Base):
    __tablename__ = "tryons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_image_url = Column(String, nullable=False)
    product_image_url = Column(String, nullable=False)
    result_image_url = Column(String, nullable=False)
    product_title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    styling_report = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="tryons")

# ----------------------------------------------------
# DATABASE UTILITIES
# ----------------------------------------------------

def init_db():
    """
    Initializes PostgreSQL tables automatically. Called at server startup.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables successfully verified/created in Neon PostgreSQL.")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")

def get_db():
    """
    Dependency generator for Database Sessions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------------------------------
# AUTHENTICATION HELPERS
# ----------------------------------------------------

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7) # Long-lived for hackathon convenience
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token if decoded_token["exp"] >= datetime.utcnow().timestamp() else None
    except Exception:
        return None
