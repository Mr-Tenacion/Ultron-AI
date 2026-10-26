# ULTRON + Gemini secure backend

## What this does
- Serves the ULTRON HTML interface and `/api/chat` from one origin.
- Calls Gemini from Node.js; the private API key stays in `.env`, not in browser HTML.
- Includes basic API rate limiting and input length checks.

## Setup on a computer with Node.js installed
1. Install Node.js (LTS) from https://nodejs.org/
2. Extract this folder.
3. Copy `.env.example` to a file named `.env`.
4. Open `.env` and replace `PASTE_YOUR_PRIVATE_GEMINI_KEY_HERE` with your own key from https://aistudio.google.com/apikey.
5. Open a terminal in this folder and run:
   ```bash
   npm install
   npm start
   ```
6. On that computer, open http://localhost:3000
7. On your phone on the same Wi-Fi, open `http://COMPUTER-LAN-IP:3000` (replace with your computer's local IP). Allow the computer firewall to accept port 3000 only on a trusted private network.

## Important
- Do not paste the key into `public/index.html`, commit `.env`, or share the `.env` file.
- The server must be running and reachable for AI chat to work.
- This backend does not make the HTML's native Android controls work; those still require a separate Android WebView bridge.
- `gemini-2.5-flash` is the default model. If your Google AI Studio project doesn't have access to it, set `GEMINI_MODEL` in `.env` to a currently available model for your account.
- Do not expose this development server directly to the public internet. For public hosting, add authentication, HTTPS, stronger abuse protection, and usage monitoring.
