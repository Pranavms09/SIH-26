from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import math
import time

router = APIRouter(prefix="/api/gis", tags=["GIS"])

# Curated Maharashtra regions for offline geocoding
MAHARASHTRA_REGIONS = {
    "baramati": {"lat": 18.1519, "lng": 74.5770, "taluka": "Baramati", "district": "Pune"},
    "vadgaon": {"lat": 18.7590, "lng": 73.6450, "taluka": "Maval", "district": "Pune"},
    "haveli": {"lat": 18.5204, "lng": 73.8567, "taluka": "Haveli", "district": "Pune"},
    "pimpri": {"lat": 18.6275, "lng": 73.8525, "taluka": "Haveli", "district": "Pune"},
    "pune": {"lat": 18.5204, "lng": 73.8567, "taluka": "Haveli", "district": "Pune"},
    "nashik": {"lat": 19.9975, "lng": 73.7898, "taluka": "Nashik", "district": "Nashik"},
    "dindori": {"lat": 20.2050, "lng": 73.8350, "taluka": "Dindori", "district": "Nashik"},
    "nagpur": {"lat": 21.1458, "lng": 79.0882, "taluka": "Nagpur", "district": "Nagpur"},
    "solapur": {"lat": 17.6599, "lng": 75.9064, "taluka": "Solapur", "district": "Solapur"},
    "pandharpur": {"lat": 17.6740, "lng": 75.3250, "taluka": "Pandharpur", "district": "Solapur"},
    "satara": {"lat": 17.6805, "lng": 74.0183, "taluka": "Satara", "district": "Satara"},
    "wai": {"lat": 17.9500, "lng": 73.8900, "taluka": "Wai", "district": "Satara"},
    "beed": {"lat": 18.9891, "lng": 75.7601, "taluka": "Beed", "district": "Beed"},
    "ambajogai": {"lat": 18.7325, "lng": 76.3842, "taluka": "Ambajogai", "district": "Beed"},
    "kolhapur": {"lat": 16.7050, "lng": 74.2433, "taluka": "Karveer", "district": "Kolhapur"},
    "mumbai": {"lat": 19.0760, "lng": 72.8777, "taluka": "Mumbai", "district": "Mumbai"},
    "thane": {"lat": 19.2183, "lng": 72.9781, "taluka": "Thane", "district": "Thane"},
    "aurangabad": {"lat": 19.8762, "lng": 75.3433, "taluka": "Aurangabad", "district": "Chhatrapati Sambhajinagar"},
    "amravati": {"lat": 20.9320, "lng": 77.7523, "taluka": "Amravati", "district": "Amravati"},
}

def generate_cadastral_boundary(lat: float, lng: float, area_ha: float = 2.15):
    scale = math.sqrt(area_ha / 2.0) * 0.0018
    offsets = [
        [-scale * 0.95, -scale * 0.85],
        [-scale * 0.20, -scale * 1.10],
        [scale * 0.85, -scale * 0.70],
        [scale * 1.15, scale * 0.35],
        [scale * 0.70, scale * 1.05],
        [-scale * 0.40, scale * 0.95],
        [-scale * 1.05, scale * 0.20],
        [-scale * 0.95, -scale * 0.85],
    ]
    ring = [[round(lng + dlng, 6), round(lat + dlat, 6)] for dlng, dlat in offsets]
    return [ring]

