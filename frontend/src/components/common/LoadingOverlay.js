import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function LoadingOverlay({ visible = false, message = 'Đang tải...' }) {
  const { theme, fontSizeScale } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.contentContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={theme.primary || '#f26f21'} />
          <Text style={[styles.message, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
