/* ----------------------------------------------------
   AURAFIT INTERACTIVE SAAS LOGIC
   ---------------------------------------------------- */

// API Configuration
const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1") 
    ? "http://localhost:8000" 
    : "";

// App State
let selectedUserTemplate = "model_man.jpg";
let selectedProductTemplate = "garment_blue_hoodie.jpg";
let selectedScrapedImageUrl = null;
let currentProductPrice = 0.0;

// SaaS State variables
let activeTheme = "dark"; // dark (default) or light
let activeLang = "tr"; // tr (default) or en
let authToken = localStorage.getItem("token") || null;
let currentUser = null;

// Multi-lingual Translation Dictionary
const translations = {
    tr: {
        "app-title": "AuraFit - Yapay Zeka Destekli Sanal Kabin ve Akıllı Alışveriş Asistanı",
        "welcome-prefix": "Merhaba,",
        "btn-login-reg": "Giriş / Üye Ol",
        "btn-my-history": "Kabin Geçmişim",
        "inputs-title": "Giriş Yapılandırması",
        "inputs-subtitle": "Kendi fotoğrafınızı ekleyin ve denemek istediğiniz ürünü seçin.",
        "results-title": "Sanal Deneme & Rapor",
        "results-subtitle": "Yapay zeka giydirme sonuçlarını, stilist tavsiyelerini ve finansal raporları inceleyin.",
        "step1-label": "Fotoğrafınızı Seçin",
        "quick-models": "Hızlı Şablon Mankenler:",
        "model-man": "Erkek Manken",
        "model-woman": "Kadın Manken",
        "upload-user-title": "Kendi Fotoğrafınızı Yükleyin",
        "upload-user-desc": "Sürükleyip bırakın veya göz atın (PNG, JPG)",
        "step2-label": "Kıyafet Detayları",
        "tab-link-title": "E-Ticaret Linki",
        "tab-manual-title": "Manuel Yükle",
        "placeholder-link-input": "Trendyol, H&M, Zara, Amazon linkini yapıştırın...",
        "btn-parse-link": "Çözümle",
        "carousel-select-prompt": "Görseller çözümlendi! Denemek istediğinizi seçin:",
        "tab-link": "Link ile Çözümle",
        "tab-file": "Görsel Yükle",
        "placeholder-url": "Trendyol, H&M, Amazon vb. ürün linki yapıştırın...",
        "placeholder-price-opt": "Fiyat (İsteğe Bağlı)",
        "btn-parse": "Çözümle & Getir",
        "placeholder-title": "Kıyafet Başlığı (örn: Oversize Mavi Sweatshirt)",
        "placeholder-price": "Fiyat (TL)",
        "placeholder-desc": "Kumaş, kesim vb. detaylar (isteğe bağlı)",
        "upload-product-title": "Kıyafet Görseli Yükleyin",
        "upload-product-desc": "Beyaz arka planlı kıyafet görselleri önerilir",
        "quick-garments": "Hızlı Deneme Kıyafetleri:",
        "rating-select-label": "Kumaş Kalitesi / Ürün Puanı:",
        "garment-blue-hoodie": "Mavi Hoodie",
        "garment-red-sweater": "Kırmızı Kazak",
        "garment-green-dress": "Yeşil Elbise",
        "btn-submit-tryon": "SANAL KABİNİ BAŞLAT",
        "promo-badge": "Yapay Zeka Destekli Geleceğin E-Ticareti",
        "hero-main-title": "Geleceğin Akıllı E-Ticaret Kabini AuraFit ile Tanışın",
        "promo-subtitle": "Beğendiğiniz ürünlerin üzerinizde nasıl duracağını anında görün, yapay zeka destekli akıllı kombin tavsiyeleri alın ve interaktif Cost-Per-Wear (Giyim Başına Maliyet) analiziyle gardırop bütçenizi en verimli şekilde planlayın. Geleceğin akıllı e-ticaret deneyimini AuraFit ile keşfedin!",
        "btn-start": "Sanal Kabini Keşfet",
        "btn-explore": "Sistemi İncele",
        "demo-title": "Önizleme Kabini",
        "demo-desc": "AuraFit'in sanal olarak birleştirdiği manken ve kıyafet sonucuna canlı olarak göz atın.",
        "features-title": "Neler Yapıyoruz?",
        "promo-w-title": "Yapay Zeka Giydirme",
        "feat-vton-desc": "Kopyaladığınız herhangi bir e-ticaret linkini veya kendi yüklediğiniz kıyafeti bulut GPU sunucularımızda mankenin üzerinde kusursuz birleştirir.",
        "rep-fin-title-h": "Akıllı Finansal ROI",
        "feat-roi-desc": "Cost-per-Wear (Giyim Başı Maliyet) simülatörümüz sayesinde kıyafetin gardırobunuzda kendini kaç giyimde amorti edeceğini raporlar.",
        "rep-sty-t": "Gemini Stil Danışmanı",
        "feat-gemini-desc": "Model ve kıyafet arasındaki renk kontrastını, vücut tipini ve beden kalıplarını analiz ederek size tamamlayıcı parça önerileri sunar.",
        "coming-soon-badge-txt": "ÇOK YAKINDA",
        "upcoming-features-title": "Gelecek Akıllı Özellikler",
        "upcoming-feat-1": "Otomatik Ürün Görseli Alma (Linkten)",
        "upcoming-feat-2": "Yorum, Fiyat ve Özellik Analizi",
        "upcoming-feat-3": "En Uygun Bütçeli Alternatifi Bulma",
        "upcoming-feat-4": "Kombin Önerilerinde Satın Alma Linkleri",
        "upcoming-widget-title": "YOL HARİTASI & GELİŞTİRİLMEKTE OLANLAR 🚀",
        "promo-h-title": "Nasıl Çalışır?",
        "step1-title": "Fotoğraf Yükle",
        "step2-title": "Kıyafet Tanımla",
        "step3-title": "Raporları Çözümle",
        "step3-label": "Ekstra Notlar & Stil Tercihleri",
        "placeholder-extra-notes": "Örn: 'Bu bir güneş gözlüğü, yüzüme uygulayın.' veya 'Bu ayakkabıyı boydan mankene giydir.' veya 'Üzerine tam otursun.'",
        "helper-styling-notes": "Gemini Yapay Zekası bu notu size özel stil ve ROI önerileri sunmak için kullanacaktır.",
        "promo-s1": "İster hızlı şablon mankenlerden birini seçin, isterseniz kendi boydan fotoğrafınızı sisteme yükleyin.",
        "promo-s2": "Beğendiğiniz kıyafetin görselini hızlıca yükleyin veya stüdyodaki hazır şablon kıyafetlerden birini anında seçin.",
        "promo-s3": "Sanal Kabin motorunu çalıştırıp giydirme sonucunu slider ile kaydırın ve interaktif ROI hesaplayıcıyı deneyin.",
        "cta-title": "AuraFit ile Akıllı E-Ticaret Çağını Hemen Başlatın",
        "cta-desc": "Ücretsiz kayıt olun, sanal dolabınızı doldurun ve verilerinizi Neon veritabanınızda kalıcı saklayın.",
        "btn-login-now": "Hemen Giriş Yap / Üye Ol",
        "empty-title": "Sanal Kabin Hazır",
        "empty-desc": "Manken seçimi yapın veya kendi fotoğrafınızı yükleyin. Ardından kıyafeti belirleyip \"Sanal Kabini Başlat\" butonuna tıklayarak sihirli yapay zeka deneyimini yaşayın.",
        "load-title": "AuraFit Analiz Ediyor...",
        "load-subtitle": "Yapay zeka modellerimiz verilerinizi işliyor.",
        "step1-t": "Gemini Prompt Optimizasyonu",
        "step2-t": "Virtual Try-On Giydirme",
        "step3-t": "Finansal ROI & Stil Analizi",
        "status-opt": "Analiz ediliyor...",
        "status-wait": "Sırada...",
        "label-orig": "Orijinal",
        "label-tryon": "AuraFit Kabin",
        "rep-fit-title-h": "Kalıp & Beden Uyumu",
        "rep-fit-score-lbl": "Uyum Puanı",
        "rep-color-h": "Renk Uyum Analizi",
        "rep-fin-title-h": "Akıllı Finansal ROI Analizi",
        "rep-fin-sub": "Giyim Başına Maliyet (Cost-per-Wear) Yatırım Getirisi",
        "fin-price": "Ürün Fiyatı",
        "fin-quality": "Kumaş Kalitesi",
        "fin-sim-t": "İnteraktif Giyim Simülasyonu",
        "fin-sim-desc": "Bu kıyafeti yılda kaç kez giymeyi planlıyorsunuz? Sürükleyin ve maliyet değişimini görün!",
        "slider-tick-1": "1 Giyme",
        "slider-tick-30": "30 Giyme",
        "slider-tick-100": "100 Giyme",
        "out-cpw": "Giyim Başına Maliyet (CPW)",
        "out-amort": "Tahmini Amorti Süresi",
        "rep-sty-t": "Akıllı Stilist Kombin Önerisi",
        "rep-sty-sub": "Gemini AI tarafından tasarlanmış tamamlayıcı parçalar",
        "btn-new-try": "Yeni Kabin Deneyimi Başlat",
        "m-login": "Giriş Yap",
        "m-register": "Kayıt Ol",
        "login-t": "AuraFit'e Giriş Yapın",
        "login-sub": "Yapay zeka asistanınıza erişmek için bilgilerinizi girin.",
        "m-p-user": "Kullanıcı Adı",
        "m-p-pass": "Şifre",
        "m-p-email": "E-Posta Adresi",
        "m-p-fullname": "Adınız Soyadınız",
        "btn-login-action": "GİRİŞ YAP",
        "reg-t": "Hesap Oluşturun",
        "reg-sub": "Akıllı kabin ve bütçe ROI analizlerini kullanmaya başlayın.",
        "btn-register-action": "KAYIT OL VE GİRİŞ YAP",
        "hist-header": "Kişisel Sanal Kabin Arşiviniz",
        "hist-sub": "PostgreSQL Neon DB'de güvenle saklanan önceki denemeleriniz.",
        "chat_title": "Terzi AI Asistanı",
        "chat_status": "Çevrimiçi | Stil & Kalıp Uzmanı",
        "chat_placeholder": "Kombin, beden veya stil sorusu sorun...",
        "chat_greet_1": "Merhaba! Ben AuraFit dijital terzi asistanınız. 🧵",
        "chat_greet_2": "Vücut yapınıza uygun beden kalıpları, renk kombinleri veya kıyafetlerin Cost-per-Wear yatırım getirisini bana sorabilirsiniz. Nasıl yardımcı olabilirim?",
        "chat_default_resp": "Harika bir kombin için buradayım! Sanal dolabınızdaki parçaları zenginleştirecek moda tüyoları isteyebilirsiniz.",
        "chat_error": "Bağlantı kurulurken bir sorun oluştu. Lütfen tekrar deneyin.",
        "btn-developer-contact": "Geliştirici İletişim",
        "chat_bubble_hello": "Merhaba, ben asistanın Terzican! Sana yardımcı olabilirim. 🧵",
        "btn-clear-all": "Tümünü Temizle",
        "footer-text": "© 2026 AuraFit. Yapay zeka destekli yeni nesil sanal kabin ve akıllı e-ticaret platformu. Tüm hakları saklıdır."
    },
    en: {
        "app-title": "AuraFit - AI-Powered Virtual Try-On & E-Commerce FinTech",
        "welcome-prefix": "Welcome,",
        "btn-login-reg": "Sign In / Register",
        "btn-my-history": "My Try-On History",
        "inputs-title": "Configuration Setup",
        "inputs-subtitle": "Provide your portrait and select the apparel you want to fit.",
        "results-title": "AI Try-On & Analytics",
        "results-subtitle": "Explore virtual fitting room, AI styling suggestions, and CPW financial reports.",
        "step1-label": "Select Your Photo",
        "quick-models": "Quick Model Templates:",
        "model-man": "Male Model",
        "model-woman": "Female Model",
        "upload-user-title": "Upload Your Own Photo",
        "upload-user-desc": "Drag and drop or browse (PNG, JPG)",
        "step2-label": "Garment Details",
        "tab-link-title": "E-Commerce Link",
        "tab-manual-title": "Manual Upload",
        "placeholder-link-input": "Paste Trendyol, H&M, Zara, Amazon link...",
        "btn-parse-link": "Analyze",
        "carousel-select-prompt": "Images parsed! Choose which one to try on:",
        "tab-link": "Parse URL Link",
        "tab-file": "Upload Image",
        "placeholder-url": "Paste Trendyol, H&M, Amazon product link...",
        "placeholder-price-opt": "Price (Optional)",
        "btn-parse": "Parse & Load",
        "placeholder-title": "Garment Title (e.g. Oversize Blue Hoodie)",
        "placeholder-price": "Price (TL)",
        "placeholder-desc": "Fabric weave, fit notes etc. (optional)",
        "upload-product-title": "Upload Garment Image",
        "upload-product-desc": "Pure white background clothes recommended",
        "quick-garments": "Quick Trial Clothes:",
        "rating-select-label": "Fabric Quality / Product Score:",
        "garment-blue-hoodie": "Blue Hoodie",
        "garment-red-sweater": "Red Sweater",
        "garment-green-dress": "Green Dress",
        "btn-submit-tryon": "START VIRTUAL TRY-ON",
        "promo-badge": "AI-Powered Future of E-Commerce",
        "hero-main-title": "Future of E-Commerce: Meet AuraFit Smart Virtual Closet",
        "promo-subtitle": "Instantly visualize how your favorite clothes look on you, receive AI-powered personalization styling advice, and optimize your wardrobe budget with interactive Cost-Per-Wear (CPW) financial ROI analytics. Step into the future of intelligent shopping with AuraFit!",
        "btn-start": "Explore Virtual Closet",
        "btn-explore": "Explore System",
        "demo-title": "Preview Cabin",
        "demo-desc": "Observe live the VTON preview of original model combined with parsed garments.",
        "features-title": "What We Do?",
        "promo-w-title": "AI Virtual Fitting Room",
        "feat-vton-desc": "Parse any e-commerce link or upload clothes manually to fit seamlessly on models via cloud GPUs.",
        "rep-fin-title-h": "Smart Financial ROI",
        "feat-roi-desc": "Our interactive Cost-per-Wear simulation forecasts exactly how many times you will wear it before amortizing.",
        "rep-sty-t": "Gemini Stylist Expert",
        "feat-gemini-desc": "Analyzes color contrasts, size fit, and body shapes to provide complementary outfit suggestions.",
        "coming-soon-badge-txt": "COMING SOON",
        "upcoming-features-title": "Upcoming Smart Features",
        "upcoming-feat-1": "Auto Product Image Extraction (from Link)",
        "upcoming-feat-2": "Sentiment, Price & Feature Analysis",
        "upcoming-feat-3": "Find the Best Budget Price",
        "upcoming-feat-4": "Direct Purchase Links in Outfit Matchings",
        "upcoming-widget-title": "ROADMAP & UNDER DEVELOPMENT FEATURES 🚀",
        "promo-h-title": "How It Works?",
        "step1-title": "Upload Photo",
        "step2-title": "Define Clothes",
        "step3-title": "Analyze Reports",
        "step3-label": "Extra Context & Styling Notes",
        "placeholder-extra-notes": "E.g. 'These are sunglasses, please apply them to my face.' or 'I want to try these shoes, use full-body application.' or 'Make it fit tighter.'",
        "helper-styling-notes": "Gemini AI will use this note to give tailored style and ROI advice.",
        "promo-s1": "Choose one of our premium models or upload your own boy portrait.",
        "promo-s2": "Quickly upload an image of the garment you like or instantly select one of the ready-made template garments in the studio.",
        "promo-s3": "Run Sanal Kabin to slide the results side-by-side and calculate dynamic bütçe.",
        "cta-title": "Launch the Smart E-Commerce Age Immediately with AuraFit",
        "cta-desc": "Register for free, build your private virtual wardrobe and sync history permanently to Neon DB.",
        "btn-login-now": "Sign In / Register Now",
        "empty-title": "Kabin Ready",
        "empty-desc": "Select a model or upload your photo. Then select the clothes and click 'Start Virtual Try-on' to experience the AI magic.",
        "load-title": "AuraFit Processing...",
        "load-subtitle": "Our advanced AI engines are rendering your trial.",
        "step1-t": "Gemini Prompt Optimization",
        "step2-t": "Virtual Try-On Fitting",
        "step3-t": "Financial ROI & Styling Report",
        "status-opt": "Optimizing details...",
        "status-wait": "In queue...",
        "label-orig": "Original",
        "label-tryon": "AuraFit Kabin",
        "rep-fit-title-h": "Harmonious Fit & Size",
        "rep-fit-score-lbl": "Fit Score",
        "rep-color-h": "Color Harmony Analysis",
        "rep-fin-title-h": "Smart Financial ROI Report",
        "rep-fin-sub": "Cost-per-Wear (CPW) Investment Return Output",
        "fin-price": "Product Price",
        "fin-quality": "Fabric Quality",
        "fin-sim-t": "Interactive Wear Simulation",
        "fin-sim-desc": "How many times a year will you wear this? Drag to recalculate the exact cost!",
        "slider-tick-1": "1 Wear",
        "slider-tick-30": "30 Wears",
        "slider-tick-100": "100 Wears",
        "out-cpw": "Cost-per-Wear (CPW)",
        "out-amort": "Estimated Payback Rate",
        "rep-sty-t": "Complementary Stylist Suggestions",
        "rep-sty-sub": "Dynamic look matching generated by Gemini AI",
        "btn-new-try": "Start New Kabin Experience",
        "m-login": "Sign In",
        "m-register": "Register",
        "login-t": "Sign In to AuraFit",
        "login-sub": "Enter credentials to access your smart fitting closets.",
        "m-p-user": "Username",
        "m-p-pass": "Password",
        "m-p-email": "E-Mail Address",
        "m-p-fullname": "Your Full Name",
        "btn-login-action": "SIGN IN",
        "reg-t": "Create Account",
        "reg-sub": "Start trying clothes on yourself and auditing financial returns.",
        "btn-register-action": "REGISTER & SIGN IN",
        "hist-header": "Your Personal Kabin Archives",
        "hist-sub": "Previous trials safely synced to our Neon PostgreSQL database.",
        "chat_title": "Tailor AI Assistant",
        "chat_status": "Online | Fit & Styling Expert",
        "chat_placeholder": "Ask about styling, fit or size...",
        "chat_greet_1": "Hello! I am your AuraFit digital tailor assistant. 🧵",
        "chat_greet_2": "You can ask me about matching sizes for your body, color coordinates, or cost-per-wear budget logic. How can I dress you today?",
        "chat_default_resp": "I'm here to help you style a perfect look! Ask me for any fashion advice or smart wardrobe tips.",
        "chat_error": "Connection issues occurred. Please try again.",
        "btn-developer-contact": "Contact Developer",
        "chat_bubble_hello": "Hello, I'm Terzican, your digital tailor! How can I help you? 🧵",
        "btn-clear-all": "Clear All",
        "footer-text": "© 2026 AuraFit. Next-generation generative AI fashion cabin & e-commerce styling platform. All rights reserved."
    }
};

