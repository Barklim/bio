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

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'),
  confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Ошибка регистрации',
        error instanceof Error ? error.message : 'Произошла неизвестная ошибка'
      );
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Создание аккаунта..." />
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>
            Создайте новый аккаунт
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            name="firstName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Имя"
                placeholder="Введите ваше имя"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Фамилия"
                placeholder="Введите вашу фамилию"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

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
                placeholder="Введите пароль"
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

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Подтверждение пароля"
                placeholder="Подтвердите пароль"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <Text style={styles.passwordToggle}>
                    {showConfirmPassword ? 'Скрыть' : 'Показать'}
                  </Text>
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}
          />

          <Button
            title="Зарегистрироваться"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            loading={isLoading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Уже есть аккаунт?{' '}
          </Text>
          <Button
            title="Войти"
            onPress={navigateToLogin}
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
    paddingTop: 40,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  
  registerButton: {
    marginTop: 20,
  },
  
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  
  footerText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
}); 