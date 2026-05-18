import os
import logging
import hashlib
import secrets
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import jwt

# Setup logger
logger = logging.getLogger(__name__)

# Retrieve environmental configs
DATABASE_URL = os.getenv("DATABASE_URL")
use_sqlite_fallback = False

# Force SQLite only if no DATABASE_URL is provided
if not DATABASE_URL:
    use_sqlite_fallback = True
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
        
    if "postgresql" in DATABASE_URL and "sslmode" not in DATABASE_URL:
        if "?" in DATABASE_URL:
            DATABASE_URL += "&sslmode=require"
        else:
            DATABASE_URL += "?sslmode=require"

def get_engine_and_session(url):
    c_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    eng = create_engine(url, connect_args=c_args)
    sess = sessionmaker(autocommit=False, autoflush=False, bind=eng)
    return eng, sess

if use_sqlite_fallback:
    DATABASE_URL = "sqlite:////tmp/aurafit.db" if os.environ.get("VERCEL") else "sqlite:///./aurafit.db"

engine, SessionLocal = get_engine_and_session(DATABASE_URL)
Base = declarative_base()

JWT_SECRET = os.getenv("JWT_SECRET", "aurafit-super-secret-key-hackathon")
JWT_ALGORITHM = "HS256"

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
    Features robust automatic self-healing fallback to SQLite on write failures.
    """
    global engine, SessionLocal
    try:
        Base.metadata.create_all(bind=engine)
        logger.info(f"Base.metadata.create_all successful.")
    except Exception as e:
        logger.error(f"⚠️ Database initialization failed with primary URL: {str(e)}")
        # If it was a PostgreSQL database and failed, fall back to SQLite!
        if engine and not engine.url.drivername.startswith("sqlite"):
            logger.warning("🔄 Attempting automatic self-healing fallback to SQLite...")
            sqlite_url = "sqlite:////tmp/aurafit.db" if os.environ.get("VERCEL") else "sqlite:///./aurafit.db"
            try:
                engine, SessionLocal = get_engine_and_session(sqlite_url)
                Base.metadata.create_all(bind=engine)
                logger.info("✅ Self-healing completed: Database tables successfully created in SQLite fallback.")
            except Exception as ex:
                logger.error(f"❌ Critical: SQLite fallback also failed: {str(ex)}")

_db_initialized = False

def get_db():
    """
    Dependency generator for Database Sessions. Lazily initializes tables.
    """
    global _db_initialized
    if not _db_initialized:
        init_db()
        _db_initialized = True
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------------------------------
# AUTHENTICATION HELPERS
# ----------------------------------------------------

def hash_password(password: str) -> str:
    """
    Securely hashes a password using PBKDF2-SHA256 with a unique salt.
    Completely native to Python, zero binary dependencies.
    """
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000 # 100k iterations
    ).hex()
    return f"pbkdf2_sha256${100000}${salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a password against the stored PBKDF2-SHA256 hash.
    Supports a dynamic fallback for old bcrypt hashes.
    """
    try:
        if not hashed_password:
            return False
        
        # If it's a native PBKDF2 hash
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) != 4:
                return False
            iterations = int(parts[1])
            salt = parts[2]
            stored_hash = parts[3]
            
            computed_hash = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt.encode('utf-8'),
                iterations
            ).hex()
            return secrets.compare_digest(stored_hash, computed_hash)
            
        # Fallback for old bcrypt hashes, dynamically importing bcrypt to prevent boot crashes
        try:
            import bcrypt
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False
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