// Bind translation state globally to the window object for chatbot accessibility
window.activeLang = activeLang;
window.translations = translations;

// DOM Elements
const userTemplates = document.querySelectorAll("#user-templates .template-card");
const productTemplates = document.querySelectorAll("#product-templates .template-card");
const userUploadArea = document.getElementById("user-upload-area");
const productUploadArea = document.getElementById("product-upload-area");
const userImageInput = document.getElementById("user-image-input");
const productImageInput = document.getElementById("product-image-input");
const userUploadPreview = document.getElementById("user-upload-preview");
const productUploadPreview = document.getElementById("product-upload-preview");
const btnRemoveUserImg = document.getElementById("btn-remove-user-img");
const btnRemoveProductImg = document.getElementById("btn-remove-product-img");

// Manual Input Elements
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const productDesc = document.getElementById("product-desc");
const productExtraNotes = document.getElementById("product-extra-notes");

// Core State Panels
const stateEmpty = document.getElementById("state-empty");
const stateLoading = document.getElementById("state-loading");
const stateSuccess = document.getElementById("state-success");
const btnSubmitTryon = document.getElementById("btn-submit-tryon");
const btnResetTryon = document.getElementById("btn-reset-tryon");

// Report Elements
const imgCompareBefore = document.getElementById("img-compare-before");
const imgCompareAfter = document.getElementById("img-compare-after");
const repBodyType = document.getElementById("rep-body-type");
const repFitScore = document.getElementById("rep-fit-score");
const repFitTitle = document.getElementById("rep-fit-title");
const repFitDesc = document.getElementById("rep-fit-desc");
const repColorHarmony = document.getElementById("rep-color-harmony");
const repPrice = document.getElementById("rep-price");
const repQuality = document.getElementById("rep-quality");
const repRoiVerdict = document.getElementById("rep-roi-verdict");
const repStylistList = document.getElementById("rep-stylist-list");

