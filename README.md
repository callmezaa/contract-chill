# ContractChill 📑✨

> AI-Powered Legal Document Analyzer and Generator built to protect freelancers, creators, and small businesses from unfair agreements. Developed for the **#JuaraVibeCoding** hackathon.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-4F46E5?style=for-the-badge)](https://contract-chill-884974546946.asia-southeast1.run.app)

---

## 🔍 Features

*   **AI Threat Scan & Red Flags:** Instantly scans PDF agreements to highlight penalty traps, strict deadlines, and unfair clauses.
*   **Overall Risk Score Meter:** Visually rates the safety level of the contract.
*   **Interactive Contract Chat:** Ask questions directly to your contract to clarify complex terms without reading the entire document.
*   **Negotiation Script Generator:** Auto-generates polite yet assertive email/chat response drafts to renegotiate clauses using custom AI personas (e.g., Chill Friend, Strict Lawyer).
*   **AI Contract Generator:** Easily draft custom, legally-sound contracts (like NDA, Freelance Agreement, or Software Contract) in seconds based on your project parameters.
*   **Premium PDF Report Export:** Save and download styled, comprehensive legal analysis reports.

---

## 🛠️ Tech Stack

*   **Frontend:** React (TypeScript), Vite, Tailwind CSS, Framer Motion, `@react-pdf-viewer`
*   **Backend:** Node.js (Express, TypeScript), Multer, PDF-Parse
*   **AI Engine:** Google Gemini API
*   **Authentication & Database:** Firebase Auth (Google Sign-In), Firestore, Firebase Cloud Storage
*   **Infrastructure:** Docker, Google Cloud Run (Serverless)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))
*   Firebase Project (Auth, Firestore, Cloud Storage enabled)

### Local Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/callmezaa/contract-chill.git
   cd contract-chill
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory using the variables in `.env.example`:*
   ```env
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Start the backend:*
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   *Create a `.env` file in the `client` directory:*
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *Start the frontend:*
   ```bash
   npm run dev
   ```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
