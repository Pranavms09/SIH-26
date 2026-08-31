import json
from tools.create_ner_sample import create_ner_sample, save_to_jsonl
from tools.validate_ner_dataset import validate_dataset

def main():
    sample_text = (
        "गाव:- अंबाजोगाई (रुरल) (560022)\n"
        "तालुका:- अंबाजोगाई\n"
        "जिल्हा: बीड\n"
        "भूमापन क्रमांक व उपविभाग: 312/2\n"
        "भू-धारणापध्दती: भोगवटादार वर्ग-1\n"
        "विलासराव पाटील\n"
        "क्षेत्र 0.24.00"
    )

    entities = [
        {"value": "अंबाजोगाई (रुरल)", "label": "VILLAGE"},
        {"value": "अंबाजोगाई", "label": "TALUKA", "occurrence": 1},
        {"value": "बीड", "label": "DISTRICT"},
        {"value": "312/2", "label": "SURVEY_NUMBER"},
        {"value": "भोगवटादार वर्ग-1", "label": "LAND_HOLDING_TYPE"},
        {"value": "विलासराव पाटील", "label": "OWNER_NAME"},
        {"value": "0.24.00", "label": "AREA"}
    ]

    sample = create_ner_sample(sample_text, entities)
    jsonl_path = "data/ner/land_records.jsonl"
    save_to_jsonl(sample, jsonl_path, mode="w")

    print(f"Generated sample successfully and saved to {jsonl_path}.")
    valid = validate_dataset(jsonl_path)
    if not valid:
        raise ValueError("Generated dataset failed validation!")

if __name__ == "__main__":
    main()
