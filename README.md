# Integrated Web-Based Tourism Booking and Planning System in Dinagat Islands

A production-ready full-stack web application that consolidates travel discovery, interactive Leaflet.js maps, accommodation booking, transportation scheduling, AI-powered itinerary planners, operator portals, and administrative analytics reporting for the Dinagat Islands.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite) + Tailwind CSS + Leaflet.js / React-Leaflet + Chart.js + React Router
* **Backend (Firebase)**: Authentication, Firestore, Storage, Cloud Functions (Node.js)
* **AI Engine**: OpenAI API integrated through Cloud Functions

---

## 📂 Project Architecture

```
integrated-tourism-system/
├── client/                      # Vite + React Frontend Application
│   ├── src/
│   │   ├── components/         # Shared, Map, Chat, and Booking UI components
│   │   ├── pages/              # Home, Itinerary, Dashboards, and Reports pages
│   │   ├── services/           # Real Firebase services paired with Mock Fallback classes
│   │   └── contexts/           # Authentication state context
├── functions/                   # Firebase Cloud Functions (Backend APIs)
│   └── src/                     # AI Chatbots, Itinerary compilation, and Analytics triggers
├── firestore.rules              # Database security configurations
├── storage.rules                # Storage security configurations
└── firebase.json                # Project bindings and emulator ports
```

---

## ⚡ Setup & Local Development

### 1. Client Installation
Navigate to `/client`, install dependencies, and start the development server:
```bash
cd client
npm install
npm run dev
```

### 2. Backend Functions Setup
Navigate to `/functions`, install dependencies, and configure environment keys:
```bash
cd functions
npm install
```

### 3. Firebase Emulator Setup
Start local emulators for serverless testing:
```bash
firebase emulators:start
```

---

## ⚙️ Environment Configuration

### Client Environment Variables (`/client/.env`)
Create an environment file:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```
*(If these environment variables are missing, the client auto-activates **Mock LocalStorage Fallback**, loading beautiful pre-seeded mock data and simulating all operations locally.)*

### Backend environment variables (`/functions/.env`)
```env
OPENAI_API_KEY=your-openai-api-key
```
