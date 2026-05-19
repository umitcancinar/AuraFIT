import os
import sys
import shutil
import logging
import asyncio

# Setup workspace directories and sys.path for Vercel
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
from sqlalchemy.orm import Session
from typing import Optional

# Load environment variables
load_dotenv()

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="AI-Destekli Sanal Kabin ve Akıllı Alışveriş Asistanı",
    description="E-Ticaret & Finans Teknolojileri Hackathon Backend",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup workspace directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if os.environ.get("VERCEL"):
    UPLOADS_DIR = "/tmp/uploads"
    OUTPUTS_DIR = "/tmp/uploads/outputs"
    ASSETS_DIR = os.path.join(BASE_DIR, "assets")
else:
    UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
    OUTPUTS_DIR = os.path.join(BASE_DIR, "uploads", "outputs")
    ASSETS_DIR = os.path.join(BASE_DIR, "assets")

try:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    if not os.environ.get("VERCEL"):
        os.makedirs(ASSETS_DIR, exist_ok=True)
except Exception as e:
    print(f"Directory creation warning (safely ignored for Vercel): {str(e)}")

# Mount Static Files (only needed for local dev — Vercel serves frontend via @vercel/static)
if not os.environ.get("VERCEL"):
    try:
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR, check_dir=False), name="assets")
    except Exception as _mount_err:
        print(f"StaticFiles mount warning: {_mount_err}")

# Import Services — wrapped in try/except to guarantee module ALWAYS loads on Vercel
# If any heavy dependency (PIL, gradio_client, google.generativeai) fails,
# the app still serves auth/chat endpoints with graceful fallbacks.

try:
    from services.gemini_service import optimize_vton_prompt, generate_styling_and_roi_report, get_chatbot_reply
    logger.info("✅ gemini_service imported successfully")
except Exception as _import_err:
    logger.error(f"⚠️ gemini_service import failed: {_import_err}")
    async def optimize_vton_prompt(product_title, product_desc="", extra_note=None): return f"A fashion garment: {product_title}"
    async def generate_styling_and_roi_report(user_image_bytes, product_image_bytes, price, extra_note=None):
        return {"body_type": "Standart", "fit_analysis": {"score": 85, "title": "Uyumlu", "description": "Analiz servisi geçici olarak kullanılamıyor."}, "styling_suggestions": [], "color_harmony": "N/A", "financial_roi": {"price": price, "quality_rating": "N/A", "estimated_lifespan_wears": 50, "cost_per_wear_10": round(price/10,2), "cost_per_wear_30": round(price/30,2), "cost_per_wear_50": round(price/50,2), "roi_verdict": "Analiz servisi geçici olarak kullanılamıyor."}}
    async def get_chatbot_reply(user_message, lang="tr"):
        return "Merhaba! Şu anda yapay zeka servisine bağlanılamıyor. Lütfen biraz sonra tekrar deneyin." if lang == "tr" else "Hello! AI service is temporarily unavailable. Please try again shortly."

try:
    from services.vton_service import run_vton
    logger.info("✅ vton_service imported successfully")
except Exception as _import_err:
    logger.error(f"⚠️ vton_service import failed: {_import_err}")
    async def run_vton(*args, **kwargs): return (kwargs.get('user_image_path', ''), 'Motor Kullanılamıyor (Import Hatası)')

try:
    from services.scraper_service import scrape_product_link
    logger.info("✅ scraper_service imported successfully")
except Exception as _import_err:
    logger.error(f"⚠️ scraper_service import failed: {_import_err}")
    async def scrape_product_link(url: str):
        from services.scraper_service import DEFAULT_MOCK
        return DEFAULT_MOCK

from services.db_service import (
    get_db, init_db, hash_password, verify_password, 
    create_access_token, decode_access_token, User, TryOn
)

from fastapi.responses import JSONResponse, FileResponse

