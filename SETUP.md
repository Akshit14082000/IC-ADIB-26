# 🌸 Sakshi - Chatbot Setup Guide

Since this is a static website, the chatbot needs an API key to communicate with the AI. For security, the key is stored in a local file that is not pushed to GitHub.

## 🚀 How to fix the "Bot not working" issue:

### 1. Create the Config File
Navigate to the project root and create a new file named `config.env`.

### 2. Add the API Key
Open `config.env` and paste the following line, replacing the placeholder with the key you received:
```env
DEEPSEEK_API_KEY=your_actual_key_here
```

### 3. Run via a Local Server
**Important:** Browsers block reading local files (`config.env`) if you just double-click `index.html`. You MUST run the project using a local server:
- **VS Code:** Install the "Live Server" extension and click "Go Live".
- **Terminal:** Run `npx serve` or `python -m http.server`.

---

## 🛠️ Deployment to a Live Server
When you move this code to the IIT Dhanbad server:
1. Ensure the `config.env` file is present in the root folder.
2. Ensure the server allowed serving `.env` or `.config` files (or rename it to `config.json` and I can update the code to match).
