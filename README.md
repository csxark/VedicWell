# VedicWell — AI-Powered Ayurvedic Wellness Platform

A production-grade Ayurvedic wellness platform combining ancient holistic health wisdom with modern machine learning inference, real-time consultation AI, and cloud persistence.

---

## 🌟 Key Features

- **XGBoost ML Dosha Assessment**: 11 clinical assessment questions analyzed via an XGBoost classification model hosted on Railway Cloud, providing primary & secondary Dosha constitution scores and key trait insights.
- **Zero-Barrier Guest Assessment**: Unauthenticated visitors can complete the assessment freely. Results are securely cached and synchronized to their permanent account upon signing up or logging in.
- **Dynamic Personalized Dashboard**: Daily Ayurvedic lifestyle rituals, dietary recommendations, herbal guidance, and yoga/pranayama practices adapted dynamically to your dominant and secondary Dosha.
- **AI Symptom Checker**: Integrated consultation chatbot powered by Google Gemini via Supabase Edge Functions, delivering personalized holistic guidance aligned with your constitution.
- **Dual-Strategy Persistence & Cold-Start Resilience**: Seamless retry mechanisms, rule-based fallback heuristics, and automated Railway cold-boot waking logic to ensure zero user disruption.

---

## 🏗️ Technology Architecture

```
                    ┌─────────────────────────────────────────┐
                    │      Railway Cloud (FastAPI Service)     │
                    │                                         │
                    │  • Python 3.12 + FastAPI + Uvicorn      │
                    │  • Trained XGBoost Classifier           │
                    │  • /predict, /health, /current-dosha,   │
                    │    /recommendations                     │
                    └────────────────────┬────────────────────┘
                                         ▲
                                         │ REST + Supabase JWT
                                         ▼
┌────────────────────────────────────────┴─────────────────────────────────────────┐
│                           Client Web App (React 18)                              │
│                                                                                  │
│  • TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion                       │
│  • guestDoshaCache (versioned local storage + claim state management)            │
│  • doshaService (Supabase direct persistence + profile synchronizer)             │
│  • doshaApi (ML client with cold-start awakening & local fallback)               │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         ▲
                                         │ Supabase Client SDK
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │             Supabase Cloud              │
                    │                                         │
                    │  • PostgreSQL with Row Level Security   │
                    │  • claim_guest_assessment() RPC         │
                    │  • Auth & User Management               │
                    │  • Edge Functions (Symptom Checker)     │
                    └─────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for backend development)

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/csxark/pbl_project.git
cd pbl_project

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials and backend API URL

# Start frontend dev server
npm run dev
```

### 3. Backend (FastAPI ML Service) Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8000
```

---

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
npm test
```
Runs 30 unit and integration tests covering:
- Assessment question schema validation
- Heuristic scoring accuracy for Vata, Pitta, and Kapha
- Guest cache lifecycle, staleness expiration, and idempotency

### Backend Tests (Pytest)
```bash
cd backend
pytest test_main.py -v
```
Runs 11 test suites covering:
- XGBoost prediction accuracy and edge case inputs
- Rule-based fallback handling
- Healthcheck and model readiness
- CORS preflight handlers
- Authenticated `/current-dosha` and `/recommendations` endpoints

---

## 🚢 Deployment Documentation

Detailed deployment procedures, environment variable references, and operational runbooks are available in the `docs/` directory:
- [API Contract](docs/API_CONTRACT.md)
- [Integration Plan & Audit](docs/INTEGRATION_PLAN.md)
- [Deployment & Operations Guide](docs/DEPLOYMENT_AND_TESTING.md)

---

## 📄 License
This project is for educational and wellness purposes.