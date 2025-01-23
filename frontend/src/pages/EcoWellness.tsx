import { useState, useEffect } from 'react';
import axios from 'axios';

interface EnvironmentalData {
  airQuality?: {
    stations: Array<{
      AQI: number;
      aqiInfo: {
        category: string;
        pollutant: string;
      };
    }>;
  };
  pollen?: {
    data: Array<{
      Risk: {
        grass_pollen: string;
        tree_pollen: string;
        weed_pollen: string;
      };
    }>;
  };
  weather?: {
    data: {
      temperature: number;
      humidity: number;
      summary: string;
    };
  };
}

export default function EcoWellness() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({});
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's location when component mounts
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchEnvironmentalData = async () => {
      if (!location) return;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/eco-wellness/environment/${location.lat}/${location.lng}`
        );
        setEnvironmentalData(response.data);
        
        // Get recommendations based on environmental data
        const recResponse = await axios.post(
          'http://localhost:5000/api/eco-wellness/recommendations',
          { environmentalData: response.data }
        );
        setRecommendations(recResponse.data.choices[0].message.content);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchEnvironmentalData();
    }
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">EcoWellness</h1>
            <p className="mt-2 text-sm text-gray-700">
              Your personalized health and wellness recommendations based on environmental factors.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Air Quality Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Air Quality</h3>
                {environmentalData.airQuality?.stations[0] && (
                  <div className="mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {environmentalData.airQuality.stations[0].AQI}
                    </p>
                    <p className="text-sm text-gray-500">
                      {environmentalData.airQuality.stations[0].aqiInfo.category}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pollen Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Pollen Levels</h3>
                {environmentalData.pollen?.data[0] && (
                  <div className="mt-3 space-y-2">
                    <p>Grass: {environmentalData.pollen.data[0].Risk.grass_pollen}</p>
                    <p>Tree: {environmentalData.pollen.data[0].Risk.tree_pollen}</p>
                    <p>Weed: {environmentalData.pollen.data[0].Risk.weed_pollen}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Weather</h3>
                {environmentalData.weather?.data && (
                  <div className="mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {environmentalData.weather.data.temperature}°C
                    </p>
                    <p className="text-sm text-gray-500">
                      {environmentalData.weather.data.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Card */}
            {recommendations && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">Personalized Recommendations</h3>
                    <div className="mt-3 prose prose-sm max-w-none">
                      {recommendations.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
