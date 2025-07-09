import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { LoadingSpinner, ErrorMessage, Button } from '../../components';
import { useUser } from '../../hooks';

export const UserDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id || '0', 10);
  
  const { data: user, isLoading, error, refetch } = useUser(userId);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Загрузка профиля пользователя..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
        
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Ошибка загрузки профиля пользователя'}
          onRetry={() => refetch()}
          style={styles.errorContainer}
        />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
        
        <ErrorMessage
          title="Пользователь не найден"
          message="Запрашиваемый пользователь не существует или был удален"
          style={styles.errorContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль пользователя</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Аватар */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName.charAt(0).toUpperCase()}
              {user.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: user.isActive ? '#28A745' : '#DC3545' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: user.isActive ? '#28A745' : '#DC3545' }
            ]}>
              {user.isActive ? 'Активен' : 'Неактивен'}
            </Text>
          </View>
        </View>

        {/* Информация */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Информация</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ID пользователя</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Имя</Text>
            <Text style={styles.infoValue}>{user.firstName}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Фамилия</Text>
            <Text style={styles.infoValue}>{user.lastName}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Дата регистрации</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Последнее обновление</Text>
            <Text style={styles.infoValue}>
              {new Date(user.updatedAt).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    marginRight: 16,
  },
  
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  
  content: {
    flex: 1,
  },
  
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 40,
    marginBottom: 20,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  
  infoValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
}); 