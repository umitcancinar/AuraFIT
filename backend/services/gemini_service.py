import os
import json
import logging
import io

# Safe imports — these may fail on Vercel serverless due to binary deps
try:
    import google.generativeai as genai
    from PIL import Image
    _GEMINI_AVAILABLE = True
except ImportError as _e:
    _GEMINI_AVAILABLE = False
    genai = None
    Image = None

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini API
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if _GEMINI_AVAILABLE and api_key:
    genai.configure(api_key=api_key)
    logger.info("Gemini API configured successfully.")
elif not _GEMINI_AVAILABLE:
    logger.warning("Gemini SDK not available (import failed). Fallback mode active.")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables!")

def get_model_name():
    # Attempt to use the latest Gemini 3 Flash model
    return "gemini-3-flash-preview"

async def _gemini_generate_with_retry(model, content, max_retries=2, base_wait=2):
    """
    Wrapper that retries Gemini API calls on 429 (quota exceeded) errors.
    Waits and retries up to max_retries times before raising.
    Fails fast if the daily quota is exhausted to prevent Vercel timeouts.
    """
    import asyncio
    for attempt in range(max_retries + 1):
        try:
            # Using async generation is crucial for Vercel Serverless performance (prevents blocking)
            response = await model.generate_content_async(content)
            return response
        except Exception as e:
            error_str = str(e)
            if "429" in error_str:
                # If it's a daily quota limit, failing fast is required to not hang Vercel
                if "GenerateRequestsPerDay" in error_str or "FreeTier" in error_str:
                    logger.error("Gemini DAILY quota exceeded. Failing fast.")
                    raise Exception("GEMINI_DAILY_QUOTA_EXCEEDED")
                    
                if attempt < max_retries:
                    wait_time = base_wait * (attempt + 1)
                    logger.warning(f"Gemini 429 rate limit hit (attempt {attempt+1}/{max_retries+1}). Waiting {wait_time}s before retry...")
                    await asyncio.sleep(wait_time)
                else:
                    raise
            else:
                raise

async def optimize_vton_prompt(product_title: str, product_desc: str = "", extra_note: str = None) -> str:
    """
    Translates product details and extra notes into an English technical VTON prompt.
    """
    try:
        model = genai.GenerativeModel(get_model_name())
        
        note_instruction = ""
        if extra_note:
            note_instruction = f"IMPORTANT USER NOTE: {extra_note}\nYou MUST incorporate this note into the physical description of how the item should be worn or applied."
            
        prompt = f"""
You are an expert fashion metadata optimizer. 
Translate the following product title and description into a highly precise, technical English VTON description. 
Focus only on describing the garment/item itself: its type, fabric, color, patterns, styling, and fit.
Do NOT describe human features or background.

Product Title: {product_title}
Product Description: {product_desc}

{note_instruction}

For example, "Red Oversized T-shirt" -> "A red oversized cotton t-shirt, plain solid design, short sleeves, high-quality fabric"

Return ONLY the plain text of the optimized English prompt. Do not include any quotes, markdown, or conversational filler.
"""
        response = await _gemini_generate_with_retry(model, prompt)
        optimized_prompt = response.text.strip()
        logger.info(f"Optimized prompt generated: {optimized_prompt}")
        return optimized_prompt
    except Exception as e:
        logger.error(f"Error in optimize_vton_prompt: {str(e)}")
        # Simple fallback
        return f"A high-quality fashion garment, {product_title}"

