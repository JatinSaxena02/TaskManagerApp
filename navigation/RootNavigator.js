import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const onboarded = await AsyncStorage.getItem('hasOnboarded');
      setHasOnboarded(onboarded === 'true');
    };

    bootstrap();

    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Block navigation until all async state is resolved
  if (initializing || hasOnboarded === null) {
    return null; // replace with SplashScreen if needed
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
