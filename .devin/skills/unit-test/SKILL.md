# Unit Test Skill

**Agent:** Tester Agent
**Purpose:** Write unit tests for individual functions and components

## When to Use This Skill

Use this skill when you need to:
- Test individual functions in isolation
- Test React components
- Test service layer logic
- Test utility functions
- Test data transformation functions

## Prerequisites

- Review existing test setup in project
- Check if Jest or other test framework is configured
- Review code to be tested
- Understand testing best practices

## Test Framework Setup

### Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|firebase|@firebase)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.jsx'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
  ],
};
```

### Setup File

**File:** `jest.setup.js`

```javascript
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));
```

## Testing Functions

### Simple Function Test

```javascript
// utils.js
export const add = (a, b) => a + b;
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// utils.test.js
import { add, capitalize } from '../utils';

describe('Utils', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-2, 3)).toBe(1);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });
});
```

### Async Function Test

```javascript
// api.js
export const fetchData = async (id) => {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
};

// api.test.js
import { fetchData } from '../api';

describe('fetchData', () => {
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    );

    const result = await fetchData(1);
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/data/1');
  });

  it('should handle errors', async () => {
    global.fetch = jest.fn(() => Promise.reject('Network error'));

    await expect(fetchData(1)).rejects.toEqual('Network error');
  });
});
```

## Testing React Components

### Component Rendering Test

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('should render with props', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeTruthy();
  });
});
```

### Component with Props Test

```javascript
describe('UserProfile', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should display user name', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('should display user email', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText('john@example.com')).toBeTruthy();
  });
});
```

### Component with User Interaction Test

```javascript
import { fireEvent } from '@testing-library/react-native';

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} title="Click me" />);

    const button = screen.getByText('Click me');
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Component with State Test

```javascript
describe('Counter', () => {
  it('should increment count when button pressed', () => {
    render(<Counter />);

    const button = screen.getByText('Increment');
    const countText = screen.getByText('Count: 0');

    fireEvent.press(button);

    expect(screen.getByText('Count: 1')).toBeTruthy();
  });
});
```

## Testing with Context

### Mock Context

```javascript
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../context/AuthContext';

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('ProtectedScreen', () => {
  it('should render when user is authenticated', () => {
    renderWithAuth(<ProtectedScreen />);
    expect(screen.getByText('Welcome')).toBeTruthy();
  });
});
```

## Testing Services

### Service Function Test

```javascript
// authService.js
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

// authService.test.js
import { login } from '../authService';
import apiClient from '../api/apiClient';

jest.mock('../api/apiClient');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call API with correct parameters', async () => {
      const mockResponse = { data: { token: 'abc123', user: { id: 1 } } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
```

## Testing Utilities

### Date/Time Functions

```javascript
describe('DateUtils', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15/01/2024');
  });

  it('should calculate days until', () => {
    const futureDate = new Date('2024-12-31');
    const today = new Date('2024-01-01');
    expect(getDaysUntil(futureDate, today)).toBe(365);
  });
});
```

### Validation Functions

```javascript
describe('Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone number', () => {
      expect(validatePhone('0123456789')).toBe(true);
    });

    it('should reject invalid phone number', () => {
      expect(validatePhone('123')).toBe(false);
    });
  });
});
```

## Mocking

### Mock External Dependencies

```javascript
// Mock Firebase
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

import { signInWithEmailAndPassword } from 'firebase/auth';

describe('Auth', () => {
  it('should sign in user', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    const result = await login('test@example.com', 'password');
    expect(result).toEqual(mockUser);
  });
});
```

### Mock AsyncStorage

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Storage', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should save and retrieve data', async () => {
    await AsyncStorage.setItem('key', 'value');
    const value = await AsyncStorage.getItem('key');
    expect(value).toBe('value');
  });
});
```

## Test Coverage

### Running Tests with Coverage

```bash
npm test -- --coverage
```

### Coverage Goals

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

## Best Practices

### 1. Arrange, Act, Assert Pattern

```javascript
it('should add two numbers', () => {
  // Arrange
  const a = 2;
  const b = 3;

  // Act
  const result = add(a, b);

  // Assert
  expect(result).toBe(5);
});
```

### 2. Test Descriptive Names

```javascript
// ✅ Good
it('should return user data when API call succeeds');

// ❌ Bad
it('test 1');
```

### 3. Test One Thing Per Test

```javascript
// ✅ Good
it('should validate email format');
it('should validate password length');

// ❌ Bad
it('should validate email and password');
```

### 4. Use beforeEach for Setup

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  // Setup code
});
```

### 5. Clean Up in afterEach

```javascript
afterEach(() => {
  // Cleanup code
});
```

## After Writing Tests

1. Run tests: `npm test`
2. Check coverage: `npm test -- --coverage`
3. Fix any failing tests
4. Update documentation
5. Notify Frontend/Backend Agent if tests reveal bugs

## Example

### Task: Write Unit Tests for Validation Utils

**Implementation:**

```javascript
// validation.test.js
import { validateEmail, validatePhone, validatePassword } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return true for valid phone', () => {
      expect(validatePhone('0123456789')).toBe(true);
      expect(validatePhone('0987654321')).toBe(true);
    });

    it('should return false for invalid phone', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('abcdefghij')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for strong password', () => {
      expect(validatePassword('StrongP@ss123')).toBe(true);
    });

    it('should return false for weak password', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });
});
```
