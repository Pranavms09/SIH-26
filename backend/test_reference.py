from app.services.reference_service import (
    validate_location_hierarchy
)


result = validate_location_hierarchy(
    district="बीड",
    taluka="अंबाजोगाई",
    village="अंबाजोगाई (रुरल) (560022)"
)


print("\n========== REFERENCE VALIDATION ==========\n")

print(result)

print(
    "\n==========================================\n"
)