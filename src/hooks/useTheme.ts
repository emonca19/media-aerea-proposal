import { useColorScheme } from 'react-native';
import { theme } from '../constants/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? theme.dark : theme.light;
}
