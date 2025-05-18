import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar...',
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons name="search" size={20} color="#8892b0" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8892b0"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <MaterialIcons name="clear" size={20} color="#8892b0" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
  },
});
