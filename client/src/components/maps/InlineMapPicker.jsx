import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Compass } from 'lucide-react';

const getPickerPinIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669" width="36" height="36" stroke="#ffffff" stroke-width="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-picker-pin-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const MapClickEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

export const InlineMapPicker = ({
  lat,
  lng,
  onChange,
  height = '240px',
  label = 'Pin Location on Map'
}) => {
  const defaultCenter = [10.1284, 125.5937]; // Dinagat Islands center
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  const initialPos = (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0)
    ? [parsedLat, parsedLng]
    : null;

  const [selectedPos, setSelectedPos] = useState(initialPos);
  const [mapCenter, setMapCenter] = useState(initialPos || defaultCenter);

  useEffect(() => {
    const pLat = parseFloat(lat);
    const pLng = parseFloat(lng);
    if (!isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0) {
      setSelectedPos([pLat, pLng]);
    } else {
      setSelectedPos(null);
    }
  }, [lat, lng]);

  const handleMapClick = (clickLat, clickLng) => {
    const roundLat = parseFloat(clickLat.toFixed(6));
    const roundLng = parseFloat(clickLng.toFixed(6));
    setSelectedPos([roundLat, roundLng]);
    onChange(roundLat.toString(), roundLng.toString());
  };

  return (
    <div className="col-span-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {label}
        </label>
        {selectedPos ? (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            📍 Location Set ({selectedPos[0].toFixed(4)}, {selectedPos[1].toFixed(4)})
          </span>
        ) : (
          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            ⚠️ Click map below to set pin
          </span>
        )}
      </div>

      {/* Embedded Leaflet Map */}
      <div
        className="w-full relative shadow-inner overflow-hidden border-2 border-emerald-500/30 rounded-2xl"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickEvents onMapClick={handleMapClick} />
          <MapRecenter center={mapCenter} />

          {selectedPos && (
            <Marker position={selectedPos} icon={getPickerPinIcon()}>
              <Popup defaultOpen>
                <div className="p-1 text-center font-extrabold text-xs">
                  <p className="text-emerald-700">📍 Exact Pin Location</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Banner Overlay */}
        <div className="absolute top-2 left-2 right-2 z-[400] pointer-events-none flex justify-center">
          <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">
            👇 Click anywhere on the map to drop the location pin
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineMapPicker;
