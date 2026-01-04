import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AdminStackNavigator from './navigation/AdminStackNavigator';
import DriverTabNavigator from './navigation/DriverTabNavigator';
import StartRoleScreen from './screens/StartRoleScreen';

export default function App() {
  const [role, setRole] = useState(null); // null | 'driver' | 'admin'

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer theme={DarkTheme}>
          <StatusBar style="light" />

          {role === null && (
            <StartRoleScreen onSelectRole={setRole} />
          )}

          {role === 'driver' && <DriverTabNavigator />}

          {role === 'admin' && <AdminStackNavigator />}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
