import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 🔐 AUTH CONTEXT
import { AuthProvider, useAuth } from './context/AuthContext';

// 🔹 NAVIGATORS
import AdminStackNavigator from './navigation/AdminStackNavigator';
import DriverTabNavigator from './navigation/DriverTabNavigator';

// 🔹 AUTH SCREEN
import LoginScreen from './screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

/* =====================================================
   ROOT NAVIGATOR (AUTH PROTECTED)
===================================================== */
function RootNavigator() {
  const { user, loading } = useAuth();

  // ⏳ Attente Firebase (important sur mobile)
  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 🔐 PAS CONNECTÉ */}
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      ) : (
        <>
          {/* 👮 ADMIN */}
          {user.email === 'admin@admin.com' ? (
            <Stack.Screen
              name="AdminApp"
              component={AdminStackNavigator}
              options={{ gestureEnabled: false }}
            />
          ) : (
            <Stack.Screen
              name="DriverApp"
              component={DriverTabNavigator}
              options={{ gestureEnabled: false }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

/* =====================================================
   APP
===================================================== */
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthProvider>
          <NavigationContainer theme={DarkTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
