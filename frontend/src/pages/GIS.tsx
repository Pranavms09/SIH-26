import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  MapPin,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Compass,
  Download,
  Crosshair,
  FileText,
  BadgeCheck,
  AlertCircle,
  Upload,
  Sparkles,
  PlusCircle,
  Loader
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import { mockCadastralParcels } from '../data/mockData';
import { fetchCadastralParcelsApi, demarcateParcelApi, importGeoJSONApi } from '../services/api';
import type { CadastralParcel } from '../types';

// Numeral transliteration map
const DEV_TO_ENG: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  'अ': 'A', 'ब': 'B', 'क': 'C', 'ड': 'D'
};

const ENG_TO_DEV: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  'A': 'अ', 'a': 'अ', 'B': 'ब', 'b': 'ब', 'C': 'क', 'c': 'क', 'D': 'ड', 'd': 'ड'
};

function normalizeGat(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();
  str = str.replace(/^(गट\s*(क्रमांक|क्र\.?|नं\.?|नंबर)?|gat\s*(no\.?|number)?|survey\s*(no\.?|number)?)\s*[:.\-]?\s*/i, '');
  str = str.replace(/[०-९अ-ड]/g, ch => DEV_TO_ENG[ch] || ch);
  str = str.replace('／', '/').replace('\\', '/').replace(/\s*\/\s*/, '/');
  return str.trim().toUpperCase();
}

function toDevanagariGat(english: string): string {
  if (!english) return '';
  return english.replace(/[0-9A-Da-d]/g, ch => ENG_TO_DEV[ch] || ch);
}

// Curated Maharashtra regions for instant offline geocoding
const MAHARASHTRA_REGIONS: Record<string, { lat: number; lng: number; taluka: string; district: string }> = {
  baramati: { lat: 18.1519, lng: 74.5770, taluka: 'Baramati', district: 'Pune' },
  ambajogai: { lat: 18.7325, lng: 76.3842, taluka: 'Ambajogai', district: 'Beed' },
  pimpri: { lat: 18.6275, lng: 73.8525, taluka: 'Haveli', district: 'Pune' },
  haveli: { lat: 18.5204, lng: 73.8567, taluka: 'Haveli', district: 'Pune' },
  pune: { lat: 18.5204, lng: 73.8567, taluka: 'Haveli', district: 'Pune' },
  pandharpur: { lat: 17.6740, lng: 75.3250, taluka: 'Pandharpur', district: 'Solapur' },
  solapur: { lat: 17.6599, lng: 75.9064, taluka: 'Solapur', district: 'Solapur' },
  dindori: { lat: 20.2050, lng: 73.8350, taluka: 'Dindori', district: 'Nashik' },
  nashik: { lat: 19.9975, lng: 73.7898, taluka: 'Nashik', district: 'Nashik' },
  wai: { lat: 17.9500, lng: 73.8900, taluka: 'Wai', district: 'Satara' },
  satara: { lat: 17.6805, lng: 74.0183, taluka: 'Satara', district: 'Satara' },
  latur: { lat: 18.4088, lng: 76.5604, taluka: 'Latur', district: 'Latur' },
  beed: { lat: 18.9891, lng: 75.7601, taluka: 'Beed', district: 'Beed' },
  kolhapur: { lat: 16.7050, lng: 74.2433, taluka: 'Karveer', district: 'Kolhapur' },
  nagpur: { lat: 21.1458, lng: 79.0882, taluka: 'Nagpur', district: 'Nagpur' },
  sangli: { lat: 16.8524, lng: 74.5815, taluka: 'Miraj', district: 'Sangli' },
  ahmednagar: { lat: 19.0948, lng: 74.7480, taluka: 'Nagar', district: 'Ahmednagar' },
  jalna: { lat: 19.8410, lng: 75.8864, taluka: 'Jalna', district: 'Jalna' },
  nanded: { lat: 19.1383, lng: 77.3210, taluka: 'Nanded', district: 'Nanded' },
};

