import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { registerUser } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';

export default function RegisterScreen({ navigation }) {
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

  const handleRegister = () => {
    if (!validateInputs()) return;
    dispatch(registerUser({ email, password }));
  };

  // Navigate after successful registration
  useEffect(() => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [user, navigation]);

  // Show error alert once and clear it
  useEffect(() => {
    if (error) {
      Alert.alert('Registration failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoSquare}>
              <Icon name="check-bold" size={45} color="white" />
            </View>
            <Text style={styles.title}>Let's get started!</Text>
          </View>

          {/* Registration Form */}
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
                placeholderTextColor="#BDBDBD"
              />
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                textContentType="password"
                placeholderTextColor="#BDBDBD"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#CCC"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Sign Up Section */}
          <Text style={styles.orText}>or sign up with</Text>
          <View style={styles.socialRow}>
            {/* Social login buttons placeholder */}
          </View>

          {/* Login Redirection */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerSection: { alignItems: 'center', marginBottom: 40 },
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E3A59', marginTop: 20 },
  form: { width: '100%' },
  label: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 58,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  signUpButton: {
    backgroundColor: '#5F59E1',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    elevation: 4,
    shadowColor: '#5F59E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  signUpButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  orText: {
    textAlign: 'center',
    color: '#B0B0B0',
    marginVertical: 30,
    fontSize: 14,
  },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#A0A0A0', fontSize: 14 },
  loginLink: { color: '#5F59E1', fontWeight: 'bold', fontSize: 14 },
});
