from app.services.land_record_extractor import (
    extract_land_record
)


header_text = """
गाव:- अंबाजोगाई (रुरल) (560022)
तालुका:- अंबाजोगाई
जिल्हा: बीड
भूमापन क्रमांक व उपविभाग: 312/2
भू-धारणापध्दती: भोगवटादार वर्ग-1
"""


owner_text = """
विलासराव पाटील
क्षेत्र 0.24.00
इतर अधिकार
"""


crop_text = """
हंगाम
खाताक्रमांक
पिकांचा प्रकार
पिकाचे नाव
"""


record = extract_land_record(
    header_text,
    owner_text,
    crop_text
)


print("\n========== LAND RECORD ==========\n")

print(
    record.model_dump_json(
        indent=2,
        ensure_ascii=False
    )
)

print(
    "\n=================================\n"
)