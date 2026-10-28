import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ErrorBanner({ visible = false, message, onDismiss }) {
  const { fontSizeScale } = useTheme();

  if (!visible || !message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning-circle-outline" size={20} color="#ffffff" />
        <Text style={[styles.message, { fontSize: 12 * fontSizeScale }]}>
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close-circle" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
});
