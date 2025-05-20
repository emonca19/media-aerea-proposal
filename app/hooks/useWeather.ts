// src/hooks/useWeather.ts
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  cloud: number;
  forecast: {
    day: string;
    temp: number;
    icon: string;
  }[];
}

const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      
      // API Key de WeatherAPI.com (regístrate en https://www.weatherapi.com/)
      const API_KEY = '4eccd331e31940199c1232056251905';
      const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&lang=es`;
      const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=5&lang=es`;

      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(url),
        axios.get(forecastUrl),
      ]);

      const currentWeather = currentResponse.data;
      const forecastData = forecastResponse.data;

      const processedData: WeatherData = {
        location: `${currentWeather.location.name}, ${currentWeather.location.country}`,
        temperature: Math.round(currentWeather.current.temp_c),
        description: currentWeather.current.condition.text,
        icon: currentWeather.current.condition.icon,
        humidity: currentWeather.current.humidity,
        windSpeed: Math.round(currentWeather.current.wind_kph),
        cloud: currentWeather.current.cloud,
        forecast: forecastData.forecast.forecastday.map((day: any) => ({
          day: new Date(day.date).toLocaleDateString('es', { weekday: 'short' }),
          temp: Math.round(day.day.avgtemp_c),
          icon: day.day.condition.icon,
        })),
      };

      setWeather(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('No se pudo obtener la información meteorológica');
      Alert.alert('Error', 'No se pudo cargar los datos del clima');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        fetchWeather(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        console.error('Error al obtener la ubicación:', err);
        // Ubicación por defecto (Ciudad de México)
        fetchWeather(19.4326, -99.1332);
      }
    };

    getLocation();
  }, []);

  return { weather, loading, error };
};

export default useWeather;
