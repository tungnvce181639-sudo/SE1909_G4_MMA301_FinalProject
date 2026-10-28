import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function FormTextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines,
  keyboardType = 'default',
  icon,
  iconColor,
  error,
  editable = true,
  ...props
}) {
  const { theme, fontSizeScale } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.background,
            borderColor: error ? '#ba1a1a' : theme.border,
            minHeight: multiline ? 100 : 48,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || theme.textSecondary}
            style={[styles.icon, { marginTop: multiline ? 2 : 0 }]}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { color: theme.text, fontSize: 14 * fontSizeScale },
            icon && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: '#ba1a1a', fontSize: 12 * fontSizeScale }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  inputWithIcon: {
    flex: 1,
  },
  errorText: {
    marginTop: 4,
    fontWeight: '500',
  },
});
