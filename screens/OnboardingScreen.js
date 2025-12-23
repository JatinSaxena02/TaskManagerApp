import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add 'onComplete' to the props
export default function OnboardingScreen({ navigation, onComplete }) {
  const handleContinue = async () => {
    try {
      // 1. Save the status to AsyncStorage
      await AsyncStorage.setItem('hasOnboarded', 'true');

      // 2. Trigger the parent function to re-render the Navigator
      // The navigator will automatically switch from Onboarding to Login
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save onboarding status.');
      console.error('AsyncStorage error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoSquare}>
        <Icon name="check-bold" size={45} color="white" />
      </View>
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
  logoSquare: {
    width: 85,
    height: 85,
    backgroundColor: '#5F59E1',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#5F59E1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
