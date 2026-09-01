# Land Record NER Dataset (Doc2Digital)

## Overview & Purpose

This directory contains the Named Entity Recognition (NER) dataset and raw data collection pipeline for extracting key land-record fields from OCR text of Maharashtra land records (7/12 Extract / Satbara Utara).

The dataset is designed to train and evaluate sequence labeling / NER models for land-record information extraction.

## Data Collection Pipeline Architecture

```text
PDF / Document Upload
        ↓
  OCR Engine
        ↓
   Raw Sample Collection (data/ner/raw/<document_id>.json)
        ↓
 Manual Entity Annotation (tools/create_ner_sample.py)
        ↓
 Validated JSONL Dataset (data/ner/land_records.jsonl)
        ↓
 Future NER Model Fine-Tuning & Evaluation
```

### Data Integrity Rules

1. **Real Data Only**: Raw samples must originate strictly from real land-record documents processed by the system.
2. **No Fabricated Data**: Fake or randomly generated records must NOT be added to the training or evaluation datasets.
3. **No Automatic Annotations**: Rule-based extractor outputs are stored alongside raw samples for diagnostic reference, but are NOT treated as automatic ground truth. Human annotation is required to verify and establish precise character entity spans.

## Directory Structure

- `land_records.jsonl`: Standard JSON Lines file containing validated ground-truth NER annotations.
- `raw/`: Directory containing raw OCR payloads saved during document processing.
  - `<document_id>.json`: Complete raw sample (OCR page text, rule-based extraction output, and validation results).
  - `manifest.json`: Index tracking all collected raw samples and their annotation status.

## Supported Entity Labels

The dataset supports 7 core target field labels:

1. `DISTRICT` - District name (e.g., बीड)
2. `TALUKA` - Taluka name (e.g., अंबाजोगाई)
3. `VILLAGE` - Village name (e.g., अंबाजोगाई (रुरल))
4. `SURVEY_NUMBER` - Survey number / Sub-division number (e.g., 312/2)
5. `OWNER_NAME` - Land owner name (e.g., विलासराव पाटील)
6. `AREA` - Land area in Hectare-R-SqM format (e.g., 0.24.00)
7. `LAND_HOLDING_TYPE` - Land tenure / holding classification (e.g., भोगवटादार वर्ग-1)

## Annotation Format

The dataset uses standard **JSON Lines (JSONL)** format:

```json
{
  "text": "गाव:- अंबाजोगाई (रुरल) (560022)\nतालुका:- अंबाजोगाई\nजिल्हा: बीड\n...",
  "entities": [
    {
      "start": 6,
      "end": 22,
      "label": "VILLAGE"
    },
    {
      "start": 41,
      "end": 50,
      "label": "TALUKA"
    }
  ]
}
```

- `text` (string): Full raw text extracted via OCR.
- `entities` (array of objects):
  - `start` (integer): 0-indexed starting character offset (inclusive).
  - `end` (integer): 0-indexed ending character offset (exclusive).
  - `label` (string): One of the supported entity labels.

## Validation & Tooling

- `tools/save_ner_raw_sample.py`: Reusable function to save raw OCR document outputs and update `raw/manifest.json`.
- `tools/create_ner_sample.py`: Converts raw text and entity values into character-indexed JSONL entries.
- `tools/validate_ner_dataset.py`: Audits JSON syntax, character offsets, non-overlapping spans, and label validity.
- `tools/evaluate_baseline.py`: Benchmarks rule-based extraction against ground-truth NER annotations.
