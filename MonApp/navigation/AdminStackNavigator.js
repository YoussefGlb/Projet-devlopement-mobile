import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import CreateMissionScreen from '../screens/admin/CreateMissionScreen';
import DriverDetailsScreen from '../screens/admin/DriverDetailsScreen';
import DriversScreen from '../screens/admin/DriversScreen';
import FuelManagementScreen from '../screens/admin/FuelManagementScreen';
import MissionDetailScreen from '../screens/admin/MissionDetailsScreen';
import MissionsScreen from '../screens/admin/MissionsScreen';
import TruckDetailScreen from '../screens/admin/TruckDetailScreen';
import TrucksScreen from '../screens/admin/TrucksScreen';
import EditDriverScreen from '../screens/admin/EditDriverScreen';
import DriverHistoryScreen from '../screens/admin/DriverHistoryScreen';
import CreateDriverScreen from '../screens/admin/CreateDriverScreen';
import AddTruckScreen from '../screens/admin/AddTruckScreen';

const Stack = createNativeStackNavigator();

const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
      />
      <Stack.Screen 
        name="Missions" 
        component={MissionsScreen} 
      />
      <Stack.Screen 
        name="CreateMission" 
        component={CreateMissionScreen} 
      />
      <Stack.Screen 
        name="MissionDetail" 
        component={MissionDetailScreen} 
      />
      <Stack.Screen 
        name="Drivers" 
        component={DriversScreen} 
      />
      <Stack.Screen 
        name="DriverDetails" 
        component={DriverDetailsScreen} 
      />
      <Stack.Screen 
        name="EditDriver" 
        component={EditDriverScreen} 
      />
      <Stack.Screen 
        name="DriverHistory" 
        component={DriverHistoryScreen} 
      />
      <Stack.Screen 
        name="CreateDriver" 
        component={CreateDriverScreen} 
      />
      <Stack.Screen 
        name="Trucks" 
        component={TrucksScreen} 
      />
      <Stack.Screen 
        name="TruckDetails" 
        component={TruckDetailScreen} 
      />
      <Stack.Screen 
        name="AddTruck" 
        component={AddTruckScreen} 
      />
      <Stack.Screen 
        name="Fuel" 
        component={FuelManagementScreen} 
      />
    </Stack.Navigator>
  );
};

export default AdminStackNavigator;