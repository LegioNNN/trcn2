// Interface for weather data
export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    icon: string;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    day: string;
    icon: string;
    temperature: number;
    condition: string;
  }>;
}

// Convert day number to short name
export function getDayName(dayNumber: number): string {
  const days = {
    tr: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };
  
  // Default to Turkish
  const lang = localStorage.getItem('language') || 'tr';
  return days[lang as 'tr' | 'en'][dayNumber];
}

// Get appropriate weather icon based on OpenWeatherMap condition codes
export function getWeatherIcon(condition: string): string {
  const iconMap: Record<string, string> = {
    'clear-day': 'wb_sunny',
    'clear-night': 'nights_stay',
    'partly-cloudy-day': 'partly_cloudy_day',
    'partly-cloudy-night': 'nights_stay',
    'cloudy': 'cloud',
    'rain': 'grain',
    'showers': 'water_drop',
    'fog': 'foggy',
    'snow': 'ac_unit',
    'thunderstorm': 'thunderstorm',
    'wind': 'air',
    'default': 'wb_sunny'
  };
  
  return iconMap[condition] || iconMap.default;
}

// Format temperature based on locale
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

// Get user's location
export async function getUserLocation(): Promise<{lat: number, lon: number}> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
          
          // Default to Konya, Turkey if location access is denied
          resolve({
            lat: 37.8719,
            lon: 32.4843
          });
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      reject(new Error('Geolocation not supported'));
      
      // Default to Konya, Turkey
      resolve({
        lat: 37.8719,
        lon: 32.4843
      });
    }
  });
}

// Get the current weather with forecast
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}
