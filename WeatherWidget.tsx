import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WeatherData, getUserLocation, getWeather, getDayName, getWeatherIcon, formatTemperature } from '@/lib/weather';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const WeatherWidget: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coords = await getUserLocation();
        setLocation(coords);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  const { data: weatherData, isLoading, isError, refetch } = useQuery<WeatherData>({ 
    queryKey: ['/api/weather', location?.lat, location?.lon],
    queryFn: async () => {
      if (!location) throw new Error('Location not available');
      return getWeather(location.lat, location.lon);
    },
    enabled: !!location,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/10 z-0"></div>
            <div className="flex items-center p-4 relative z-10">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 ml-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-100 bg-gray-50">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-2 text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
                <Skeleton className="h-8 w-8 mx-auto my-1 rounded-full" />
                <Skeleton className="h-4 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !weatherData) {
    return (
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <span className="material-icons text-5xl mb-2">cloud_off</span>
            <p>Unable to load weather data</p>
            <button 
              onClick={() => refetch()} 
              className="text-primary hover:underline mt-2 text-sm flex items-center justify-center mx-auto"
            >
              <span className="material-icons text-sm mr-1">refresh</span>
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const today = now.getDay();

  return (
    <Card className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/10 z-0"></div>
          <div className="flex items-center p-4 relative z-10">
            <div className="text-yellow-500 mr-3">
              <span className="material-icons text-5xl">
                {getWeatherIcon(weatherData.current.icon)}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-semibold">
                {formatTemperature(weatherData.current.temperature)}
              </div>
              <div className="text-sm text-gray-600">{weatherData.location}</div>
            </div>
            <div>
              <button 
                onClick={() => refetch()} 
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">refresh</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-100 bg-gray-50">
          {weatherData.forecast.slice(0, 4).map((day, index) => (
            <div key={index} className="p-2 text-center">
              <div className="text-xs text-gray-500">
                {getDayName((today + index) % 7)}
              </div>
              <div className="material-icons text-yellow-500 my-1 text-xl">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-sm font-medium">
                {formatTemperature(day.temperature)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