// CPW Dynamic Calculator Elements
const cpwSlider = document.getElementById("cpw-slider");
const cpwDynamicVal = document.getElementById("cpw-dynamic-val");
const cpwAmortization = document.getElementById("cpw-amortization");

// Dynamic Decoupled Views DOM
const viewLanding = document.getElementById("view-landing");
const viewDashboard = document.getElementById("view-dashboard");

// Auth Controls DOM
const btnShowHistory = document.getElementById("btn-show-history");
const btnLogout = document.getElementById("btn-logout");
const userWelcomeArea = document.getElementById("user-welcome-area");
const userDisplayName = document.getElementById("user-display-name");

// Auth Modal DOM
const authModal = document.getElementById("auth-modal");
const btnCloseAuth = document.getElementById("btn-close-auth");
const modalTabLogin = document.getElementById("modal-tab-login");
const modalTabRegister = document.getElementById("modal-tab-register");
const modalViewLogin = document.getElementById("modal-view-login");
const modalViewRegister = document.getElementById("modal-view-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

// History Modal DOM
const historyModal = document.getElementById("history-modal");
const btnCloseHistory = document.getElementById("btn-close-history");
const historyItemsGrid = document.getElementById("history-items-grid");

// Jury Modal DOM
const juryModal = document.getElementById("jury-modal");
const btnCloseJury = document.getElementById("btn-close-jury");
const btnAgreeJury = document.getElementById("btn-agree-jury");

// Language and Theme Selectors
const btnThemeToggles = document.querySelectorAll(".btn-theme-toggle");
const btnLangToggles = document.querySelectorAll(".btn-lang-toggle");

/* ----------------------------------------------------
   1. GLOBAL SYSTEM SETUP (THEME & LANG & AUTO-LOGIN)
   ---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Load Saved Theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    setSystemTheme(savedTheme);
    
    // Load Saved Language
    const savedLang = localStorage.getItem("lang") || "tr";
    setSystemLanguage(savedLang);

    // Initial Login Verification
    verifySavedSession();

    // Init Public Landing Compare slider
    initCompareSlider("landing-compare-slider", "landing-after-wrapper", "landing-slider-bar");
});

function setSystemTheme(theme) {
    activeTheme = theme;
    if (theme === "light") {
        document.body.classList.add("light-theme");
        btnThemeToggles.forEach(btn => btn.innerHTML = `<i class="fa-solid fa-sun"></i>`);
    } else {
        document.body.classList.remove("light-theme");
        btnThemeToggles.forEach(btn => btn.innerHTML = `<i class="fa-solid fa-moon"></i>`);
    }
    localStorage.setItem("theme", theme);
}

function setSystemLanguage(lang) {
    activeLang = lang;
    window.activeLang = lang;
    btnLangToggles.forEach(btn => {
        btn.innerHTML = lang === "tr" 
            ? `<span style="font-size:1.1rem; margin-right:4px;">🇹🇷</span> TR` 
            : `<span style="font-size:1.1rem; margin-right:4px;">🇺🇸</span> EN`;
    });
    localStorage.setItem("lang", lang);
    
    // Perform 100% data-i18n Translation on DOM
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Translate Inputs Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Dispatch custom event to notify components like chatbot
    window.dispatchEvent(new CustomEvent("langChanged", { detail: lang }));
}

// Bind Theme Switchers
btnThemeToggles.forEach(btn => {
    btn.addEventListener("click", () => {
        setSystemTheme(activeTheme === "dark" ? "light" : "dark");
    });
});

// Bind Lang Switchers
btnLangToggles.forEach(btn => {
    btn.addEventListener("click", () => {
        setSystemLanguage(activeLang === "tr" ? "en" : "tr");
        if (currentProductPrice > 0) {
            updateDynamicCPW(parseInt(cpwSlider.value));
        }
    });
});

/* ----------------------------------------------------
   2. DECOUPLED VIEWS CONTROLS (GUEST LANDING vs AUTH DASHBOARD)
   ---------------------------------------------------- */
async function verifySavedSession() {
    if (!authToken) {
        setGuestUIState();
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/me`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error("Session expired.");
        
        const data = await res.json();
        if (data.status === "success") {
            currentUser = data.user;
            setAuthenticatedUIState(data.user.full_name || data.user.username);
        }
    } catch (err) {
        console.warn("Auto-login failed, restoring guest view:", err.message);
        logoutUser();
    }
}

function setGuestUIState() {
    // Show Landing Wrapper, Hide Cabinet Dashboard
    viewLanding.classList.remove("hidden");
    viewDashboard.classList.add("hidden");
    
    // Re-init landing compare slider to keep it alive
    initCompareSlider("landing-compare-slider", "landing-after-wrapper", "landing-slider-bar");
}

function setAuthenticatedUIState(name) {
    // Hide Landing Wrapper, Show Cabinet Dashboard
    viewLanding.classList.add("hidden");
    viewDashboard.classList.remove("hidden");
    
    // Set user headers
    userDisplayName.innerText = name;
    
    // Set Dashboard split results state to empty initially if not working
    if (stateSuccess.classList.contains("hidden") && stateLoading.classList.contains("hidden")) {
        stateEmpty.classList.remove("hidden");
    }

    // Show Jury Warning Pop-up with a premium smooth delay (once per session)
    if (juryModal && !sessionStorage.getItem("juryAlertShown")) {
        setTimeout(() => {
            juryModal.classList.remove("hidden");
        }, 800);
    }
}

// Log Out Execution
function logoutUser() {
    localStorage.removeItem("token");
    authToken = null;
    currentUser = null;
    
    // Reset inputs safely with null-checks to prevent ReferenceErrors
    if (productTitle) productTitle.value = "";
    if (productPrice) productPrice.value = "";
    if (productDesc) productDesc.value = "";
    if (productExtraNotes) productExtraNotes.value = "";
    
    // Restore states
    if (stateSuccess) stateSuccess.classList.add("hidden");
    if (stateLoading) stateLoading.classList.add("hidden");
    if (stateEmpty) stateEmpty.classList.add("hidden");
    
    setGuestUIState();
}

btnLogout.addEventListener("click", logoutUser);

/* ----------------------------------------------------
   3. AUTHENTICATION POPUP MODAL CONTROL
   ---------------------------------------------------- */
document.querySelectorAll(".btn-show-auth-modal").forEach(btn => {
    btn.addEventListener("click", () => {
        authModal.classList.remove("hidden");
        modalTabLogin.click(); // Default to login view
    });
});

btnCloseAuth.addEventListener("click", () => {
    authModal.classList.add("hidden");
});

authModal.addEventListener("click", (e) => {
    if (e.target === authModal) authModal.classList.add("hidden");
});

// Jury Alert Pop-up Modal Control
if (btnCloseJury && btnAgreeJury && juryModal) {
    const closeJuryAlert = () => {
        juryModal.classList.add("hidden");
        sessionStorage.setItem("juryAlertShown", "true");
    };
    
    btnCloseJury.addEventListener("click", closeJuryAlert);
    btnAgreeJury.addEventListener("click", closeJuryAlert);
    juryModal.addEventListener("click", (e) => {
        // Close if click is on the overlay backdrop (empty space)
        if (e.target === juryModal) {
            closeJuryAlert();
        }
    });
}

// Toggle Auth Tabs
modalTabLogin.addEventListener("click", () => {
    modalTabLogin.classList.add("active");
    modalTabRegister.classList.remove("active");
    modalViewLogin.classList.remove("hidden");
    modalViewRegister.classList.add("hidden");
});

modalTabRegister.addEventListener("click", () => {
    modalTabRegister.classList.add("active");
    modalTabLogin.classList.remove("active");
    modalViewRegister.classList.remove("hidden");
    modalViewLogin.classList.add("hidden");
});

// Handle Login Form POST
formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("login-username").value.trim();
    const p = document.getElementById("login-password").value;
    
    try {
        const res = await fetch(`${API_BASE}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: u, password: p })
        });
        if (!res.ok) {
            let errorMsg = "Giriş başarısız.";
            try {
                const errData = await res.json();
                errorMsg = errData.detail || errorMsg;
            } catch (_) {
                errorMsg = `Sunucu hatası (${res.status}). Lütfen tekrar deneyin.`;
            }
            throw new Error(errorMsg);
        }
        
        const data = await res.json();
        authToken = data.token;
        localStorage.setItem("token", data.token);
        currentUser = data.user;
        
        setAuthenticatedUIState(data.user.full_name || data.user.username);
        authModal.classList.add("hidden");
        formLogin.reset();
    } catch (err) {
        alert(`❌ Hata: ${err.message}`);
    }
});

