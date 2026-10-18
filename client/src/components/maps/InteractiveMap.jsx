import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Home } from 'lucide-react';

const getSvgIcon = (color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="white" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-svg-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

/**
 * MapAutoRecenter — listens for changes in the target lat/lng (not the array reference)
 * and pans + zooms the Leaflet map to the new position.
 * Using numeric values as deps avoids the stale-array-reference problem.
 */
const MapAutoRecenter = ({ lat, lng, zoom }) => {
  const map = useMap();
  const prevRef = useRef({ lat: null, lng: null });

  useEffect(() => {
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;
    // Only pan if the coordinates actually changed
    if (prevRef.current.lat === lat && prevRef.current.lng === lng) return;
    prevRef.current = { lat, lng };
    map.setView([lat, lng], zoom || 13, { animate: true, duration: 0.8 });
  }, [lat, lng, zoom, map]);

  return null;
};

export const InteractiveMap = ({
  center = [10.1284, 125.5937],
  zoom = 11,
  items = [],
  selectedItem = null,
  height = '500px'
}) => {

  // Determine where the map should currently be focused
  const hasSelectedCoords =
    selectedItem != null &&
    selectedItem.latitude != null &&
    selectedItem.longitude != null &&
    !isNaN(Number(selectedItem.latitude)) &&
    !isNaN(Number(selectedItem.longitude));

  const focusLat = hasSelectedCoords ? Number(selectedItem.latitude) : center[0];
  const focusLng = hasSelectedCoords ? Number(selectedItem.longitude) : center[1];
  const mapZoom  = hasSelectedCoords ? 14 : zoom;

  // Initial center for MapContainer (init-only prop — MapAutoRecenter handles updates)
  const initCenter = [center[0], center[1]];

  return (
    <div
      className="w-full relative shadow-inner overflow-hidden border border-slate-100 rounded-2xl"
      style={{ height }}
    >
      <MapContainer
        center={initCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items.map((item) => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          // Skip items with missing or zero coordinates
          if (!item.latitude || !item.longitude || isNaN(lat) || isNaN(lng)) return null;

          const isSelected = selectedItem && selectedItem.id === item.id;

          let markerColor = '#0d9488'; // teal — attractions
          if (item.pricePerNight) markerColor = '#f43f5e'; // rose — hotels
          if (isSelected)         markerColor = '#d97706'; // amber — active

          const icon = getSvgIcon(markerColor);

          return (
            <Marker
              key={item.id}
              position={[lat, lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 max-w-[200px] text-left">
                  {item.images && item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.name || item.hotelName}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">
                    {item.name || item.hotelName}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-600">
                      {item.entranceFee !== undefined
                        ? `Fee: ₱${item.entranceFee}`
                        : `₱${item.pricePerNight}/night`}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center space-x-0.5">
                      {item.pricePerNight ? <Home className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                      <span>{item.category || 'Resort'}</span>
                    </span>
                  </div>
                  {/* Show exact coordinates in popup for verification */}
                  <p className="text-[9px] text-slate-300 mt-1 font-mono">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Reactive map re-centering — uses numeric lat/lng deps, not array reference */}
        <MapAutoRecenter lat={focusLat} lng={focusLng} zoom={mapZoom} />
      </MapContainer>

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-40 bg-white/90 backdrop-blur border border-slate-200/50 p-3 rounded-xl shadow-lg flex items-center space-x-4 pointer-events-none">
        <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-bold">
          <span className="h-3.5 w-3.5 rounded-full bg-teal-600 border border-white inline-block shadow-sm" />
          <span>Attractions</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-bold">
          <span className="h-3.5 w-3.5 rounded-full bg-rose-500 border border-white inline-block shadow-sm" />
          <span>Hotels</span>
        </div>
        {selectedItem && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-bold animate-pulse">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-600 border border-white inline-block shadow-sm" />
            <span>Active Spot</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
