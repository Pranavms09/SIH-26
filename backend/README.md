# BhuLekha Backend & Hybrid Extraction Architecture

BhuLekha is an intelligent Maharashtra 7/12 land-record digitization, OCR, extraction, and verification system.

## Hybrid Extraction Architecture (Step 16)

BhuLekha combines local deterministic OCR rule-based extraction with Groq Cloud Vision LLM extraction via an explainable multi-signal routing engine.

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
           Path A: Rule-Based                Path B: Groq Vision
            OCR LandRecord                 LLM Image Extraction
           (0 Groq Calls)                           ↓
                  │                         AI Validation Adapter
                  │                                 ↓
                  │                      (Safe Fallback to Path A
                  │                       if Groq API fails/unconfigured)
                  └────────────────┬────────────────┘
                                   ↓
                           Final LandRecord
                                   ↓
                         Authoritative Validation
                                   ↓
                       POST /api/process Response
```

### Key Architectural Principles
1. **Explainable Multi-Signal Complexity Routing**: Documents are evaluated on 5 local signals (field completeness, validation warnings, layout/table line density, owner structure complexity, and text volume). Simple documents (`score < 0.50`) consume **0 Groq API calls**.
2. **Authoritative Validation Engine**: The existing `validation_service.py` is the final verification layer. AI confidence scores (`0.95`) cannot override validation errors (`possible_error`, `suspicious`, `invalid`).
3. **Zero AI Value Mutation**: Validation suggestions do not overwrite extracted AI values, preserving raw extraction provenance.
4. **Non-Destructive Degradation & Safe Fallback**: If a complex document is routed to Groq and Groq API fails (missing key, timeout, rate limit), the system gracefully falls back to local rule-based OCR (`source: "rule_based_ocr_fallback"`).

### Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Configure parameters:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_VISION_MODEL=qwen/qwen3.6-27b
```

### Running Tests

1. **Master Test Suite (All 15 Unit & Integration Suites)**:
   ```bash
   python run_all_tests.py
   ```
2. **Individual Hybrid Step Test Suites**:
   - `python test_groq_service.py` (Groq API foundation - Step 16A)
   - `python test_vision_extractor.py` (Groq Vision Extractor - Step 16B)
   - `python test_ai_validation.py` (AI Validation Adapter - Step 16C)
   - `python test_document_complexity.py` (Complexity Analyzer - Step 16D)
   - `python test_extraction_router.py` (Extraction Router - Step 16D)
   - `python test_api_hybrid.py` (End-to-End API Integration - Step 16E)
3. **Live Optional Connectivity & End-to-End Tests**:
   - `python test_groq_connection.py` (Live Groq API Ping)
   - `python test_vision_live.py` (Live Vision Extraction)
   - `python test_complexity_experiment.py` (Complexity Routing Diagnostics)
   - `python test_api_hybrid_live.py` (Live `/api/process` Endpoint Test)

### API Response Metadata (`POST /api/process`)
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
    "source": "rule_based_ocr" | "groq_vision" | "rule_based_ocr_fallback",
    "route": "ocr" | "groq"
  },
  "complexity": {
    "classification": "simple" | "complex",
    "score": 0.25,
    "threshold": 0.50,
    "reasons": [...]
  }
}
```
