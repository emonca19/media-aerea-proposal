import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function TurbineDetails() {
  const { turbineId } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Detalles de Turbina ID: {turbineId}</Text>
    </View>
  );
}