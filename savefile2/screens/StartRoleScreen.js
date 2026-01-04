import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartRoleScreen({ onSelectRole }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir le mode</Text>

      <TouchableOpacity
        style={styles.buttonUser}
        onPress={() => onSelectRole('driver')}
      >
        <Text style={styles.buttonText}>Utilisateur</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonAdmin}
        onPress={() => onSelectRole('admin')}
      >
        <Text style={styles.buttonText}>Admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 40,
  },
  buttonUser: {
    width: '70%',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonAdmin: {
    width: '70%',
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
});
