import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Search, Info } from "lucide-react";
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's missing icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface AddressData {
  city: string;
  barangay: string;
  street: string;
  landmark: string;
  latitude: number;
  longitude: number;
  locationComment: string;
}

interface AddressMapSelectorProps {
  onAddressChange: (address: AddressData) => void;
  initialAddress?: Partial<AddressData>;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

// Component to handle map clicks
const MapClickHandler = ({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const AddressMapSelector: React.FC<AddressMapSelectorProps> = ({ 
  onAddressChange, 
  initialAddress 
}) => {
  const [addressData, setAddressData] = useState<AddressData>({
    city: initialAddress?.city || '',
    barangay: initialAddress?.barangay || '',
    street: initialAddress?.street || '',
    landmark: initialAddress?.landmark || '',
    latitude: initialAddress?.latitude || 14.5995,
    longitude: initialAddress?.longitude || 120.9842,
    locationComment: initialAddress?.locationComment || '',
  });

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    addressData.latitude,
    addressData.longitude
  ]);
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Perform search using Nominatim API
  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Focus search on Philippines
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition([lat, lng]);
    updateAddressData({ latitude: lat, longitude: lng });
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    setLocationAccuracy('high'); // Search results are typically accurate
  };

  // Check and request location permission
  const requestLocationPermission = async () => {
    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Current geolocation permission:', permission.state);
        
        if (permission.state === 'denied') {
          alert('Location access is currently blocked. Please enable location permissions in your browser settings:\n\n1. Click the location icon in the address bar\n2. Choose "Always allow"\n3. Refresh the page and try again');
          return false;
        }
        
        if (permission.state === 'granted') {
          return true;
        }
      }
      
