"""
Baseline evaluation system for Doc2Digital rule-based land-record extractor.
Compares ground truth NER annotations from land_records.jsonl against
rule-based predictions from land_record_extractor.py.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

from tools.validate_ner_dataset import validate_dataset, ALLOWED_LABELS
from app.services.land_record_extractor import extract_land_record
from app.models.land_record import LandRecord


FIELD_TO_LABEL_MAP = {
    "district": "DISTRICT",
    "taluka": "TALUKA",
    "village": "VILLAGE",
    "survey_number": "SURVEY_NUMBER",
    "owner_name": "OWNER_NAME",
    "area": "AREA",
    "land_holding_type": "LAND_HOLDING_TYPE"
}


def normalize_text(text: Optional[str]) -> Optional[str]:
    """
    Standard whitespace normalization.
    Trims leading/trailing whitespace and collapses repeated internal spaces.
    Does NOT modify Marathi characters, transliterate, or alter string content.
    """
    if text is None:
        return None
    text = str(text).strip()
    return " ".join(text.split())


def calculate_metrics(tp: int, fp: int, fn: int) -> Dict[str, float]:
    """Calculate precision, recall, and F1 score with safe zero division."""
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1
    }


def evaluate_baseline(
    dataset_path: str = "data/ner/land_records.jsonl"
) -> Dict[str, Any]:
    """Runs baseline evaluation over the dataset and prints formatted metrics."""
    dataset_file = Path(dataset_path)

    # 1. Validate dataset first
    print(">>> Validating NER dataset before baseline evaluation...")
    if not validate_dataset(dataset_file):
        raise ValueError(f"Dataset validation failed for {dataset_file}")

    # 2. Load dataset
    examples = []
    with open(dataset_file, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if line_str:
                examples.append(json.loads(line_str))

    num_examples = len(examples)
    sorted_labels = sorted(list(ALLOWED_LABELS))

    # Metrics trackers
    per_label_counts = {
        label: {"tp": 0, "fp": 0, "fn": 0} for label in sorted_labels
    }
    overall_counts = {"tp": 0, "fp": 0, "fn": 0}
    errors_list = []

    # 3. Process each document example
    for example_idx, example in enumerate(examples, start=1):
        text = example["text"]
        gt_entities = example["entities"]

        # Map ground-truth entities by label
        gt_map = {}
        for entity in gt_entities:
            label = entity["label"]
            start = entity["start"]
            end = entity["end"]
            raw_val = text[start:end]
            gt_map[label] = normalize_text(raw_val)

        # Run rule-based extractor
        extracted_record: LandRecord = extract_land_record(
            header_text=text,
            owner_text=text,
            crop_text=text
        )

        # Map predictions by label
        pred_map = {}
        for field_name, label in FIELD_TO_LABEL_MAP.items():
            field_obj = getattr(extracted_record, field_name, None)
            if field_obj and field_obj.value:
                pred_map[label] = normalize_text(field_obj.value)

        # Compare GT vs Pred for each supported entity label
        for label in sorted_labels:
            gt_val = gt_map.get(label)
            pred_val = pred_map.get(label)

            if gt_val is not None and pred_val is not None:
                if gt_val == pred_val:
                    per_label_counts[label]["tp"] += 1
                    overall_counts["tp"] += 1
                else:
                    per_label_counts[label]["fp"] += 1
                    per_label_counts[label]["fn"] += 1
                    overall_counts["fp"] += 1
                    overall_counts["fn"] += 1
                    errors_list.append({
                        "example": example_idx,
                        "label": label,
                        "expected": gt_val,
                        "predicted": pred_val,
                        "error_type": "WRONG_VALUE"
                    })
            elif gt_val is not None and pred_val is None:
                per_label_counts[label]["fn"] += 1
                overall_counts["fn"] += 1
                errors_list.append({
                    "example": example_idx,
                    "label": label,
                    "expected": gt_val,
                    "predicted": "None",
                    "error_type": "MISSING"
                })
            elif gt_val is None and pred_val is not None:
                per_label_counts[label]["fp"] += 1
                overall_counts["fp"] += 1
                errors_list.append({
                    "example": example_idx,
                    "label": label,
                    "expected": "None",
                    "predicted": pred_val,
                    "error_type": "EXTRA"
                })

    # 4. Compute overall & per-label metrics
    overall_metrics = calculate_metrics(
        overall_counts["tp"],
        overall_counts["fp"],
        overall_counts["fn"]
    )

    per_label_metrics = {}
    for label in sorted_labels:
        counts = per_label_counts[label]
        metrics = calculate_metrics(counts["tp"], counts["fp"], counts["fn"])
        per_label_metrics[label] = {
            "tp": counts["tp"],
            "fp": counts["fp"],
            "fn": counts["fn"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1": metrics["f1"]
        }

    # 5. Print Baseline Evaluation Report
    print("\n==========================================")
    print("       DOC2DIGITAL BASELINE EVALUATION    ")
    print("==========================================")
    print(f"\nDataset examples: {num_examples}")

    if num_examples < 5:
        print("\nWARNING: Dataset contains only 1 example.")
        print("Metrics are preliminary and not representative.")

    print("\n------------------------------------------")
    print("OVERALL METRICS")
    print("------------------------------------------")
    print(f"TP:        {overall_counts['tp']}")
    print(f"FP:        {overall_counts['fp']}")
    print(f"FN:        {overall_counts['fn']}")
    print(f"Precision: {overall_metrics['precision']:.2f}")
    print(f"Recall:    {overall_metrics['recall']:.2f}")
    print(f"F1 Score:  {overall_metrics['f1']:.2f}")

    print("\n------------------------------------------")
    print("PER ENTITY METRICS")
    print("------------------------------------------")
    for label in sorted_labels:
        m = per_label_metrics[label]
        print(f"\n[{label}]")
        print(f"  TP: {m['tp']} | FP: {m['fp']} | FN: {m['fn']}")
        print(f"  Precision: {m['precision']:.2f} | Recall: {m['recall']:.2f} | F1: {m['f1']:.2f}")

    print("\n------------------------------------------")
    print("ERRORS REPORT")
    print("------------------------------------------")
    if not errors_list:
        print("No extraction errors detected!")
    else:
        for err in errors_list:
            print(f"\nExample #{err['example']} | Field: {err['label']} | Error: {err['error_type']}")
            print(f"  Expected:  '{err['expected']}'")
            print(f"  Predicted: '{err['predicted']}'")

    print("\n==========================================\n")

    return {
        "num_examples": num_examples,
        "overall": {
            **overall_counts,
            **overall_metrics
        },
        "per_label": per_label_metrics,
        "errors": errors_list
    }


if __name__ == "__main__":
    target_path = sys.argv[1] if len(sys.argv) > 1 else "data/ner/land_records.jsonl"
    evaluate_baseline(target_path)
