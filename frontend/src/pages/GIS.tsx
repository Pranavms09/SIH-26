import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const mockParcels = [
  {
    id: 'parcel-001',
    surveyNo: '124/3A',
    owner: 'Rajendra Patil',
    area: '2.48 ha',
    status: 'verified',
    recordId: 'LR-MH-2026-018492',
    village: 'Pimpri',
    district: 'Pune',
    geojson: {
      type: 'Feature' as const,
      properties: { id: 'parcel-001', surveyNo: '124/3A' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[73.85, 18.63], [73.855, 18.63], [73.855, 18.625], [73.85, 18.625], [73.85, 18.63]]],
      },
    },
  },
  {
    id: 'parcel-002',
    surveyNo: '124/3B',
    owner: 'Sunita Deshmukh',
    area: '1.82 ha',
    status: 'verified',
    recordId: 'LR-MH-2026-018493',
    village: 'Pimpri',
    district: 'Pune',
    geojson: {
      type: 'Feature' as const,
      properties: { id: 'parcel-002', surveyNo: '124/3B' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[73.855, 18.63], [73.861, 18.63], [73.861, 18.625], [73.855, 18.625], [73.855, 18.63]]],
      },
    },
  },
  {
    id: 'parcel-003',
    surveyNo: '125',
    owner: 'Mahesh Jadhav',
    area: '3.12 ha',
    status: 'needs_review',
    village: 'Pimpri',
    district: 'Pune',
    geojson: {
      type: 'Feature' as const,
      properties: { id: 'parcel-003', surveyNo: '125' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[73.845, 18.635], [73.851, 18.635], [73.851, 18.63], [73.845, 18.63], [73.845, 18.635]]],
      },
    },
  },
];

const parcelStyle = (status: string, selected: boolean) => ({
  color: selected ? '#4a7c59' : status === 'verified' ? '#3d6b4a' : '#b8861a',
  weight: selected ? 2 : 1,
  fillColor: selected ? 'rgba(74,124,89,0.4)' : status === 'verified' ? 'rgba(74,124,89,0.15)' : 'rgba(184,134,26,0.15)',
  fillOpacity: 1,
});

export default function GIS() {
  const [selectedParcel, setSelectedParcel] = useState<typeof mockParcels[0] | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light-mode'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light-mode'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="gis-page">
      {/* Map */}
      <MapContainer
        center={[18.628, 73.852]}
        zoom={15}
        className="gis-map"
        zoomControl={false}
      >
        <TileLayer
          key={isLight ? 'light' : 'dark'}
          url={isLight
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />
        {mockParcels.map(parcel => (
          <GeoJSON
            key={parcel.id}
            data={parcel.geojson as any}
            style={() => parcelStyle(parcel.status, selectedParcel?.id === parcel.id) as any}
            eventHandlers={{
              click: () => setSelectedParcel(parcel),
            }}
          >
            <Popup className="gis-popup">
              <div className="gis-popup-content">
                <div className="gis-popup-survey">{parcel.surveyNo}</div>
                <div className="gis-popup-owner">{parcel.owner}</div>
              </div>
            </Popup>
          </GeoJSON>
        ))}
      </MapContainer>

      {/* Left filter panel */}
      <div className="gis-filter-panel">
        <div className="gis-panel-title">Cadastral Viewer</div>
        <div className="gis-search">
          <Search size={13} />
          <input
            className="gis-search-input"
            placeholder="Survey no., owner, village…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="gis-layers">
          <div className="section-label">Layers</div>
          {['Cadastral Boundaries', 'Survey Numbers', 'Village Boundaries', 'Roads', 'Water Bodies'].map(layer => (
            <label key={layer} className="gis-layer-item">
              <input type="checkbox" defaultChecked={layer !== 'Water Bodies'} />
              <span>{layer}</span>
            </label>
          ))}
        </div>

        <div className="gis-parcels">
          <div className="section-label">Parcels ({mockParcels.length})</div>
          {mockParcels
            .filter(p => !query || p.surveyNo.toLowerCase().includes(query.toLowerCase()) || p.owner.toLowerCase().includes(query.toLowerCase()))
            .map(p => (
              <button
                key={p.id}
                className={`gis-parcel-item ${selectedParcel?.id === p.id ? 'active' : ''}`}
                onClick={() => setSelectedParcel(p)}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-green-bright)' }}>
                  {p.surveyNo}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.owner}</div>
                <span className={`badge ${p.status === 'verified' ? 'badge-verified' : 'badge-review'}`} style={{ marginTop: 4 }}>
                  {p.status.replace('_', ' ')}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Right: Selected parcel panel */}
      <AnimatePresence>
        {selectedParcel && (
          <motion.div
            className="gis-detail-panel"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="gis-panel-title">Parcel Details</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedParcel(null)}>
                <X size={13} />
              </button>
            </div>

            <div className="gis-detail-survey">{selectedParcel.surveyNo}</div>
            <div className="gis-detail-village">
              <MapPin size={12} />
              {selectedParcel.village}, {selectedParcel.district}
            </div>

            <div className="divider" />

            {[
              { label: 'Survey No.', value: selectedParcel.surveyNo },
              { label: 'Owner', value: selectedParcel.owner },
              { label: 'Area', value: selectedParcel.area },
              { label: 'Status', value: selectedParcel.status.replace('_', ' '), capitalize: true },
            ].map(f => (
              <div key={f.label} className="gis-detail-field">
                <span className="gis-detail-label">{f.label}</span>
                <span className={`gis-detail-value ${f.capitalize ? 'capitalize' : ''}`}>{f.value}</span>
              </div>
            ))}

            {selectedParcel.recordId && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                onClick={() => navigate(`/app/records/${selectedParcel.recordId}`)}
              >
                <ExternalLink size={13} /> View Record
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
