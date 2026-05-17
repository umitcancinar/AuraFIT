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
    
    // Premium SVG Design: Elite Milan Fashion Designer & Stylist
    const charSvg = `
    <div class="chatbot-char" id="chatbotChar" title="AuraFit Modacı & Terzi Asistanı">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2e3a4e"/>
                    <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
            </defs>
            
            <!-- Charcoal Double-Breasted Designer Suit Body -->
            <path d="M40 10C56 10 70 20 72 38C74 54 66 70 52 76C42 79 30 78 20 72C10 66 6 52 8 38C10 20 24 10 40 10Z" fill="url(#suitGrad)"/>
            
            <!-- Crisp White V-Neck Dress Shirt Collar -->
            <path d="M30 14 L40 32 L50 14 L40 22 Z" fill="#ffffff"/>
            
            <!-- Elegant Red Silk Designer Necktie -->
            <path d="M38 22 L42 22 L44 40 L40 46 L36 40 Z" fill="#ef4444"/>
            <circle cx="40" cy="23" r="2.5" fill="#b91c1c"/>
            
            <!-- Sleek Charcoal Lapels with Accent Lining -->
            <path d="M26 14 L36 32 M54 14 L44 32" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
            <circle cx="34" cy="28" r="1.5" fill="#fbbf24"/> <!-- Gold Stylist Accent Pin -->
            
            <!-- Tailor Measuring Tape (Yellow/Gold) wrapped elegantly around shoulders -->
            <path d="M22 26 C28 22, 52 22, 58 26 C61 38, 52 48, 48 56 M22 26 C19 38, 28 48, 32 56" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M48 56 L47 62 M32 56 L33 62" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Stylized Sewing Needle details -->
            <path d="M11 26 L16 16" stroke="rgba(255,255,255,0.8)" stroke-width="1.8" stroke-linecap="round"/>
            
            <!-- Dark Designer Suit Sleeves / Waving Arms -->
            <g class="h-arm-l" style="transform-origin: 12px 42px;">
                <path d="M8 44 C-2 36, 0 28, 2 24" stroke="#2e3a4e" stroke-width="5" stroke-linecap="round" fill="none"/>
            </g>
            <g class="h-arm-r" style="transform-origin: 68px 42px;">
                <path d="M72 44 C82 36, 80 28, 78 24" stroke="#2e3a4e" stroke-width="5" stroke-linecap="round" fill="none"/>
            </g>
            
            <!-- Moving Interactive Eyes -->
            <ellipse class="h-eye" cx="28" cy="35" rx="7" ry="9" fill="white"/>
            <circle class="h-pupil" cx="28" cy="35" r="4.2" fill="#1D1D1F"/>
            
            <ellipse class="h-eye" cx="52" cy="35" rx="7" ry="9" fill="white"/>
            <circle class="h-pupil" cx="52" cy="35" r="4.2" fill="#1D1D1F"/>
            
            <!-- Ultra-Chic Gold Stylist Glasses -->
            <circle cx="28" cy="35" r="9" fill="none" stroke="#f59e0b" stroke-width="1.6"/>
            <circle cx="52" cy="35" r="9" fill="none" stroke="#f59e0b" stroke-width="1.6"/>
            <line x1="37" y1="35" x2="43" y2="35" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>
            
            <!-- Smiling / Excited Mouths -->
            <path class="h-mouth" id="charMouth" d="M32 52 Q40 58 48 52" stroke="#1D1D1F" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <ellipse class="h-mouth-excited" cx="40" cy="54" rx="6" ry="7" fill="#1D1D1F" opacity="0"/>
        </svg>
    </div>`;

    root.innerHTML = charSvg + `
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
            const data = await res.json();
            hideTyping();
            
            addMsg(data.response || transDict.chat_default_resp || "I'm styling your next smart outfit!", false);
        } catch (error) {
            hideTyping();
            addMsg(transDict.chat_error || "Oops! There was an issue reaching my AI database.", false);
        }
    }

    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
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
        
        const msgs = messages.querySelectorAll('.chatbot-msg.bot');
        const userMsgs = messages.querySelectorAll('.chatbot-msg.user');
        
        if (userMsgs.length === 0 && msgs.length > 0) {
            messages.innerHTML = '';
            addMsg(transDict.chat_greet_1, false);
            addMsg(transDict.chat_greet_2, false);
        }
    });
})();
