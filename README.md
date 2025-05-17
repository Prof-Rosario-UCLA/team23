# FlashMind: AI-Powered Flashcard Generator

FlashMind is a two-pane React application that helps students convert lecture notes into interactive flashcards using AI. The left side is a note entry panel, and the right side presents navigable, flippable flashcards.

**Features**  
✍️ Paste lecture notes and generate flashcards instantly  
🔁 Flip cards to reveal answers  
⬅️➡️ Navigate between questions  
🎨 Clean, responsive Tailwind-styled UI  
🧪 Switch between live OpenAI and dummy local generation

**Tech Stack**  
Frontend: React + TypeScript + Tailwind CSS + Vite  
Backend: Node.js + Express + TypeScript  
AI: OpenAI (ChatGPT) API

**Getting Started**

- Prerequisite: Node.js ≥ 18

1. Clone the repo

       git clone https://github.com/your-username/flashmind.git
       cd flashmind

2. Setup the frontend

       cd flashmind-ui
       npm install
       npm run dev

   App runs at: http://localhost:5173

3. Setup the backend

       cd flashmind-app
       npm install
       cp .env.example .env   # Add your OPENAI_API_KEY here
       npm run dev

   API runs at: http://localhost:3001

**Development Notes**  
- API logic lives in `src/api/flashcards.ts`  
- Main interface is under `src/features/FlashcardPage/`  
- Switch between dummy and real OpenAI calls inside `flashcards.ts`
