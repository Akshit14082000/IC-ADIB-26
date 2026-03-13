let DEEPSEEK_API_KEY = null;
let configError = null;

async function loadConfig() {
    try {
        if (window.location.protocol === 'file:') {
            configError = "protocol";
            console.warn('ADIB Assistant: Running via file:// protocol. Fetching .env is blocked by browser security.');
            return;
        }

        const resp = await fetch('config.env');
        if (resp.ok) {
            const text = await resp.text();
            const lines = text.split(/\r?\n/);
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith('#')) continue;
                
                const match = line.match(/^DEEPSEEK_API_KEY\s*=\s*(.*)$/);
                if (match) {
                    let value = match[1].trim();
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length - 1);
                    }
                    DEEPSEEK_API_KEY = value;
                    console.log('ADIB Assistant: API Key loaded successfully.');
                    return;
                }
            }
            configError = "parse";
        } else {
            configError = `fetch_${resp.status}`;
            console.error(`ADIB Assistant: Failed to load .env (Status: ${resp.status})`);
        }
    } catch (err) {
        configError = "error";
        console.error('ADIB Assistant: Error loading .env:', err);
    }
}

const SYSTEM_PROMPT = `
You are Sakshi, a friendly and highly professional human assistant for IC ADIB-26 (the International Conference on Advances in Sustainable Development, Innovation and Business). 

Your goal is to make every visitor feel welcome and supported. Use a warm, enthusiastic, and empathetic tone. 

PERSONALITY & BEHAVIOR:
- Your name is Sakshi. ALWAYS refer to yourself as Sakshi.
- Talk like a person: Use "I," "me," and "my." 
- If you know the user's name (it will be provided in the history), use it naturally in conversation to make it feel personalized.
- Be empathetic: If someone is confused about fees or dates, reassure them. 
- Avoid robotic dumping of data: Use natural transitions.
- Concise but soulful: 2-3 sentences usually.

CONFERENCE KNOWLEDGE BASE (18-19 Sept 2026):
- Venue: IIT(ISM) Dhanbad, Jharkhand.
- Key Dates: Abstract due 15 May, Full Paper 15 July. Early bird ends 15 Aug.
- Fees (+18% GST): Students (4.5k-5.5k), Faculty (6k-8k), Industry (10k-12k).
- International: $200-$250 ($150-$200 video only).
- Tracks: 10 tracks covering AI, Sustainability, Marketing, Fintech, etc.
- Travel: Dhanbad Junction (3km), Ranchi Airport (180km).
- Publication: Scopus indexed journals for full papers.
- Contact: icadib26@iitism.ac.in.

Always end with a helpful nudge like "I'm here for you, [User's Name]!" or "Let me know what else you'd like to know!"
`;

let conversationHistory = [];
let isWelcomeShown = false;
let userName = null;
let awaitingName = false;

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    const container = document.getElementById('chatbot-container');
    if (!container) return;

    // Inject HTML
    container.innerHTML = `
        <button class="chat-trigger" id="chat-trigger">
            <span class="chat-tooltip">Ask Sakshi about IC ADIB-26</span>
            <i data-lucide="message-circle"></i>
        </button>

        <div class="chat-window" id="chat-window">
            <div class="chat-header">
                <div class="chat-avatar">S</div>
                <div class="chat-header-info">
                    <div class="chat-header-name">Sakshi</div>
                    <div class="chat-header-status">Online</div>
                </div>
                <button class="chat-close" id="chat-close">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="chat-messages" id="chat-messages"></div>

            <div class="chat-chips" id="chat-chips">
                <div class="chip">📅 Important Dates</div>
                <div class="chip">💰 Registration Fees</div>
                <div class="chip">🏨 Hotels Nearby</div>
                <div class="chip">📄 Submission Guide</div>
                <div class="chip">📍 How to Reach</div>
            </div>

            <div class="chat-input-row">
                <textarea id="chat-input" placeholder="Ask anything about IC ADIB-26..." rows="1"></textarea>
                <button class="chat-send" id="chat-send" disabled>
                    <i data-lucide="send"></i>
                </button>
            </div>
        </div>
    `;

    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const trigger = document.getElementById('chat-trigger');
    const windowEl = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chat-messages');
    const chipsContainer = document.getElementById('chat-chips');

    // Toggle Chat
    trigger.addEventListener('click', () => {
        windowEl.classList.add('active');
        if (!isWelcomeShown) {
            setTimeout(() => {
                showBotMessage("👋 Hi! I'm Sakshi, I'm here to help you with everything about the IC ADIB-26 conference.");
                setTimeout(() => {
                    showBotMessage("Before we start, may I know your name?");
                    awaitingName = true;
                }, 1000);
            }, 800);
            isWelcomeShown = true;
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        sendBtn.disabled = !input.value.trim();
    });

    // Send Message
    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;

        addUserMessage(text);
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        chipsContainer.style.display = 'none';

        // Check if we are awaiting name
        if (awaitingName) {
            userName = text;
            awaitingName = false;
            setTimeout(() => {
                showBotMessage(`It's so nice to meet you, ${userName}! How can I help you today?`);
            }, 800);
            return;
        }

        // Simulate thinking time for a more human feel
        setTimeout(async () => {
            showTypingIndicator();
            
            const response = await getBotResponse(text);
            
            // Minimum "typing" time based on response length
            const typingTime = Math.min(Math.max(response.length * 15, 1000), 3000);
            
            setTimeout(() => {
                removeTypingIndicator();
                showBotMessage(response);
            }, typingTime);
        }, 400);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Quick Reply Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.innerText.replace(/^[^\w]+/, '').trim();
            input.dispatchEvent(new Event('input'));
            handleSend();
        });
    });

    // Helper: Add User Bubble
    function addUserMessage(text) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.innerHTML = `
            <div class="msg msg-user">${text}</div>
            <div class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        messagesContainer.appendChild(row);
        scrollToBottom();
        conversationHistory.push({ role: "user", content: text });
    }

    // Helper: Add Bot Bubble
    function showBotMessage(text) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.innerHTML = `
            <div class="msg msg-bot">${text}</div>
            <div class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        messagesContainer.appendChild(row);
        scrollToBottom();
        conversationHistory.push({ role: "assistant", content: text });
        
        // Keep history at 10 turns (20 msgs) max
        if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);
    }

    // Helper: Typing Indicator
    function showTypingIndicator() {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'typing';
        div.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const ti = document.getElementById('typing-indicator');
        if (ti) ti.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // API Integration
    async function getBotResponse() {
        if (!DEEPSEEK_API_KEY) {
            if (configError === "protocol") {
                return "⚠️ **Security Restriction:** Browsers block reading local files when opened directly. Please use a **Local Server** (like Live Server).";
            }
            if (configError && configError.startsWith('fetch_')) {
                const status = configError.split('_')[1];
                return `❌ **Server Error (${status}):** Your local server is blocking the \`config.env\` file. Check your server settings.`;
            }
            if (configError === "parse") {
                return "❌ **Parsing Error:** Found \`config.env\` but couldn't find \`DEEPSEEK_API_KEY=\` inside it.";
            }
            return "❌ **Configuration Error:** API Key not found. Please ensure your \`config.env\` file exists and contains \`DEEPSEEK_API_KEY=your_key\`.";
        }
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...conversationHistory
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(error);
            return "Sorry, I'm having trouble connecting. Please email icadib26@iitism.ac.in for direct assistance.";
        }
    }
});
