import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../features/auth/authSlice';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

// ... existing imports

export default function RootNavigator() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [initializing, setInitializing] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(null);

  // 1. Function to re-check the onboarding status
  const checkOnboarding = async () => {
    const onboarded = await AsyncStorage.getItem('hasOnboarded');
    setHasOnboarded(onboarded === 'true');
  };

  useEffect(() => {
    checkOnboarding();
    const unsubscribe = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        dispatch(setUser({ uid: firebaseUser.uid, email: firebaseUser.email }));
      } else {
        dispatch(clearUser());
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing || hasOnboarded === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasOnboarded ? (
        // 2. Pass the function as a prop using a render callback
        <Stack.Screen name="Onboarding">
          {props => (
            <OnboardingScreen {...props} onComplete={checkOnboarding} />
          )}
        </Stack.Screen>
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
