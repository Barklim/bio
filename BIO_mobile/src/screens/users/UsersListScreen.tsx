import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

import { LoadingSpinner, ErrorMessage, UserCard, Input, Button } from '../../components';
import { useUsers } from '../../hooks';
import { useAuth } from '../../contexts';
import { User } from '../../types';

export const UsersListScreen: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const { data: users, isLoading, error, refetch } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter users by search query
  const filteredUsers = users?.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }) || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserPress = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <UserCard
      user={item}
      onPress={handleUserPress}
    />
  );

  const renderListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>
        Привет, {currentUser?.firstName}! 👋
      </Text>
      
      <Input
        placeholder="Поиск пользователей..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchInput}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Найдено пользователей: {filteredUsers.length}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Попробуйте изменить поисковый запрос'
          : 'Здесь пока нет зарегистрированных пользователей'
        }
      </Text>
    </View>
  );

  if (isLoading && !users) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Загрузка пользователей..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderListHeader()}
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Ошибка загрузки пользователей'}
          onRetry={() => refetch()}
          style={styles.errorContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  
  searchInput: {
    marginBottom: 16,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#DC3545',
  },
  
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
}); 