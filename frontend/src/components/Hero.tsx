import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Droplets, Sun, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { weatherAPI } from "@/services/api";
import Seed3D from "./Seed3D";
import WavyBackground from "./WavyBackground";
import WeatherWidget from "./WeatherWidget";

const Hero = () => {
  const navigate = useNavigate();
  const [plantData, setPlantData] = useState({
    humidity: 65,
    waterLevel: 450,
    atmosphere: "Loading...",
    humidityProgress: 65,
    waterProgress: 75,
    atmosphereProgress: 50
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
      
      // Try to get user location, fallback to default
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await weatherAPI.getForecast(
                position.coords.latitude,
                position.coords.longitude
              );
              if (response.success) {
                updatePlantData(response.data);
              }
            } catch (err) {
              // Fallback to default location
              const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
              if (response.success) {
                updatePlantData(response.data);
              }
            }
          },
          async () => {
            // Geolocation failed, use default
            const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
            if (response.success) {
              updatePlantData(response.data);
            }
          }
        );
      } else {
        // Geolocation not supported, use default
        const response = await weatherAPI.getForecast(undefined, undefined, 'Taguig');
        if (response.success) {
          updatePlantData(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlantData = (weatherData: any) => {
    const humidity = weatherData.current?.humidity || 65;
    const temperature = weatherData.current?.temperature || 25;
    const description = weatherData.current?.description || "Clear";
    
    // Calculate optimal water level based on humidity and temperature
    // Lower humidity = more watering needed, higher temp = more watering needed
    const baseWaterLevel = 300;
    const humidityFactor = (100 - humidity) / 100; // Higher when humidity is low
    const tempFactor = Math.max(0, (temperature - 20) / 20); // Higher when temp > 20°C
    const waterLevel = Math.round(baseWaterLevel + (humidityFactor * 200) + (tempFactor * 150));
    
    // Calculate progress bars
    const humidityProgress = humidity;
    const waterProgress = Math.min(100, (waterLevel / 600) * 100);
    
    // Determine atmosphere quality based on weather conditions
    let atmosphereProgress = 50;
    if (description.toLowerCase().includes('clear') || description.toLowerCase().includes('sunny')) {
      atmosphereProgress = 90;
    } else if (description.toLowerCase().includes('cloud')) {
      atmosphereProgress = 70;
    } else if (description.toLowerCase().includes('rain')) {
      atmosphereProgress = 40;
    }

    setPlantData({
      humidity,
      waterLevel,
      atmosphere: description,
      humidityProgress,
      waterProgress,
      atmosphereProgress
    });
  };

  const handleBuyNowClick = () => {
    navigate('/shop');
  };

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-white to-red-100 overflow-hidden min-h-screen">
      <WavyBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Proper care of 
              <span className="flex items-center justify-center lg:justify-start mt-2">
                <Leaf className="w-8 h-8 lg:w-10 lg:h-10 text-red-600 mr-3" />
                <span className="text-red-600">Plants</span>
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Looking for an easier way to care for your plants? Our HarvestConnect tool provides straightforward tips to keep them happy and healthy all year. Start now and show your plants the love they need!
            </p>
            
            {/* Plant Status Cards */}
            <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-sm">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  {loading ? "Loading..." : `${plantData.humidity}% Humidity`}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${plantData.humidityProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-sm">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {loading ? "Loading..." : `${plantData.waterLevel}ml Water needed`}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${plantData.waterProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-sm">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {loading ? "Loading..." : plantData.atmosphere}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${plantData.atmosphereProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button 
                onClick={handleBuyNowClick}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-full"
              >
                Buy now
              </Button>
            </div>
          </div>

          {/* 3D Plant Scene with Modern Container */}
          <div className="relative order-first lg:order-last">
            {/* Main curved container */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Background curved shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[3rem] transform rotate-12 shadow-2xl"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] transform rotate-6 shadow-xl"></div>
              
              {/* Plant container - moved up with higher z-index */}
              <div className="relative bg-white rounded-[2rem] p-8 shadow-xl overflow-hidden z-20 transform -translate-y-4">
                <div className="w-full h-[350px] sm:h-[400px] lg:h-[450px] relative z-30">
                  <Seed3D />
                </div>
                
                {/* Floating status badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-40">
                  <span className="text-xs font-semibold text-gray-800">100% Organic</span>
                </div>
              </div>
            </div>
            
            {/* Weather Widget */}
            <div className="absolute bottom-8 right-0 lg:right-3 w-64 z-30">
              <WeatherWidget />
            </div>
            
            {/* Color progress bar */}
            <div className="absolute bottom-4 left-4 right-4 lg:left-8 lg:right-16 z-20">
              <div className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 h-2 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">3°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