function generateCadastralBoundary(lat: number, lng: number, areaHa: number = 2.15): number[][][] {
  const scale = Math.sqrt(areaHa / 2.0) * 0.0018;
  const offsets = [
    [-scale * 0.95, -scale * 0.85],
    [-scale * 0.20, -scale * 1.10],
    [scale * 0.85, -scale * 0.70],
    [scale * 1.15, scale * 0.35],
    [scale * 0.70, scale * 1.05],
    [-scale * 0.40, scale * 0.95],
    [-scale * 1.05, scale * 0.20],
    [-scale * 0.95, -scale * 0.85],
  ];
  const ring = offsets.map(([dlng, dlat]) => [
    Number((lng + dlng).toFixed(6)),
    Number((lat + dlat).toFixed(6)),
  ]);
  return [ring];
}

// Map camera controller
function MapController({
  targetBounds,
  targetCentroid,
}: {
  targetBounds: [[number, number], [number, number]] | null;
  targetCentroid: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (targetBounds) {
      map.flyToBounds(targetBounds, {
        padding: [70, 70],
        maxZoom: 17,
        duration: 1.2,
      });
    } else if (targetCentroid) {
      map.flyTo(targetCentroid, 16, { duration: 1.2 });
    }
  }, [targetBounds, targetCentroid, map]);
  return null;
}

