import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Droplets, Sun, Wind } from "lucide-react";
import Seed3D from "./Seed3D";
import WavyBackground from "./WavyBackground";
import WeatherWidget from "./WeatherWidget";

const Hero = () => {
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
                <span className="text-sm font-medium text-gray-700">10% Humidity</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div className="bg-blue-500 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-sm">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">450ml Water level</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-sm">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Sunny Atmosphere</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-auto">
                  <div className="bg-yellow-500 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-full">
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
            
            {/* Side management card */}
            <div className="absolute bottom-8 right-0 lg:right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-xs z-30">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Manage your home plants</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Let our smart AI tool help you care for your plants! Find out how much water they need and how much sunlight they can tolerate.
              </p>
            </div>

            {/* Weather Widget */}
            <div className="absolute top-8 right-0 lg:right-8 w-64 z-30">
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
