import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for buyer and seller
const buyerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sellerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteMapProps {
  buyerLocation: {
    lat: number;
    lng: number;
    address: string;
    name: string;
  };
  sellerLocations: Array<{
    lat: number;
    lng: number;
    address: string;
    name: string;
    items: any[];
    totalWeight?: number; // Total weight for this seller in kg
    deliveryWarnings?: string[]; // Delivery warnings
    tripsNeeded?: number; // Number of delivery trips needed
  }>;
  onRoutesCalculated?: (routes: Array<{
    seller: any;
    distance: number;
    duration: number;
    coordinates: [number, number][];
  }>) => void;
  showDeliveryWarnings?: boolean; // Whether to show delivery warnings
}

const RouteMap: React.FC<RouteMapProps> = ({ 
  buyerLocation, 
  sellerLocations, 
  onRoutesCalculated, 
  showDeliveryWarnings = true 
}) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate routes from buyer to each seller
  useEffect(() => {
    const calculateRoutes = async () => {
      setLoading(true);
      setError(null);
      const newRoutes: any[] = [];

      for (const seller of sellerLocations) {
        try {
          const route = await getRoute(
            [buyerLocation.lng, buyerLocation.lat],
            [seller.lng, seller.lat]
          );
          
          if (route) {
            newRoutes.push({
              seller,
              coordinates: route.coordinates,
              distance: route.distance,
              duration: route.duration
            });
          }
        } catch (error) {
          console.error(`Error calculating route to ${seller.name}:`, error);
        }
      }

      setRoutes(newRoutes);
      setLoading(false);
      
      // Notify parent component about calculated routes
      if (onRoutesCalculated && newRoutes.length > 0) {
        onRoutesCalculated(newRoutes);
      }
    };

    if (buyerLocation && sellerLocations.length > 0) {
      calculateRoutes();
    }
  }, [buyerLocation, sellerLocations, onRoutesCalculated]);

  const getRoute = async (start: [number, number], end: [number, number]) => {
    const apiKey1 = import.meta.env.VITE_OPENROUTE_API_KEY;
    const apiKey2 = import.meta.env.VITE_OPENROUTE_API_KEY2;

    const tryWithKey = async (apiKey: string) => {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const route = data.features[0];
        return {
          coordinates: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]), // Swap to lat,lng
          distance: route.properties.summary.distance,
          duration: route.properties.summary.duration
        };
      }
      return null;
    };

    try {
      // Try with first API key
      return await tryWithKey(apiKey1);
    } catch (error) {
      console.warn('First API key failed, trying second key:', error);
      try {
        // Try with second API key
        return await tryWithKey(apiKey2);
      } catch (error2) {
        console.error('Both API keys failed:', error2);
        setError('Unable to calculate route. Please check your internet connection.');
        return null;
      }
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.round(duration / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate center point and zoom level
  const calculateBounds = () => {
    const allCoords = [
      [buyerLocation.lat, buyerLocation.lng],
      ...sellerLocations.map(seller => [seller.lat, seller.lng])
    ];

    const lats = allCoords.map(coord => coord[0]);
    const lngs = allCoords.map(coord => coord[1]);

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    return { center: [centerLat, centerLng] as [number, number] };
  };

  const { center } = calculateBounds();

  // Component to fit bounds after routes are loaded
  const FitBounds = () => {
    const map = useMap();

    useEffect(() => {
      if (routes.length > 0) {
        const allPoints = [
          [buyerLocation.lat, buyerLocation.lng],
          ...sellerLocations.map(seller => [seller.lat, seller.lng])
        ];
        
        const bounds = L.latLngBounds(allPoints as L.LatLngTuple[]);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, [map, routes]);

    return null;
  };

  const getRouteColor = (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm">
          <p>{error}</p>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Buyer marker */}
        <Marker position={[buyerLocation.lat, buyerLocation.lng]} icon={buyerIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-green-600">Your Location</h3>
              <p className="text-sm">{buyerLocation.name}</p>
              <p className="text-xs text-gray-600">{buyerLocation.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Seller markers */}
        {sellerLocations.map((seller, index) => (
          <Marker key={index} position={[seller.lat, seller.lng]} icon={sellerIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-red-600">Seller</h3>
                <p className="text-sm">{seller.name}</p>
                <p className="text-xs text-gray-600">{seller.address}</p>
                <div className="mt-2">
                  <p className="text-xs font-medium">Items from this seller:</p>
                  {seller.items.map((item, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      • {item.product?.productName} (x{item.quantity})
                    </p>
                  ))}
                </div>
                {routes[index] && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-blue-600">
                      📍 Distance: {formatDistance(routes[index].distance)}
                    </p>
                    <p className="text-xs text-blue-600">
                      🕒 Travel time: {formatDuration(routes[index].duration)}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route lines */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.coordinates}
            pathOptions={{
              color: getRouteColor(index),
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
        ))}

        <FitBounds />
      </MapContainer>

      {/* Route information */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-sm text-gray-600">Calculating routes...</div>
        </div>
      )}

      {routes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Delivery Routes:</h4>
          {routes.map((route, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getRouteColor(index) }}
                ></div>
                <span className="font-medium">{route.seller.name}</span>
              </div>
              <div className="text-xs text-gray-600">
                {formatDistance(route.distance)} • {formatDuration(route.duration)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteMap;
