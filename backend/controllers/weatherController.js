// Using native fetch API (Node.js 18+)

const weatherController = {
    // Get current weather and hourly forecast
    getWeatherForecast: async (req, res) => {
        try {
            const { lat, lon, city } = req.query;
            const API_KEY = process.env.OWM_API_KEY;

            if (!API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: 'Weather API key not configured'
                });
            }

            let weatherData;
            let forecastData;

            // If coordinates are provided, use them
            if (lat && lon) {
                // Current weather
                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                
                if (!weatherResponse.ok) {
                    throw new Error(`Weather API error: ${weatherResponse.status}`);
                }
                
                weatherData = await weatherResponse.json();

                // 5-day forecast with 3-hour intervals
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                
                if (!forecastResponse.ok) {
                    throw new Error(`Forecast API error: ${forecastResponse.status}`);
                }
                
                forecastData = await forecastResponse.json();
            } else if (city) {
                // Current weather by city
                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
                );
                
                if (!weatherResponse.ok) {
                    throw new Error(`Weather API error: ${weatherResponse.status}`);
                }
                
                weatherData = await weatherResponse.json();

                // 5-day forecast with 3-hour intervals
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
                );
                
                if (!forecastResponse.ok) {
                    throw new Error(`Forecast API error: ${forecastResponse.status}`);
                }
                
                forecastData = await forecastResponse.json();
            } else {
                // Default to Taguig City if no location provided
                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=Taguig,PH&appid=${API_KEY}&units=metric`
                );
                
                if (!weatherResponse.ok) {
                    throw new Error(`Weather API error: ${weatherResponse.status}`);
                }
                
                weatherData = await weatherResponse.json();

                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=Taguig,PH&appid=${API_KEY}&units=metric`
                );
                
                if (!forecastResponse.ok) {
                    throw new Error(`Forecast API error: ${forecastResponse.status}`);
                }
                
                forecastData = await forecastResponse.json();
            }

            // Process current weather
            const currentWeather = {
                location: weatherData.name,
                country: weatherData.sys.country,
                temperature: Math.round(weatherData.main.temp),
                feelsLike: Math.round(weatherData.main.feels_like),
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                windSpeed: weatherData.wind.speed,
                windDirection: weatherData.wind.deg,
                visibility: weatherData.visibility / 1000, // Convert to km
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                sunrise: new Date(weatherData.sys.sunrise * 1000),
                sunset: new Date(weatherData.sys.sunset * 1000)
            };

            // Process hourly forecast (next 24 hours)
            const hourlyForecast = forecastData.list.slice(0, 8).map(item => ({
                time: new Date(item.dt * 1000),
                temperature: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                windSpeed: item.wind.speed,
                windDirection: item.wind.deg,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                precipitation: item.pop * 100 // Probability of precipitation
            }));

            // Process daily forecast (next 5 days)
            const dailyForecast = [];
            const processedDates = new Set();

            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateString = date.toDateString();

                if (!processedDates.has(dateString)) {
                    processedDates.add(dateString);
                    dailyForecast.push({
                        date: date,
                        temperature: Math.round(item.main.temp),
                        tempMin: Math.round(item.main.temp_min),
                        tempMax: Math.round(item.main.temp_max),
                        humidity: item.main.humidity,
                        windSpeed: item.wind.speed,
                        description: item.weather[0].description,
                        icon: item.weather[0].icon,
                        precipitation: item.pop * 100
                    });
                }
            });

            // Agricultural insights based on weather
            const agriculturalInsights = generateAgriculturalInsights(currentWeather, hourlyForecast);

            res.status(200).json({
                success: true,
                data: {
                    current: currentWeather,
                    hourly: hourlyForecast,
                    daily: dailyForecast.slice(0, 5),
                    agriculturalInsights
                }
            });

        } catch (error) {
            console.error('Weather forecast error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching weather forecast'
            });
        }
    },

    // Get weather alerts
    getWeatherAlerts: async (req, res) => {
        try {
            const { lat, lon, city } = req.query;
            const API_KEY = process.env.OWM_API_KEY;

            if (!API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: 'Weather API key not configured'
                });
            }

            let alertsData;

            if (lat && lon) {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error(`Alerts API error: ${response.status}`);
                }
                
                alertsData = await response.json();
            } else if (city) {
                // Get coordinates first
                const geoResponse = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
                );
                
                if (!geoResponse.ok) {
                    throw new Error(`Geo API error: ${geoResponse.status}`);
                }
                
                const geoData = await geoResponse.json();
                
                if (geoData.length > 0) {
                    const { lat, lon } = geoData[0];
                    const alertResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                    );
                    
                    if (!alertResponse.ok) {
                        throw new Error(`Alerts API error: ${alertResponse.status}`);
                    }
                    
                    alertsData = await alertResponse.json();
                }
            }

            const alerts = alertsData?.alerts || [];

            res.status(200).json({
                success: true,
                data: {
                    alerts: alerts.map(alert => ({
                        senderName: alert.sender_name,
                        event: alert.event,
                        start: new Date(alert.start * 1000),
                        end: new Date(alert.end * 1000),
                        description: alert.description
                    }))
                }
            });

        } catch (error) {
            console.error('Weather alerts error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching weather alerts'
            });
        }
    }
};

// Generate agricultural insights based on weather data
function generateAgriculturalInsights(current, hourly) {
    const insights = [];

    // Temperature insights
    if (current.temperature > 35) {
        insights.push({
            type: 'warning',
            title: 'High Temperature Alert',
            message: 'Very hot weather may stress plants. Ensure adequate watering and consider shade protection.',
            icon: '🌡️'
        });
    } else if (current.temperature < 10) {
        insights.push({
            type: 'warning',
            title: 'Cold Weather Alert',
            message: 'Cold temperatures may damage tender plants. Consider protection or moving potted plants indoors.',
            icon: '🥶'
        });
    }

    // Humidity insights
    if (current.humidity > 80) {
        insights.push({
            type: 'info',
            title: 'High Humidity',
            message: 'High humidity may promote fungal diseases. Ensure good air circulation around plants.',
            icon: '💧'
        });
    } else if (current.humidity < 30) {
        insights.push({
            type: 'info',
            title: 'Low Humidity',
            message: 'Low humidity may cause plant stress. Consider misting or using a humidifier.',
            icon: '🏜️'
        });
    }

    // Wind insights
    if (current.windSpeed > 20) {
        insights.push({
            type: 'warning',
            title: 'Strong Winds',
            message: 'Strong winds may damage plants. Secure tall plants and consider wind protection.',
            icon: '💨'
        });
    }

    // Precipitation insights
    const avgPrecipitation = hourly.reduce((sum, hour) => sum + hour.precipitation, 0) / hourly.length;
    if (avgPrecipitation > 70) {
        insights.push({
            type: 'info',
            title: 'High Precipitation Expected',
            message: 'Heavy rain expected. Check drainage and protect delicate plants from excess water.',
            icon: '🌧️'
        });
    } else if (avgPrecipitation < 10) {
        insights.push({
            type: 'info',
            title: 'Dry Weather',
            message: 'Low chance of rain. Plan for regular watering, especially for outdoor plants.',
            icon: '☀️'
        });
    }

    // General growing conditions
    if (current.temperature >= 20 && current.temperature <= 30 && current.humidity >= 40 && current.humidity <= 70) {
        insights.push({
            type: 'success',
            title: 'Optimal Growing Conditions',
            message: 'Great weather for plant growth! Perfect time for planting and outdoor activities.',
            icon: '🌱'
        });
    }

    return insights;
}

module.exports = weatherController;
