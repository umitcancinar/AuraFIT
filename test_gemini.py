import asyncio
import os
import sys

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))

from backend.services.gemini_service import get_chatbot_reply, generate_styling_and_roi_report

async def main():
    print("--- TESTING CHATBOT ---")
    try:
        chat_reply = await get_chatbot_reply("Merhaba, bana bir kombin önerisi yapar mısın?", "tr")
        print("Chatbot Reply:", chat_reply)
    except Exception as e:
        print("Chatbot Failed:", str(e))

    print("\n--- TESTING REPORT (NO IMAGES) ---")
    try:
        report = await generate_styling_and_roi_report(None, None, price=500.0, extra_note="Bana bunu güzelce yorumla.", lang="tr", reviews=[{"user": "Ali", "rating": 5, "comment": "Çok iyi"}])
        print("Report Generated Successfully!")
        import json
        print(json.dumps(report, indent=2, ensure_ascii=False))
    except Exception as e:
        print("Report Failed:", str(e))

asyncio.run(main())
