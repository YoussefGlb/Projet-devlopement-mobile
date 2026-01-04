import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createStackNavigator();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard Administrateur',
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#F8FAFC',
        }}
      />
    </Stack.Navigator>
  );
}
