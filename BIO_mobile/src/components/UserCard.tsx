import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onPress?: (user: User) => void;
  style?: ViewStyle;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  style,
}) => {
  const handlePress = () => {
    onPress?.(user);
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName.charAt(0).toUpperCase()}
            {user.lastName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        
        <Text style={styles.email}>
          {user.email}
        </Text>
        
        <View style={styles.statusContainer}>
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
      
      <View style={styles.metaContainer}>
        <Text style={styles.dateText}>
          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
        </Text>
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  avatarContainer: {
    marginRight: 12,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  
  email: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  metaContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
}); 