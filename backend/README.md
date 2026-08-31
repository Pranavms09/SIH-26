# BhuLekha Backend & Hybrid Extraction Architecture

BhuLekha is an intelligent Maharashtra 7/12 land-record digitization, OCR, extraction, and verification system built with FastAPI, OpenCV, PyMuPDF, Tesseract OCR, and Gemini 2.5 Flash / Groq Vision integration.

## ⚙️ Prerequisites & Installation

### 1. System Dependencies (Tesseract OCR)

BhuLekha requires system-level Tesseract OCR with Marathi (`mar`) and English (`eng`) language packs for 7/12 document processing:

```bash
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-mar
```

### 2. Python Virtual Environment Setup

```bash
cd backend

# Create & activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install all backend Python dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Configure environment parameters in `backend/.env`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Primary AI Provider (gemini or groq)
PRIMARY_AI_PROVIDER=gemini
```

### 4. Running the Backend API Server

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

---

## 🏛️ Hybrid Extraction Architecture

BhuLekha combines local deterministic OCR rule-based extraction with Gemini 2.5 Flash / Groq Cloud Vision LLM extraction via an explainable multi-signal routing engine.

```
                           Uploaded PDF/Image
                                   ↓
                         PDF → Page Images (PyMuPDF)
                                   ↓
                         Tesseract OCR Extraction
                                   ↓
                      Rule-Based Section Extractor
                                   ↓
                         Authoritative Validation
                                   ↓
                       Document Complexity Analyzer
                                   ↓
                          Extraction Router
                                   ↓
                  ┌────────────────┴────────────────┐
                  ↓                                 ↓
               SIMPLE                            COMPLEX
          (Score < 0.50)                     (Score ≥ 0.50)
                  ↓                                 ↓
           Path A: Rule-Based               Path B: Gemini/Groq Vision
            OCR LandRecord                 LLM Image Extraction
           (0 AI API Calls)                         ↓
                  │                        AI Validation Adapter
                  │                                 ↓
                  │                      (Safe Fallback to Path A
                  │                       if AI API fails/unconfigured)
                  └────────────────┬────────────────┘
                                   ↓
                           Final LandRecord
                                   ↓
                         Authoritative Validation
                                   ↓
                       POST /api/process Response
```

### Key Architectural Principles
1. **Explainable Multi-Signal Complexity Routing**: Documents are evaluated on 5 local signals (field completeness, validation warnings, layout/table line density, owner structure complexity, and text volume). Simple documents (`score < 0.50`) consume **0 AI API calls**.
2. **Authoritative Validation Engine**: The existing `validation_service.py` is the final verification layer. AI confidence scores (`0.95`) cannot override validation errors (`possible_error`, `suspicious`, `invalid`).
3. **Zero AI Value Mutation**: Validation suggestions do not overwrite extracted AI values, preserving raw extraction provenance.
4. **Non-Destructive Degradation & Safe Fallback**: If a complex document is routed to AI and the API fails (missing key, timeout, rate limit), the system gracefully falls back to local rule-based OCR (`source: "rule_based_ocr_fallback"`).

---

## 🧪 Running Backend Tests

1. **Master Test Suite (All 17 Unit & Integration Suites)**:
   ```bash
   python run_all_tests.py
   ```
2. **Individual Integration Test Suites**:
   - `python test_gemini_integration.py` (Gemini 2.5 Flash Integration)
   - `python test_groq_service.py` (Groq API foundation)
   - `python test_ai_validation.py` (AI Validation Adapter)
   - `python test_document_complexity.py` (Complexity Analyzer)
   - `python test_extraction_router.py` (Extraction Router)
   - `python test_api_process.py` (End-to-End API Integration)
3. **Live Optional Connectivity Tests**:
   - `python test_gemini_connection.py` (Live Gemini API Ping)
   - `python test_groq_connection.py` (Live Groq API Ping)
   - `python test_api_hybrid_live.py` (Live `/api/process` Endpoint Test)

---

## 📊 API Response Metadata (`POST /api/process`)

The response maintains 100% backward compatibility while exposing diagnostic metadata:
```json
{
  "message": "Document processed successfully",
  "document_id": "...",
  "filename": "...",
  "pages": [...],
  "record": {...},
  "validation": {...},
  "extraction": {
    "source": "rule_based_ocr" | "gemini_vision" | "groq_vision" | "rule_based_ocr_fallback",
    "route": "ocr" | "gemini" | "groq"
  },
  "complexity": {
    "classification": "simple" | "complex",
    "score": 0.25,
    "threshold": 0.50,
    "reasons": [...]
  }
}
```