@app.get("/uploads/{file_path:path}")
async def serve_uploads(file_path: str):
    """
    Custom endpoint to serve uploads and pre-rendered assets.
    This guarantees 100% reliability on Vercel where StaticFiles mounting is restricted.
    """
    # 1. Try local/temp uploads directory (exact path)
    local_path = os.path.join(UPLOADS_DIR, file_path)
    if os.path.exists(local_path):
        return FileResponse(local_path)
        
    filename = os.path.basename(file_path)
    
    # 2. Check for VTON result templates in filename
    result_template_map = {
        "result_man_blue_hoodie": "result_man_blue_hoodie.jpg",
        "result_woman_red_sweater": "result_woman_red_sweater.jpg",
        "result_woman_green_dress": "result_woman_green_dress.jpg",
    }
    for key, asset_name in result_template_map.items():
        if key in filename:
            asset_file = os.path.join(ASSETS_DIR, asset_name)
            if os.path.exists(asset_file):
                logger.info(f"Serving pre-rendered VTON result template: {asset_name}")
                return FileResponse(asset_file)

    # 3. Check for quick model/garment templates in filename to handle Vercel's ephemeral /tmp storage
    template_map = {
        "model_man": "model_man.jpg",
        "model_woman": "model_woman.jpg",
        "garment_blue_hoodie": "garment_blue_hoodie.jpg",
        "garment_red_sweater": "garment_red_sweater.jpg",
        "garment_green_dress": "garment_green_dress.jpg",
        "garment_blue_jacket": "garment_blue_jacket.jpg",
    }
    for key, asset_name in template_map.items():
        if key in filename:
            asset_file = os.path.join(ASSETS_DIR, asset_name)
            if os.path.exists(asset_file):
                return FileResponse(asset_file)
        
    # 4. Try backend assets directory (for fallback templates)
    asset_path = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(asset_path):
        return FileResponse(asset_path)
        
    # 5. Try standard assets directory
    fallback_asset_path = os.path.join(BASE_DIR, "assets", filename)
    if os.path.exists(fallback_asset_path):
        return FileResponse(fallback_asset_path)
    
    logger.warning(f"File not found in any location: {file_path} (filename: {filename})")
    raise HTTPException(status_code=404, detail="File not found")

# Global Exception Handler to ensure 100% JSON error responses (prevents HTML crash pages on Vercel)
@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    logger.error(f"💥 Global Exception Caught: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Uygulama sunucu hatası: {str(exc)}"}
    )

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# ----------------------------------------------------
# PYDANTIC SCHEMAS
# ----------------------------------------------------

class LinkRequest(BaseModel):
    url: str
    price: float = 0.0

class ChatRequest(BaseModel):
    message: str
    lang: str = "tr"

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""

class UserLogin(BaseModel):
    username: str
    password: str

# Predefined high-quality products for url-parsing simulation
SIMULATED_PRODUCTS = [
    {
        "url_keywords": ["elbise", "dress", "h&m"],
        "title": "Zarif Yeşil Keten Yazlık Elbise",
        "description": "Premium kalite %100 keten, askılı, A-kesim, hafif ve nefes alabilen yapısıyla yaz ayları için ideal şık yeşil elbise.",
        "price": 1499.90,
        "image": "garment_green_dress.jpg"
    },
    {
        "url_keywords": ["hoodie", "sweatshirt", "mavi", "trendyol"],
        "title": "Mavi Premium Oversize Hoodie",
        "description": "%100 organik pamuklu, içi şardonlu, kalın ve tok duruşlu, unisex tasarım mavi kapüşonlu sweatshirt.",
        "price": 899.90,
        "image": "garment_blue_hoodie.jpg"
    },
    {
        "url_keywords": ["kazak", "sweater", "kirmizi", "lcw"],
        "title": "Kırmızı Örgü Balıkçı Yaka Kazak",
        "description": "Yumuşak dokulu triko örgü, boğazlı yaka, sıcak tutan dokusuyla sonbahar-kış sezonunun en tarz parçası.",
        "price": 749.90,
        "image": "garment_red_sweater.jpg"
    }
]

# ----------------------------------------------------
# AUTHENTICATION DEPENDENCY
# ----------------------------------------------------

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        return None
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            return None
        payload = decode_access_token(token)
        if not payload:
            return None
        username = payload.get("sub")
        if not username:
            return None
        user = db.query(User).filter(User.username == username).first()
        return user
    except Exception:
        return None

# ----------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "AI-Destekli Sanal Kabin Backend Servisi Aktif!",
        "engine": "FastAPI + Hugging Face IDM-VTON + Google Gemini 1.5/3 + PostgreSQL"
    }