# In-memory parcels cache
INITIAL_PARCELS: List[Dict[str, Any]] = [
    {
        "id": "parcel-vadgaon-233",
        "gat_number": "233",
        "gat_marathi": "२३३",
        "district": "पुणे",
        "district_en": "Pune",
        "taluka": "बारामती",
        "taluka_en": "Baramati",
        "village": "वडगाव",
        "village_en": "Vadgaon",
        "owner_name": "श्री. गणेश रामचंद्र शिंदे",
        "owner_name_en": "Ganesh Ramchandra Shinde",
        "area_ha": 1.62,
        "area_guntha": 162,
        "area_acres": 4.0,
        "land_type": "जिरायत (शेतजमीन)",
        "land_type_en": "Jirayat (Agricultural)",
        "soil_class": "Class 1 (काळी जमीन)",
        "status": "verified",
        "record_id": "LR-MH-2026-000233",
        "centroid": [18.1700, 74.5800],
        "bounds": [[18.1670, 74.5770], [18.1730, 74.5830]],
        "mutation_no": "थेट ७/१२ भू-नकाशा नोंद",
        "crops": ["सोयाबीन (Soybean)", "कापूस (Cotton)"],
        "geojson": {
            "type": "Feature",
            "properties": {"gat_number": "233", "village": "Vadgaon", "district": "Pune"},
            "geometry": {"type": "Polygon", "coordinates": generate_cadastral_boundary(18.1700, 74.5800, 1.62)}
        }
    },
    {
        "id": "parcel-ambajogai-312",
        "gat_number": "312/2",
        "gat_marathi": "३१२/२",
        "district": "बीड",
        "district_en": "Beed",
        "taluka": "अंबाजोगाई",
        "taluka_en": "Ambajogai",
        "village": "अंबाजोगाई",
        "village_en": "Ambajogai",
        "owner_name": "रामभाऊ विष्णू पवार",
        "owner_name_en": "Rambhau Vishnu Pawar",
        "area_ha": 2.15,
        "area_guntha": 215,
        "area_acres": 5.31,
        "land_type": "जिरायत (शेतजमीन)",
        "land_type_en": "Jirayat (Agricultural)",
        "soil_class": "Class 1 (काळी जमीन)",
        "status": "verified",
        "record_id": "LR-MH-2026-003122",
        "centroid": [18.7325, 76.3842],
        "bounds": [[18.7295, 76.3812], [18.7355, 76.3872]],
        "mutation_no": "फेरफार क्र. १४२ (खरेदीखत)",
        "crops": ["सोयाबीन (Soybean)", "तूर (Pigeon Pea)"],
        "geojson": {
            "type": "Feature",
            "properties": {"gat_number": "312/2", "village": "Ambajogai", "district": "Beed"},
            "geometry": {"type": "Polygon", "coordinates": generate_cadastral_boundary(18.7325, 76.3842, 2.15)}
        }
    },
    {
        "id": "parcel-pimpri-124",
        "gat_number": "124/3A",
        "gat_marathi": "१२४/३A",
        "district": "पुणे",
        "district_en": "Pune",
        "taluka": "हवेली",
        "taluka_en": "Haveli",
        "village": "पिंपरी",
        "village_en": "Pimpri",
        "owner_name": "अशोक नामदेव चव्हाण",
        "owner_name_en": "Ashok Namdev Chavan",
        "area_ha": 0.85,
        "area_guntha": 85,
        "area_acres": 2.10,
        "land_type": "बागायत (विहीर)",
        "land_type_en": "Bagayat (Irrigated)",
        "soil_class": "Class 2 (मध्यम जमीन)",
        "status": "verified",
        "record_id": "LR-MH-2026-001243",
        "centroid": [18.6275, 73.8525],
        "bounds": [[18.6250, 73.8500], [18.6300, 73.8550]],
        "mutation_no": "फेरफार क्र. २१० (वारस नोंद)",
        "crops": ["ऊस (Sugarcane)"],
        "geojson": {
            "type": "Feature",
            "properties": {"gat_number": "124/3A", "village": "Pimpri", "district": "Pune"},
            "geometry": {"type": "Polygon", "coordinates": generate_cadastral_boundary(18.6275, 73.8525, 0.85)}
        }
    },
    {
        "id": "parcel-nashik-45",
        "gat_number": "45/1",
        "gat_marathi": "४५/१",
        "district": "नाशिक",
        "district_en": "Nashik",
        "taluka": "दिंडोरी",
        "taluka_en": "Dindori",
        "village": "दिंडोरी",
        "village_en": "Dindori",
        "owner_name": "सुभाष भिकाजी गायकवाड",
        "owner_name_en": "Subhash Bhikaji Gaikwad",
        "area_ha": 1.45,
        "area_guntha": 145,
        "area_acres": 3.58,
        "land_type": "बागायत (विहीर/कॅनॉल)",
        "land_type_en": "Bagayat (Irrigated)",
        "soil_class": "Class 1 (काळी जमीन)",
        "status": "verified",
        "record_id": "LR-MH-2026-000451",
        "centroid": [20.2050, 73.8350],
        "bounds": [[20.2020, 73.8320], [20.2080, 73.8380]],
        "mutation_no": "फेरफार क्र. ८८ (खरेदीखत)",
        "crops": ["द्राक्षे (Grapes)", "कांदा (Onion)"],
        "geojson": {
            "type": "Feature",
            "properties": {"gat_number": "45/1", "village": "Dindori", "district": "Nashik"},
            "geometry": {"type": "Polygon", "coordinates": generate_cadastral_boundary(20.2050, 73.8350, 1.45)}
        }
    },
]

PARCELS_STORE = list(INITIAL_PARCELS)

class DemarcateRequest(BaseModel):
    gat_number: str
    location_name: str
    owner_name: Optional[str] = "शेतकरी खातेदार (Live Demarcated)"
    area_ha: Optional[float] = 2.15

@router.get("/parcels")
def get_parcels():
    return {
        "status": "success",
        "count": len(PARCELS_STORE),
        "parcels": PARCELS_STORE
    }

@router.get("/parcels/{identifier}")
def get_parcel(identifier: str):
    for p in PARCELS_STORE:
        if p["id"] == identifier or p["gat_number"] == identifier or p.get("record_id") == identifier:
            return {"status": "success", "parcel": p}
    raise HTTPException(status_code=404, detail="Parcel not found")