// Handle Register Form POST
formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("register-username").value.trim();
    const em = document.getElementById("register-email").value.trim();
    const fn = document.getElementById("register-fullname").value.trim();
    const p = document.getElementById("register-password").value;
    
    try {
        const res = await fetch(`${API_BASE}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: u, email: em, full_name: fn, password: p })
        });
        if (!res.ok) {
            let errorMsg = "Kayıt başarısız.";
            try {
                const errData = await res.json();
                errorMsg = errData.detail || errorMsg;
            } catch (_) {
                errorMsg = `Sunucu hatası (${res.status}). Lütfen tekrar deneyin.`;
            }
            throw new Error(errorMsg);
        }
        
        const data = await res.json();
        authToken = data.token;
        localStorage.setItem("token", data.token);
        currentUser = data.user;
        
        setAuthenticatedUIState(data.user.full_name || data.user.username);
        authModal.classList.add("hidden");
        formRegister.reset();
    } catch (err) {
        alert(`❌ Hata: ${err.message}`);
    }
});

/* ----------------------------------------------------
   4. TEMPLATE SELECTION LOGIC
   ---------------------------------------------------- */
userTemplates.forEach(card => {
    card.addEventListener("click", () => {
        userTemplates.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        selectedUserTemplate = card.dataset.filename;
        
        userImageInput.value = "";
        userUploadPreview.classList.add("hidden");
    });
});

productTemplates.forEach(card => {
    card.addEventListener("click", () => {
        productTemplates.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        selectedProductTemplate = card.dataset.filename;
        
        productTitle.value = card.dataset.title;
        productPrice.value = card.dataset.price;
        productDesc.value = card.dataset.desc;
        
        // Update star selector value
        if (card.dataset.rating) {
            updateInteractiveRating(parseInt(card.dataset.rating, 10));
        }
        
        productImageInput.value = "";
        productUploadPreview.classList.add("hidden");
    });
});

/* ----------------------------------------------------
   PRODUCT DETAILS LINK SCRAPER (Strategy 3)
   ---------------------------------------------------- */

const btnParseLink = document.getElementById("btn-parse-link");
const productLinkInput = document.getElementById("product-link-input");
const scrapedImagesContainer = document.getElementById("scraped-images-container");
const scrapedImagesCarousel = document.getElementById("scraped-images-carousel");

if (btnParseLink) {
    btnParseLink.addEventListener("click", async () => {
        const url = productLinkInput.value.trim();
        if (!url) {
            alert(activeLang === "tr" ? "Lütfen geçerli bir e-ticaret ürün linki girin." : "Please enter a valid e-commerce product link.");
            return;
        }

        const originalHtml = btnParseLink.innerHTML;
        btnParseLink.disabled = true;
        btnParseLink.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${activeLang === "tr" ? "Çözülüyor..." : "Parsing..."}`;

        try {
            const res = await fetch(`${API_BASE}/api/parse-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
            });

            if (!res.ok) throw new Error("Parse failed");
            const data = await res.json();

            if (data.status === "success") {
                productTitle.value = data.title || "";
                productPrice.value = data.price || "";
                productDesc.value = data.description || "";

                if (data.images && data.images.length > 0) {
                    scrapedImagesCarousel.innerHTML = "";
                    
                    data.images.forEach((imgUrl, idx) => {
                        const card = document.createElement("div");
                        card.className = "scraped-img-card" + (idx === 0 ? " active" : "");
                        card.style.cssText = "width: 75px; height: 75px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid " + (idx === 0 ? "#ff9f0a" : "transparent") + "; position: relative; transition: all 0.2s; flex-shrink: 0; background: #0f172a;";
                        card.innerHTML = `<img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        
                        card.addEventListener("click", () => {
                            document.querySelectorAll(".scraped-img-card").forEach(c => {
                                c.classList.remove("active");
                                c.style.borderColor = "transparent";
                            });
                            card.classList.add("active");
                            card.style.borderColor = "#ff9f0a";
                            
                            selectedScrapedImageUrl = imgUrl;
                            selectedProductTemplate = null;
                            productImageInput.value = "";
                            productUploadPreview.classList.add("hidden");
                            productTemplates.forEach(t => t.classList.remove("active"));
                        });

                        scrapedImagesCarousel.appendChild(card);
                    });

                    selectedScrapedImageUrl = data.images[0];
                    selectedProductTemplate = null;
                    productTemplates.forEach(t => t.classList.remove("active"));

                    scrapedImagesContainer.classList.remove("hidden");
                    scrapedImagesContainer.style.opacity = 0;
                    setTimeout(() => scrapedImagesContainer.style.opacity = 1, 50);
                }
            } else {
                throw new Error(data.detail || "Unknown error");
            }
        } catch (err) {
            console.error("Link parsing failed:", err);
            alert(activeLang === "tr" 
                ? "Link çözümlenemedi. Lütfen internetinizi kontrol edin veya manuel yükleme yapın." 
                : "Failed to parse product link. Please check connection or use manual upload.");
        } finally {
            btnParseLink.disabled = false;
            btnParseLink.innerHTML = originalHtml;
        }
    });
}

