# E2E Test Skill

**Agent:** Tester Agent
**Purpose:** Write end-to-end tests for critical user flows

## When to Use This Skill

Use this skill when you need to:
- Test complete user journeys
- Test multi-screen workflows
- Test authentication flows
- Test critical business processes
- Test real user scenarios

## Prerequisites

- Review app navigation structure
- Check if Detox or Appium is configured
- Understand critical user flows
- Have test environment setup

## Test Framework Setup

### Detox Configuration

**File:** `package.json`

```json
{
  "scripts": {
    "e2e": "detox test",
    "e2e:build": "detox build --configuration ios.sim.debug",
    "e2e:build:android": "detox build --configuration android.emu.debug"
  },
  "devDependencies": {
    "detox": "^20.0.0",
    "jest-circus": "^29.0.0"
  }
}
```

### Detox Config

**File:** `detox.config.js`

```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/SmartCampus.app',
      build: 'xcodebuild -workspace ios/SmartCampus.xcworkspace -scheme SmartCampus -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 14' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_5_API_33' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

## Authentication Flow Tests

### Login Flow

```javascript
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should successfully login with valid credentials', async () => {
    // Navigate to login screen
    await element(by.id('email-input')).typeText('test@fpt.edu.vn');
    await element(by.id('password-input')).typeText('password123');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify user is logged in
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@fpt.edu.vn');
    await element(by.id('password-input')).typeText('wrongpassword');

    await element(by.id('login-button')).tap();

    // Wait for error message
    await waitFor(element(by.text('Mật khẩu hoặc email không chính xác')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should validate email format', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');

    await element(by.id('login-button')).tap();

    // Should show validation error
    await expect(element(by.text('Vui lòng sử dụng định dạng MSSV@fpt.edu.vn'))).toBeVisible();
  });
});
```

### Registration Flow

```javascript
describe('Registration Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should successfully register new user', async () => {
    // Navigate to register screen
    await element(by.id('register-link')).tap();

    // Fill registration form
    await element(by.id('email-input')).typeText('newuser@fpt.edu.vn');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    await element(by.id('fullname-input')).typeText('New User');

    // Submit registration
    await element(by.id('register-button')).tap();

    // Wait for success message
    await waitFor(element(by.text('Đăng ký thành công!')))
      .toBeVisible()
      .withTimeout(5000);

    // Should navigate to login or home
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should validate password matching', async () => {
    await element(by.id('register-link')).tap();

    await element(by.id('email-input')).typeText('test@fpt.edu.vn');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('different');

    await element(by.id('register-button')).tap();

    await expect(element(by.text('Mật khẩu không khớp'))).toBeVisible();
  });
});
```

### Google Sign-in Flow

```javascript
describe('Google Sign-in Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should successfully sign in with Google', async () => {
    // Tap Google sign-in button
    await element(by.id('google-signin-button')).tap();

    // Wait for Google sign-in screen (mocked)
    await waitFor(element(by.id('google-signin-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Complete Google sign-in (needs mock setup)
    await element(by.id('google-account-select')).tap();

    // Wait for redirect back to app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify user is logged in
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

## Product Listing Flow Tests

### Post Product Flow

```javascript
describe('Post Product Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login first
    await loginUser();
  });

  it('should successfully post a new product', async () => {
    // Navigate to post product screen
    await element(by.id('post-item-button')).tap();

    // Fill product details
    await element(by.id('title-input')).typeText('iPhone 13');
    await element(by.id('description-input')).typeText('Like new condition, includes charger');
    await element(by.id('price-input')).typeText('15000000');

    // Select category
    await element(by.id('category-picker')).tap();
    await element(by.text('Electronics')).tap();

    // Select condition
    await element(by.id('condition-picker')).tap();
    await element(by.text('Like New')).tap();

    // Upload image
    await element(by.id('upload-image-button')).tap();
    await element(by.id('image-library-option')).tap();
    await element(by.id('first-image')).tap();

    // Submit product
    await element(by.id('submit-button')).tap();

    // Wait for success
    await waitFor(element(by.text('Đăng tin thành công!')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify product appears in listings
    await element(by.id('my-listings-button')).tap();
    await expect(element(by.text('iPhone 13'))).toBeVisible();
  });

  it('should validate required fields', async () => {
    await element(by.id('post-item-button')).tap();

    // Try to submit without filling fields
    await element(by.id('submit-button')).tap();

    // Should show validation errors
    await expect(element(by.text('Vui lòng nhập tiêu đề'))).toBeVisible();
    await expect(element(by.text('Vui lòng nhập giá'))).toBeVisible();
  });
});
```

### View Product Details Flow

```javascript
describe('View Product Details Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser();
  });

  it('should display product details correctly', async () => {
    // Navigate to home
    await element(by.id('home-tab')).tap();

    // Tap on first product
    await element(by.id('product-item-0')).tap();

    // Verify product details screen
    await expect(element(by.id('product-title'))).toBeVisible();
    await expect(element(by.id('product-price'))).toBeVisible();
    await expect(element(by.id('product-description'))).toBeVisible();
    await expect(element(by.id('product-images'))).toBeVisible();

    // Verify seller info
    await expect(element(by.id('seller-name'))).toBeVisible();
    await expect(element(by.id('seller-rating'))).toBeVisible();
  });

  it('should allow adding to favorites', async () => {
    await element(by.id('home-tab')).tap();
    await element(by.id('product-item-0')).tap();

    // Tap favorite button
    await element(by.id('favorite-button')).tap();

    // Verify button state changed
    await expect(element(by.id('favorite-button-filled'))).toBeVisible();
  });
});
```

## Order Flow Tests

### Create Order Flow

```javascript
describe('Order Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser();
  });

  it('should successfully create an order', async () => {
    // Navigate to product details
    await element(by.id('home-tab')).tap();
    await element(by.id('product-item-0')).tap();

    // Tap buy button
    await element(by.id('buy-button')).tap();

    // Confirm order
    await element(by.id('confirm-order-button')).tap();

    // Wait for success
    await waitFor(element(by.text('Đặt hàng thành công!')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify order appears in history
    await element(by.id('orders-tab')).tap();
    await expect(element(by.id('order-item-0'))).toBeVisible();
  });

  it('should display order details', async () => {
    await element(by.id('orders-tab')).tap();
    await element(by.id('order-item-0')).tap();

    // Verify order details
    await expect(element(by.id('order-id'))).toBeVisible();
    await expect(element(by.id('order-status'))).toBeVisible();
    await expect(element(by.id('order-total'))).toBeVisible();
    await expect(element(by.id('order-date'))).toBeVisible();
  });
});
```

## Profile Flow Tests

### Edit Profile Flow

```javascript
describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser();
  });

  it('should successfully edit profile', async () => {
    // Navigate to profile
    await element(by.id('profile-tab')).tap();

    // Tap edit profile
    await element(by.id('edit-profile-button')).tap();

    // Update fields
    await element(by.id('fullname-input')).clearText();
    await element(by.id('fullname-input')).typeText('Updated Name');

    await element(by.id('student-id-input')).clearText();
    await element(by.id('student-id-input')).typeText('SE123456');

    await element(by.id('major-input')).clearText();
    await element(by.id('major-input')).typeText('Software Engineering');

    // Save changes
    await element(by.id('save-button')).tap();

    // Wait for success
    await waitFor(element(by.text('Cập nhật thành công!')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify changes reflected
    await expect(element(by.text('Updated Name'))).toBeVisible();
    await expect(element(by.text('SE123456'))).toBeVisible();
  });

  it('should update avatar', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('edit-profile-button')).tap();

    // Tap change avatar
    await element(by.id('change-avatar-button')).tap();

    // Select from gallery
    await element(by.id('gallery-option')).tap();
    await element(by.id('first-image')).tap();

    // Save
    await element(by.id('save-button')).tap();

    // Verify avatar updated
    await expect(element(by.id('profile-avatar'))).toBeVisible();
  });
});
```

## Settings Flow Tests

### Theme Toggle Flow

```javascript
describe('Settings Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser();
  });

  it('should toggle dark mode', async () => {
    // Navigate to settings
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();

    // Toggle dark mode
    await element(by.id('dark-mode-toggle')).tap();

    // Wait for theme change
    await waitFor(element(by.id('settings-screen')))
      .toHaveValue('darkMode', true)
      .withTimeout(1000);

    // Verify dark mode is active
    await expect(element(by.id('dark-background'))).toBeVisible();

    // Toggle back
    await element(by.id('dark-mode-toggle')).tap();
  });

  it('should update notification settings', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();

    // Enable notifications
    await element(by.id('notifications-toggle')).tap();

    // Verify setting saved
    await expect(element(by.id('notifications-toggle'))).toHaveValue('checked', true);
  });
});
```

## Helper Functions

### Login Helper

```javascript
async function loginUser() {
  await element(by.id('email-input')).typeText('test@fpt.edu.vn');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();

  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);
}
```

### Logout Helper

```javascript
async function logoutUser() {
  await element(by.id('profile-tab')).tap();
  await element(by.id('logout-button')).tap();

  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(3000);
}
```

### Navigate Helper

```javascript
async function navigateTo(screenId) {
  await element(by.id(screenId)).tap();

  await waitFor(element(by.id(screenId)))
    .toBeVisible()
    .withTimeout(3000);
}
```

## Best Practices

### 1. Use Explicit Waits
```javascript
// ✅ Good
await waitFor(element(by.id('home-screen')))
  .toBeVisible()
  .withTimeout(5000);

// ❌ Bad
await element(by.id('home-screen')).tap();
```

### 2. Clean Up Between Tests
```javascript
beforeEach(async () => {
  await device.reloadReactNative();
});

afterEach(async () => {
  // Logout if needed
  await logoutUser();
});
```

### 3. Use Descriptive Test IDs
```javascript
// ✅ Good
element(by.id('login-button'))
element(by.id('email-input'))

// ❌ Bad
element(by.id('button-1'))
element(by.id('input-2'))
```

### 4. Test Real User Scenarios
```javascript
it('should complete full purchase flow', async () => {
  // Login
  // Browse products
  // View product
  // Add to cart
  // Checkout
  // Verify order
});
```

### 5. Handle Network Conditions
```javascript
it('should handle network errors gracefully', async () => {
  // Mock network failure
  await device.setNetworkSpeed('offline');

  // Try action
  await element(by.id('submit-button')).tap();

  // Verify error message
  await expect(element(by.text('Lỗi kết nối mạng'))).toBeVisible();

  // Restore network
  await device.setNetworkSpeed('wifi');
});
```

## Running E2E Tests

```bash
# Build and run iOS tests
npm run e2e:build
npm run e2e

# Build and run Android tests
npm run e2e:build:android
npm run e2e

# Run specific test file
npm test -- e2e/auth-flow.test.js
```

## After Writing Tests

1. Run E2E tests on simulator/emulator
2. Verify all critical flows pass
3. Test on real device if possible
4. Document test scenarios
5. Notify all agents if tests reveal issues

## Example

### Task: Write E2E Test for Complete Product Purchase Flow

**Implementation:**

```javascript
describe('Complete Purchase Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete full purchase journey', async () => {
    // Step 1: Login
    await element(by.id('email-input')).typeText('buyer@fpt.edu.vn');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 2: Browse products
    await element(by.id('search-input')).typeText('iPhone');
    await element(by.id('search-button')).tap();

    // Step 3: View product details
    await element(by.id('product-item-0')).tap();

    await expect(element(by.id('product-title'))).toBeVisible();
    await expect(element(by.id('product-price'))).toBeVisible();

    // Step 4: Add to favorites
    await element(by.id('favorite-button')).tap();
    await expect(element(by.id('favorite-button-filled'))).toBeVisible();

    // Step 5: Initiate purchase
    await element(by.id('buy-button')).tap();

    // Step 6: Confirm order
    await waitFor(element(by.id('confirm-order-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('confirm-order-button')).tap();

    // Step 7: Verify success
    await waitFor(element(by.text('Đặt hàng thành công!')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 8: View order in history
    await element(by.id('orders-tab')).tap();

    await expect(element(by.id('order-item-0'))).toBeVisible();
    await element(by.id('order-item-0')).tap();

    await expect(element(by.id('order-status'))).toBeVisible();
    await expect(element(by.id('order-status'))).toHaveText('pending');

    // Step 9: Logout
    await element(by.id('profile-tab')).tap();
    await element(by.id('logout-button')).tap();

    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```
