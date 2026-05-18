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
let parsedProductImage = null; // Stored if parsed from URL
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
        "step1-label": "Fotoğrafınızı Seçin",
        "quick-models": "Hızlı Şablon Mankenler:",
        "model-man": "Erkek Manken",
        "model-woman": "Kadın Manken",
        "upload-user-title": "Kendi Fotoğrafınızı Yükleyin",
        "upload-user-desc": "Sürükleyip bırakın veya göz atın (PNG, JPG)",
        "step2-label": "Kıyafet Detayları",
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
        "garment-blue-hoodie": "Mavi Hoodie",
        "garment-red-sweater": "Kırmızı Kazak",
        "garment-green-dress": "Yeşil Elbise",
        "btn-submit-tryon": "SANAL KABİNİ BAŞLAT",
        "promo-badge": "Yapay Zeka Destekli Geleceğin E-Ticareti",
        "hero-main-title": "Geleceğin Akıllı E-Ticaret Kabini AuraFit ile Tanışın",
        "promo-subtitle": "Sanal Giydirme Teknolojisi ve Gemini Akıllı Finansal CPW Analizi ile Akıllı E-Ticaret Çağını Keşfedin!",
        "promo-tagline": "Kıyafet, ayakkabı veya gözlük... Siz hayal edin, yapay zekamızla anında üzerinizde görelim! 🕶️👟",
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
        "promo-h-title": "Nasıl Çalışır?",
        "step1-title": "Fotoğraf Yükle",
        "step2-title": "Kıyafet Tanımla",
        "step3-title": "Raporları Çözümle",
        "promo-s1": "İster hızlı şablon mankenlerden birini seçin, isterseniz kendi boydan fotoğrafınızı sisteme yükleyin.",
        "promo-s2": "E-ticaret sitesinden beğendiğiniz bir ürünün linkini yapıştırın veya direkt kıyafet resmini ekleyin.",
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
        "footer-text": "© 2026 AuraFit. Yapay zeka destekli yeni nesil sanal kabin ve akıllı e-ticaret platformu. Tüm hakları saklıdır."
    },
    en: {
        "app-title": "AuraFit - AI-Powered Virtual Try-On & E-Commerce FinTech",
        "welcome-prefix": "Welcome,",
        "btn-login-reg": "Sign In / Register",
        "btn-my-history": "My Try-On History",
        "inputs-title": "Configuration Setup",
        "inputs-subtitle": "Provide your portrait and select the apparel you want to fit.",
        "step1-label": "Select Your Photo",
        "quick-models": "Quick Model Templates:",
        "model-man": "Male Model",
        "model-woman": "Female Model",
        "upload-user-title": "Upload Your Own Photo",
        "upload-user-desc": "Drag and drop or browse (PNG, JPG)",
        "step2-label": "Garment Details",
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
        "garment-blue-hoodie": "Blue Hoodie",
        "garment-red-sweater": "Red Sweater",
        "garment-green-dress": "Green Dress",
        "btn-submit-tryon": "START VIRTUAL TRY-ON",
        "promo-badge": "AI-Powered Future of E-Commerce",
        "hero-main-title": "Future of E-Commerce: Meet AuraFit Smart Virtual Closet",
        "promo-subtitle": "Explore the age of smart e-commerce with VTON virtual try-on and Gemini financial Cost-per-Wear ROI analysis!",
        "promo-tagline": "Garments, footwear, or eyewear... You imagine it, and we'll dynamically try it on you in seconds! 🕶️👟",
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
        "promo-h-title": "How It Works?",
        "step1-title": "Upload Photo",
        "step2-title": "Define Clothes",
        "step3-title": "Analyze Reports",
        "promo-s1": "Choose one of our premium models or upload your own boy portrait.",
        "promo-s2": "Paste an e-commerce link from any site or upload garment pictures directly.",
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

// Toggle Tabs
const tabBtnLink = document.getElementById("tab-btn-link");
const tabBtnFile = document.getElementById("tab-btn-file");
const panelLink = document.getElementById("panel-link");
const panelFile = document.getElementById("panel-file");

// URL Parser Elements
const productUrl = document.getElementById("product-url");
const productUrlPrice = document.getElementById("product-url-price");
const btnParseLink = document.getElementById("btn-parse-link");

// Manual Input Elements
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const productDesc = document.getElementById("product-desc");

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
}

// Log Out Execution
function logoutUser() {
    localStorage.removeItem("token");
    authToken = null;
    currentUser = null;
    
    // Reset inputs
    productTitle.value = "";
    productPrice.value = "";
    productDesc.value = "";
    productUrl.value = "";
    
    // Restore states
    stateSuccess.classList.add("hidden");
    stateLoading.classList.add("hidden");
    stateEmpty.classList.add("hidden");
    
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
        
        productImageInput.value = "";
        productUploadPreview.classList.add("hidden");
        parsedProductImage = null;
    });
});

/* ----------------------------------------------------
   5. CUSTOM UPLOAD PREVIEWS
   ---------------------------------------------------- */
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
            parsedProductImage = null;
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
    productTemplates[0].click();
});

