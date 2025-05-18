import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { WindPark } from '../types';

interface WindParksMapProps {
  parks: WindPark[];
  onParkSelect?: (parkId: string) => void;
}

export function WindParksMap({ parks, onParkSelect }: WindParksMapProps) {
  const [initialRegion, setInitialRegion] = useState({
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your position on the map.');
        return;
      }

      if (parks.length > 0) {
        const lats = parks.map(p => p.location.latitude);
        const lngs = parks.map(p => p.location.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        setInitialRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5 || 10,
          longitudeDelta: (maxLng - minLng) * 1.5 || 10,
        });
      } else {
        const location = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        });
      }
    })();
  }, [parks]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {parks.map(park => (
          <Marker
            key={park.id}
            coordinate={{
              latitude: park.location.latitude,
              longitude: park.location.longitude,
            }}
            title={park.name}
            description={park.location.address}
            onPress={() => onParkSelect?.(park.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
