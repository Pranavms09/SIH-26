"""
Master test runner for BhuLekha backend pipelines, NER dataset, raw collection pipeline, annotator workflow, baseline evaluation, Groq Vision, and Gemini 2.5 Flash.
"""

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def run_all():
    print("\n=======================================================")
    print("      BHULEKHA COMPLETE SYSTEM TEST SUITE              ")
    print("=======================================================\n")

    # 1. Generate initial dataset & validate
    print(">>> 1. Generating & Validating NER Dataset...")
    from tools.generate_initial_dataset import main as gen_main
    gen_main()
    print("✓ NER Dataset Generation & Validation Passed!\n")

    # 2. Re-run validator explicitly
    print(">>> 2. Running Dataset Validator...")
    from tools.validate_ner_dataset import validate_dataset
    val_success = validate_dataset("data/ner/land_records.jsonl")
    assert val_success, "Dataset validation failed!"
    print("✓ Dataset Validator Passed!\n")

    # 3. Run Baseline Evaluator
    print(">>> 3. Running Baseline Evaluator...")
    from tools.evaluate_baseline import evaluate_baseline
    eval_res = evaluate_baseline("data/ner/land_records.jsonl")
    assert eval_res["num_examples"] > 0, "Baseline evaluation found 0 examples!"
    print("✓ Baseline Evaluator Passed!\n")

    # 4. Test Raw Dataset Collection
    print(">>> 4. Running test_raw_dataset.py...")
    import test_raw_dataset
    test_raw_dataset.run_tests()
    print("✓ Raw Dataset Collection Test Passed!\n")

    # 5. Test Local Annotator Workflow
    print(">>> 5. Running test_annotator.py...")
    import test_annotator
    test_annotator.run_tests()
    print("✓ Local Annotator Workflow Test Passed!\n")

    # 6. Test Extractor
    print(">>> 6. Running test_extractor.py...")
    import test_extractor
    print("✓ Extractor Test Passed!\n")

    # 7. Test Validation Service
    print(">>> 7. Running test_validation.py...")
    import test_validation
    print("✓ Validation Test Passed!\n")

    # 8. Test Reference Location Hierarchy
    print(">>> 8. Running test_reference.py...")
    import test_reference
    print("✓ Reference Test Passed!\n")

    # 9. Test Survey Validation
    print(">>> 9. Running test_survey_validation.py...")
    import test_survey_validation
    test_survey_validation.run_tests()
    print("✓ Survey Validation Test Passed!\n")

    # 10. Test Consistency Service
    print(">>> 10. Running test_consistency.py...")
    import test_consistency
    test_consistency.run_tests()
    print("✓ Consistency Test Passed!\n")

    # 11. Test API Process Endpoint
    print(">>> 11. Running test_api_process.py...")
    import test_api_process
    test_api_process.test_process_endpoint()
    print("✓ API Process Test Passed!\n")

    # 12. Test Groq Service Foundation (Step 16A)
    print(">>> 12. Running test_groq_service.py...")
    import test_groq_service
    test_groq_service.run_tests()
    print("✓ Groq Service Foundation Test Passed!\n")

    # 13. Test AI Validation Adapter (Step 16C)
    print(">>> 13. Running test_ai_validation.py...")
    import test_ai_validation
    test_ai_validation.run_tests()
    print("✓ AI Validation Adapter Test Passed!\n")

    # 14. Test Document Complexity Service (Step 16D)
    print(">>> 14. Running test_document_complexity.py...")
    import test_document_complexity
    test_document_complexity.run_tests()
    print("✓ Document Complexity Service Test Passed!\n")

    # 15. Test Extraction Router Service (Step 16D)
    print(">>> 15. Running test_extraction_router.py...")
    import test_extraction_router
    test_extraction_router.run_tests()
    print("✓ Extraction Router Service Test Passed!\n")

    # 16. Test Groq Vision Reliability (Step 17A)
    print(">>> 16. Running test_step17a_groq_reliability.py...")
    import test_step17a_groq_reliability
    test_step17a_groq_reliability.run_tests()
    print("✓ Groq Vision Reliability Test Passed!\n")

    # 17. Test Gemini 2.5 Flash Integration
    print(">>> 17. Running test_gemini_integration.py...")
    import test_gemini_integration
    test_gemini_integration.run_tests()
    print("✓ Gemini 2.5 Flash Integration Test Passed!\n")

    print("=======================================================")
    print(" ALL TESTS & BASELINE EVALUATION PASSED SUCCESSFULLY! ")
    print("=======================================================\n")

if __name__ == "__main__":
    run_all()
