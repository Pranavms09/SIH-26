# Doc2Digital Local NER Annotator

Lightweight web-based annotation tool for converting raw OCR land-record outputs into validated ground-truth NER dataset entries.

## How to Launch

From the `backend/` directory, execute:

```bash
python tools/annotator/app.py
```

Then open your browser at:
`http://127.0.0.1:8000`

## Annotation Workflow

1. **Select Raw Sample**: Pick an unannotated (`raw`) sample from the left sidebar list (populated from `data/ner/raw/manifest.json`).
2. **Highlight Text**: Select the target entity substring directly in the OCR text panel. The character offsets (`start`, `end`) will be calculated automatically.
3. **Select Entity Label**: Choose one of the 7 supported field labels:
   - `DISTRICT`
   - `TALUKA`
   - `VILLAGE`
   - `SURVEY_NUMBER`
   - `OWNER_NAME`
   - `AREA`
   - `LAND_HOLDING_TYPE`
4. **Add Entity**: Click `[+ Add Annotation]`. The tool prevents overlapping spans automatically.
5. **Save Annotation**: Click `[✓ Save Annotation]`.
   - Validates the dataset line.
   - Appends/updates the entry in `data/ner/land_records.jsonl`.
   - Re-audits global dataset integrity via `tools/validate_ner_dataset.py`.
   - Updates sample status in `data/ner/raw/manifest.json` (`raw` → `annotated`).
   - Keeps `data/ner/raw/<document_id>.json` untouched as immutable source data.
