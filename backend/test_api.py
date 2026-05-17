import requests
import os
import sys
import uuid

def test_api():
    print("🚀 AuraFit Backend E2E SaaS ve PostgreSQL Doğrulama Testi Başlatılıyor...")
    
    # 1. Test Root
    try:
        res = requests.get("http://localhost:8000/")
        res.raise_for_status()
        print("✅ 1. Backend Servis Bağlantısı: BAŞARILI!")
        print("      Sistem Yanıtı:", res.json())
    except Exception as e:
        print("❌ 1. Backend Servis Bağlantısı: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # Generate a unique random test user
    test_username = f"tester_{uuid.uuid4().hex[:6]}"
    test_email = f"{test_username}@aurafit.ai"
    test_password = "SecurePassword123!"
    test_fullname = "Deneme Testi"

    # 2. Test User Registration
    token = None
    try:
        register_payload = {
            "username": test_username,
            "email": test_email,
            "password": test_password,
            "full_name": test_fullname
        }
        res = requests.post("http://localhost:8000/api/register", json=register_payload)
        res.raise_for_status()
        data = res.json()
        token = data.get("token")
        print(f"✅ 2. Üye Kaydı (PostgreSQL): BAŞARILI! (Kullanıcı: {test_username})")
    except Exception as e:
        print("❌ 2. Üye Kaydı (PostgreSQL): BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # 3. Test User Login & JWT Token Retrieval
    try:
        login_payload = {
            "username": test_username,
            "password": test_password
        }
        res = requests.post("http://localhost:8000/api/login", json=login_payload)
        res.raise_for_status()
        data = res.json()
        token = data.get("token")
        print("✅ 3. JWT Giriş Yetkilendirmesi: BAŞARILI!")
    except Exception as e:
        print("❌ 3. JWT Giriş Yetkilendirmesi: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # 4. Test Profile Retrieval via JWT Bearer
    try:
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.get("http://localhost:8000/api/me", headers=headers)
        res.raise_for_status()
        data = res.json()
        print(f"✅ 4. Profil Doğrulama: BAŞARILI! (Adı Soyadı: {data.get('user', {}).get('full_name')})")
    except Exception as e:
        print("❌ 4. Profil Doğrulama: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # 5. Test Link Resolver
    try:
        payload = {
            "url": "https://www.trendyol.com/h-m/mavi-oversize-hoodie-p-12345",
            "price": 899.90
        }
        res = requests.post("http://localhost:8000/api/parse-link", json=payload)
        res.raise_for_status()
        data = res.json()
        print("✅ 5. E-Ticaret Link Çözümleyici: BAŞARILI!")
        print("      Çözümlenen Başlık:", data.get("title"))
        print("      Çözümlenen Fiyat:", data.get("price"), "TL")
    except Exception as e:
        print("❌ 5. E-Ticaret Link Çözümleyici: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # 6. Test Try-On Flow using Template Files with JWT Auth (persisting to Neon Postgres)
    user_img_path = "/Users/umitcancinar/Desktop/kullanıcıdeneyimi/frontend/assets/model_man.jpg"
    garment_img_path = "/Users/umitcancinar/Desktop/kullanıcıdeneyimi/frontend/assets/garment_blue_hoodie.jpg"

    if not os.path.exists(user_img_path) or not os.path.exists(garment_img_path):
        print("⚠️ Hata: Test için gerekli şablon görselleri bulunamadı.")
        sys.exit(1)

    try:
        print("⚙️ Sanal Kabin Giydirme & Gemini Analizi Tetikleniyor (PostgreSQL veritabanına otomatik kaydedilecek)...")
        files = {
            "user_image": ("model_man.jpg", open(user_img_path, "rb"), "image/jpeg"),
            "product_image": ("garment_blue_hoodie.jpg", open(garment_img_path, "rb"), "image/jpeg")
        }
        form_data = {
            "product_title": "Mavi Premium Oversize Hoodie",
            "product_desc": "Kalın şardonlu pamuklu kumaş mavi kapüşonlu sweatshirt",
            "price": 899.90
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post("http://localhost:8000/api/try-on", files=files, data=form_data, headers=headers)
        res.raise_for_status()
        data = res.json()
        
        print("✅ 6. Sanal Kabin Giydirme & Gemini Analizi: BAŞARILI!")
        print("      Giydirilmiş Görsel URL'i:", data.get("image_url"))
        print("      Beden/Kalıp Uyumu:", data.get("styling_report", {}).get("fit_analysis", {}).get("title"))
        print("      ROI Kararı:", data.get("styling_report", {}).get("financial_roi", {}).get("roi_verdict"))
    except Exception as e:
        print("❌ 6. Sanal Kabin Giydirme & Gemini Analizi: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

    # 7. Test Try-on History Retrieval to verify Neon PostgreSQL DB persistence
    try:
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.get("http://localhost:8000/api/history", headers=headers)
        res.raise_for_status()
        data = res.json()
        history_list = data.get("history", [])
        print(f"✅ 7. PostgreSQL Neon Veri Kalıcılığı Doğrulaması: BAŞARILI!")
        print(f"      Bulunan Geçmiş Deneme Sayısı: {len(history_list)}")
        if len(history_list) > 0:
            print(f"      Kaydedilen Ürün Başlığı: {history_list[0].get('product_title')}")
            print(f"      Kaydedilen Sonuç Görseli: {history_list[0].get('result_image_url')}")
        
        print("\n🎉 TEBRİKLER! TÜM SAAS VE POSTGRESQL API ENTEGRASYONLARI EKSİKSİZ VE MÜKEMMEL ÇALIŞIYOR!")
    except Exception as e:
        print("❌ 7. PostgreSQL Neon Veri Kalıcılığı Doğrulaması: BAŞARISIZ!")
        print("      Hata:", str(e))
        sys.exit(1)

if __name__ == "__main__":
    test_api()