@router.get("/search")
def search_parcels(
    gat_number: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    taluka: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
):
    results = []
    for p in PARCELS_STORE:
        if gat_number and p["gat_number"].lower() != gat_number.lower() and p.get("gat_marathi") != gat_number:
            continue
        if district and p.get("district_en", "").lower() != district.lower() and p.get("district", "").lower() != district.lower():
            continue
        if taluka and p.get("taluka_en", "").lower() != taluka.lower() and p.get("taluka", "").lower() != taluka.lower():
            continue
        if village and p.get("village_en", "").lower() != village.lower() and p.get("village", "").lower() != village.lower():
            continue
        results.append(p)

    return {
        "status": "success",
        "query": {"gat_number": gat_number, "district": district, "taluka": taluka, "village": village},
        "count": len(results),
        "parcels": results
    }

@router.post("/demarcate")
def demarcate_parcel(payload: DemarcateRequest):
    loc_key = payload.location_name.lower().strip()
    region = MAHARASHTRA_REGIONS.get(loc_key, {"lat": 18.5204, "lng": 73.8567, "taluka": payload.location_name, "district": "Maharashtra"})
    lat = region["lat"]
    lng = region["lng"]
    area_ha = payload.area_ha or 2.15

    poly = generate_cadastral_boundary(lat, lng, area_ha)
    parcel_id = f"parcel-demarcate-{int(time.time() * 1000)}"

    new_parcel = {
        "id": parcel_id,
        "gat_number": payload.gat_number,
        "gat_marathi": payload.gat_number,
        "district": region["district"],
        "district_en": region["district"],
        "taluka": region["taluka"],
        "taluka_en": region["taluka"],
        "village": payload.location_name,
        "village_en": payload.location_name,
        "owner_name": payload.owner_name or "शेतकरी खातेदार (Live Demarcated)",
        "owner_name_en": "Agricultural Holder",
        "area_ha": area_ha,
        "area_guntha": int(area_ha * 100),
        "area_acres": round(area_ha * 2.47, 2),
        "land_type": "जिरायत (शेतजमीन)",
        "land_type_en": "Jirayat (Agricultural)",
        "soil_class": "Class 1 (काळी जमीन)",
        "status": "verified",
        "record_id": None,
        "centroid": [round(lat, 5), round(lng, 5)],
        "bounds": [[round(lat - 0.0025, 5), round(lng - 0.0025, 5)], [round(lat + 0.0025, 5), round(lng + 0.0025, 5)]],
        "mutation_no": "थेट भू-नकाशा नोंद",
        "crops": ["सोयाबीन (Soybean)", "कापूस (Cotton)"],
        "geojson": {
            "type": "Feature",
            "properties": {"gat_number": payload.gat_number, "village": payload.location_name, "district": region["district"]},
            "geometry": {"type": "Polygon", "coordinates": poly}
        }
    }
    PARCELS_STORE.insert(0, new_parcel)
    return {"status": "success", "parcel": new_parcel}

@router.post("/import-geojson")
def import_geojson(payload: Dict[str, Any]):
    features = payload.get("features", [])
    if not features and payload.get("type") == "Feature":
        features = [payload]
    
    imported = []
    for idx, f in enumerate(features):
        props = f.get("properties", {})
        gat = str(props.get("gat_number") or props.get("gat") or props.get("survey_no") or f"GAT-IMP-{idx+1}")
        coords = f.get("geometry", {}).get("coordinates", [[]])[0]
        if coords:
            avg_lng = sum(c[0] for c in coords) / len(coords)
            avg_lat = sum(c[1] for c in coords) / len(coords)
        else:
            avg_lat, avg_lng = 18.5204, 73.8567

        p = {
            "id": f"import-{idx}-{int(time.time())}",
            "gat_number": gat,
            "gat_marathi": gat,
            "district": props.get("district", "Maharashtra"),
            "district_en": props.get("district", "Maharashtra"),
            "taluka": props.get("taluka", "Imported"),
            "taluka_en": props.get("taluka", "Imported"),
            "village": props.get("village", "Imported"),
            "village_en": props.get("village", "Imported"),
            "owner_name": props.get("owner", "Imported Holder"),
            "owner_name_en": props.get("owner", "Imported Holder"),
            "area_ha": float(props.get("area_ha") or 2.0),
            "area_guntha": int(float(props.get("area_ha") or 2.0) * 100),
            "area_acres": round(float(props.get("area_ha") or 2.0) * 2.47, 2),
            "land_type": "कृषी जमीन",
            "land_type_en": "Agricultural Land",
            "soil_class": "Class 1",
            "status": "verified",
            "record_id": None,
            "centroid": [round(avg_lat, 5), round(avg_lng, 5)],
            "bounds": [[round(avg_lat - 0.002, 5), round(avg_lng - 0.002, 5)], [round(avg_lat + 0.002, 5), round(avg_lng + 0.002, 5)]],
            "geojson": f
        }
        imported.append(p)
        PARCELS_STORE.insert(0, p)

    return {"status": "success", "imported_count": len(imported), "parcels": imported}
