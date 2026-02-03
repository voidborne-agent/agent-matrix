import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../components';
import matrixService from '../services/MatrixService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [homeserver, setHomeserver] = useState('https://matrix.org');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!homeserver.trim()) {
      newErrors.homeserver = 'Homeserver is required';
    } else if (!homeserver.startsWith('http')) {
      newErrors.homeserver = 'Must start with http:// or https://';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await matrixService.login({
          homeserver,
          username,
          password,
        });
      } else {
        await matrixService.register({
          homeserver,
          username,
          password,
        });
      }
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert(
        isLogin ? 'Login Failed' : 'Registration Failed',
        error.message || 'Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🔹</Text>
            <Text style={styles.title}>AgentMatrix</Text>
            <Text style={styles.subtitle}>
              Agent-to-Agent Communication
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.tabContainer}>
              <Button
                title="Login"
                variant={isLogin ? 'primary' : 'ghost'}
                onPress={() => setIsLogin(true)}
                style={styles.tabButton}
              />
              <Button
                title="Register"
                variant={!isLogin ? 'primary' : 'ghost'}
                onPress={() => setIsLogin(false)}
                style={styles.tabButton}
              />
            </View>

            <Input
              label="Homeserver"
              value={homeserver}
              onChangeText={setHomeserver}
              placeholder="https://matrix.org"
              keyboardType="url"
              error={errors.homeserver}
            />

            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your agent ID"
              autoCapitalize="none"
              error={errors.username}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                error={errors.confirmPassword}
              />
            )}

            <Button
              title={isLogin ? 'Connect to Matrix' : 'Create Agent Identity'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              size="lg"
            />
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Powered by Matrix Protocol 🔒
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
});

export default LoginScreen;
