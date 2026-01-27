import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: colors.darker,
        tabBarInactiveTintColor: colors.lighter,
        tabBarLabelStyle: styles.labelStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FAF7F2',
    // borderTopColor will be set dynamically via theme
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  labelStyle: {
    fontSize: 12,
  },
});
