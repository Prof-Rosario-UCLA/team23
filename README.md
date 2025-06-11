# FlashMind: AI-Powered Flashcard Generator

FlashMind is a full-stack web application that lets students convert lecture notes into interactive flashcards using AI. It features a note entry interface and a flashcard viewer with flip-and-review functionality.

## ✨ Features

- ✍️ Paste lecture notes and generate flashcards via GPT-4o-mini
- 📚 Organize content into chats, lectures, and card sets
- 🔁 Flip flashcards and mark known/review status
- ⚡ Redis-backed caching for faster response times
- 🌐 Monolithic Docker image deployable to GKE

## 🧪 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **AI Integration**: OpenAI GPT-4o-mini
- **Database**: MongoDB
- **Caching**: Redis
- **Deployment**: Docker + Google Cloud Build + GKE

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js ≥ 18
- Redis running locally (default: `localhost:6379`)
- MongoDB running locally (default: `localhost:27017`)
- OpenAI API key

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/flashmind.git
cd flashmind
```

### 2. Start the Frontend

```bash
cd flashmind-ui
npm install
npm run dev
```

App runs at: [http://localhost:5173](http://localhost:5173)

### 3. Start the Backend

```bash
cd flashmind-app
npm install
cp .env.example .env  # or create a .env file with the variables below
npm run dev
```

API runs at: [http://localhost:3001](http://localhost:3001)

## 🔐 Environment Variables

In `flashmind-app/.env`:

```env
OPENAI_API_KEY=your_openai_key
MONGODB_URI=mongodb://localhost:27017/flashmind
JWT_SECRET=your_secret_key
```

## 🐳 Docker Build (Monolithic Image)

The app uses a 3-stage Dockerfile:

1. Build frontend (`flashmind-ui`)
2. Build backend (`flashmind-app`) and copy static frontend assets
3. Serve everything from Node.js on port `3001`

## ☁️ Deployment (GKE via Cloud Build)

1. Build and tag the Docker image:

   ```yaml
   - docker build -t ... .
   ```

2. Push to Artifact Registry

3. Apply Kubernetes manifests:
   ```yaml
   - kubectl apply -f kubernetes/
   - kubectl set image deployment/flashmind ...
   ```

All steps are defined in `cloudbuild.yaml` and triggered by Cloud Build.

## 🧠 API Reference

### 🔄 Generate Flashcards

#### `POST /api/generate`

Generate flashcards from lecture notes using GPT-4o-mini.

```json
Request:
{ "notes": "Photosynthesis is the process by which..." }
Response:
{ "cards": [ { "front": "...", "back": "..." } ] }
```

#### `POST /api/generate/dummy`

Returns static test flashcards for development.

### 📁 Chats

#### `GET /api/chats`

Returns all chats for the authenticated user.

#### `POST /api/chats`

Creates a new chat.

```json
{ "name": "Biology Review" }
```

### 📚 Lectures

#### `GET /api/chats/:chatId/lectures`

Get all lectures within a chat.

#### `POST /api/chats/:chatId/lectures`

Create a lecture under a specific chat.

```json
{ "lecture": "Chapter 1 Notes" }
```

#### `PATCH /api/chats/:chatId/lecture/:lectureId`

Update the notes for a lecture.

```json
{ "notes": "Updated lecture notes..." }
```

#### `GET /api/chats/:chatId/lecture/:lectureId`

Fetch a single lecture and all associated flashcards.

### 🧾 Flashcards

#### `GET /api/chats/:chatId/lecture/:lectureId/flashcards`

Returns all flashcards for a given lecture.

#### `POST /api/chats/:chatId/lecture/:lectureId/flashcards`

Insert multiple flashcards.

```json
{ "flashcards": [{ "front": "...", "back": "..." }] }
```

#### `PATCH /api/chats/:chatId/lecture/:lectureId/flashcards/:flashcardId`

Update flashcard review status.

```json
{ "isKnown": true, "isReview": false }
```

## 🧠 Caching Strategy

- **Redis** used for read-heavy endpoints (e.g., `/lectures`, `/flashcards`, `/generate`)
- Cache keys follow naming like `lecture:<lectureId>` or `flashcards_generated:<notes>`
- TTL is 10 minutes (600 seconds) per key

## 🛠 Development Notes

- Switch between dummy and real AI calls in `generate.routes.ts`
- Auth handled by middleware in `middleware/auth.ts`
- Main UI lives under `flashmind-ui/src/`
- Backend API is in `flashmind-app/src/routes/`
