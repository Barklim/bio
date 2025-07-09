import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';

import { Button, Input, LoadingSpinner } from '../../components';
import { useAuth } from '../../contexts';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Ошибка входа',
        error instanceof Error ? error.message : 'Произошла неизвестная ошибка'
      );
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Вход в систему..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Добро пожаловать!</Text>
          <Text style={styles.subtitle}>
            Войдите в свой аккаунт
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Введите ваш email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Пароль"
                placeholder="Введите ваш пароль"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                rightIcon={
                  <Text style={styles.passwordToggle}>
                    {showPassword ? 'Скрыть' : 'Показать'}
                  </Text>
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <Button
            title="Войти"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            loading={isLoading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Нет аккаунта?{' '}
          </Text>
          <Button
            title="Зарегистрироваться"
            onPress={navigateToRegister}
            variant="outline"
            size="small"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  
  form: {
    marginBottom: 30,
  },
  
  passwordToggle: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  loginButton: {
    marginTop: 20,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
}); 