# Frontend Screen Skill

**Agent:** Frontend Agent
**Purpose:** Implement React Native screens according to UI/UX designs

## When to Use This Skill

Use this skill when you need to:
- Implement a new screen from design spec
- Modify existing screen
- Add new features to existing screen
- Implement screen navigation
- Handle screen states (loading, error, success)

## Prerequisites

- Review design spec in `.devin/DESIGN_SPECS/`
- Check existing screens in `frontend/src/screens/` for patterns
- Review `frontend/src/context/` for available contexts
- Check `frontend/src/components/common/` for reusable components
- Review `frontend/src/navigation/AppNavigator.js` for navigation setup

## Screen Implementation Template

### Basic Screen Structure

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ScreenName({ navigation, route }) {
  const { theme, fontSizeScale } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{error}</Text>
        <TouchableOpacity onPress={loadData}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Screen content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Component Patterns

### 1. Header with Back Button

```javascript
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function CustomHeader({ title, rightAction }) {
  const navigation = useNavigation();
  const { theme, fontSizeScale } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
        {title}
      </Text>
      {rightAction || <View style={styles.headerButton} />}
    </View>
  );
}
```

### 2. Card Component

```javascript
function Card({ children, style }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, style]}>
      {children}
    </View>
  );
}
```

### 3. Loading Overlay

```javascript
function LoadingOverlay({ visible }) {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}
```

### 4. Empty State

```javascript
function EmptyState({ icon, message, action, onAction }) {
  const { theme, fontSizeScale } = useTheme();

  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyMessage, { color: theme.textSecondary, fontSize: 14 * fontSizeScale }]}>
        {message}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.emptyButtonText}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## State Management

### Using Context

```javascript
const { user, login, logout } = useAuth();
const { profile, updateProfile } = useProfile();
const { theme, toggleTheme } = useTheme();
```

### Local State

```javascript
// Simple state
const [value, setValue] = useState('');

// Object state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: ''
});

// Array state
const [items, setItems] = useState([]);

// Update object state
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## Form Handling

### Text Input with Validation

```javascript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const handleEmailChange = (text) => {
  setEmail(text);
  if (!validateEmail(text)) {
    setEmailError('Invalid email format');
  } else {
    setEmailError('');
  }
};

<TextInput
  value={email}
  onChangeText={handleEmailChange}
  style={[styles.input, { borderColor: emailError ? 'red' : theme.border }]}
/>
{emailError ? <Text style={styles.error}>{emailError}</Text> : null}
```

## API Integration

### Fetch Data on Mount

```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/endpoint');
      setData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Submit Form

```javascript
const handleSubmit = async () => {
  setLoading(true);
  try {
    const response = await apiClient.post('/endpoint', formData);
    Alert.alert('Success', 'Data saved successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

## Navigation

### Navigate to Screen

```javascript
navigation.navigate('ScreenName', { param1: 'value1' });
```

### Navigate with Params

```javascript
const { itemId } = route.params;
```

### Replace Screen

```javascript
navigation.replace('ScreenName');
```

### Reset Stack

```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }]
});
```

## Theme Integration

### Using Theme Colors

```javascript
const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();

// Common theme properties
theme.background        // Main background
theme.card             // Card/panel background
theme.text             // Primary text
theme.textSecondary    // Secondary text
theme.border           // Border color
theme.input            // Input background
theme.surface          // Surface color
```

### Font Scaling

```javascript
<Text style={{ fontSize: 16 * fontSizeScale }}>
  Scaled text
</Text>
```

## Common UI Patterns

### Pull to Refresh

```javascript
import { RefreshControl } from 'react-native';

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={loadData}
      tintColor={theme.primary}
    />
  }
>
  {/* Content */}
</ScrollView>
```

### FlatList with Loading

```javascript
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Item item={item} />}
  ListEmptyComponent={<EmptyState message="No items" />}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Modal

```javascript
import { Modal } from 'react-native';

<Modal
  visible={modalVisible}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={[styles.modal, { backgroundColor: theme.card }]}>
    {/* Modal content */}
  </View>
</Modal>
```

## Styling Best Practices

### 1. Use StyleSheet.create

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### 2. Conditional Styling

```javascript
<View style={[
  styles.card,
  isActive && styles.activeCard,
  { backgroundColor: theme.card }
]}>
```

### 3. Platform-specific Styles

```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
});
```

## After Implementation

1. Test screen on different screen sizes
2. Test dark mode
3. Test loading/error states
4. Test navigation
5. Request UI/UX Agent review
6. Update `.devin/PROGRESS.md`

## Example

### Task: Implement EditProfileScreen

**Requirements:**
- Display current profile data
- Allow editing fullName, studentId, major, phone, address
- Save changes to backend
- Show loading state during save

**Implementation:**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import apiClient from '../../services/api/apiClient';

export default function EditProfileScreen({ navigation }) {
  const { theme, fontSizeScale } = useTheme();
  const { profile, updateProfileData } = useProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    major: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: profile.fullName || '',
      studentId: profile.studentId || '',
      major: profile.major || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileData(formData);
      await apiClient.put('/profile/me', formData);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {/* Form fields */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 16 },
});
```
