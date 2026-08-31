"""
Utility to create annotated NER samples for land records automatically.
Calculates character offsets, validates entity occurrences, prevents overlaps,
and formats into valid JSONL output.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Union

ALLOWED_LABELS = {
    "DISTRICT",
    "TALUKA",
    "VILLAGE",
    "SURVEY_NUMBER",
    "OWNER_NAME",
    "AREA",
    "LAND_HOLDING_TYPE"
}


def find_all_occurrences(text: str, substring: str) -> List[int]:
    """Find all starting indices of a substring in text."""
    indices = []
    start = 0
    while True:
        idx = text.find(substring, start)
        if idx == -1:
            break
        indices.append(idx)
        start = idx + 1
    return indices


def create_ner_sample(
    text: str,
    entities: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Creates an annotated NER sample dictionary from raw text and entity values.

    Each item in entities should be a dict with:
      - "value": str (the exact substring in text)
      - "label": str (must be in ALLOWED_LABELS)
      - "occurrence": int (optional 0-indexed occurrence index, default 0)

    Returns:
      {"text": text, "entities": [{"start": int, "end": int, "label": str}, ...]}
    """
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text must be a non-empty string.")

    annotated_entities = []

    for entity in entities:
        value = entity.get("value")
        label = entity.get("label")
        occ_index = entity.get("occurrence", entity.get("occurrence_index", 0))

        if not value or not isinstance(value, str):
            raise ValueError(f"Invalid or missing entity 'value': {entity}")

        if not label or label not in ALLOWED_LABELS:
            raise ValueError(
                f"Invalid entity label '{label}'. Allowed labels: {sorted(list(ALLOWED_LABELS))}"
            )

        occurrences = find_all_occurrences(text, value)
        if not occurrences:
            raise ValueError(
                f"Entity value '{value}' (label: {label}) was not found in the text."
            )

        if occ_index < 0 or occ_index >= len(occurrences):
            raise ValueError(
                f"Occurrence index {occ_index} out of range for entity '{value}'. "
                f"Found {len(occurrences)} occurrence(s)."
            )

        start = occurrences[occ_index]
        end = start + len(value)

        # Verify substring match
        extracted = text[start:end]
        if extracted != value:
            raise ValueError(
                f"Mismatch in calculated offset span: expected '{value}', got '{extracted}'"
            )

        annotated_entities.append({
            "start": start,
            "end": end,
            "label": label,
            "_value": value  # internal check tag
        })

    # Check for overlaps between any two entities
    annotated_entities.sort(key=lambda x: x["start"])

    for i in range(len(annotated_entities)):
        for j in range(i + 1, len(annotated_entities)):
            e1 = annotated_entities[i]
            e2 = annotated_entities[j]
            # Overlap condition: e1.end > e2.start and e1.start < e2.end
            if not (e1["end"] <= e2["start"] or e2["end"] <= e1["start"]):
                raise ValueError(
                    f"Overlapping entities detected:\n"
                    f"  Entity 1: '{e1['_value']}' [{e1['start']}:{e1['end']}] ({e1['label']})\n"
                    f"  Entity 2: '{e2['_value']}' [{e2['start']}:{e2['end']}] ({e2['label']})"
                )

    # Clean up internal tag and format final structure
    final_entities = [
        {
            "start": item["start"],
            "end": item["end"],
            "label": item["label"]
        }
        for item in annotated_entities
    ]

    return {
        "text": text,
        "entities": final_entities
    }


def save_to_jsonl(
    sample: Dict[str, Any],
    output_path: Union[str, Path],
    mode: str = "a"
) -> None:
    """Save or append a single NER sample to a JSONL file."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    json_line = json.dumps(sample, ensure_ascii=False)

    with open(output_path, mode, encoding="utf-8") as f:
        f.write(json_line + "\n")


if __name__ == "__main__":
    # Conceptual test / demonstration
    sample_text = "गाव:- अंबाजोगाई (रुरल) तालुका:- अंबाजोगाई जिल्हा:- बीड"
    sample_entities = [
        {"value": "अंबाजोगाई (रुरल)", "label": "VILLAGE"},
        {"value": "अंबाजोगाई", "label": "TALUKA", "occurrence": 1},  # 2nd occurrence in text
        {"value": "बीड", "label": "DISTRICT"}
    ]

    res = create_ner_sample(sample_text, sample_entities)
    print("Generated sample:")
    print(json.dumps(res, ensure_ascii=False, indent=2))