      // For browsers without permissions API or when permission is 'prompt'
      return true;
    } catch (error) {
      console.log('Permissions API not available, proceeding with geolocation request');
      return true;
    }
  };

  // Fallback IP-based location detection
  const getIPLocation = async () => {
    try {
      setIsLoadingLocation(true);
      console.log('Trying IP-based location...');
      
      // Using ipapi.co for IP geolocation (free service)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        
        console.log('IP location obtained:', { lat, lng, city: data.city, country: data.country_name });
        
        setSelectedPosition([lat, lng]);
        updateAddressData({ latitude: lat, longitude: lng });
        setLocationAccuracy('low'); // IP location is generally less accurate
        
        alert(`Approximate location found based on your internet connection: ${data.city}, ${data.country_name}. Please adjust the pin for precise location.`);
      } else {
        throw new Error('No location data received');
      }
    } catch (error) {
      console.error('IP location error:', error);
      alert('Could not determine your location automatically. Please search for your area or click on the map to pin your location manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get user's current location with proper permission handling
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Trying alternative method...');
      getIPLocation();
      return;
    }

    // Check if we're on HTTP (not HTTPS) and not localhost
    const isHTTP = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('192.168.');

    if (isHTTP && !isLocalhost) {
      alert('Location access requires HTTPS connection. Trying alternative method...');
      getIPLocation();
      return;
    }

    // Check permission status first
    const canRequestLocation = await requestLocationPermission();
    if (!canRequestLocation) {
      setIsLoadingLocation(false);
      return;
    }

    // Show user that we're about to request location
    console.log('Requesting location permission...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('GPS location obtained:', { latitude, longitude, accuracy });
        
        setSelectedPosition([latitude, longitude]);
        updateAddressData({ latitude, longitude });
        
        // Determine accuracy level
        if (accuracy <= 10) setLocationAccuracy('high');
        else if (accuracy <= 50) setLocationAccuracy('medium');
        else setLocationAccuracy('low');
        
        setIsLoadingLocation(false);
        
        // Show success message
        alert(`Location found! Accuracy: ${accuracy.toFixed(0)}m`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'GPS location failed. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location permissions in your browser:\n\n1. Click the location icon in the address bar\n2. Choose "Allow"\n3. Try again\n\nOr trying alternative method...';
            console.log(errorMessage);
            // Try IP-based location as fallback
            getIPLocation();
            return;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'GPS location unavailable. Trying alternative method...';
            break;
          case error.TIMEOUT:
            errorMessage += 'GPS request timed out. Trying alternative method...';
            break;
          default:
            errorMessage += 'Trying alternative method...';
            break;
        }
        
        console.log(errorMessage);
        // Try IP-based location as fallback
        getIPLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000 // Accept cached position up to 5 minutes old
      }
    );
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    updateAddressData({ latitude: lat, longitude: lng });
    setLocationAccuracy('medium'); // Manual selection
  };

  // Update address data and notify parent
  const updateAddressData = (updates: Partial<AddressData>) => {
    const newData = { ...addressData, ...updates };
    setAddressData(newData);
    onAddressChange(newData);
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof AddressData, value: string) => {
    updateAddressData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Location Accuracy Alert */}
      {locationAccuracy === 'low' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-orange-700">
            <strong>Location Accuracy Notice:</strong> The pinned location may not be very precise. 
            Please ensure to fill in the landmark field with nearby recognizable places 
            (e.g., "Near SM Mall", "Beside 7-Eleven", "Across from City Hall").
          </AlertDescription>
        </Alert>
      )}

      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pin Your Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for places in Philippines (e.g., 'SM Mall Manila', 'Quezon City', 'BGC Taguig')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  </div>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Button 
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300"
                >
                  <Navigation className="w-4 h-4" />
                  {isLoadingLocation ? 'Detecting Location...' : 'Request Location Access'}
                </Button>
                <div className="text-sm text-gray-600">
                  Browser will ask for permission to access your location
                </div>
              </div>
              
              {/* Location help information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium mb-1">How to enable location:</div>
                    <ul className="text-xs space-y-1">
                      <li>• Click "Request Location Access" - your browser will ask for permission</li>
                      <li>• Choose "Allow" when prompted to enable precise location</li>
                      <li>• If blocked, look for a 🔒 or 📍 icon in your address bar to enable</li>
                      <li>• Alternative: Search for landmarks above or click on the map</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
              <MapContainer
                center={selectedPosition}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                key={`${selectedPosition[0]}-${selectedPosition[1]}`}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <Marker position={selectedPosition}>
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-semibold">Your selected location</div>
                      <div className="text-sm">
                        Lat: {selectedPosition[0].toFixed(6)}<br />
                        Lng: {selectedPosition[1].toFixed(6)}
                      </div>
                      {addressData.locationComment && (
                        <div className="text-sm border-t pt-2">
                          <strong>Note:</strong> {addressData.locationComment}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
                <MapClickHandler onLocationSelect={handleMapClick} />
              </MapContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Form */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Fields */}
            <div className="space-y-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City/Municipality *</Label>
                <Input
                  id="city"
                  value={addressData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="e.g., Manila, Quezon City, Cebu City"
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Barangay */}
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay *</Label>
                <Input
                  id="barangay"
                  value={addressData.barangay}
                  onChange={(e) => handleFieldChange('barangay', e.target.value)}
                  placeholder="e.g., Barangay San Antonio, Brgy. Poblacion"
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={addressData.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                  placeholder="e.g., 123 Rizal Street, Unit 5B Building Name"
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark *</Label>
                <Input
                  id="landmark"
                  value={addressData.landmark}
                  onChange={(e) => handleFieldChange('landmark', e.target.value)}
                  placeholder="e.g., Near SM Mall, Beside McDonald's, Across from City Hall"
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500">
                  Help delivery riders find you easily by mentioning nearby recognizable places
                </p>
              </div>
            </div>

            {/* Small Map View */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Pinned Location</Label>
                <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
                  <MapContainer
                    center={selectedPosition}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    key={`address-map-${selectedPosition[0]}-${selectedPosition[1]}`}
                    scrollWheelZoom={true}
                    dragging={true}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <Marker position={selectedPosition}>
                      <Popup>
                        <div className="space-y-1">
                          <div className="font-semibold text-xs">Your Location</div>
                          <div className="text-xs">
                            {addressData.street && `${addressData.street}, `}
                            {addressData.barangay && `${addressData.barangay}, `}
                            {addressData.city}
                          </div>
                          {addressData.landmark && (
                            <div className="text-xs text-gray-600">
                              📍 {addressData.landmark}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                    <MapClickHandler onLocationSelect={handleMapClick} />
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-500">
                  Click on this map to adjust your pin location
                </p>
              </div>

              {/* Coordinates Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Coordinates:</strong><br />
                  Latitude: {selectedPosition[0].toFixed(6)}<br />
                  Longitude: {selectedPosition[1].toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          {/* Location Comment - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="locationComment">Pin Location Note</Label>
            <Textarea
              id="locationComment"
              value={addressData.locationComment}
              onChange={(e) => handleFieldChange('locationComment', e.target.value)}
              placeholder="Add a note about your pinned location (e.g., 'Red gate with number 123', 'Blue house beside the mango tree', 'White apartment building')"
              className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[80px]"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Help delivery riders identify your exact location by describing visible features, colors, or unique characteristics of your building/house
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressMapSelector;
