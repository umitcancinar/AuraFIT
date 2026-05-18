'use strict';
(function() {
    let root = document.getElementById('chatbot-root');
    if (!root) { 
        root = document.createElement('div'); 
        root.id = 'chatbot-root'; 
        document.body.appendChild(root); 
    }

    // Determine correct API URL
    const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1") 
        ? "http://localhost:8000" 
        : "";
    const API_URL = `${API_BASE}/api`;
    
    // Premium SVG Design: Elite Milan Fashion Designer & Stylist with Separated Head & Suit Body
    const charSvg = `
    <div class="chatbot-char" id="chatbotChar" title="AuraFit Modacı & Terzi Asistanı">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2e3a4e"/>
                    <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
                <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f1f5f9"/>
                </linearGradient>
            </defs>
            
            <!-- Charcoal Double-Breasted Designer Suit Body (Separated below the head) -->
            <path d="M16 43 C20 40, 24 40, 40 40 C56 40, 60 40, 64 43 L66 78 C66 79, 62 80, 40 80 C18 80, 14 79, 14 78 Z" fill="url(#suitGrad)"/>
            
            <!-- Crisp White V-Neck Dress Shirt Collar -->
            <path d="M33 40 L40 56 L47 40 Z" fill="#ffffff"/>
            
            <!-- Elegant Red Silk Designer Necktie -->
            <path d="M38 50 L42 50 L43.5 66 L40 71 L36.5 66 Z" fill="#ef4444"/>
            <circle cx="40" cy="51" r="2" fill="#b91c1c"/>
            
            <!-- Sleek Charcoal Lapels with Accent Pin -->
            <path d="M26 40 L36 56 M54 40 L44 56" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="33" cy="50" r="1.2" fill="#fbbf24"/> <!-- Gold Stylist Accent Pin -->
            
            <!-- Tailor Measuring Tape (Yellow/Gold) wrapped elegantly around shoulders -->
            <path d="M23 42 C28 38, 52 38, 57 42 C59 52, 52 64, 48 72 M23 42 C20 52, 27 64, 31 72" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M48 72 L47 78 M31 72 L32 78" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Dark Designer Suit Sleeves / Waving Arms (Anchored at shoulders) -->
            <g class="h-arm-l" style="transform-origin: 16px 45px;">
                <path d="M12 45 C4 42, 4 32, 6 26" stroke="#2e3a4e" stroke-width="4.5" stroke-linecap="round" fill="none"/>
            </g>
            <g class="h-arm-r" style="transform-origin: 64px 45px;">
                <path d="M68 45 C76 42, 76 32, 74 26" stroke="#2e3a4e" stroke-width="4.5" stroke-linecap="round" fill="none"/>
            </g>
            
            <!-- Elegant Separated Designer Head -->
            <circle cx="40" cy="26" r="16" fill="url(#headGrad)" stroke="#e2e8f0" stroke-width="1.5"/>
            
            <!-- Moving Interactive Eyes (Inside the head) -->
            <ellipse class="h-eye" cx="30" cy="26" rx="6.2" ry="7.8" fill="white"/>
            <circle class="h-pupil" cx="30" cy="26" r="3.8" fill="#1D1D1F"/>
            
            <ellipse class="h-eye" cx="50" cy="26" rx="6.2" ry="7.8" fill="white"/>
            <circle class="h-pupil" cx="50" cy="26" r="3.8" fill="#1D1D1F"/>
            
            <!-- Ultra-Chic Gold Stylist Glasses (On the head) -->
            <circle cx="30" cy="26" r="8.2" fill="none" stroke="#f59e0b" stroke-width="1.8"/>
            <circle cx="50" cy="26" r="8.2" fill="none" stroke="#f59e0b" stroke-width="1.8"/>
            <line x1="38" y1="26" x2="42" y2="26" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>
            
            <!-- Smiling / Excited Mouths (On the head) -->
            <path class="h-mouth" id="charMouth" d="M34 35 Q40 40 46 35" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round" fill="none"/>
            <ellipse class="h-mouth-excited" cx="40" cy="36" rx="4.5" ry="5.5" fill="#1D1D1F" opacity="0"/>
        </svg>
    </div>`;

    root.innerHTML = charSvg + `
    <div class="chatbot-welcome-bubble" id="chatbotWelcomeBubble">
        <button class="chatbot-welcome-bubble-close" id="chatbotWelcomeCloseBtn">✕</button>
        <span id="chatbotWelcomeText">Merhaba, ben asistanın Terzican! Sana yardımcı olabilirim. 🧵</span>
    </div>
    <div class="chatbot-window" id="chatbotWindow" role="dialog" aria-hidden="true">
        <div class="chatbot-header">
            <div class="chatbot-header-info">
                <div class="chatbot-avatar">🧵</div>
                <div>
                    <div class="chatbot-header-title" id="cb-title">Terzi AI Asistanı</div>
                    <div class="chatbot-header-status" id="cb-status">Çevrimiçi | Stil & Kalıp Uzmanı</div>
                </div>
            </div>
            <button class="chatbot-close-btn" id="chatbotCloseBtn">✕</button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages"></div>
        <div class="chatbot-input-row">
            <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Kombin, beden veya stil sorusu sorun...">
            <button class="chatbot-send-btn" id="chatbotSendBtn">➤</button>
        </div>
    </div>`;

    const toggle = document.getElementById('chatbotChar');
    const windowEl = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const messages = document.getElementById('chatbotMessages');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSendBtn');
    
    // Welcome Bubble DOM elements
    const welcomeBubble = document.getElementById('chatbotWelcomeBubble');
    const welcomeCloseBtn = document.getElementById('chatbotWelcomeCloseBtn');
    const welcomeText = document.getElementById('chatbotWelcomeText');

    // Pupil cursor tracking formula calculations
    const pupils = toggle.querySelectorAll('.h-pupil');
    function setPupils(dx, dy) { 
        pupils.forEach(p => p.setAttribute('transform', `translate(${dx},${dy})`)); 
    }
    
    document.addEventListener('mousemove', (e) => {
        if (!toggle) return;
        const rect = toggle.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.min(1, d / 80);
        
        // Offset mapping to pupil boundaries
        setPupils((dx / d) * f * 3.5, (dy / d) * f * 3.5);
        
        // Jumps and gets excited when the user cursor is very close!
        if (d < 140) {
            toggle.classList.add('excited');
        } else {
            toggle.classList.remove('excited');
        }
    });

    // Wave hands greeting animation on mount
    setTimeout(() => { 
        if (toggle) {
            toggle.classList.add('greeting'); 
            setTimeout(() => toggle.classList.remove('greeting'), 1800); 
        }
    }, 1200);

    function addMsg(text, isUser) {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'chatbot-msg ' + (isUser ? 'user' : 'bot');
        div.innerHTML = `
            <div class="chatbot-msg-avatar">${isUser ? '👤' : '🧵'}</div>
            <div class="chatbot-msg-bubble">${text}</div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'chatbot-typing';
        div.id = 'typingIndicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    async function processMessage(text) {
        if (!text.trim()) return;
        addMsg(text, true);
        input.value = '';
        showTyping();

        // Safe access to global activeLang and translations
        const lang = window.activeLang || 'tr';
        const transDict = window.translations ? window.translations[lang] : {};

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, lang: lang })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            hideTyping();
            
            addMsg(data.response || transDict.chat_default_resp || "I'm styling your next smart outfit!", false);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            hideTyping();
            addMsg(transDict.chat_error || "Sistemde anlık bir gecikme var, lütfen tekrar deneyin.", false);
        }
    }

    // Show welcome bubble after 2.5 seconds on first load
    setTimeout(() => {
        if (welcomeBubble && windowEl && !windowEl.classList.contains('open')) {
            const lang = window.activeLang || 'tr';
            const transDict = window.translations ? window.translations[lang] : {};
            if (welcomeText) {
                welcomeText.innerHTML = transDict.chat_bubble_hello || "Merhaba, ben asistanın Terzican! Sana yardımcı olabilirim. 🧵";
            }
            welcomeBubble.classList.add('show');
        }
    }, 2500);

    if (welcomeCloseBtn) {
        welcomeCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (welcomeBubble) welcomeBubble.classList.remove('show');
        });
    }

    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (welcomeBubble) welcomeBubble.classList.remove('show');
            
            const isOpen = windowEl.classList.toggle('open');
            if (isOpen) {
                const lang = window.activeLang || 'tr';
                const transDict = window.translations ? window.translations[lang] : {};
                
                const title = document.getElementById('cb-title');
                const status = document.getElementById('cb-status');
                const inputEl = document.getElementById('chatbotInput');
                
                if (title && transDict.chat_title) title.textContent = transDict.chat_title;
                if (status && transDict.chat_status) status.textContent = transDict.chat_status;
                if (inputEl && transDict.chat_placeholder) inputEl.placeholder = transDict.chat_placeholder;

                if (messages.children.length === 0) {
                    addMsg(transDict.chat_greet_1 || "Hello!", false);
                    addMsg(transDict.chat_greet_2 || "Ask me about sizes or styling!", false);
                }
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            windowEl.classList.remove('open'); 
        });
    }
    
    document.addEventListener('click', (e) => {
        if (windowEl && windowEl.classList.contains('open') && !windowEl.contains(e.target) && !toggle.contains(e.target)) {
            windowEl.classList.remove('open');
        }
    });

    if (windowEl) windowEl.addEventListener('click', (e) => e.stopPropagation());
    if (sendBtn) sendBtn.addEventListener('click', () => processMessage(input.value));
    if (input) input.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') processMessage(input.value); 
    });

    // Synchronize UI translations dynamically on language change
    window.addEventListener('langChanged', (e) => {
        const lang = e.detail;
        const transDict = window.translations ? window.translations[lang] : {};
        
        const title = document.getElementById('cb-title');
        const status = document.getElementById('cb-status');
        const inputEl = document.getElementById('chatbotInput');
        
        if (title && transDict.chat_title) title.textContent = transDict.chat_title;
        if (status && transDict.chat_status) status.textContent = transDict.chat_status;
        if (inputEl && transDict.chat_placeholder) inputEl.placeholder = transDict.chat_placeholder;
        
        if (welcomeText && transDict.chat_bubble_hello) {
            welcomeText.innerHTML = transDict.chat_bubble_hello;
        }

        const msgs = messages.querySelectorAll('.chatbot-msg.bot');
        const userMsgs = messages.querySelectorAll('.chatbot-msg.user');
        
        if (userMsgs.length === 0 && msgs.length > 0) {
            messages.innerHTML = '';
            addMsg(transDict.chat_greet_1, false);
            addMsg(transDict.chat_greet_2, false);
        }
    });
})();
