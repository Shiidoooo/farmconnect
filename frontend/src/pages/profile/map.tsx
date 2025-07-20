import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's missing icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      // Fallback to Manila coordinates
      setPosition([14.5995, 120.9842]);
      map.setView([14.5995, 120.9842], 15);
      return;
    }

    if (!isSecureContext) {
      console.warn('Geolocation requires HTTPS or localhost. Using default location.');
      // Don't even attempt geolocation on non-secure contexts
      setPosition([14.5995, 120.9842]);
      map.setView([14.5995, 120.9842], 15);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        map.setView([latitude, longitude], 15);
      },
      (err) => {
        console.error('Geolocation error:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        
        // Provide more specific error messages
        let errorMsg = 'Could not get your location. ';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg += 'Permission denied. Please allow location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'An unknown error occurred.';
            break;
        }
        
        alert(errorMsg);
        // Fallback to Manila coordinates
        setPosition([14.5995, 120.9842]);
        map.setView([14.5995, 120.9842], 15);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [map]);

  return position ? (
    <Marker position={position}>
      <Popup>
        {position[0] === 14.5995 && position[1] === 120.9842 
          ? "Default location (Manila) - Enable location access for your actual position"
          : "You are here"
        }
      </Popup>
    </Marker>
  ) : null;
};

export default function MapWithLocation() {
  return (
    <MapContainer
      center={[14.5995, 120.9842]} // Default to Manila
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LocationMarker />
    </MapContainer>
  );
}
