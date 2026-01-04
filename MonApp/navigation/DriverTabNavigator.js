import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import DashboardScreen from '../screens/driver/DashboardScreen';
import HistoryScreen from '../screens/driver/HistoryScreen';
import MissionDetailsScreen from '../screens/driver/MissionDetailsScreen';
import MissionsScreen from '../screens/driver/MissionsScreen';
import ProfileScreen from '../screens/driver/ProfileScreen';
import TruckScreen from '../screens/driver/TruckScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* =====================================================
   TABS
===================================================== */
function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          switch (route.name) {
            case 'Dashboard':
              icon = focused ? 'home' : 'home-outline';
              break;
            case 'Missions':
              icon = focused ? 'list' : 'list-outline';
              break;
            case 'Truck':
              icon = focused ? 'car-sport' : 'car-sport-outline';
              break;
            case 'History':
              icon = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
              icon = focused ? 'person' : 'person-outline';
              break;
            default:
              icon = 'help-outline';
          }

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />

      <Tab.Screen
        name="Missions"
        component={MissionsScreen}
        options={{ tabBarLabel: 'Missions' }}
      />

      <Tab.Screen
        name="Truck"
        component={TruckScreen}
        options={{ tabBarLabel: 'Camion' }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Historique' }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

/* =====================================================
   ROOT STACK (MISSION DETAILS GLOBAL)
===================================================== */
export default function DriverTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={DriverTabs} />
      <Stack.Screen
        name="MissionDetails"
        component={MissionDetailsScreen}
      />
    </Stack.Navigator>
  );
}