async def generate_styling_and_roi_report(user_image_bytes: bytes, product_image_bytes: bytes, price: float, extra_note: str = None, lang: str = "tr", reviews: list = None) -> dict:
    """
    Analyzes user body type, clothing fit, styling harmony, financial ROI, and customer review sentiment using Gemini.
    """
    try:
        model = genai.GenerativeModel(get_model_name())
        
        # Load images for Gemini using PIL
        user_img = Image.open(io.BytesIO(user_image_bytes))
        product_img = Image.open(io.BytesIO(product_image_bytes))
        note_instruction = f"User's Extra Context/Note: {extra_note}" if extra_note else ""
        
        # Add reviews input to the prompt
        reviews_instruction = ""
        if reviews:
            reviews_json = json.dumps(reviews, ensure_ascii=False)
            reviews_instruction = f"Here are the scraped customer reviews/comments for this product: {reviews_json}\nYou MUST analyze these reviews/comments and summarize the overall sentiment (e.g. positive highlights, quality complaints) and select the top highlights under the 'review_analysis' key."
        
        prompt_lang = "ENGLISH" if lang == "en" else "TURKISH"
        
        prompt = f"""
        Your task is to analyze the user's photo, the desired product photo, and optionally the customer reviews to generate a {prompt_lang} 'Fit, Styling, Reviews, and Financial ROI' report.
        
        Inputs:
        1. User Photo (to understand body type, style, skin tone)
        2. Product Photo (the item they want to try on or buy)
        3. Product Price: {price} USD/EUR (Treat as local currency)
        {note_instruction}
        {reviews_instruction}
        
        Please perform your analysis entirely in {prompt_lang} and output strictly using the JSON schema below. Do not add any introductory or concluding text, and do NOT wrap the output in markdown code blocks. Output raw, valid JSON only.
        
        JSON Schema:
        {{
          "body_type": "User's body type analysis (e.g., Athletic, Rectangle, Pear, Hourglass, etc.)",
          "fit_analysis": {{
            "score": 0 to 100 representing fit harmony (e.g., 85),
            "title": "Fit Degree (e.g., Perfect Fit, Relaxed Fit, Tailored Fit in the requested language)",
            "description": "Detailed analysis of how the garment/item fits the user's specific body type or features. Include specific sizing advice considering the User's Extra Context/Note if applicable."
          }},
          "styling_suggestions": [
            {{
              "item": "Complementary Item Name (e.g., Black Slim-Fit Jeans in the requested language)",
              "description": "Why this piece should be chosen, fabric and color harmony (in the requested language).",
              "category": "bottom"
            }},
            {{
              "item": "Footwear (e.g., Minimalist White Leather Sneakers in the requested language)",
              "description": "Shoe style to complete the look (in the requested language).",
              "category": "shoes"
            }},
            {{
              "item": "Accessory (e.g., Silver Metallic Watch in the requested language)",
              "description": "Accessory detail to add elegance (in the requested language).",
              "category": "accessory"
            }},
            {{
              "item": "Outerwear (e.g., Khaki Bomber Jacket in the requested language)",
              "description": "Complementary piece for colder weather (in the requested language).",
              "category": "outerwear"
            }}
          ],
          "color_harmony": "Harmony degree and stylistic impact of the product's color based on the user's skin tone, hair color, and vibe (in the requested language).",
          "financial_roi": {{
            "price": {price},
            "quality_rating": "Estimated fabric/build quality from the image (1 to 5 stars)",
            "estimated_lifespan_wears": Estimated times it can be worn before wearing out (number, e.g., 75),
            "cost_per_wear_10": Cost per wear if worn 10 times (price / 10),
            "cost_per_wear_30": Cost per wear if worn 30 times (price / 30),
            "cost_per_wear_50": Cost per wear if worn 50 times (price / 50),
            "roi_verdict": "Short advice on whether this is a logical financial wardrobe investment based on versatility and estimated longevity (in the requested language)."
          }},
          "review_analysis": {{
            "overall_sentiment": "Summary of customer reviews/comments sentiment and key feedback details (in the requested language). If no comments/reviews are provided, return exactly: 'Bu ürün için henüz gerçek müşteri yorumu bulunamadı.' for Turkish or 'No real customer reviews found for this product yet.' for English. Do NOT make up or simulate fake reviews.",
            "highlights": [
              {{
                "user": "Customer username from the provided reviews. If no reviews were provided, return an EMPTY array [] for highlights.",
                "rating": "1 to 5 representing their product rating",
                "comment": "Highlight or summary of their comment (in the requested language)"
              }}
            ]
          }}
        }}
        """
        
        # Prevent Gemini from crashing by filtering out None values
        content_parts = [prompt]
        if user_img:
            content_parts.append(user_img)
        if product_img:
            content_parts.append(product_img)
            
        # Execute Gemini multi-modal generation
        response = await _gemini_generate_with_retry(model, content_parts)
        response_text = response.text.strip()
        
        # Robustly extract JSON using regex in case Gemini adds markdown or conversational text
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            response_text = json_match.group(0)
        else:
            raise ValueError(f"No JSON block found in Gemini response: {response_text[:100]}")
        
        # Parse JSON to verify correctness
        report_data = json.loads(response_text)
        logger.info("Styling and ROI report generated successfully via Gemini.")
        return report_data
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in generate_styling_and_roi_report: {error_msg}")
        # Inject the exact error into the UI so we can see why it failed!
        return {
            "body_type": f"Hata/Error: {error_msg}",
            "fit_analysis": {
                "score": 0,
                "title": "Analiz Hatası",
                "description": f"Yapay zeka analizi çöktü: {error_msg}"
            },
            "styling_suggestions": [
                {
                    "item": "Sistem Hatası",
                    "description": "Lütfen tekrar deneyiniz.",
                    "category": "bottom"
                }
            ],
            "color_harmony": "Hata nedeniyle analiz edilemedi.",
            "financial_roi": {
                "price": price,
                "quality_rating": "N/A",
                "estimated_lifespan_wears": 0,
                "cost_per_wear_10": 0,
                "cost_per_wear_30": 0,
                "cost_per_wear_50": 0,
                "roi_verdict": "Hata"
            },
            "review_analysis": {
                "overall_sentiment": "",
                "highlights": []
            }
        }

async def get_chatbot_reply(user_message: str, lang: str = "tr") -> str:
    """
    Generates intelligent tailor/fashion styling advice from Gemini.
    """
    try:
        model = genai.GenerativeModel(get_model_name())
        system_instruction = """
You are "AuraFit Terzi Asistanı" (AuraFit Tailor Assistant), a warm, elite digital tailor, master fashion designer, and smart budget shopper assistant.
Your goal is to answer fashion questions, styling combination advice, fit size selections, and cost-per-wear budget logic.
Make your responses brief (maximum 2-3 sentences), highly friendly, elegant, and extremely helpful.
Respond strictly in the language requested (TR for Turkish, EN for English).
Do not output markdown code blocks. Just plain styling advice text.
"""
        prompt = f"{system_instruction}\nUser Message: {user_message}\nRequested Language: {lang.upper()}\nReply:"
        response = await _gemini_generate_with_retry(model, prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error in get_chatbot_reply: {str(e)}")
        if lang == "tr":
            return "Merhaba! Harika bir stil için buradayım. Sanal kabine kıyafet yükleyerek veya link girerek Gemini analiziyle giydirmeyi anında başlatabiliriz!"
        else:
            return "Hello! I am here to help you design a gorgeous look. Let's upload clothes or paste links to start visual try-on immediately!"

