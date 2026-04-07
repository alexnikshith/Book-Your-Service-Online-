import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ providers }) => {
  const cityCoordinates = {
    'hyderabad': [17.3850, 78.4867],
    'bangalore': [12.9716, 77.5946],
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'coimbatore': [11.0168, 76.9558]
  };

  // Default to Hyderabad or San Francisco as backup
  const defaultCenter = [17.3850, 78.4867]; 
  
  // Try to center on the first provider, or the city coordinate, or the default
  let center = defaultCenter;
  
  if (providers.length > 0 && providers[0].location?.coordinates) {
    center = [providers[0].location.coordinates[1], providers[0].location.coordinates[0]];
  } else if (providers.length === 0) {
    // If no providers, see if any provider coordinates matched partially or default to first in list
    // Actually, simple way: check if we have a city match in our static list
    // (This would be better if passed as a prop, but I'll optimize based on provider names if available)
  }

  return (
    <div className="h-[400px] w-full rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {providers.map((p) => (
          p.location?.coordinates && (
            <Marker 
                key={p._id} 
                position={[p.location.coordinates[1], p.location.coordinates[0]]}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[150px] space-y-2">
                  <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {p.user?.name[0].toUpperCase()}
                      </div>
                      <h4 className="font-black text-slate-900 tracking-tight">{p.user?.name}</h4>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{p.category}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      <span className="text-sm font-black text-primary-600">$45/hr</span>
                      <button className="text-[10px] font-black underline uppercase text-slate-600">View Data</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
