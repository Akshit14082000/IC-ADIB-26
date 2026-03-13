// API Key will be loaded from .env for local security
let DEEPSEEK_API_KEY = null;

async function loadConfig() {
    try {
        const resp = await fetch('.env');
        if (resp.ok) {
            const text = await resp.text();
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.startsWith('DEEPSEEK_API_KEY=')) {
                    DEEPSEEK_API_KEY = line.split('=')[1].trim();
                    console.log('ADIB Assistant: API Key loaded from .env');
                    break;
                }
            }
        }
    } catch (err) {
        console.warn('ADIB Assistant: Local .env could not be loaded. Ensure it exists for local testing.');
    }
}

const SYSTEM_PROMPT = `
You are ADIB Assistant, the official AI assistant for 
IC ADIB-26 — the International Conference on Advances 
in Sustainable Development, Innovation and Business, 
hosted by IIT(ISM) Dhanbad on 18-19 September 2026.

You answer questions helpfully, concisely, and accurately 
using only the information below. If asked something not 
covered, say "I don't have that information yet. Please 
contact icadib26@iitism.ac.in for help."

Keep responses short (2-4 sentences max). Use bullet 
points only when listing multiple items. Be friendly 
and professional.

=== CONFERENCE INFORMATION ===

BASIC DETAILS:
- Full name: International Conference on Advances in 
  Sustainable Development, Innovation and Business
- Short name: IC ADIB-26
- Dates: 18-19 September 2026
- Pre-Conference: 17 September 2026
- Venue: IIT(ISM) Dhanbad, Jharkhand 826004, India
- Mode: Hybrid (Online + Offline)
- Organised by: Department of Management Studies & 
  Industrial Engineering, IIT(ISM) Dhanbad
- Contact email: icadib26@iitism.ac.in

IMPORTANT DATES:
- Abstract Submission Deadline: 15 May 2026
- Notification of Abstract Acceptance: 15 June 2026
- Full Paper Submission Deadline: 15 July 2026
- Notification of Full Paper Acceptance: 30 July 2026
- Early Bird Registration Deadline: 15 August 2026
- Pre-Conference Seminar: 17 September 2026
- Conference Dates: 18-19 September 2026

REGISTRATION FEES (all + 18% GST):
- Research Scholars/Students: 
    Early Bird: INR 4,500 | Regular: INR 5,500
- Faculty Members: 
    Early Bird: INR 6,000 | Regular: INR 8,000
- Industry Participants: 
    Early Bird: INR 10,000 | Regular: INR 12,000
- International Participants: 
    Early Bird: USD 200 | Regular: USD 250
- International (Video Only): 
    Early Bird: USD 150 | Regular: USD 200
- Delegates/Accompanying Persons: INR 6,000

Pre-conference workshop only: INR 2,500 + 18% GST
Pre-conference is FREE for registered participants.
Accommodation on campus available.

PAYMENT DETAILS:
- Account Name: IIT ISM CEP ACCOUNT
- Account Number: 110261358281
- Bank: Canara Bank
- IFS Code: CNRB0000986
- SWIFT Code: CNRBINBBBFD

CONFERENCE TRACKS (10 total):
1. Sustainable Strategy and Corporate Governance
2. AI, Analytics, and Digital Transformation
3. Sustainability, ESG, and Responsible Management
4. Human Resource Management and Future of Work
5. Marketing, Consumer Analytics & Sustainable Value Creation
6. Operations, Supply Chain, and Industry 5.0
7. Finance, Accounting, and FinTech for Sustainability
8. Innovation, Entrepreneurship, and Startups
9. Public Policy, Governance, and Smart Cities
10. Global Business, Ethics, and Cross-Cultural Management

PUBLICATION:
- Full papers (if accepted): Scopus indexed journal
- Extended abstracts (accepted + registered): 
  Published in conference proceedings

ORGANIZING COMMITTEE:
- Chief Patron: Prof. Prem Vrat (Chairperson, BoG)
- Patron: Prof. Sukumar Mishra (Director, IIT ISM)
- Co-Patron: Prof. Dheeraj Kumar (Dy. Director)
- Chairperson: Prof. Sandeep Mondal (HOD, DMS&IE)
- Convenor: Prof. Himanshu Gupta 
- Co-Convenor: Prof. Shashank Bansal 
- Organizing Secretary: Prof. Preeti Roy 

TRAVEL TO DHANBAD:
- Nearest Railway Station: Dhanbad Junction (~3 km)
- Nearest Airport: Birsa Munda Airport Ranchi (~180 km)

HOTELS NEAR CAMPUS:
Kings Resort, TMG, Clarks Inn Suites, Wedlock Greens, etc.
`;

let conversationHistory = [];
let isWelcomeShown = false;

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    const container = document.getElementById('chatbot-container');
    if (!container) return;

    // Inject HTML
    container.innerHTML = `
        <button class="chat-trigger" id="chat-trigger">
            <span class="chat-tooltip">Ask about IC ADIB-26</span>
            <i data-lucide="message-circle"></i>
        </button>

        <div class="chat-window" id="chat-window">
            <div class="chat-header">
                <div class="chat-avatar">A</div>
                <div class="chat-header-info">
                    <div class="chat-header-name">ADIB Assistant</div>
                    <div class="chat-header-status">Online · Powered by DeepSeek</div>
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
            showBotMessage("👋 Hi! I'm ADIB Assistant. I can help you with registration fees, submission guidelines, travel info, important dates, and more about IC ADIB-26. What would you like to know?");
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

        showTypingIndicator();
        
        const response = await getBotResponse(text);
        removeTypingIndicator();
        showBotMessage(response);
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
            console.error('ADIB Assistant: No API Key found.');
            return "I'm sorry, my API Key is not configured correctly in the .env file. Please ensure it's set up.";
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