// Dynamic Star Rating Interactive Control
function updateInteractiveRating(val) {
    const ratingInput = document.getElementById("product-rating");
    if (ratingInput) ratingInput.value = val;
    
    const stars = document.querySelectorAll("#product-rating-selector .star-option");
    stars.forEach((star, index) => {
        if (index < val) {
            star.classList.add("active");
            star.style.color = "#ff9f0a";
        } else {
            star.classList.remove("active");
            star.style.color = "rgba(255, 255, 255, 0.2)";
        }
    });
}

document.querySelectorAll("#product-rating-selector .star-option").forEach(star => {
    star.addEventListener("click", () => {
        const val = parseInt(star.dataset.value, 10);
        updateInteractiveRating(val);
    });
});

/* ----------------------------------------------------
   5. CUSTOM UPLOAD PREVIEWS
   ---------------------------------------------------- */
// Stop click propagation on hidden file inputs to prevent double-triggering native file dialogs
userImageInput.addEventListener("click", (e) => {
    e.stopPropagation();
});

productImageInput.addEventListener("click", (e) => {
    e.stopPropagation();
});

userUploadArea.addEventListener("click", (e) => {
    if (e.target !== btnRemoveUserImg && !btnRemoveUserImg.contains(e.target)) {
        userImageInput.click();
    }
});

