import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Упс! Что-то пошло не так',
  message,
  onRetry,
  retryText = 'Попробовать снова',
  style,
  titleStyle,
  messageStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>
      
      <Text style={[styles.message, messageStyle]}>
        {message}
      </Text>
      
      {onRetry && (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="outline"
          size="medium"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  
  retryButton: {
    minWidth: 140,
  },
}); 