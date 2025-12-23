import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = () => {
    if (!validateInputs()) return;
    dispatch(loginUser({ email, password }));
  };

  // Navigate and store user after successful login
  useEffect(() => {
    if (user) {
      (async () => {
        try {
          await AsyncStorage.multiSet([
            ['userEmail', user.email],
            ['userUid', user.uid],
          ]);
        } catch (e) {
          console.error('Failed to store user data', e);
        }
        // Reset navigation stack to HomeScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })();
    }
  }, [user, navigation]);

  // Show error alert once and clear it from Redux
  useEffect(() => {
    if (error) {
      Alert.alert('Login failed', error, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.headerSection}>
          <View style={styles.logoSquare}>
            <Icon name="check-bold" size={45} color="white" />
          </View>
          <Text style={styles.title}>Welcome back!</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              placeholderTextColor="#999"
            />
            {email.includes('@') && (
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            )}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>PASSWORD</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              textContentType="password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color="#CCC"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>or log in with</Text>

        <View style={styles.socialRow}>
          {/* Social login buttons should be implemented or hidden */}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpText}>Get started!</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoSquare: {
    width: 80,
    height: 80,
    backgroundColor: '#5F59E1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#5F59E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginTop: 15 },
  form: { width: '100%' },
  label: { fontSize: 12, color: '#999', fontWeight: '700', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  forgotText: {
    textAlign: 'right',
    color: '#5F59E1',
    marginTop: 12,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#5F59E1',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  orText: { textAlign: 'center', color: '#AAA', marginVertical: 25 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#999' },
  signUpText: { color: '#5F59E1', fontWeight: 'bold' },
});