productUploadArea.addEventListener("click", (e) => {
    if (e.target !== btnRemoveProductImg && !btnRemoveProductImg.contains(e.target)) {
        productImageInput.click();
    }
});

// HTML5 Drag and Drop Support
["dragenter", "dragover"].forEach(eventName => {
    userUploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        userUploadArea.classList.add("dragover");
    }, false);
    
    productUploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        productUploadArea.classList.add("dragover");
    }, false);
});

["dragleave", "drop"].forEach(eventName => {
    userUploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        userUploadArea.classList.remove("dragover");
    }, false);
    
    productUploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        productUploadArea.classList.remove("dragover");
    }, false);
});

userUploadArea.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
        userImageInput.files = files;
        // Dispatch change event to trigger FileReader preview logic
        userImageInput.dispatchEvent(new Event("change"));
    }
});

productUploadArea.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
        productImageInput.files = files;
        // Dispatch change event to trigger FileReader preview logic
        productImageInput.dispatchEvent(new Event("change"));
    }
});

userImageInput.addEventListener("change", () => {
    if (userImageInput.files && userImageInput.files[0]) {
        const file = userImageInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            userUploadPreview.querySelector("img").src = e.target.result;
            userUploadPreview.classList.remove("hidden");
            
            userTemplates.forEach(c => c.classList.remove("active"));
            selectedUserTemplate = null;
        };
        reader.readAsDataURL(file);
    }
});

productImageInput.addEventListener("change", () => {
    if (productImageInput.files && productImageInput.files[0]) {
        const file = productImageInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            productUploadPreview.querySelector("img").src = e.target.result;
            productUploadPreview.classList.remove("hidden");
            
            productTemplates.forEach(c => c.classList.remove("active"));
            selectedProductTemplate = null;
            selectedScrapedImageUrl = null;
            if (scrapedImagesContainer) scrapedImagesContainer.classList.add("hidden");
        };
        reader.readAsDataURL(file);
    }
});

btnRemoveUserImg.addEventListener("click", (e) => {
    e.stopPropagation();
    userImageInput.value = "";
    userUploadPreview.classList.add("hidden");
    userTemplates[0].click();
});

btnRemoveProductImg.addEventListener("click", (e) => {
    e.stopPropagation();
    productImageInput.value = "";
    productUploadPreview.classList.add("hidden");
    selectedScrapedImageUrl = null;
    if (scrapedImagesContainer) scrapedImagesContainer.classList.add("hidden");
    productTemplates[0].click();
});

/* ----------------------------------------------------
   8. ASYNC VTON SANAL KABIN EXECUTION
   ---------------------------------------------------- */