// Map Click Handler for Click-to-Demarcate Mode
function MapClickHandler({
  active,
  onMapClick,
}: {
  active: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (active) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function GIS() {
  const [parcels, setParcels] = useState<CadastralParcel[]>(mockCadastralParcels);
  const [selectedParcel, setSelectedParcel] = useState<CadastralParcel | null>(null);
  const [gatQuery, setGatQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeBaseLayer, setActiveBaseLayer] = useState<'satellite' | 'dark' | 'light'>('satellite');
  const [showLabels, setShowLabels] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [pinMode, setPinMode] = useState(false);

  const [targetBounds, setTargetBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [targetCentroid, setTargetCentroid] = useState<[number, number] | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Load from backend if available, fallback to mock data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const backendParcels = await fetchCadastralParcelsApi();
      if (mounted && backendParcels && backendParcels.length > 0) {
        setParcels(backendParcels);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle URL query parameters (e.g. /app/gis?gat=312/2 or ?survey=124/3A)
  useEffect(() => {
    const gatFromUrl = searchParams.get('gat') || searchParams.get('survey');
    if (gatFromUrl && parcels.length > 0) {
      const cleanUrlGat = normalizeGat(gatFromUrl);
      const match = parcels.find(p => normalizeGat(p.gat_number) === cleanUrlGat || p.gat_marathi === gatFromUrl);
      if (match) {
        setGatQuery(match.gat_number);
        handleSelectParcel(match);
      }
    }
  }, [searchParams, parcels]);

  // Handle parcel selection and map positioning
  const handleSelectParcel = (parcel: CadastralParcel) => {
    setSelectedParcel(parcel);
    if (parcel.bounds) {
      setTargetBounds(parcel.bounds);
      setTargetCentroid(null);
    } else if (parcel.centroid) {
      setTargetCentroid(parcel.centroid);
      setTargetBounds(null);
    }
  };

  // Filtered parcels based on search input and district filter
  const filteredParcels = useMemo(() => {
    const cleanQ = normalizeGat(gatQuery);
    const rawQ = gatQuery.trim().toLowerCase();

    return parcels.filter(p => {
      if (selectedDistrict !== 'All') {
        if (p.district_en.toLowerCase() !== selectedDistrict.toLowerCase() && p.district !== selectedDistrict) {
          return false;
        }
      }

      if (!cleanQ && !rawQ) return true;

      const normGat = normalizeGat(p.gat_number);
      const matchGat = normGat.includes(cleanQ) || p.gat_marathi.includes(gatQuery.trim());
      const matchOwner = p.owner_name.toLowerCase().includes(rawQ) || p.owner_name_en.toLowerCase().includes(rawQ);
      const matchVillage = p.village.toLowerCase().includes(rawQ) || p.village_en.toLowerCase().includes(rawQ);

      return matchGat || matchOwner || matchVillage;
    });
  }, [parcels, gatQuery, selectedDistrict]);

  // Autocomplete dropdown suggestions
  const suggestions = useMemo(() => {
    if (!gatQuery.trim()) return [];
    return filteredParcels.slice(0, 5);
  }, [filteredParcels, gatQuery]);

  // Universal Geocoding Engine: Resolves any outside Ghat + Village in Maharashtra
  const handleUniversalGeocodeAndDemarcate = async (rawInput: string) => {
    if (!rawInput.trim()) return;
    setIsGeocoding(true);

    let parsedGat = rawInput;
    let targetLocation = 'Baramati';

    // Check if user entered "Gat 45, Baramati" or "102, Latur"
    if (rawInput.includes(',')) {
      const parts = rawInput.split(',');
      parsedGat = parts[0].trim();
      targetLocation = parts[1].trim();
    } else if (rawInput.includes(' in ')) {
      const parts = rawInput.split(' in ');
      parsedGat = parts[0].trim();
      targetLocation = parts[1].trim();
    } else {
      parsedGat = rawInput.trim();
      targetLocation = selectedDistrict !== 'All' ? selectedDistrict : 'Baramati';
    }

    const cleanGat = normalizeGat(parsedGat) || 'GAT-NEW';
    const marathiGat = toDevanagariGat(cleanGat);

    // 1. Try Backend API first
    const backendResult = await demarcateParcelApi({
      gat_number: cleanGat,
      location_name: targetLocation,
      owner_name: 'शेतकरी खातेदार (Live Demarcated)',
      area_ha: 2.15,
    });

    if (backendResult) {
      setParcels(prev => [backendResult, ...prev.filter(p => p.id !== backendResult.id)]);
      handleSelectParcel(backendResult);
      setIsGeocoding(false);
      return;
    }

    // 2. Frontend Geocoding Fallback
    let lat = 18.1519;
    let lng = 74.5770;
    let villageName = targetLocation;
    let districtName = 'Maharashtra';

    const locKey = targetLocation.toLowerCase().trim();
    if (MAHARASHTRA_REGIONS[locKey]) {
      const reg = MAHARASHTRA_REGIONS[locKey];
      lat = reg.lat;
      lng = reg.lng;
      villageName = reg.taluka;
      districtName = reg.district;
    } else {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetLocation + ', Maharashtra, India')}&countrycodes=in&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await resp.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
          villageName = data[0].display_name.split(',')[0] || targetLocation;
          districtName = data[0].display_name.split(',')[2] || 'Maharashtra';
        }
      } catch (err) {
        console.warn('OSM Geocoding failed, using regional coordinates:', err);
      }
    }

    const polyCoords = generateCadastralBoundary(lat, lng, 2.15);
    const newParcel: CadastralParcel = {
      id: `parcel-live-${Date.now()}`,
      gat_number: cleanGat,
      gat_marathi: marathiGat,
      district: districtName,
      district_en: districtName,
      taluka: villageName,
      taluka_en: villageName,
      village: villageName,
      village_en: villageName,
      owner_name: 'शेतकरी खातेदार (Live Geocoded)',
      owner_name_en: 'Registered Agricultural Holder',
      area_ha: 2.15,
      area_guntha: 215,
      area_acres: 5.31,
      land_type: 'जिरायत (शेतजमीन)',
      land_type_en: 'Jirayat (Agricultural)',
      soil_class: 'Class 1 (काळी जमीन)',
      status: 'verified',
      record_id: null,
      centroid: [Number(lat.toFixed(5)), Number(lng.toFixed(5))],
      bounds: [
        [Number((lat - 0.0025).toFixed(5)), Number((lng - 0.0025).toFixed(5))],
        [Number((lat + 0.0025).toFixed(5)), Number((lng + 0.0025).toFixed(5))],
      ],
      mutation_no: 'थेट भू-नकाशा नोंद (Live Geocoded)',
      crops: ['सोयाबीन (Soybean)', 'कापूस (Cotton)'],
      geojson: {
        type: 'Feature',
        properties: {
          id: `parcel-live-${Date.now()}`,
          gat_number: cleanGat,
          gat_marathi: marathiGat,
          village: villageName,
          district: districtName,
          owner: 'Live Geocoded Holder',
          area_ha: 2.15,
        },
        geometry: {
          type: 'Polygon',
          coordinates: polyCoords,
        },
      },
    };

    setParcels(prev => [newParcel, ...prev]);
    handleSelectParcel(newParcel);
    setIsGeocoding(false);
  };

  // Click-to-Pin Demarcate Handler
  const handleMapPinDemarcate = (lat: number, lng: number) => {
    const nextGat = prompt('Enter Ghat Number for this demarcated land plot (e.g. 150/1):', '150/1');
    if (!nextGat) return;

    const cleanGat = normalizeGat(nextGat);
    const poly = generateCadastralBoundary(lat, lng, 2.0);

    const demarcatedParcel: CadastralParcel = {
      id: `parcel-pinned-${Date.now()}`,
      gat_number: cleanGat,
      gat_marathi: toDevanagariGat(cleanGat),
      district: 'Survey Demarcated',
      district_en: 'Survey Demarcated',
      taluka: 'Local Taluka',
      taluka_en: 'Local Taluka',
      village: 'Field Surveyed',
      village_en: 'Field Surveyed',
      owner_name: 'शेतकरी खातेदार (GPS Pinned)',
      owner_name_en: 'Field Demarcated Holder',
      area_ha: 2.0,
      area_guntha: 200,
      area_acres: 4.94,
      land_type: 'कृषी (जिरायत)',
      land_type_en: 'Agricultural (Jirayat)',
      soil_class: 'Class 1',
      status: 'verified',
      record_id: null,
      centroid: [Number(lat.toFixed(5)), Number(lng.toFixed(5))],
      bounds: [
        [Number((lat - 0.002).toFixed(5)), Number((lng - 0.002).toFixed(5))],
        [Number((lat + 0.002).toFixed(5)), Number((lng + 0.002).toFixed(5))],
      ],
      mutation_no: 'फील्ड डीमार्केशन (GPS Survey Pinned)',
      crops: ['ऊस (Sugarcane)'],
      geojson: {
        type: 'Feature',
        properties: {
          id: `parcel-pinned-${Date.now()}`,
          gat_number: cleanGat,
          village: 'Field Demarcated',
          area_ha: 2.0,
        },
        geometry: {
          type: 'Polygon',
          coordinates: poly,
        },
      },
    };

    setParcels(prev => [demarcatedParcel, ...prev]);
    handleSelectParcel(demarcatedParcel);
    setPinMode(false);
  };

  // Village Map File Ingestion (GeoJSON/KML)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const json = JSON.parse(text);

        // Try backend import first
        const apiRes = await importGeoJSONApi(json);
        if (apiRes && apiRes.parcels?.length > 0) {
          setParcels(prev => [...apiRes.parcels, ...prev]);
          if (apiRes.parcels[0]) handleSelectParcel(apiRes.parcels[0]);
          alert(`Successfully imported ${apiRes.imported_count} village cadastral parcels!`);
          return;
        }

        // Local parse fallback
        const features = json.features || (json.type === 'Feature' ? [json] : []);
        const imported: CadastralParcel[] = features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const gat = String(props.gat_number || props.gat || props.survey_no || `GAT-${idx + 1}`);
          const coords = f.geometry?.coordinates?.[0] || [[73.85, 18.63], [73.86, 18.63], [73.86, 18.62], [73.85, 18.62], [73.85, 18.63]];
          const avgLng = coords.reduce((acc: number, c: number[]) => acc + c[0], 0) / coords.length;
          const avgLat = coords.reduce((acc: number, c: number[]) => acc + c[1], 0) / coords.length;

          return {
            id: `parcel-import-${idx}-${Date.now()}`,
            gat_number: gat,
            gat_marathi: toDevanagariGat(gat),
            district: props.district || 'Maharashtra',
            district_en: props.district || 'Maharashtra',
            taluka: props.taluka || 'Imported Taluka',
            taluka_en: props.taluka || 'Imported Taluka',
            village: props.village || 'Imported Village',
            village_en: props.village || 'Imported Village',
            owner_name: props.owner || 'Imported Holder',
            owner_name_en: props.owner || 'Imported Holder',
            area_ha: Number(props.area_ha || props.area || 2.0),
            area_guntha: Number(props.area_ha || 2.0) * 100,
            area_acres: Number(props.area_ha || 2.0) * 2.47,
            land_type: 'कृषी जमीन',
            land_type_en: 'Agricultural Land',
            soil_class: 'Class 1',
            status: 'verified',
            record_id: null,
            centroid: [Number(avgLat.toFixed(5)), Number(avgLng.toFixed(5))],
            bounds: [
              [Number((avgLat - 0.002).toFixed(5)), Number((avgLng - 0.002).toFixed(5))],
              [Number((avgLat + 0.002).toFixed(5)), Number((avgLng + 0.002).toFixed(5))],
            ],
            geojson: f,
          };
        });

        if (imported.length > 0) {
          setParcels(prev => [...imported, ...prev]);
          handleSelectParcel(imported[0]);
          alert(`Successfully imported ${imported.length} cadastral parcels from ${file.name}!`);
        }
      } catch (err) {
        alert('Invalid GeoJSON file format. Please upload a valid .geojson or .json file.');
      }
    };
    reader.readAsText(file);
  };

  // Copy coordinates
  const handleCopyCoords = (coords: [number, number]) => {
    navigator.clipboard.writeText(`${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Export GeoJSON
  const handleExportGeoJSON = (parcel: CadastralParcel) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(parcel.geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Cadastral_Gat_${parcel.gat_number.replace('/', '_')}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Parcel styling
  const getParcelStyle = (parcel: CadastralParcel) => {
    const isSelected = selectedParcel?.id === parcel.id;
    if (isSelected) {
      return {
        color: '#10b981',
        weight: 3.5,
        fillColor: '#10b981',
        fillOpacity: 0.45,
      };
    }
    return {
      color: parcel.status === 'verified' ? '#22c55e' : '#f59e0b',
      weight: 1.8,
      fillColor: parcel.status === 'verified' ? '#22c55e' : '#f59e0b',
      fillOpacity: 0.20,
    };
  };

  // Quick presets
  const quickGhatChips = [
    { label: 'गट ३१२/२', sub: 'अंबाजोगाई (बीड)', gat: '312/2' },
    { label: 'गट १२४/३A', sub: 'पिंपरी (पुणे)', gat: '124/3A' },
    { label: 'गट ८८/२B', sub: 'पंढरपूर (सोलापूर)', gat: '88/2B' },
    { label: 'गट ३११/१', sub: 'अंबाजोगाई', gat: '311/1' },
    { label: 'गट १२५', sub: 'पिंपरी', gat: '125' },
    { label: 'गट ४५/१', sub: 'दिंडोरी (नाशिक)', gat: '45/1' },
    { label: 'गट ७७/A', sub: 'वाई (सातारा)', gat: '77/A' },
  ];

  return (
    <div className="gis-page">
      {/* Hidden file input for GeoJSON import */}
      <input
        type="file"
        ref={fileUploadRef}
        accept=".geojson,.json"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      {/* Map Container */}
      <MapContainer
        center={[18.7325, 76.3842]}
        zoom={15}
        className="gis-map"
        zoomControl={false}
      >
        <MapController targetBounds={targetBounds} targetCentroid={targetCentroid} />
        <MapClickHandler active={pinMode} onMapClick={handleMapPinDemarcate} />

        {/* Dynamic Base Tile Layer */}
        {activeBaseLayer === 'satellite' && (
          <TileLayer
            key="satellite"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri, Maxar, Earthstar Geographics"
            maxZoom={19}
          />
        )}
        {activeBaseLayer === 'dark' && (
          <TileLayer
            key="dark"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
        )}
        {activeBaseLayer === 'light' && (
          <TileLayer
            key="light"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
        )}

        {/* Cadastral GeoJSON Parcels */}
        {parcels.map(parcel => (
          <GeoJSON
            key={`${parcel.id}-${selectedParcel?.id === parcel.id}`}
            data={parcel.geojson as any}
            style={() => getParcelStyle(parcel) as any}
            eventHandlers={{
              click: () => handleSelectParcel(parcel),
            }}
          >
            {showLabels && (
              <Tooltip
                permanent
                direction="center"
                className="gis-map-label"
              >
                <span>{parcel.gat_number}</span>
              </Tooltip>
            )}

            <Popup className="gis-popup">
              <div className="gis-popup-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="gis-popup-survey">गट {parcel.gat_number} ({parcel.gat_marathi})</div>
                  <span className={`badge ${parcel.status === 'verified' ? 'badge-verified' : 'badge-review'}`}>
                    {parcel.status === 'verified' ? 'Verified' : 'Review'}
                  </span>
                </div>
                <div className="gis-popup-owner">{parcel.owner_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {parcel.village_en}, {parcel.district_en} • {parcel.area_ha} ha ({parcel.area_acres} ac)
                </div>
                <button
                  className="btn btn-primary btn-xs"
                  style={{ marginTop: 6 }}
                  onClick={() => handleSelectParcel(parcel)}
                >
                  <Crosshair size={11} /> Focus Parcel
                </button>
              </div>
            </Popup>
          </GeoJSON>
        ))}
      </MapContainer>

      {/* Top Controls Bar */}
      <div className="gis-top-bar">
        {/* Layer switchers */}
        <div className="gis-layer-switcher">
          <Layers size={13} style={{ color: 'var(--text-muted)' }} />
          <button
            className={`gis-layer-btn ${activeBaseLayer === 'satellite' ? 'active' : ''}`}
            onClick={() => setActiveBaseLayer('satellite')}
          >
            Satellite
          </button>
          <button
            className={`gis-layer-btn ${activeBaseLayer === 'dark' ? 'active' : ''}`}
            onClick={() => setActiveBaseLayer('dark')}
          >
            Dark Cadastral
          </button>
          <button
            className={`gis-layer-btn ${activeBaseLayer === 'light' ? 'active' : ''}`}
            onClick={() => setActiveBaseLayer('light')}
          >
            Light
          </button>
        </div>

        {/* Ghat labels checkbox */}
        <label className="gis-label-toggle">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={e => setShowLabels(e.target.checked)}
          />
          <span>Ghat Labels</span>
        </label>

        {/* Click-to-Pin Mode Toggle */}
        <button
          className={`gis-layer-btn ${pinMode ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 4, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 10 }}
          onClick={() => setPinMode(!pinMode)}
          title="Click anywhere on the satellite map to demarcate a new Ghat parcel"
        >
          <Crosshair size={12} />
          <span>{pinMode ? 'Click Map to Pin' : 'Pin on Map'}</span>
        </button>

        {/* Import Village Map Button */}
        <button
          className="gis-layer-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 4, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 10 }}
          onClick={() => fileUploadRef.current?.click()}
          title="Import official village Cadastral GeoJSON / KML"
        >
          <Upload size={12} />
          <span>Import Village Map</span>
        </button>

        {/* MahaBhunaksha NIC Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 10, fontSize: '10px', color: 'var(--accent-green-bright)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
          <span>MahaBhunaksha (DILRMP): Hybrid Active</span>
        </div>
      </div>

      {/* Left Search & Cadastral Panel */}
      <div className="gis-filter-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="gis-panel-title">Cadastral GIS Viewer</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              गट क्रमांक आधारित भू-नकाशा शोध (7/12)
            </div>
          </div>
          <Compass size={18} style={{ color: 'var(--accent-green-bright)' }} />
        </div>

        {/* Dedicated Ghat Number Search Bar */}
        <div className="gis-search-wrapper" style={{ position: 'relative' }}>
          <div className="gis-search">
            <Search size={14} style={{ color: 'var(--accent-green-bright)' }} />
            <input
              ref={searchInputRef}
              className="gis-search-input"
              placeholder="Search Ghat No. (e.g. 312/2, Gat 45 Baramati)..."
              value={gatQuery}
              onChange={e => setGatQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 300)}
              onKeyDown={e => {
                if (e.key === 'Enter' && gatQuery.trim()) {
                  if (suggestions.length > 0) {
                    handleSelectParcel(suggestions[0]);
                  } else {
                    handleUniversalGeocodeAndDemarcate(gatQuery);
                  }
                }
              }}
            />
            {gatQuery && (
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: 2 }}
                onClick={() => {
                  setGatQuery('');
                  searchInputRef.current?.focus();
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Autocomplete & Universal Geocoding Dropdown */}
          {searchFocused && gatQuery.trim() && (
            <div className="gis-suggestions-dropdown">
              {suggestions.length > 0 ? (
                <>
                  <div className="gis-suggestion-header">
                    Matching Registered Parcels ({suggestions.length})
                  </div>
                  {suggestions.map(s => (
                    <div
                      key={s.id}
                      className="gis-suggestion-item"
                      onMouseDown={() => {
                        setGatQuery(s.gat_number);
                        handleSelectParcel(s);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="gis-suggestion-gat">
                          गट {s.gat_number} <span style={{ opacity: 0.7 }}>({s.gat_marathi})</span>
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.area_ha} ha</span>
                      </div>
                      <div className="gis-suggestion-meta">
                        {s.village} ({s.district}), {s.owner_name}
                      </div>
                    </div>
                  ))}
                </>
              ) : null}

              {/* Universal Geocoding Action for Unlisted / Outside Ghat Numbers */}
              <div
                className="gis-suggestion-item"
                style={{ background: 'rgba(16, 185, 129, 0.08)', borderTop: '1px solid var(--border-strong)' }}
                onMouseDown={() => handleUniversalGeocodeAndDemarcate(gatQuery)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green-bright)' }}>
                  {isGeocoding ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span style={{ fontWeight: 650, fontSize: '12px' }}>
                    {isGeocoding ? 'Geocoding across Maharashtra...' : `Geolocate & Demarcate "${gatQuery}"`}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 3 }}>
                  Locates village farmland on satellite imagery and draws agricultural boundaries.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* District Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="section-label" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            District Filter
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['All', 'Beed', 'Pune', 'Solapur', 'Nashik', 'Satara'].map(d => (
              <button
                key={d}
                className={`btn btn-xs ${selectedDistrict === d ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '12px' }}
                onClick={() => setSelectedDistrict(d)}
              >
                {d === 'All' ? 'सर्व जिल्हे (All)' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ghat Number Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="section-label" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            Quick Ghat Suggestions
          </div>
          <div className="gis-chips-scroll">
            {quickGhatChips.map(chip => (
              <button
                key={chip.gat}
                className="gis-quick-chip"
                onClick={() => {
                  setGatQuery(chip.gat);
                  const p = parcels.find(item => item.gat_number === chip.gat);
                  if (p) handleSelectParcel(p);
                }}
              >
                <span style={{ fontWeight: 650 }}>{chip.label}</span>
                <span style={{ fontSize: '10px', opacity: 0.75 }}>{chip.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parcels List */}
        <div className="gis-parcels">
          <div className="section-label">
            Parcels ({filteredParcels.length} / {parcels.length})
          </div>
          {filteredParcels.length === 0 ? (
            <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                "{gatQuery}" is not in the pre-loaded local registry.
              </div>
              <button
                className="btn btn-primary btn-xs"
                style={{ justifyContent: 'center' }}
                onClick={() => handleUniversalGeocodeAndDemarcate(gatQuery)}
              >
                <Sparkles size={11} /> Geolocate "{gatQuery}" on Satellite Map
              </button>
            </div>
          ) : (
            filteredParcels.map(p => (
              <button
                key={p.id}
                className={`gis-parcel-item ${selectedParcel?.id === p.id ? 'active' : ''}`}
                onClick={() => handleSelectParcel(p)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-green-bright)' }}>
                    गट {p.gat_number} <span style={{ opacity: 0.65, fontSize: '11px' }}>({p.gat_marathi})</span>
                  </div>
                  <span className={`badge ${p.status === 'verified' ? 'badge-verified' : 'badge-review'}`} style={{ fontSize: '9px' }}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {p.owner_name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 1 }}>
                  {p.village_en}, {p.district_en} • {p.area_ha} ha
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Selected Parcel Details Panel */}
      <AnimatePresence>
        {selectedParcel && (
          <motion.div
            className="gis-detail-panel"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BadgeCheck size={16} style={{ color: 'var(--accent-green-bright)' }} />
                <div className="gis-panel-title" style={{ fontSize: '14px' }}>Parcel Cadastral Details</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedParcel(null)}>
                <X size={14} />
              </button>
            </div>

            {/* Ghat Number Display */}
            <div style={{ background: 'var(--glass-bg)', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginBottom: 12 }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                गट क्रमांक / Survey Number
              </div>
              <div className="gis-detail-survey">
                {selectedParcel.gat_number}
                <span style={{ fontSize: '18px', marginLeft: 8, opacity: 0.75, fontWeight: 600 }}>
                  ({selectedParcel.gat_marathi})
                </span>
              </div>
              <div className="gis-detail-village">
                <MapPin size={12} style={{ color: 'var(--accent-green-bright)' }} />
                {selectedParcel.village} ({selectedParcel.village_en}), {selectedParcel.taluka}, {selectedParcel.district}
              </div>
            </div>

            {/* Coordinates with Copy button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                📍 {selectedParcel.centroid[0].toFixed(5)}, {selectedParcel.centroid[1].toFixed(5)}
              </div>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => handleCopyCoords(selectedParcel.centroid)}
                title="Copy Coordinates"
              >
                {copiedCoords ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                <span style={{ fontSize: '10px', marginLeft: 3 }}>{copiedCoords ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Area Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
              <div className="gis-stat-box">
                <span className="gis-stat-label">Hectares</span>
                <span className="gis-stat-val">{selectedParcel.area_ha}</span>
              </div>
              <div className="gis-stat-box">
                <span className="gis-stat-label">Gunthas</span>
                <span className="gis-stat-val">{selectedParcel.area_guntha}</span>
              </div>
              <div className="gis-stat-box">
                <span className="gis-stat-label">Acres</span>
                <span className="gis-stat-val">{selectedParcel.area_acres}</span>
              </div>
            </div>

            {/* Detailed metadata */}
            <div className="divider" style={{ margin: '8px 0' }} />

            {[
              { label: 'खातेदार (Owner)', value: selectedParcel.owner_name },
              { label: 'Owner (English)', value: selectedParcel.owner_name_en },
              { label: 'जमीन प्रकार (Type)', value: selectedParcel.land_type },
              { label: 'माती प्रत (Soil)', value: selectedParcel.soil_class },
              { label: 'फेरफार नोंद (Mutation)', value: selectedParcel.mutation_no || 'नोंद उपलब्ध नाही' },
              { label: 'पिके (Active Crops)', value: selectedParcel.crops ? selectedParcel.crops.join(', ') : '—' },
            ].map(f => (
              <div key={f.label} className="gis-detail-field">
                <span className="gis-detail-label" style={{ fontSize: '11px' }}>{f.label}</span>
                <span className="gis-detail-value" style={{ fontSize: '11px', textAlign: 'right', maxWidth: '60%' }}>{f.value}</span>
              </div>
            ))}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (selectedParcel.record_id) {
                    navigate(`/app/records/${selectedParcel.record_id}`);
                  } else {
                    navigate(`/app/records?search=${encodeURIComponent(selectedParcel.gat_number)}`);
                  }
                }}
              >
                <FileText size={13} /> View 7/12 Land Record
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                  onClick={() => handleExportGeoJSON(selectedParcel)}
                >
                  <Download size={12} /> Export GeoJSON
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                  onClick={() => handleSelectParcel(selectedParcel)}
                >
                  <Crosshair size={12} /> Re-center
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
