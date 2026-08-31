# BhuLekha (भूलेख)

**Intelligent 7/12 Land Record Digitization & Authoritative Verification Platform**

BhuLekha is a full-stack land record processing solution built with a FastAPI backend and a Vite/React frontend. It automates OCR text extraction, layout cropping, rule-based field parsing, document complexity classification, and hybrid AI extraction using **Gemini 2.5 Flash**.

---

## 🏛️ System Architecture & Hybrid AI Pipeline

```
USER / BROWSER (Vite + React 19)
       │
       ▼
   POST /api/process?provider=gemini
       │
FASTAPI BACKEND
       │
  1. PDF / Image Page Preprocessing & OCR (Tesseract mar+eng)
       │
  2. Section Cropping & Initial Rule-based Field Extraction
       │
  3. Document Complexity Analysis (Scored & Classified)
       ├── Simple Document  ──► Rule-based OCR Extraction
       └── Complex Document ──► Gemini 2.5 Flash Vision Pipeline
                                       │ (if unavailable)
                                       └──► Local OCR Fallback
       │
  4. Authoritative Rule Validation & NER Sample Collector
       │
  5. JSON Response to Frontend
```

---

## 📁 Repository Structure

```
BhuLekha/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (upload, process)
│   │   ├── models/          # LandRecord Pydantic data model
│   │   ├── services/        # OCR, Gemini Vision, Groq, Complexity, Validation
│   │   └── config.py        # Environment configuration
│   ├── data/                # Reference locations & NER dataset
│   ├── tools/               # NER dataset generators & evaluators
│   ├── .env.example         # Template environment variables
│   ├── requirements.txt     # Python runtime dependencies
│   └── run_all_tests.py     # Master backend test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Shell, Sidebar, Topbar, Copilot
│   │   ├── pages/           # Documents, Verification, GIS, Records
│   │   ├── services/        # API client (http://127.0.0.1:8000)
│   │   ├── lib/             # Global AppContext
│   │   └── styles/          # Dark mode design tokens & global CSS
│   ├── .env.example         # Frontend API URL template
│   └── package.json         # Node dependencies
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Tesseract OCR (with `mar` & `eng` language packs)

### 1. Backend Setup

```bash
cd backend

# Create & activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY (never commit .env to version control!)
```

#### Start Backend Server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

---

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Frontend Development Server
npm run dev
```
- Web Interface: `http://localhost:5173`

---

## 🧪 Testing & Verification

Run the master backend regression test suite covering all 17 test modules:

```bash
cd backend
source venv/bin/activate
python run_all_tests.py
```

---

## 🔒 Security & Privacy

- **Server-Side API Keys**: `GEMINI_API_KEY` and `GROQ_API_KEY` reside exclusively in `backend/.env` on the backend server. No API keys are exposed to the browser or frontend bundle.
- **Document Privacy**: Uploaded 7/12 land record documents and OCR processing artifacts are excluded from Git tracking via `.gitignore`.
- **Marathi Language Integrity**: Unicode characters for Maharashtra land records (`बीड`, `अंबाजोगाई`, `विलासराव पाटील`, `0.24.00`) are preserved without transliteration or corrupted encoding.
