import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen({ navigation }) {
  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      // Navigate to Login screen after onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save onboarding status.');
      console.error('AsyncStorage error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.icon} />
      <Text style={styles.title}>Get things done.</Text>
      <Text style={styles.subtitle}>
        Just a click away from planning your tasks.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  icon: {
    width: width * 0.2,
    height: width * 0.2,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 25,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  subtitle: {
    color: '#666',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
});