btnSubmitTryon.addEventListener("click", async () => {
    if (!selectedUserTemplate && !userImageInput.files[0]) {
        alert(activeLang === "tr" ? "Lütfen bir manken seçin veya fotoğraf yükleyin." : "Please select a model or upload a photo.");
        return;
    }
    
    if (!selectedProductTemplate && !productImageInput.files[0] && !selectedScrapedImageUrl) {
        alert(activeLang === "tr" ? "Lütfen denenecek kıyafeti belirleyin." : "Please choose the garment to try on.");
        return;
    }
    
    let pTitle = productTitle.value.trim();
    let pPrice = parseFloat(productPrice.value) || 0.0;
    let pDesc = productDesc.value.trim();
    let pExtra = productExtraNotes.value.trim();
    
    if (!pTitle || pPrice <= 0) {
        alert(activeLang === "tr" ? "Lütfen kıyafet başlığı ve fiyatını eksiksiz girin." : "Please fill in garment title and price.");
        return;
    }

    stateEmpty.classList.add("hidden");
    stateSuccess.classList.add("hidden");
    stateLoading.classList.remove("hidden");
    
    // Reset Steppers
    const step1 = document.getElementById("loading-step-1");
    const step2 = document.getElementById("loading-step-2");
    const step3 = document.getElementById("loading-step-3");
    
    step1.className = "step-item active";
    step1.querySelector(".step-status").innerText = activeLang === "tr" ? "İşleniyor..." : "Processing...";
    step2.className = "step-item";
    step2.querySelector(".step-status").innerText = activeLang === "tr" ? "Sırada..." : "In queue...";
    step3.className = "step-item";
    step3.querySelector(".step-status").innerText = activeLang === "tr" ? "Sırada..." : "In queue...";

    try {
        step1.className = "step-item completed";
        step1.querySelector(".step-status").innerText = activeLang === "tr" ? "Tamamlandı!" : "Completed!";
        step2.className = "step-item active";
        step2.querySelector(".step-status").innerText = activeLang === "tr" ? "Giydirme Yapılıyor..." : "Fitting on model...";
        
        const formData = new FormData();
        formData.append("product_title", pTitle);
        formData.append("product_desc", pDesc);
        formData.append("price", pPrice);
        if (pExtra) {
            formData.append("extra_note", pExtra);
        }
        
        // Add Dynamic Star Rating selection
        const ratingInput = document.getElementById("product-rating");
        const pRating = ratingInput ? ratingInput.value : "4";
        formData.append("rating", pRating);
        formData.append("lang", activeLang);
        
        if (userImageInput.files[0]) {
            formData.append("user_image", userImageInput.files[0]);
            imgCompareBefore.src = URL.createObjectURL(userImageInput.files[0]);
        } else {
            const response = await fetch(`assets/${selectedUserTemplate}`);
            const blob = await response.blob();
            formData.append("user_image", new File([blob], selectedUserTemplate, { type: "image/jpeg" }));
            imgCompareBefore.src = `assets/${selectedUserTemplate}`;
        }
        
        if (selectedScrapedImageUrl) {
            const response = await fetch(selectedScrapedImageUrl);
            const blob = await response.blob();
            formData.append("product_image", new File([blob], "scraped_garment.jpg", { type: "image/jpeg" }));
        } else if (productImageInput.files[0]) {
            formData.append("product_image", productImageInput.files[0]);
        } else {
            const response = await fetch(`assets/${selectedProductTemplate}`);
            const blob = await response.blob();
            formData.append("product_image", new File([blob], selectedProductTemplate, { type: "image/jpeg" }));
        }
        
        const headers = {};
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}/api/try-on`, {
            method: "POST",
            headers: headers,
            body: formData
        });
        
        if (!response.ok) throw new Error("Virtual Try-on server error.");
        
        const data = await response.json();
        
        if (data.status === "success") {
            imgCompareAfter.src = `${API_BASE}${data.image_url}`;
            
            step2.className = "step-item completed";
            step2.querySelector(".step-status").innerText = activeLang === "tr" ? "Giydirildi!" : "Finished!";
            step3.className = "step-item completed";
            step3.querySelector(".step-status").innerText = activeLang === "tr" ? "Rapor Hazır!" : "Report Ready!";
            
            currentProductPrice = pPrice;
            renderReports(data.styling_report, pPrice);
            
            // Show engine info badge
            const engineBadge = document.getElementById("vton-engine-badge");
            const engineName = document.getElementById("vton-engine-name");
            if (engineBadge && engineName && data.vton_engine) {
                engineName.textContent = data.vton_engine;
                engineBadge.style.display = "flex";
            }
            
            // Show experimental toolbar
            const expToolbar = document.getElementById("experimental-toolbar");
            if (expToolbar) expToolbar.style.display = "block";
            
            stateLoading.classList.add("hidden");
            stateSuccess.classList.remove("hidden");
            
            const panelResults = document.getElementById("panel-results");
            if (panelResults) {
                panelResults.scrollTop = 0;
            }
            panelResults.scrollIntoView({ behavior: "smooth" });
            initCompareSlider("dashboard-compare-slider", "dashboard-after-wrapper", "dashboard-slider-bar");
        }
    } catch (err) {
        console.error(err);
        alert(activeLang === "tr" ? `Kabin giydirme başarısız: ${err.message}` : `Try-on failed: ${err.message}`);
        stateLoading.classList.add("hidden");
        stateEmpty.classList.remove("hidden");
    }
});

btnResetTryon.addEventListener("click", () => {
    stateSuccess.classList.add("hidden");
    stateEmpty.classList.remove("hidden");
    
    // Hide engine badge and experimental toolbar
    const engineBadge = document.getElementById("vton-engine-badge");
    if (engineBadge) engineBadge.style.display = "none";
    const expToolbar = document.getElementById("experimental-toolbar");
    if (expToolbar) expToolbar.style.display = "none";
});

/* ----------------------------------------------------
   9. RENDER DYNAMIC REPORTS FROM GEMINI
   ---------------------------------------------------- */
function renderReports(report, price) {
    repBodyType.innerText = report.body_type || "Standart";
    repFitScore.innerText = report.fit_analysis?.score || "85";
    
    let fTitle = report.fit_analysis?.title || "Uyumlu Kesim";
    let fDesc = report.fit_analysis?.description || "";
    let colorHarmony = report.color_harmony || "";
    let roiVerdict = report.financial_roi?.roi_verdict || "";

    if (activeLang === "en") {
        if (fTitle === "Uyumlu Kesim") fTitle = "Harmonious Fit";
        if (fTitle === "Hafif Bol") fTitle = "Relaxed Fit";
        if (fTitle === "Dar Kesim") fTitle = "Slim Fit";
    }

    repFitTitle.innerText = fTitle;
    repFitDesc.innerText = fDesc;
    repColorHarmony.innerText = colorHarmony;
    
    repPrice.innerText = `${price.toLocaleString(activeLang === 'tr' ? 'tr-TR' : 'en-US')} TL`;
    repQuality.innerText = report.financial_roi?.quality_rating || "⭐⭐⭐⭐";
    repRoiVerdict.innerText = roiVerdict;
    
    cpwSlider.value = 30;
    updateDynamicCPW(30);
    
    repStylistList.innerHTML = "";
    if (report.styling_suggestions && report.styling_suggestions.length > 0) {
        report.styling_suggestions.forEach(s => {
            let iconClass = "fa-socks";
            if (s.category === "bottom") iconClass = "fa-socks";
            else if (s.category === "shoes") iconClass = "fa-shoe-prints";
            else if (s.category === "accessory") iconClass = "fa-clock";
            else if (s.category === "outerwear") iconClass = "fa-vest";
            
            let catTitle = activeLang === "tr" ? "Alt Giyim Kombini" : "Bottom Outfit";
            if (s.category === "shoes") catTitle = activeLang === "tr" ? "Ayakkabı Tercihi" : "Footwear Selection";
            else if (s.category === "accessory") catTitle = activeLang === "tr" ? "Aksesuar Detayı" : "Accessory Matching";
            else if (s.category === "outerwear") catTitle = activeLang === "tr" ? "Dış Giyim Şıklığı" : "Outerwear Styling";
            
            const sItem = document.createElement("div");
            sItem.className = "suggestion-item";
            sItem.innerHTML = `
                <div class="s-icon"><i class="fa-solid ${iconClass}"></i></div>
                <div class="s-details">
                    <h4 class="s-title">${catTitle}</h4>
                    <p class="s-desc"><strong>${s.item}:</strong> ${s.description}</p>
                </div>
            `;
            repStylistList.appendChild(sItem);
        });
    }
}

/* ----------------------------------------------------
   10. INTERACTIVE CPW CALCULATIONS
   ---------------------------------------------------- */
cpwSlider.addEventListener("input", (e) => {
    const wears = parseInt(e.target.value);
    updateDynamicCPW(wears);
});

function updateDynamicCPW(wears) {
    const cpw = currentProductPrice / wears;
    cpwDynamicVal.innerText = `${cpw.toFixed(2)} TL`;
    
    if (wears < 15) {
        cpwAmortization.innerText = activeLang === "tr" ? "Düşük Amorti (Seyrek)" : "Low ROI (Rare Wear)";
        cpwAmortization.style.color = "#ff3b30";
    } else if (wears >= 15 && wears < 45) {
        cpwAmortization.innerText = activeLang === "tr" ? "İyi Amorti (Orta)" : "Good ROI (Medium Wear)";
        cpwAmortization.style.color = "#f59e0b";
    } else {
        cpwAmortization.innerText = activeLang === "tr" ? "Mükemmel Amorti (Sık)" : "High ROI (Frequent Wear)";
        cpwAmortization.style.color = "#10b981";
    }
}

/* ----------------------------------------------------
   11. COMPARE SLIDER DRAG LOGIC (SUPPORT MULTIPLE INSTANCES)
   ---------------------------------------------------- */
function initCompareSlider(containerId, afterWrapperId, sliderBarId) {
    const container = document.getElementById(containerId);
    const afterWrapper = document.getElementById(afterWrapperId);
    const sliderBar = document.getElementById(sliderBarId);
    
    if (!container || !afterWrapper || !sliderBar) return;
    
    const afterImg = afterWrapper.querySelector("img");
    let isDragging = false;
    
    afterWrapper.style.width = "50%";
    sliderBar.style.left = "50%";
    
    const updateWidths = () => {
        const containerWidth = container.getBoundingClientRect().width;
        if (afterImg) {
            afterImg.style.width = `${containerWidth}px`;
            afterImg.style.maxWidth = "none";
        }
    };
    
    // Initial call and load binding
    updateWidths();
    if (afterImg) {
        afterImg.addEventListener("load", updateWidths);
    }
    window.addEventListener("resize", updateWidths);
    
    const dragStart = () => { isDragging = true; };
    const dragEnd = () => { isDragging = false; };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        
        let containerRect = container.getBoundingClientRect();
        let clientX = e.clientX || (e.touches && e.touches[0].clientX);
        
        if (!clientX) return;
        
        let offsetX = clientX - containerRect.left;
        let percentage = (offsetX / containerRect.width) * 100;
        
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        
        afterWrapper.style.width = `${percentage}%`;
        sliderBar.style.left = `${percentage}%`;
        
        updateWidths();
    };
    
    // Remove previous listeners to prevent leakage
    sliderBar.removeEventListener("mousedown", dragStart);
    sliderBar.removeEventListener("touchstart", dragStart);
    
    sliderBar.addEventListener("mousedown", dragStart);
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("mousemove", dragMove);
    
    sliderBar.addEventListener("touchstart", dragStart);
    window.addEventListener("touchend", dragEnd);
    window.addEventListener("touchmove", dragMove);
}

/* ----------------------------------------------------
   12. TRIAL ARCHIVE VIEWER (POSTGRES RETRIEVAL)
   ---------------------------------------------------- */
btnShowHistory.addEventListener("click", async () => {
    historyModal.classList.remove("hidden");
    historyItemsGrid.innerHTML = `<div class="empty-state-content"><i class="fa-solid fa-spinner fa-spin empty-icon"></i><p>${activeLang === 'tr' ? 'Yükleniyor...' : 'Loading previous trials...'}</p></div>`;
    
    try {
        const res = await fetch(`${API_BASE}/api/history`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error("Could not fetch trial history.");
        
        const data = await res.json();
        
        if (data.status === "success") {
            renderHistoryGrid(data.history);
        }
    } catch (err) {
        console.error(err);
        historyItemsGrid.innerHTML = `<div class="empty-state-content"><i class="fa-solid fa-triangle-exclamation empty-icon"></i><p>${activeLang === 'tr' ? 'Geçmiş yüklenemedi.' : 'Failed to retrieve history.'}</p></div>`;
    }
});

btnCloseHistory.addEventListener("click", () => {
    historyModal.classList.add("hidden");
});

historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) historyModal.classList.add("hidden");
});

function renderHistoryGrid(history) {
    historyItemsGrid.innerHTML = "";
    const btnClearHistory = document.getElementById("btn-clear-history");
    
    if (btnClearHistory) {
        if (history.length === 0) {
            btnClearHistory.style.display = "none";
        } else {
            btnClearHistory.style.display = "flex";
        }
    }
    
    if (history.length === 0) {
        historyItemsGrid.innerHTML = `
            <div class="empty-state-content" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-folder-open empty-icon"></i>
                <h3>${activeLang === 'tr' ? 'Kabin Arşiviniz Boş' : 'Cabinet Archive is Empty'}</h3>
                <p>${activeLang === 'tr' ? 'Henüz hiçbir kıyafet denemediniz. Hemen ilk giydirmenizi yapın!' : 'You have not tried any outfit yet. Make your first trial now!'}</p>
            </div>
        `;
        return;
    }
    
    history.forEach(item => {
        const dateObj = new Date(item.created_at);
        const formattedDate = dateObj.toLocaleDateString(activeLang === "tr" ? "tr-TR" : "en-US", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        });
        
        const card = document.createElement("div");
        card.className = "history-card";
        card.innerHTML = `
            <div class="history-images-grid">
                <img src="${API_BASE}${item.user_image_url}" alt="Original">
                <img src="${API_BASE}${item.result_image_url}" alt="Result">
            </div>
            <div class="history-details">
                <h4>${item.product_title}</h4>
                <span class="price">${item.price.toLocaleString(activeLang === 'tr' ? 'tr-TR' : 'en-US')} TL</span>
                <span class="date"><i class="fa-solid fa-calendar-alt"></i> ${formattedDate}</span>
            </div>
            <button type="button" class="btn-delete-card-item" title="${activeLang === 'tr' ? 'Sil' : 'Delete'}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        
        card.addEventListener("click", (e) => {
            // Only trigger restore if they didn't click the delete button
            if (e.target.closest(".btn-delete-card-item")) return;
            
            historyModal.classList.add("hidden");
            
            imgCompareBefore.src = `${API_BASE}${item.user_image_url}`;
            imgCompareAfter.src = `${API_BASE}${item.result_image_url}`;
            
            currentProductPrice = item.price;
            renderReports(item.styling_report, item.price);
            
            stateEmpty.classList.add("hidden");
            stateSuccess.classList.remove("hidden");
            
            const panelResults = document.getElementById("panel-results");
            if (panelResults) {
                panelResults.scrollTop = 0;
            }
            panelResults.scrollIntoView({ behavior: "smooth" });
            initCompareSlider("dashboard-compare-slider", "dashboard-after-wrapper", "dashboard-slider-bar");
        });
        
        // Bind individual delete button
        const btnDelete = card.querySelector(".btn-delete-card-item");
        btnDelete.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!confirm(activeLang === "tr" ? "Bu denemeyi arşivinizden silmek istediğinize emin misiniz?" : "Are you sure you want to delete this trial?")) return;
            
            try {
                const res = await fetch(`${API_BASE}/api/history/${item.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${authToken}` }
                });
                const data = await res.json();
                if (data.status === "success") {
                    card.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.9) translateY(10px)";
                    setTimeout(() => {
                        const updatedHistory = history.filter(h => h.id !== item.id);
                        renderHistoryGrid(updatedHistory);
                    }, 350);
                }
            } catch (err) {
                console.error("Delete individual card failed:", err);
            }
        });
        
        historyItemsGrid.appendChild(card);
    });
}

// Bind bulk clear all button once
const btnClearHistory = document.getElementById("btn-clear-history");
if (btnClearHistory) {
    btnClearHistory.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm(activeLang === "tr" ? "Tüm sanal kabin geçmişinizi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz." : "Are you sure you want to permanently clear all cabinet history? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/history`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.status === "success") {
                renderHistoryGrid([]);
            }
        } catch (err) {
            console.error("Clear all failed:", err);
        }
    });
}

/* ----------------------------------------------------
   HELPERS
   ---------------------------------------------------- */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Instant Scroll for "Sistemi İncele" button (bypasses browser smooth transitions delay)
const btnExplore = document.querySelector('a[href="#how-it-works"]');
if (btnExplore) {
    btnExplore.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("how-it-works");
        if (target) {
            const prevBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            target.scrollIntoView({ behavior: "auto" });
            document.documentElement.style.scrollBehavior = prevBehavior || "smooth";
            history.pushState(null, null, "#how-it-works");
        }
    });
}