/* ----------------------------------------------------
   6. TOGGLE TABS (LINK VS FILE)
   ---------------------------------------------------- */
tabBtnLink.addEventListener("click", () => {
    tabBtnLink.classList.add("active");
    tabBtnFile.classList.remove("active");
    panelLink.classList.remove("hidden");
    panelFile.classList.add("hidden");
});

tabBtnFile.addEventListener("click", () => {
    tabBtnFile.classList.add("active");
    tabBtnLink.classList.remove("active");
    panelFile.classList.remove("hidden");
    panelLink.classList.add("hidden");
});

/* ----------------------------------------------------
   7. E-COMMERCE LINK RESOLVER (API INTEGRATION)
   ---------------------------------------------------- */
btnParseLink.addEventListener("click", async () => {
    const urlVal = productUrl.value.trim();
    if (!urlVal) {
        alert(activeLang === "tr" ? "Lütfen geçerli bir e-ticaret ürün linki girin." : "Please enter a valid e-commerce product link.");
        return;
    }

    const priceVal = parseFloat(productUrlPrice.value) || 0.0;
    btnParseLink.disabled = true;
    btnParseLink.innerHTML = `<span class="btn-text">${activeLang === 'tr' ? 'Çözümleniyor...' : 'Parsing...'}</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    
    try {
        const response = await fetch(`${API_BASE}/api/parse-link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlVal, price: priceVal })
        });
        
        if (!response.ok) throw new Error("Link parsing error.");
        
        const data = await response.json();
        
        if (data.status === "success") {
            productTitle.value = data.title;
            productPrice.value = data.price;
            productDesc.value = data.description;
            parsedProductImage = data.image_url;
            
            tabBtnFile.click();
            productUploadPreview.querySelector("img").src = `${API_BASE}${data.image_url}`;
            productUploadPreview.classList.remove("hidden");
            
            productTemplates.forEach(c => c.classList.remove("active"));
            selectedProductTemplate = null;
        }
    } catch (err) {
        console.error(err);
        alert(activeLang === "tr" ? "E-Ticaret linki çözümlenemedi. Görsel yükleyerek devam edebilirsiniz." : "E-Commerce link could not be parsed. You can upload clothes manually.");
    } finally {
        btnParseLink.disabled = false;
        btnParseLink.innerHTML = `<span class="btn-text">${activeLang === 'tr' ? 'Çözümle & Getir' : 'Parse & Load'}</span> <i class="fa-solid fa-wand-magic"></i>`;
    }
});

/* ----------------------------------------------------
   8. ASYNC VTON SANAL KABIN EXECUTION
   ---------------------------------------------------- */
btnSubmitTryon.addEventListener("click", async () => {
    if (!selectedUserTemplate && !userImageInput.files[0]) {
        alert(activeLang === "tr" ? "Lütfen bir manken seçin veya fotoğraf yükleyin." : "Please select a model or upload a photo.");
        return;
    }
    
    if (!selectedProductTemplate && !productImageInput.files[0] && !parsedProductImage) {
        alert(activeLang === "tr" ? "Lütfen denenecek kıyafeti belirleyin." : "Please choose the garment to try on.");
        return;
    }
    
    let pTitle = productTitle.value.trim();
    let pPrice = parseFloat(productPrice.value) || 0.0;
    let pDesc = productDesc.value.trim();
    
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
        
        if (userImageInput.files[0]) {
            formData.append("user_image", userImageInput.files[0]);
            imgCompareBefore.src = URL.createObjectURL(userImageInput.files[0]);
        } else {
            const response = await fetch(`assets/${selectedUserTemplate}`);
            const blob = await response.blob();
            formData.append("user_image", new File([blob], selectedUserTemplate, { type: "image/jpeg" }));
            imgCompareBefore.src = `assets/${selectedUserTemplate}`;
        }
        
        if (productImageInput.files[0]) {
            formData.append("product_image", productImageInput.files[0]);
        } else if (parsedProductImage) {
            const response = await fetch(`${API_BASE}${parsedProductImage}`);
            const blob = await response.blob();
            formData.append("product_image", new File([blob], "parsed_product.jpg", { type: "image/jpeg" }));
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
            
            stateLoading.classList.add("hidden");
            stateSuccess.classList.remove("hidden");
            
            document.getElementById("panel-results").scrollIntoView({ behavior: "smooth" });
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
    
    let isDragging = false;
    
    afterWrapper.style.width = "50%";
    sliderBar.style.left = "50%";
    
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
        `;
        
        card.addEventListener("click", () => {
            historyModal.classList.add("hidden");
            
            imgCompareBefore.src = `${API_BASE}${item.user_image_url}`;
            imgCompareAfter.src = `${API_BASE}${item.result_image_url}`;
            
            currentProductPrice = item.price;
            renderReports(item.styling_report, item.price);
            
            stateEmpty.classList.add("hidden");
            stateSuccess.classList.remove("hidden");
            
            document.getElementById("panel-results").scrollIntoView({ behavior: "smooth" });
            initCompareSlider("dashboard-compare-slider", "dashboard-after-wrapper", "dashboard-slider-bar");
        });
        
        historyItemsGrid.appendChild(card);
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
