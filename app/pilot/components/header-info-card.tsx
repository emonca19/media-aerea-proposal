// src/components/HeaderInfoCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './pilot-dashboard-styles';



import type { ColorValue } from 'react-native';

const HEADER_CARD_GRADIENT_COLORS: [ColorValue, ColorValue] = ['#2563eb', '#1e40af'];

type PilotInfo = {
  name: string;
  avatar: any; // Replace 'any' with the correct type if known (e.g., ImageSourcePropType)
};

type Weather = {
  icon: string;
  temperature: number;
  description: string;
};

type WeatherData = {
  loading: boolean;
  weather?: Weather;
  error?: boolean | string;
};

type HeaderInfoCardProps = {
  pilotInfo: PilotInfo;
  currentDate: string;
  weatherData: WeatherData;
  onLogout: () => void;
};

const HeaderInfoCard: React.FC<HeaderInfoCardProps> = ({ pilotInfo, currentDate, weatherData, onLogout }) => (
  <LinearGradient
    colors={HEADER_CARD_GRADIENT_COLORS} // Usa la constante importada
    style={styles.headerCard_container}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.headerCard_topRow}>
      <View style={styles.headerCard_textContainer}>
        <Text style={styles.headerCard_greeting}>Hola,</Text>
        <Text style={styles.headerCard_pilotName}>
          {pilotInfo && pilotInfo.name ? pilotInfo.name.split(' ')[0] : 'Piloto'}!
        </Text>
      </View>
      <View style={styles.headerCard_avatarLogoutContainer}>
        {pilotInfo && pilotInfo.avatar && 
          <Image source={pilotInfo.avatar} style={styles.headerCard_avatar} />
        }
        <TouchableOpacity onPress={onLogout} style={styles.headerCard_logoutButton}>
          <Ionicons name="log-out-outline" size={26} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.headerCard_bottomRow}>
      <Text style={styles.headerCard_dateText}>{currentDate}</Text>
      {weatherData && !weatherData.loading && weatherData.weather && (
        <View style={styles.headerCard_weatherContainer}>
          <Image source={{ uri: 'https:' + weatherData.weather.icon }} style={styles.headerCard_weatherIcon} />
          <Text style={styles.headerCard_weatherText}>{weatherData.weather.temperature}°C, {weatherData.weather.description}</Text>
        </View>
      )}
    </View>
    {weatherData && weatherData.loading && (
      <Text style={[styles.headerCard_weatherText, { alignSelf: 'center', marginTop: 6 }]}>Cargando clima...</Text>
    )}
    {weatherData && weatherData.error && (
      <Text style={[styles.headerCard_weatherText, { alignSelf: 'center', marginTop: 6, color: '#ffcdd2' }]}>Error clima</Text>
    )}
  </LinearGradient>
);

export default HeaderInfoCard;