import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { weatherAPI } from '@/services/api';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WeatherData {
  current: {
    location: string;
    country: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
}

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get user location, fallback to Manila
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await weatherAPI.getForecast(
                position.coords.latitude,
                position.coords.longitude
              );
              if (response.success) {
                setWeatherData(response.data);
              }
            } catch (err) {
              // Fallback to Taguig City
              const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
              if (response.success) {
                setWeatherData(response.data);
              }
            }
          },
          async () => {
            // Geolocation failed, use Taguig City
            const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
            if (response.success) {
              setWeatherData(response.data);
            }
          }
        );
      } else {
        // Geolocation not supported, use Taguig City
        const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
        if (response.success) {
          setWeatherData(response.data);
        }
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <Sun className="w-6 h-6 text-yellow-500" />,
      '01n': <Sun className="w-6 h-6 text-gray-400" />,
      '02d': <Cloud className="w-6 h-6 text-gray-500" />,
      '02n': <Cloud className="w-6 h-6 text-gray-600" />,
      '03d': <Cloud className="w-6 h-6 text-gray-500" />,
      '03n': <Cloud className="w-6 h-6 text-gray-600" />,
      '04d': <Cloud className="w-6 h-6 text-gray-600" />,
      '04n': <Cloud className="w-6 h-6 text-gray-700" />,
      '09d': <CloudRain className="w-6 h-6 text-blue-500" />,
      '09n': <CloudRain className="w-6 h-6 text-blue-600" />,
      '10d': <CloudRain className="w-6 h-6 text-blue-500" />,
      '10n': <CloudRain className="w-6 h-6 text-blue-600" />,
      '11d': <CloudRain className="w-6 h-6 text-purple-500" />,
      '11n': <CloudRain className="w-6 h-6 text-purple-600" />,
      '13d': <Cloud className="w-6 h-6 text-blue-200" />,
      '13n': <Cloud className="w-6 h-6 text-blue-300" />,
      '50d': <Cloud className="w-6 h-6 text-gray-400" />,
      '50n': <Cloud className="w-6 h-6 text-gray-500" />,
    };

    return iconMap[iconCode] || <Sun className="w-6 h-6 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="text-center">
            <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Weather unavailable</p>
            <Button 
              onClick={fetchWeatherData} 
              size="sm" 
              variant="outline"
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              {weatherData.current.location}
            </span>
          </div>

          {/* Main Weather Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weatherData.current.icon)}
              <div>
                <div className="text-xl font-bold text-gray-800">
                  {weatherData.current.temperature}°C
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {weatherData.current.description}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600">{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">{weatherData.current.windSpeed} m/s</span>
            </div>
          </div>

          {/* View More Button */}
          <div className="pt-2 border-t border-gray-200">
            <Link to="/weather">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs hover:bg-blue-50"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Full Forecast
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
