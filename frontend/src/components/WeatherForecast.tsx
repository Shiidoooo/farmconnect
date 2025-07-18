import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { weatherAPI } from '@/services/api';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  MapPin, 
  RefreshCw, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  Sunrise,
  Sunset
} from 'lucide-react';

interface WeatherData {
  current: {
    location: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    description: string;
    icon: string;
    sunrise: string;
    sunset: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    temperature: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    precipitation: number;
  }>;
  agriculturalInsights: Array<{
    type: string;
    title: string;
    message: string;
    icon: string;
  }>;
}

const WeatherForecast: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'current' | 'hourly' | 'daily' | 'insights'>('current');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Taguig City
          fetchWeatherData(undefined, undefined, 'Taguig');
        }
      );
    } else {
      // Fallback to Taguig City
      fetchWeatherData(undefined, undefined, 'Taguig');
    }
  }, []);

  const fetchWeatherData = async (lat?: number, lon?: number, city?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await weatherAPI.getForecast(lat, lon, city);
      
      if (response.success) {
        setWeatherData(response.data);
      } else {
        setError(response.message || 'Failed to fetch weather data');
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = () => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lon);
    } else {
      fetchWeatherData(undefined, undefined, 'Taguig');
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <Sun className="w-8 h-8 text-yellow-500" />,
      '01n': <Sun className="w-8 h-8 text-gray-400" />,
      '02d': <Cloud className="w-8 h-8 text-gray-500" />,
      '02n': <Cloud className="w-8 h-8 text-gray-600" />,
      '03d': <Cloud className="w-8 h-8 text-gray-500" />,
      '03n': <Cloud className="w-8 h-8 text-gray-600" />,
      '04d': <Cloud className="w-8 h-8 text-gray-600" />,
      '04n': <Cloud className="w-8 h-8 text-gray-700" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-600" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-600" />,
      '11d': <CloudRain className="w-8 h-8 text-purple-500" />,
      '11n': <CloudRain className="w-8 h-8 text-purple-600" />,
      '13d': <Cloud className="w-8 h-8 text-blue-200" />,
      '13n': <Cloud className="w-8 h-8 text-blue-300" />,
      '50d': <Cloud className="w-8 h-8 text-gray-400" />,
      '50n': <Cloud className="w-8 h-8 text-gray-500" />,
    };

    return iconMap[iconCode] || <Sun className="w-8 h-8 text-yellow-500" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading weather data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button onClick={refreshWeather} className="mt-4 bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <h2 className="text-2xl font-bold text-gray-800">
            {weatherData.current.location}, {weatherData.current.country}
          </h2>
        </div>
        <Button onClick={refreshWeather} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={selectedView === 'current' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('current')}
          className="flex-1"
        >
          Current
        </Button>
        <Button
          variant={selectedView === 'hourly' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('hourly')}
          className="flex-1"
        >
          Hourly
        </Button>
        <Button
          variant={selectedView === 'daily' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('daily')}
          className="flex-1"
        >
          Daily
        </Button>
        <Button
          variant={selectedView === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('insights')}
          className="flex-1"
        >
          Insights
        </Button>
      </div>

      {/* Current Weather */}
      {selectedView === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getWeatherIcon(weatherData.current.icon)}
                <span>Current Weather</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {weatherData.current.temperature}°C
                  </div>
                  <div className="text-gray-600 capitalize">
                    {weatherData.current.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Feels like {weatherData.current.feelsLike}°C
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Humidity: {weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>Wind: {weatherData.current.windSpeed} m/s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>Pressure: {weatherData.current.pressure} hPa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>Visibility: {weatherData.current.visibility} km</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span>Sun & Moon</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sunrise className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Sunrise</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(weatherData.current.sunrise).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sunset className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Sunset</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(weatherData.current.sunset).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hourly Forecast */}
      {selectedView === 'hourly' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>24-Hour Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weatherData.hourly.map((hour, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {new Date(hour.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(hour.icon)}
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {hour.temperature}°C
                  </div>
                  <div className="text-xs text-gray-500 capitalize mb-2">
                    {hour.description}
                  </div>
                  <div className="text-xs text-blue-600">
                    {hour.precipitation}% rain
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Forecast */}
      {selectedView === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <span>5-Day Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weatherData.daily.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-600 w-20">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon(day.icon)}
                      <span className="text-sm capitalize">{day.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{day.tempMax}°</span> / {day.tempMin}°
                    </div>
                    <div className="text-sm text-blue-600">
                      {day.precipitation}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {day.windSpeed} m/s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agricultural Insights */}
      {selectedView === 'insights' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Agricultural Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weatherData.agriculturalInsights.length > 0 ? (
                weatherData.agriculturalInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-800">{insight.title}</h4>
                        <span className="text-xl">{insight.icon}</span>
                      </div>
                      <p className="text-sm text-gray-600">{insight.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No weather warnings. Good conditions for farming!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherForecast;
