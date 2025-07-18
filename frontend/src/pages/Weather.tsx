import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WeatherForecast from '@/components/WeatherForecast';
import { Cloud, Sun, CloudRain } from 'lucide-react';

const Weather: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sun className="w-8 h-8 text-yellow-500" />
            <Cloud className="w-8 h-8 text-gray-500" />
            <CloudRain className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Weather Forecast
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about weather conditions to make better decisions for your farming and gardening activities. 
            Get hourly forecasts, daily predictions, and agricultural insights.
          </p>
        </div>

        {/* Weather Forecast Component */}
        <WeatherForecast />

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Why Weather Matters for Agriculture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <Sun className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Temperature</h3>
              <p className="text-sm text-gray-600">
                Optimal temperatures ensure healthy plant growth and prevent stress-related issues.
              </p>
            </div>
            <div className="text-center p-4">
              <CloudRain className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Precipitation</h3>
              <p className="text-sm text-gray-600">
                Knowing when it will rain helps you plan irrigation and protect sensitive crops.
              </p>
            </div>
            <div className="text-center p-4">
              <Cloud className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Humidity</h3>
              <p className="text-sm text-gray-600">
                Humidity levels affect plant diseases and the effectiveness of treatments.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Weather;
