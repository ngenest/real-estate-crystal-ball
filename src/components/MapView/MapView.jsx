import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { REGIONS, TAMPA_BAY_CENTER } from '../../data/regions.js';
import { PERMIT_TYPES } from '../../data/dataSources.js';
import { formatCurrency, shortAddress } from '../../utils/formatters.js';
import './MapView.css';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LAYER_OPTIONS = [
  { id: 'permits', label: 'Permits', color: '#f97316' },
  { id: 'transactions', label: 'Transactions', color: '#22c55e' },
  { id: 'zoning', label: 'Zoning', color: '#a855f7' },
  { id: 'hearings', label: 'Hearings', color: '#3b82f6' },
  { id: 'regions', label: 'Regions', color: '#94a3b8' },
];

function makeCircleMarker(lat, lng, color, radius = 8) {
  return L.circleMarker([lat, lng], {
    radius,
    fillColor: color,
    color: '#fff',
    weight: 1.5,
    opacity: 0.9,
    fillOpacity: 0.85,
  });
}

function getPermitColor(type) {
  const pt = PERMIT_TYPES.find((p) => p.id === type);
  return pt ? pt.color : '#94a3b8';
}

export default function MapView({ permits, transactions, zoning, hearings, selectedRegion, onRegionChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({});
  const [activeLayers, setActiveLayers] = useState(['permits', 'transactions', 'regions']);
  const [mapStyle, setMapStyle] = useState('dark');

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: TAMPA_BAY_CENTER,
      zoom: 10,
      zoomControl: true,
    });

    // Tile layers
    const tiles = {
      dark: L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
      ),
      light: L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
      ),
      satellite: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri © OpenStreetMap', maxZoom: 19 }
      ),
    };

    tiles.dark.addTo(map);

    // Store tile layers for switching
    map._tileLayers = tiles;
    map._activeStyle = 'dark';

    // Initialize layer groups
    layerGroupsRef.current = {
      permits: L.layerGroup().addTo(map),
      transactions: L.layerGroup().addTo(map),
      zoning: L.layerGroup().addTo(map),
      hearings: L.layerGroup().addTo(map),
      regions: L.layerGroup().addTo(map),
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const tiles = map._tileLayers;
    if (!tiles) return;

    Object.values(tiles).forEach((t) => map.removeLayer(t));
    tiles[mapStyle]?.addTo(map);
    map._activeStyle = mapStyle;
  }, [mapStyle]);

  // Render region circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current.regions;
    if (!map || !lg) return;

    lg.clearLayers();

    if (!activeLayers.includes('regions')) return;

    REGIONS.forEach((region) => {
      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 18,
        fillColor: region.color,
        color: selectedRegion === region.id ? '#fff' : 'transparent',
        weight: selectedRegion === region.id ? 2 : 0,
        opacity: 0.9,
        fillOpacity: selectedRegion === region.id ? 0.5 : 0.25,
      });

      marker.bindTooltip(
        `<strong>${region.name}</strong><br/>${region.county} County<br/><small>${region.description}</small>`,
        { className: 'map-tooltip', direction: 'top' }
      );

      marker.on('click', () => {
        onRegionChange(selectedRegion === region.id ? null : region.id);
      });

      lg.addLayer(marker);
    });
  }, [activeLayers, selectedRegion, onRegionChange]);

  // Render permit markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current.permits;
    if (!map || !lg) return;

    lg.clearLayers();
    if (!activeLayers.includes('permits')) return;

    (permits || [])
      .filter((p) => p.lat && p.lng && (!selectedRegion || p.region === selectedRegion))
      .forEach((permit) => {
        const color = getPermitColor(permit.type);
        const marker = makeCircleMarker(permit.lat, permit.lng, color, 7);

        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-badge permit">Permit</div>
            <strong>${permit.id}</strong>
            <p>${permit.subtype}</p>
            <p>${shortAddress(permit.address)}</p>
            <p>Value: <strong>${formatCurrency(permit.value)}</strong></p>
            <p>Status: <span class="popup-status">${permit.status}</span></p>
          </div>
        `);

        lg.addLayer(marker);
      });
  }, [permits, activeLayers, selectedRegion]);

  // Render transaction markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current.transactions;
    if (!map || !lg) return;

    lg.clearLayers();
    if (!activeLayers.includes('transactions')) return;

    (transactions || [])
      .filter((t) => t.lat && t.lng && (!selectedRegion || t.region === selectedRegion))
      .forEach((txn) => {
        const marker = makeCircleMarker(txn.lat, txn.lng, '#22c55e', 9);

        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-badge transaction">Transaction</div>
            <strong>${txn.type}</strong>
            <p>${shortAddress(txn.address)}</p>
            <p>Price: <strong>${formatCurrency(txn.price)}</strong></p>
            <p>${txn.asset_class}</p>
          </div>
        `);

        lg.addLayer(marker);
      });
  }, [transactions, activeLayers, selectedRegion]);

  // Render zoning markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current.zoning;
    if (!map || !lg) return;

    lg.clearLayers();
    if (!activeLayers.includes('zoning')) return;

    (zoning || [])
      .filter((z) => z.lat && z.lng && (!selectedRegion || z.region === selectedRegion))
      .forEach((item) => {
        const marker = makeCircleMarker(item.lat, item.lng, '#a855f7', 7);

        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-badge zoning">Zoning</div>
            <strong>${item.id}</strong>
            <p>${item.type}: ${item.from_zone} → ${item.to_zone}</p>
            <p>${shortAddress(item.address)}</p>
            <p>Status: <span class="popup-status">${item.status}</span></p>
          </div>
        `);

        lg.addLayer(marker);
      });
  }, [zoning, activeLayers, selectedRegion]);

  // Render hearing markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current.hearings;
    if (!map || !lg) return;

    lg.clearLayers();
    if (!activeLayers.includes('hearings')) return;

    (hearings || [])
      .filter((h) => (!selectedRegion || h.region === selectedRegion))
      .forEach((hearing) => {
        const region = REGIONS.find((r) => r.id === hearing.region);
        if (!region) return;

        // Offset slightly so they don't overlap region circles
        const lat = region.lat + (Math.random() - 0.5) * 0.02;
        const lng = region.lng + (Math.random() - 0.5) * 0.02;

        const marker = makeCircleMarker(lat, lng, '#3b82f6', 6);

        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-badge hearing">Hearing</div>
            <strong>${hearing.title}</strong>
            <p>${hearing.body}</p>
            <p>${hearing.date} at ${hearing.time}</p>
            <p>${hearing.location}</p>
          </div>
        `);

        lg.addLayer(marker);
      });
  }, [hearings, activeLayers, selectedRegion]);

  // Pan/zoom to selected region
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedRegion) {
      const region = REGIONS.find((r) => r.id === selectedRegion);
      if (region) {
        map.flyTo([region.lat, region.lng], region.zoom || 13, { duration: 1 });
      }
    } else {
      map.flyTo(TAMPA_BAY_CENTER, 10, { duration: 1 });
    }
  }, [selectedRegion]);

  function toggleLayer(id) {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  return (
    <div className="map-container">
      {/* Controls overlay */}
      <div className="map-controls">
        <div className="map-control-group">
          <span className="control-label">Layers</span>
          {LAYER_OPTIONS.map((layer) => (
            <button
              key={layer.id}
              className={`layer-btn ${activeLayers.includes(layer.id) ? 'active' : ''}`}
              onClick={() => toggleLayer(layer.id)}
              style={{ '--layer-color': layer.color }}
            >
              <span className="layer-dot" style={{ background: activeLayers.includes(layer.id) ? layer.color : '#334155' }} />
              {layer.label}
            </button>
          ))}
        </div>
        <div className="map-control-group">
          <span className="control-label">Style</span>
          {['dark', 'light', 'satellite'].map((s) => (
            <button
              key={s}
              className={`style-btn ${mapStyle === s ? 'active' : ''}`}
              onClick={() => setMapStyle(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map legend */}
      <div className="map-legend">
        {LAYER_OPTIONS.filter((l) => activeLayers.includes(l.id)).map((l) => (
          <div key={l.id} className="legend-item">
            <span className="legend-dot" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <div ref={mapRef} className="leaflet-map" />
    </div>
  );
}
