"""
Dataset validator for Doc2Digital Land Record NER JSONL dataset.
Validates syntax, schemas, character boundaries, entity labels, and span overlaps.
"""

import json
import sys
from pathlib import Path
from typing import Union
from typing import List, Dict, Any, Tuple

ALLOWED_LABELS = {
    "DISTRICT",
    "TALUKA",
    "VILLAGE",
    "SURVEY_NUMBER",
    "OWNER_NAME",
    "AREA",
    "LAND_HOLDING_TYPE"
}


def validate_example(
    data: Any,
    line_number: int
) -> Tuple[bool, List[str], int]:
    """
    Validates a single parsed dataset example.
    Returns: (is_valid, list_of_error_strings, entity_count)
    """
    errors = []

    if not isinstance(data, dict):
        return False, [f"Line {line_number}: Root element is not a JSON object."], 0

    if "text" not in data:
        errors.append(f"Line {line_number}: Missing required key 'text'.")

    if "entities" not in data:
        errors.append(f"Line {line_number}: Missing required key 'entities'.")

    if errors:
        return False, errors, 0

    text = data["text"]
    entities = data["entities"]

    if not isinstance(text, str):
        errors.append(f"Line {line_number}: 'text' field must be a string.")

    if not isinstance(entities, list):
        errors.append(f"Line {line_number}: 'entities' field must be a list.")

    if errors:
        return False, errors, 0

    text_len = len(text)
    valid_entity_spans = []

    for idx, entity in enumerate(entities):
        if not isinstance(entity, dict):
            errors.append(
                f"Line {line_number}, Entity {idx}: Entity is not a JSON object."
            )
            continue

        start = entity.get("start")
        end = entity.get("end")
        label = entity.get("label")

        # Type checks (bool is subclass of int in Python)
        if not isinstance(start, int) or isinstance(start, bool):
            errors.append(
                f"Line {line_number}, Entity {idx}: 'start' must be an integer."
            )

        if not isinstance(end, int) or isinstance(end, bool):
            errors.append(
                f"Line {line_number}, Entity {idx}: 'end' must be an integer."
            )

        if label not in ALLOWED_LABELS:
            errors.append(
                f"Line {line_number}, Entity {idx}: Invalid label '{label}'. "
                f"Allowed: {sorted(list(ALLOWED_LABELS))}"
            )

        if isinstance(start, int) and not isinstance(start, bool) and \
           isinstance(end, int) and not isinstance(end, bool):

            if start < 0:
                errors.append(
                    f"Line {line_number}, Entity {idx}: 'start' index ({start}) cannot be negative."
                )

            if start >= end:
                errors.append(
                    f"Line {line_number}, Entity {idx}: 'start' ({start}) must be strictly less than 'end' ({end})."
                )

            if end > text_len:
                errors.append(
                    f"Line {line_number}, Entity {idx}: 'end' index ({end}) exceeds text length ({text_len})."
                )

            if 0 <= start < end <= text_len:
                valid_entity_spans.append((start, end, label, idx))

    # Check for overlapping spans
    valid_entity_spans.sort(key=lambda x: x[0])

    for i in range(len(valid_entity_spans)):
        for j in range(i + 1, len(valid_entity_spans)):
            s1, e1, l1, idx1 = valid_entity_spans[i]
            s2, e2, l2, idx2 = valid_entity_spans[j]

            # Overlap check
            if not (e1 <= s2 or e2 <= s1):
                span1_text = text[s1:e1]
                span2_text = text[s2:e2]
                errors.append(
                    f"Line {line_number}: Overlapping entities detected between entity {idx1} "
                    f"('{span1_text}' [{s1}:{e1}] label={l1}) and entity {idx2} "
                    f"('{span2_text}' [{s2}:{e2}] label={l2})."
                )

    is_valid = len(errors) == 0
    return is_valid, errors, len(entities)


def validate_dataset(filepath: Union[str, Path]) -> bool:
    """Validate full JSONL dataset file."""
    filepath = Path(filepath)

    if not filepath.exists():
        print(f"Error: Dataset file not found at {filepath}")
        return False

    total_examples = 0
    valid_examples = 0
    invalid_examples = 0
    total_entities = 0
    all_errors = []

    with open(filepath, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line_str = line.strip()
            if not line_str:
                continue

            total_examples += 1

            try:
                data = json.loads(line_str)
            except json.JSONDecodeError as e:
                invalid_examples += 1
                all_errors.append((line_num, f"Invalid JSON syntax: {str(e)}", line_str[:50]))
                continue

            is_valid, errors, entity_count = validate_example(data, line_num)

            if is_valid:
                valid_examples += 1
                total_entities += entity_count
            else:
                invalid_examples += 1
                for err in errors:
                    all_errors.append((line_num, err, data.get("text", "")[:50]))

    print("\n==========================================")
    print("      NER DATASET VALIDATION REPORT       ")
    print("==========================================")
    print(f"File Path:        {filepath}")
    print(f"Total examples:   {total_examples}")
    print(f"Valid examples:   {valid_examples}")
    print(f"Invalid examples: {invalid_examples}")
    print(f"Total entities:   {total_entities}")
    print("==========================================\n")

    if all_errors:
        print("ERRORS DETECTED:")
        for line_num, problem, snippet in all_errors:
            print(f"- Line {line_num}: {problem}")
            if snippet:
                print(f"  Text snippet: \"{snippet}...\"")
        print()
        return False
    else:
        print("SUCCESS: Dataset validation passed with 0 errors!\n")
        return True


if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/ner/land_records.jsonl"
    success = validate_dataset(target_file)
    if not success:
        sys.exit(1)
