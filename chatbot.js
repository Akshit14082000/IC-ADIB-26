// Sakshi - Static Intelligent Assistant Logic
let userName = null;
let awaitingName = false;
let isWelcomeShown = false;
let conversationHistory = [];

const KNOWLEDGE_BASE = {
    greetings: {
        keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'evening', 'sakshi'],
        responses: [
            "Hi there! I'm Sakshi. How can I help you with IC ADIB-26 today?",
            "Hello! Sakshi here. Ready to assist you with any conference queries!",
            "Hey! So glad you're here. How is your day going? Need help with the conference?"
        ]
    },
    dates: {
        keywords: ['date', 'deadline', 'when', 'timeline', 'last date', 'schedule', 'submission'],
        responses: [
            "Mark your calendars! The Abstract submission is due by **May 15**, and Full Papers by **July 15**. The conference itself is on **Sept 18-19, 2026**.",
            "Key dates to remember: Abstract Deadline (May 15), Full Paper (July 15), and Conference Days (Sept 18-19)."
        ]
    },
    venue: {
        keywords: ['venue', 'location', 'where', 'address', 'place', 'iit', 'dhanbad', 'ism'],
        responses: [
            "The conference is hosted at the prestigious **IIT (ISM) Dhanbad**, Jharkhand. It's a beautiful campus with great facilities!",
            "We are gathering at **IIT (ISM) Dhanbad**. Would you like me to show you how to reach the venue?"
        ]
    },
    registration: {
        keywords: ['register', 'fee', 'cost', 'price', 'payment', 'money', 'registration', 'gst', 'early bird'],
        responses: [
            "Registration fees vary from ₹4,500 for students to ₹12,000 for industry experts (+18% GST). Early bird discounts are available until **Aug 15**!",
            "You can register via the official form. Fees start at ₹4,500 for students. Need the detailed fee structure?"
        ]
    },
    tracks: {
        keywords: ['track', 'topic', 'subject', 'area', 'research', 'ai', 'sustainability', 'fintech'],
        responses: [
            "We have 10 exciting tracks including AI, Sustainability, Marketing, and Fintech. You'll find a complete list on the 'Tracks' page!",
            "The conference covers a wide range of topics from Sustainable Development to Innovation in Business. There's something for every researcher!"
        ]
    },
    publication: {
        keywords: ['publish', 'journal', 'scopus', 'index', 'paper', 'proceedings'],
        responses: [
            "Great news! All accepted full papers will be published in **Scopus-indexed journals**. High-quality research is our priority!",
            "Full papers are eligible for publication in reputed Scopus journals after a peer-review process."
        ]
    },
    contact: {
        keywords: ['contact', 'email', 'help', 'support', 'organizer', 'reach out', 'number'],
        responses: [
            "You can reach the organizing team at **icadib26@iitism.ac.in**. For comprehensive details, please refer to the documents in our **pdf folder**.",
            "For any specific queries, feel free to email **icadib26@iitism.ac.in**. You can also find all official info in the `pdf/conference_brochure.pdf` brochure."
        ]
    },
    travel: {
        keywords: ['travel', 'reach', 'airport', 'train', 'station', 'flight', 'how to'],
        responses: [
            "Dhanbad Junction is just 3km away. Full travel and accommodation details are available in the **Official Brochure (pdf folder)**. I can help with hotel info too!",
            "The easiest way is by train to Dhanbad Junction. Check the `pdf/conference_brochure.pdf` for a detailed travel guide."
        ]
    },
    docs: {
        keywords: ['pdf', 'document', 'brochure', 'guide', 'info', 'details', 'download'],
        responses: [
            "You can find all official information and the conference brochure in our **pdf folder**. I highly recommend checking `conference_brochure.pdf` for the most accurate details!",
            "All session details and official guidelines are in the **pdf/conference_brochure.pdf**. Would you like me to help you find something specific in there?"
        ]
    }
};

const DEFAULT_RESPONSES = [
    "That's a good question! I'm not entirely sure about that specific detail, but I can tell you about our dates, venue, or registration fees!",
    "I'm still learning! Could you try asking about the conference dates, tracks, or location?",
    "I want to make sure I give you accurate info. Feel free to ask about the submission deadlines or how to register!"
];