@app.post("/api/register")
def register(req: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya e-posta adresi zaten kayıtlı.")
    
    # Create user
    new_user = User(
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate token
        token = create_access_token({"sub": new_user.username})
        return {
            "status": "success",
            "message": "Kayıt başarıyla tamamlandı.",
            "token": token,
            "user": {
                "username": new_user.username,
                "email": new_user.email,
                "full_name": new_user.full_name
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Kayıt işlemi başarısız: {str(e)}")

@app.post("/api/login")
def login(req: UserLogin, db: Session = Depends(get_db)):
    # Query user by username OR email (users may enter either)
    user = db.query(User).filter(
        (User.username == req.username) | (User.email == req.username)
    ).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Hatalı kullanıcı adı veya şifre.")
    
    # Generate token
    token = create_access_token({"sub": user.username})
    return {
        "status": "success",
        "message": "Giriş başarılı.",
        "token": token,
        "user": {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name
        }
    }

@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik oturum bilgisi.")
    return {
        "status": "success",
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name
        }
    }

@app.get("/api/debug/db")
def debug_db(db: Session = Depends(get_db)):
    """Returns the type of database connected (for debugging only)."""
    try:
        from services.db_service import DATABASE_URL, engine, use_sqlite_fallback, db_init_error
        # Count users to see if data exists
        user_count = db.query(User).count()
        return {
            "status": "success", 
            "configured_url_dialect": DATABASE_URL.split("://")[0],
            "actual_driver": engine.url.drivername,
            "is_sqlite_fallback": engine.url.drivername.startswith("sqlite"),
            "primary_error": db_init_error,
            "user_count": user_count,
            "message": "Connected successfully to the database."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik oturum bilgisi.")
    
    # Fetch user VTON history from Postgres DB
    history = db.query(TryOn).filter(TryOn.user_id == current_user.id).order_by(TryOn.created_at.desc()).all()
    
    return {
        "status": "success",
        "history": [
            {
                "id": r.id,
                "user_image_url": r.user_image_url,
                "product_image_url": r.product_image_url,
                "result_image_url": r.result_image_url,
                "product_title": r.product_title,
                "price": r.price,
                "styling_report": r.styling_report,
                "created_at": r.created_at.isoformat()
            } for r in history
        ]
    }

@app.delete("/api/history/{record_id}")
def delete_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik oturum bilgisi.")
        
    record = db.query(TryOn).filter(TryOn.id == record_id, TryOn.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı.")
        
    db.delete(record)
    db.commit()
    return {"status": "success", "message": "Kayıt başarıyla silindi."}

@app.delete("/api/history")
def delete_all_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik oturum bilgisi.")
        
    db.query(TryOn).filter(TryOn.user_id == current_user.id).delete()
    db.commit()
    return {"status": "success", "message": "Tüm geçmiş başarıyla silindi."}

@app.post("/api/try-on")
async def try_on(
    user_image: UploadFile = File(...),
    product_image: UploadFile = File(...),
    product_title: str = Form(...),
    product_desc: str = Form(""),
    price: float = Form(...),
    extra_note: Optional[str] = Form(None),
    rating: Optional[int] = Form(None),
    lang: str = Form("tr"),
    product_reviews: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Accepts user photo, product photo, title, description, and price.
    Processes VTON and Gemini report asynchronously.
    If authenticated, automatically persists the record in PostgreSQL Neon DB.
    """
    user_filename = f"user_{uuid.uuid4().hex[:8]}_{user_image.filename}"
    product_filename = f"product_{uuid.uuid4().hex[:8]}_{product_image.filename}"
    
    user_path = os.path.join(UPLOADS_DIR, user_filename)
    product_path = os.path.join(UPLOADS_DIR, product_filename)
    
    try:
        # Save uploads
        with open(user_path, "wb") as buffer:
            shutil.copyfileobj(user_image.file, buffer)
        with open(product_path, "wb") as buffer:
            shutil.copyfileobj(product_image.file, buffer)
            
        logger.info(f"Saved uploaded images: {user_filename}, {product_filename}")
        
        # 1. OPTIMIZE PROMPT VIA GEMINI
        logger.info("Step 1: Translating and optimizing prompt via Gemini...")
        optimized_prompt = await optimize_vton_prompt(product_title, product_desc, extra_note)
        
        # Read files for Gemini multi-modal processing
        with open(user_path, "rb") as f:
            user_bytes = f.read()
        with open(product_path, "rb") as f:
            product_bytes = f.read()
            
        # 2. RUN PARALLEL ASYNC OPERATIONS (VTON Generation & Gemini Report)
        logger.info("Step 2: Starting parallel AI operations (VTON Image & Gemini Analysis)...")
        
        vton_task = run_vton(
            user_image_path=user_path,
            product_image_path=product_path,
            prompt=optimized_prompt,
            user_filename=user_image.filename,
            product_filename=product_image.filename
        )
        
        reviews_list = None
        if product_reviews:
            try:
                reviews_list = json.loads(product_reviews)
            except Exception:
                pass

        report_task = generate_styling_and_roi_report(
            user_image_bytes=user_bytes,
            product_image_bytes=product_bytes,
            price=price,
            extra_note=extra_note,
            lang=lang,
            reviews=reviews_list
        )
        
        # Gather results
        vton_result, styling_report = await asyncio.gather(vton_task, report_task)
        
        # Unpack VTON result tuple (path, engine_name)
        if isinstance(vton_result, tuple):
            result_image_path, vton_engine = vton_result
        else:
            result_image_path = vton_result
            vton_engine = "Bilinmeyen Motor"
        
        # Override the quality_rating if the user explicitly provided a rating
        if rating and 1 <= rating <= 5:
            stars = "⭐" * rating
            quality_labels = {
                5: "Premium Kalite Pamuk/İpek Karışımı",
                4: "İyi Kalite Pamuk Karışımı",
                3: "Standart Kalite Polyester/Pamuk",
                2: "Düşük Kalite Sentetik Karışım",
                1: "Zayıf Kalite İnce Kumaş"
            }
            label = quality_labels.get(rating, "İyi Kalite")
            if not styling_report:
                styling_report = {}
            if "financial_roi" not in styling_report or not isinstance(styling_report["financial_roi"], dict):
                styling_report["financial_roi"] = {}
            styling_report["financial_roi"]["quality_rating"] = f"{stars} ({rating}/5 - {label})"
        
        # 3. CONVERT RESULT PATH TO ACCESSIBLE URL WITH UNIQUE FILENAME TO PREVENT CACHING
        result_relative_name = os.path.basename(result_image_path)
        unique_filename = f"vton_{uuid.uuid4().hex[:8]}_{result_relative_name}"
        target_path = os.path.join(OUTPUTS_DIR, unique_filename)
        
        try:
            if os.path.exists(result_image_path):
                shutil.copy(result_image_path, target_path)
                image_url = f"/uploads/outputs/{unique_filename}"
            else:
                # Fallback if source path is not directly accessible
                image_url = f"/uploads/outputs/{result_relative_name}"
        except Exception as copy_err:
            logger.error(f"Error copying unique VTON result: {str(copy_err)}")
            image_url = f"/uploads/outputs/{result_relative_name}"
            
        logger.info(f"VTON Result url: {image_url}")
        
        # 4. DATABASE PERSISTENCE FOR LOGGED IN USERS
        # Authenticate user from header
        current_user = None
        if authorization:
            try:
                scheme, token = authorization.split(" ")
                if scheme.lower() == "bearer":
                    payload = decode_access_token(token)
                    if payload:
                        username = payload.get("sub")
                        current_user = db.query(User).filter(User.username == username).first()
            except Exception as auth_err:
                logger.warning(f"Optional auth decoding failed: {str(auth_err)}")

        if current_user:
            logger.info(f"Persisting TryOn record for user '{current_user.username}' in PostgreSQL database...")
            # We can save relative URLs
            user_web_url = f"/uploads/{user_filename}"
            product_web_url = f"/uploads/{product_filename}"
            
            new_record = TryOn(
                user_id=current_user.id,
                user_image_url=user_web_url,
                product_image_url=product_web_url,
                result_image_url=image_url,
                product_title=product_title,
                price=price,
                styling_report=styling_report
            )
            try:
                db.add(new_record)
                db.commit()
                logger.info(f"✅ TryOn record saved under ID {new_record.id}")
            except Exception as db_save_err:
                db.rollback()
                logger.error(f"❌ Failed to persist VTON details in Postgres: {str(db_save_err)}")
        
        return {
            "status": "success",
            "image_url": image_url,
            "optimized_prompt": optimized_prompt,
            "styling_report": styling_report,
            "vton_engine": vton_engine
        }
        
    except Exception as e:
        logger.error(f"Error in try_on: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sanal kabin giydirme sırasında bir hata oluştu: {str(e)}")



@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Intelligent chatbot endpoint powered by Gemini tailor advisor.
    """
    try:
        reply = await get_chatbot_reply(req.message, req.lang)
        return {
            "status": "success",
            "response": reply
        }
    except Exception as e:
        logger.error(f"Error in chat_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-link")
async def parse_link(req: LinkRequest):
    """
    Intelligent product link scraper endpoint.
    Extracts high-resolution images, price, title, and description.
    """
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    try:
        data = await scrape_product_link(req.url)
        return {
            "status": "success",
            "title": data.get("title", ""),
            "price": data.get("price", 0.0),
            "description": data.get("description", ""),
            "images": data.get("images", []),
            "reviews": data.get("reviews", []),
            "source": data.get("source", "Scraper")
        }
    except Exception as e:
        logger.error(f"Error in parse_link: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Link çözümlenirken bir hata oluştu: {str(e)}")

