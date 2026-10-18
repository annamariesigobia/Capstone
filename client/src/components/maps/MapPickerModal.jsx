import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Check, X, Navigation, Compass, Search } from 'lucide-react';

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
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
};

export const MapPickerModal = ({
  isOpen,
  onClose,
  initialLat = '',
  initialLng = '',
  onSelectLocation,
  title = 'Select Location on Map'
}) => {
  const defaultCenter = [10.1284, 125.5937]; // Dinagat Islands center
  const parsedLat = parseFloat(initialLat);
  const parsedLng = parseFloat(initialLng);

  const initialPos = (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0)
    ? [parsedLat, parsedLng]
    : null;

  const [selectedPos, setSelectedPos] = useState(initialPos);
  const [mapCenter, setMapCenter] = useState(initialPos || defaultCenter);

  useEffect(() => {
    const pLat = parseFloat(initialLat);
    const pLng = parseFloat(initialLng);
    if (!isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0) {
      setSelectedPos([pLat, pLng]);
      setMapCenter([pLat, pLng]);
    } else {
      setSelectedPos(null);
      setMapCenter(defaultCenter);
    }
  }, [initialLat, initialLng, isOpen]);

  if (!isOpen) return null;

  const handleMapClick = (lat, lng) => {
    const roundLat = parseFloat(lat.toFixed(6));
    const roundLng = parseFloat(lng.toFixed(6));
    setSelectedPos([roundLat, roundLng]);
  };

  const handleConfirm = () => {
    if (selectedPos) {
      onSelectLocation(selectedPos[0].toString(), selectedPos[1].toString());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/50 rounded-xl">
              <MapPin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">{title}</h3>
              <p className="text-[11px] text-emerald-100">Click anywhere on the map to set pin coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-slate-100">
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
                    <p className="text-emerald-700">📍 Pin Location Set</p>
                    <p className="text-[10px] text-slate-600 font-mono mt-1">
                      Lat: {selectedPos[0]}<br />Lng: {selectedPos[1]}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Floating Instructions Banner */}
          <div className="absolute top-3 left-3 right-3 z-[400] pointer-events-none flex justify-center">
            <div className="bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Tap anywhere on Dinagat Islands map to drop location pin</span>
            </div>
          </div>
        </div>

        {/* Footer with Selected Coordinates and Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex-1 sm:flex-initial">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Selected Coordinates</span>
              {selectedPos ? (
                <span className="text-xs font-black text-emerald-800 font-mono">
                  {selectedPos[0].toFixed(5)}, {selectedPos[1].toFixed(5)}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-600">No point clicked yet</span>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedPos}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all ${
                selectedPos
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>Confirm Location Pin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapPickerModal;
