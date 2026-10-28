# API Integration Skill

**Agent:** Frontend Agent
**Purpose:** Connect frontend screens to backend API endpoints

## When to Use This Skill

Use this skill when you need to:
- Create new API service functions
- Integrate API calls into screens
- Handle API responses and errors
- Set up request/response interceptors
- Implement data transformation

## Prerequisites

- Review existing API services in `frontend/src/services/api/`
- Check `frontend/src/services/api/apiClient.js` for API client setup
- Review backend API documentation
- Understand authentication flow

## API Client Setup

### Base Configuration

**File:** `frontend/src/services/api/apiClient.js`

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      // Navigate to login (need navigation ref)
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```

## Creating API Service Functions

### Basic CRUD Operations

**File:** `frontend/src/services/api/<resource>Api.js`

```javascript
import apiClient from './apiClient';

// Get all items
export const getAll = async (params = {}) => {
  try {
    const response = await apiClient.get('/resource', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch items');
  }
};

// Get item by ID
export const getById = async (id) => {
  try {
    const response = await apiClient.get(`/resource/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch item');
  }
};

// Create new item
export const create = async (data) => {
  try {
    const response = await apiClient.post('/resource', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create item');
  }
};

// Update item
export const update = async (id, data) => {
  try {
    const response = await apiClient.put(`/resource/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update item');
  }
};

// Delete item
export const delete = async (id) => {
  try {
    const response = await apiClient.delete(`/resource/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete item');
  }
};
```

### Authentication API

**File:** `frontend/src/services/api/authApi.js`

```javascript
import apiClient from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (email, password, fullName) => {
  try {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      fullName
    });
    return response;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh');
    return response;
  } catch (error) {
    throw new Error(error.message || 'Token refresh failed');
  }
};
```

## Integrating API in Screens

### Fetch Data on Component Mount

```javascript
import { useState, useEffect } from 'react';
import { getAll } from '../../services/api/resourceApi';

export default function Screen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getAll();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    // Render data
  );
}
```

### Submit Form Data

```javascript
const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await create(formData);
    Alert.alert('Success', 'Item created successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

### Pagination

```javascript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || loading) return;

  try {
    const result = await getAll({ page: page + 1 });
    setData(prev => [...prev, ...result.data]);
    setPage(prev => prev + 1);
    setHasMore(result.hasMore);
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Search and Filter

```javascript
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState({});

const handleSearch = async () => {
  setLoading(true);
  try {
    const result = await getAll({
      search: searchQuery,
      ...filters
    });
    setData(result);
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

## Error Handling Patterns

### User-Friendly Error Messages

```javascript
const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please login.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response.data?.message || 'An error occurred.';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred.';
  }
};
```

### Retry Logic

```javascript
const retryRequest = async (requestFn, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
};
```

## Data Transformation

### Transform API Response

```javascript
const transformUserData = (apiResponse) => {
  return {
    id: apiResponse._id,
    name: apiResponse.fullName,
    email: apiResponse.email,
    avatar: apiResponse.avatarUrl,
    createdAt: new Date(apiResponse.createdAt).toLocaleDateString(),
  };
};

const loadData = async () => {
  const response = await getUser();
  const userData = transformUserData(response.data);
  setUser(userData);
};
```

### Transform Form Data for API

```javascript
const transformFormData = (formData) => {
  return {
    fullName: formData.name,
    contactEmail: formData.email,
    phoneNumber: formData.phone,
  };
};

const handleSubmit = async () => {
  const apiData = transformFormData(formData);
  await create(apiData);
};
```

## File Upload

### Upload Image

```javascript
import * as ImagePicker from 'expo-image-picker';

const handleImageUpload = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) return;

  const formData = new FormData();
  formData.append('image', {
    uri: result.assets[0].uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  try {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};
```

## Caching

### Simple Cache with AsyncStorage

```javascript
const CACHE_KEY = 'cached_data';

const getCachedData = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

const setCachedData = async (data) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Cache error:', error);
  }
};

const loadData = async () => {
  // Try cache first
  const cached = await getCachedData();
  if (cached) {
    setData(cached);
  }

  // Fetch fresh data
  try {
    const fresh = await getAll();
    setData(fresh);
    await setCachedData(fresh);
  } catch (error) {
    if (!cached) {
      throw error;
    }
  }
};
```

## Best Practices

### 1. Always Handle Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};
```

### 2. Always Handle Errors
```javascript
try {
  await apiCall();
} catch (error) {
  Alert.alert('Error', getErrorMessage(error));
}
```

### 3. Use Async/Aware
```javascript
// ✅ Good
const loadData = async () => {
  const data = await apiCall();
  setData(data);
};

// ❌ Bad
const loadData = () => {
  apiCall().then(data => setData(data));
};
```

### 4. Cancel Requests on Unmount
```javascript
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await apiCall({ signal: controller.signal });
      setData(data);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        setError(error.message);
      }
    }
  };

  loadData();

  return () => controller.abort();
}, []);
```

## After Integration

1. Test API calls with valid and invalid data
2. Test error handling
3. Test loading states
4. Test network error scenarios
5. Update API documentation in `frontend/API_INTEGRATION.md`
6. Notify Tester Agent for testing

## Example

### Task: Integrate Product API

**API Endpoints:**
- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

**Implementation:**

```javascript
// frontend/src/services/api/productApi.js
import apiClient from './apiClient';

export const getProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }
};

export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch product');
  }
};

export const createProduct = async (data) => {
  try {
    const response = await apiClient.post('/products', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create product');
  }
};

export const updateProduct = async (id, data) => {
  try {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update product');
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete product');
  }
};
```