document.addEventListener('DOMContentLoaded', () => {
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
            <div class="chat-chips" id="chat-chips"></div>

            <div class="chat-input-row">
                <textarea id="chat-input" placeholder="Ask anything about IC ADIB-26..." rows="1"></textarea>
                <button class="chat-send" id="chat-send" disabled>
                    <i data-lucide="send"></i>
                </button>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const trigger = document.getElementById('chat-trigger');
    const windowEl = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chat-messages');
    const chipsContainer = document.getElementById('chat-chips');

    const PAGE_CONTEXTS = {
        'index.html': { greeting: "Welcome to IC ADIB-26! I'm Sakshi. Ready to explore our tracks and dates?", chips: ["📅 Key Dates", "📚 Tracks", "💰 Registration", "🏫 Venue", "📄 Download Brochure"] },
        'register.html': { greeting: "Ready to join us? I'm Sakshi—I can help with fees or the registration process!", chips: ["💰 Fees", "⏰ Deadlines", "📝 Register", "💳 Payment", "📄 Download Brochure"] },
        'travel.html': { greeting: "Planning your trip? I'm Sakshi! I can guide you on travel and stays.", chips: ["📍 Location", "🏨 Hotels", "🚆 Train", "✈️ Airport", "📄 Download Brochure"] },
        'default': { greeting: "👋 Hi! I'm Sakshi. How can I help you with IC ADIB-26?", chips: ["📅 Dates", "💰 Fees", "📚 Tracks", "📍 Venue", "📄 Download Brochure"] }
    };

    function getPageContext() {
        const page = window.location.pathname.split("/").pop() || 'index.html';
        return PAGE_CONTEXTS[page] || PAGE_CONTEXTS['default'];
    }

    trigger.addEventListener('click', () => {
        windowEl.classList.add('active');
        if (!isWelcomeShown) {
            const context = getPageContext();
            setTimeout(() => {
                showBotMessage(context.greeting);
                setTimeout(() => {
                    showBotMessage("Before we start, may I know your name?");
                    awaitingName = true;
                }, 1000);
            }, 600);
            isWelcomeShown = true;
        }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.remove('active'));

    function renderSuggestions(chips) {
        chipsContainer.innerHTML = '';
        if (!chips?.length) { chipsContainer.style.display = 'none'; return; }
        chipsContainer.style.display = 'flex';
        chips.forEach(text => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerText = text;
            chip.onclick = () => { 
                if (text.includes('Download Brochure')) {
                    window.open('pdf/conference_brochure.pdf', '_blank');
                    return;
                }
                input.value = text.replace(/^[^\w]+/, '').trim(); 
                handleSend(); 
            };
            chipsContainer.appendChild(chip);
        });
        scrollToBottom();
    }

    input.oninput = () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        sendBtn.disabled = !input.value.trim();
    };

    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;
        addUserMessage(text);
        input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;
        renderSuggestions([]);

        if (awaitingName) {
            userName = text; awaitingName = false;
            setTimeout(() => {
                showBotMessage(`Nice to meet you, ${userName}! How can I help you today?`);
                renderSuggestions(getPageContext().chips);
            }, 800);
            return;
        }

        setTimeout(() => {
            showTypingIndicator();
            const response = getStaticResponse(text);
            setTimeout(() => {
                removeTypingIndicator();
                showBotMessage(response);
                updateSuggestions(response);
            }, Math.min(Math.max(response.length * 10, 800), 2000));
        }, 300);
    };

    sendBtn.onclick = handleSend;
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    function getStaticResponse(query) {
        query = query.toLowerCase();
        let bestMatch = null;
        let maxKeywords = 0;

        for (const cat in KNOWLEDGE_BASE) {
            const count = KNOWLEDGE_BASE[cat].keywords.filter(k => query.includes(k)).length;
            if (count > maxKeywords) {
                maxKeywords = count;
                bestMatch = cat;
            }
        }

        if (bestMatch) {
            const resps = KNOWLEDGE_BASE[bestMatch].responses;
            let finalMsg = resps[Math.floor(Math.random() * resps.length)];
            if (userName) finalMsg = finalMsg.replace('Hi there', `Hi ${userName}`);
            return finalMsg;
        }
        return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
    }

    function updateSuggestions(response) {
        const lower = response.toLowerCase();
        if (lower.includes('venue') || lower.includes('location')) renderSuggestions(["📍 Open in Maps", "🏨 Hotels", "🚆 Travel Info"]);
        else if (lower.includes('date') || lower.includes('deadline')) renderSuggestions(["💰 Fees", "📝 Register", "📚 Tracks"]);
        else renderSuggestions(getPageContext().chips);
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.style = 'display:flex;flex-direction:column;';
        div.innerHTML = `<div class="msg msg-user">${text}</div><div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function showBotMessage(text) {
        const div = document.createElement('div');
        div.style = 'display:flex;flex-direction:column;';
        let richCardHtml = '';
        const lower = text.toLowerCase();
        if (lower.includes('iit (ism) dhanbad') || lower.includes('venue')) {
            richCardHtml = `<div class="rich-card"><img src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400" class="card-img"><div class="card-content"><h3>IIT (ISM) Dhanbad</h3><p>Dhanbad, Jharkhand</p><a href="https://maps.app.goo.gl/3wGv2rEqp6Z6XGzY7" target="_blank" class="card-link"><i data-lucide="map-pin"></i> Open in Maps</a></div></div>`;
        } else if (lower.includes('date') || lower.includes('deadline')) {
            richCardHtml = `<div class="rich-card timeline-card"><div class="card-content"><div class="timeline-item"><span>May 15</span> Abstract Due</div><div class="timeline-item"><span>Jul 15</span> Full Paper Due</div><div class="timeline-item"><span>Sep 18</span> Starts</div></div></div>`;
        }
        div.innerHTML = `<div class="msg msg-bot">${text}</div>${richCardHtml}<div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
        messagesContainer.appendChild(div);
        if (window.lucide) window.lucide.createIcons();
        scrollToBottom();
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.id = 'typing-indicator'; div.className = 'typing';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function removeTypingIndicator() { const ti = document.getElementById('typing-indicator'); if (ti) ti.remove(); }
    function scrollToBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }
});
