# EditProfileScreen Design Specification

**Project:** SmartCampus Market
**Screen:** EditProfileScreen
**Designer:** UI/UX Agent
**Date:** 2026-10-28
**Status:** Design Complete

---

## 📋 Overview

**Purpose:** Allow users to edit their profile information including name, phone, address, and bio, with the ability to change their avatar.

**User Flow:**
1. User navigates to EditProfileScreen from UserProfileScreen
2. Screen loads with current profile data pre-filled
3. User edits fields as needed
4. User can optionally change avatar via image picker
5. User taps "Lưu thay đổi" to save
6. Loading state shown during update
7. Success confirmation or error message displayed
8. User navigates back to UserProfileScreen on success

---

## 🏗️ Screen Structure

```
EditProfileScreen
├── SafeAreaView
│   ├── Header
│   │   ├── Back Button (chevron-back)
│   │   ├── Title ("Chỉnh sửa hồ sơ")
│   │   └── Save Button (text link)
│   └── ScrollView
│       ├── AvatarSection
│       │   ├── Avatar Container (82x82px)
│       │   ├── Avatar Image
│       │   └── Edit Avatar Button (camera icon)
│       ├── FormSection
│       │   ├── TextField (Name)
│       │   ├── TextField (Phone)
│       │   ├── TextField (Address)
│       │   └── TextField (Bio - multiline)
│       └── Error Banner (conditional)
└── LoadingOverlay (when saving)
```

---

## 🎨 Component Specifications

### 1. EditProfileScreen (Main Component)

**Props:**
- `navigation` - React Navigation prop (for back navigation)

**State:**
- `formData` - Object containing editable fields
  - `name: string` - Display name
  - `phone: string` - Phone number
  - `address: string` - Address
  - `bio: string` - Bio/description
- `avatarUri: string | null` - Local URI for new avatar
- `loading: boolean` - Loading state during save
- `error: string | null` - Error message
- `success: boolean` - Success state for confirmation

**Context:**
- `useTheme()` - For theme colors and fontSizeScale
- `useProfile()` - For current profile data and updateProfileData
- `useAuth()` - For user authentication

---

### 2. AvatarSection

**Purpose:** Display current avatar with option to change it

**Layout:**
- Centered horizontally
- Avatar: 82x82px, circular with border
- Edit button: Absolute positioned at bottom-right, 28x28px, circular
- Avatar background: `theme.card` with subtle border

**Behavior:**
- Tapping edit button opens image picker
- Uses `expo-image-picker` for photo selection
- Allows editing (crop) before selection
- Quality: 0.8 (balance quality/file size)
- Updates local state with selected URI
- Does not upload immediately (uploads on save)

**Accessibility:**
- `accessibilityLabel: "Đổi ảnh đại diện"`
- `accessibilityRole: "button"`

---

### 3. FormTextField

**Purpose:** Reusable text input component with label

**Props:**
- `label: string` - Field label
- `value: string` - Current value
- `onChangeText: (text: string) => void` - Change handler
- `placeholder: string` - Placeholder text
- `multiline?: boolean` - For bio field
- `numberOfLines?: number` - For multiline fields
- `keyboardType?: string` - Keyboard type (e.g., 'phone-pad')
- `icon?: string` - Ionicons name (optional)
- `iconColor?: string` - Icon color

**Layout:**
- Label above input
- Input container with rounded corners (12px)
- Background: `theme.background`
- Border: 1px solid `theme.border`
- Focus state: Border color changes to `primaryColor`
- Padding: 12px horizontal, 14px vertical
- Min height: 48px (touch target)

**Typography:**
- Label: 12px, `theme.textSecondary`, fontWeight: '600'
- Input: 14px * fontSizeScale, `theme.text`

**States:**
- Default: Gray border
- Focused: Primary color border, elevated shadow
- Error: Red border (#ba1a1a)

---

### 4. SaveButton

**Purpose:** Primary action to save profile changes

**Layout:**
- Full width (minus 32px margin)
- Height: 48px
- Background: `primaryColor` (#f26f21)
- Border radius: 12px
- Centered text and icon

**Typography:**
- Text: "Lưu thay đổi"
- Size: 14px * fontSizeScale
- Weight: '700'
- Color: #ffffff

**States:**
- Default: Solid primary color
- Pressed: Opacity 0.8
- Disabled: Opacity 0.5, not interactive

**Loading State:**
- Show ActivityIndicator instead of text
- Color: #ffffff

---

### 5. LoadingOverlay

**Purpose:** Full-screen overlay during save operation

**Layout:**
- Full screen (flex: 1)
- Background: Semi-transparent black (rgba(0,0,0,0.5))
- Centered ActivityIndicator
- Centered text below indicator

**Typography:**
- Text: "Đang lưu..."
- Size: 14px * fontSizeScale
- Color: #ffffff
- Weight: '600'

---

## 🎨 Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primaryColor` | #f26f21 | Brand accent, buttons, active states |
| `theme.background` | #f9f9fd (light) / #17181c (dark) | Screen background |
| `theme.card` | #ffffff (light) / #24252a (dark) | Card backgrounds |
| `theme.text` | #1a1c1f (light) / #f5f5f5 (dark) | Primary text |
| `theme.textSecondary` | #584238 (light) / #b9b9c0 (dark) | Secondary text, labels |
| `theme.border` | #e2e2e6 (light) / #4a4b52 (dark) | Borders, dividers |
| `errorColor` | #ba1a1a | Error messages, validation |
| `successColor` | #006b55 | Success messages |

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Header Title | 20px * fontSizeScale | 700 | theme.text |
| Field Label | 12px * fontSizeScale | 600 | theme.textSecondary |
| Input Text | 14px * fontSizeScale | 400 | theme.text |
| Button Text | 14px * fontSizeScale | 700 | #ffffff |
| Error Text | 12px * fontSizeScale | 600 | errorColor |

### Spacing

| Element | Value |
|---------|-------|
| Screen Padding | 16px |
| Section Spacing | 24px |
| Field Spacing | 16px |
| Input Padding | 12px horizontal, 14px vertical |
| Button Margin Top | 24px |

### Border Radius

| Element | Value |
|---------|-------|
| Cards | 12px |
| Inputs | 12px |
| Buttons | 12px |
| Avatar | 41px (82px diameter) |
| Avatar Edit Button | 14px (28px diameter) |

### Elevation

| Element | Shadow |
|---------|--------|
| Cards | elevation: 1, shadowOpacity: 0.1, shadowRadius: 6 |
| Inputs (focused) | elevation: 2, shadowOpacity: 0.15 |

---

## 📱 UI States

### 1. Initial State (Loaded)

**Description:** Screen loads with current profile data pre-filled

**Visual Elements:**
- Header with back button and title
- Avatar showing current profile image
- All form fields populated with current data
- Save button enabled
- No error message

**User Actions:**
- Can edit any field
- Can tap avatar to change
- Can tap back to cancel (with unsaved changes warning)
- Can tap save to submit

---

### 2. Loading State (Saving)

**Description:** User tapped save, data is being sent to backend

**Visual Elements:**
- Full-screen overlay with semi-transparent background
- ActivityIndicator (large, white)
- Text "Đang lưu..." below indicator
- All interactions disabled

**User Actions:**
- None (all interactions blocked)

**Duration:**
- Typically 1-3 seconds
- Timeout after 10 seconds with error

---

### 3. Success State

**Description:** Profile updated successfully

**Visual Elements:**
- Loading overlay dismissed
- Brief success message (Toast or Alert)
- "Đã lưu hồ sơ thành công!"
- Auto-navigate back to UserProfileScreen after 1.5s

**User Actions:**
- None (automatic navigation)

**Alternative:** Show success banner at top with "Đã lưu" and checkmark icon

---

### 4. Error State

**Description:** Update failed due to network or server error

**Visual Elements:**
- Loading overlay dismissed
- Error banner at top of screen
- Red background with error icon
- Error message: "Không thể lưu hồ sơ. Vui lòng thử lại."
- Save button remains enabled for retry

**User Actions:**
- Can tap error banner to dismiss
- Can edit fields and retry save
- Can tap back to cancel

**Error Messages:**
- Network error: "Lỗi kết nối. Vui lòng kiểm tra mạng."
- Validation error: "Vui lòng điền đầy đủ thông tin."
- Server error: "Lỗi máy chủ. Vui lòng thử lại sau."

---

### 5. Validation State

**Description:** Form validation errors before submission

**Visual Elements:**
- Invalid fields have red border
- Error text below invalid field
- Save button may be disabled if critical fields missing

**Validation Rules:**
- Name: Required, min 2 characters
- Phone: Optional, must be valid phone format if provided
- Address: Optional
- Bio: Optional, max 200 characters

**User Actions:**
- Can correct invalid fields
- Save button disabled until valid

---

## 🔄 Navigation Flow

### Entry Points

1. **From UserProfileScreen**
   - Tap "Chỉnh sửa hồ sơ" menu item
   - Route: `EditProfile`

2. **From Avatar Edit Button**
   - Tap camera icon on avatar
   - Route: `EditProfile` (scrolls to avatar section)

### Exit Points

1. **Back Button**
   - Tap back chevron in header
   - Check for unsaved changes
   - If changes exist: Show confirmation dialog
   - If no changes: Navigate back immediately

2. **Save Success**
   - Auto-navigate to UserProfileScreen after 1.5s
   - Or show success button to navigate manually

3. **Cancel (Unsaved Changes)**
   - Alert dialog: "Bạn có muốn lưu thay đổi không?"
   - Options: "Lưu", "Không lưu", "Hủy"

---

## ♿ Accessibility Considerations

### Screen Reader Support

- All interactive elements have `accessibilityLabel`
- Form fields have `accessibilityHint` describing purpose
- Avatar edit button: "Đổi ảnh đại diện"
- Save button: "Lưu thay đổi hồ sơ"
- Back button: "Quay lại"

### Touch Targets

- Minimum 44x44px for all interactive elements
- Avatar edit button: 28x28px (but with larger touch padding)
- Form inputs: Full width, 48px min height
- Buttons: 48px height

### Color Contrast

- Text colors meet WCAG AA standards (4.5:1 ratio)
- Error red (#ba1a1a) on white passes contrast
- Success green (#006b55) on white passes contrast
- Primary orange (#f26f21) on white passes contrast

### Keyboard Navigation

- Form fields focusable
- Tab order: Name → Phone → Address → Bio → Save
- Submit on Enter (for single-line fields)

### Dynamic Font Sizes

- All text scales with `fontSizeScale` from ThemeContext
- Input fields adjust height if needed
- Layout accommodates larger fonts

---

## 📐 Layout Mockup Description

### Header (Top)
- Height: 64px
- Background: `theme.card`
- Border bottom: 1px solid `theme.border`
- Left: Back chevron (24px)
- Center: Title "Chỉnh sửa hồ sơ" (20px, bold)
- Right: Save text link (14px, primary color)

### Avatar Section
- Margin top: 24px
- Centered horizontally
- Avatar: 82x82px circular
- Border: 3px solid `theme.card`
- Edit button: Absolute, bottom-right, 28x28px circular
- Background: `theme.card`
- Icon: Camera (15px, primary color)

### Form Section
- Margin top: 32px
- Margin horizontal: 16px
- Vertical stack of 4 fields
- Each field: Label + Input
- Spacing between fields: 16px

### Field Layout (each)
- Label: 12px, `theme.textSecondary`, bottom: 4px
- Input container: Full width, 48px min height
- Background: `theme.background`
- Border: 1px solid `theme.border`
- Border radius: 12px
- Padding: 12px horizontal, 14px vertical

### Bio Field (special)
- Multiline: true
- numberOfLines: 4
- Height: 100px
- textAlignVertical: 'top'

### Save Button
- Margin top: 32px
- Margin horizontal: 16px
- Height: 48px
- Background: `primaryColor`
- Border radius: 12px
- Text: "Lưu thay đổi" (centered, white, bold)
- Icon: Checkmark (optional, right of text)

### Error Banner (conditional)
- Position: Below header
- Background: Error color (#ba1a1a)
- Padding: 12px
- Text: White, 12px
- Icon: Warning-circle (left)
- Dismissible: X button (right)

---

## 🔧 Technical Considerations

### Image Picker Integration

- Library: `expo-image-picker`
- Permission handling:
  - Request media library permission on first use
  - Show alert if permission denied
- Image options:
  - mediaTypes: Images only
  - allowsEditing: true (crop)
  - quality: 0.8
  - aspect: [1, 1] (square)
- Fallback: If picker fails, keep current avatar

### Data Flow

1. **Load:**
   - Get current profile from `useProfile()`
   - Populate form fields
   - Set avatar URI from profile.avatar

2. **Edit:**
   - Update local state on field change
   - Track unsaved changes flag
   - Validate on blur or submit

3. **Save:**
   - Set loading state
   - Call `updateProfileData()` from ProfileContext
   - If avatar changed, include in update
   - Handle success/error
   - Update global profile state

4. **Avatar Upload:**
   - Image picker returns local URI
   - Store in local state
   - Upload on save (if changed)
   - Update profile with new avatar URL

### Error Handling

- Network errors: Show retry option
- Validation errors: Highlight invalid fields
- Permission errors: Show alert with instructions
- Timeout errors: Show error after 10s

### Performance

- Debounce text input (300ms) for validation
- Lazy load avatar image
- Compress images before upload
- Cancel ongoing requests on unmount

---

## 🎯 Success Criteria

- [ ] Screen loads with current profile data
- [ ] All fields are editable
- [ ] Avatar can be changed via image picker
- [ ] Form validation works correctly
- [ ] Loading state shown during save
- [ ] Success confirmation displayed
- [ ] Error messages are clear and actionable
- [ ] Back navigation handles unsaved changes
- [ ] Design matches UserProfileScreen style
- [ ] Theme colors applied correctly
- [ ] Font scaling works
- [ ] Dark mode supported
- [ ] Accessibility requirements met

---

## 📝 Implementation Notes

### Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
```

### Key Functions

```javascript
// Load profile data
useEffect(() => {
  if (profile) {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      bio: profile.bio || '',
    });
    setAvatarUri(profile.avatar || null);
  }
}, [profile]);

// Handle avatar change
const handleAvatarChange = async () => {
  // Request permission
  // Launch image picker
  // Update local state
};

// Handle save
const handleSave = async () => {
  // Validate
  // Set loading
  // Call updateProfileData
  // Handle success/error
};

// Handle back with unsaved changes
const handleBack = () => {
  if (hasUnsavedChanges) {
    // Show confirmation dialog
  } else {
    navigation.goBack();
  }
};
```

### Reusable Components

Consider extracting these to `frontend/src/components/common/`:
- `FormTextField` - Reusable text input with label
- `AvatarPicker` - Avatar with edit button
- `LoadingOverlay` - Full-screen loading indicator
- `ErrorBanner` - Dismissible error message

---

## 🔄 Design Evolution

### Version 1.0 (Initial)
- Basic form with 4 fields
- Avatar picker
- Save functionality
- Loading and error states

### Future Enhancements (Version 2.0)
- Add more fields (major, studentId)
- Email verification
- Social media links
- Profile visibility settings
- Preview mode before save

---

## 📎 References

- **Existing Screen:** `frontend/src/screens/profile/UserProfileScreen.js`
- **Theme System:** `frontend/src/context/ThemeContext.js`
- **Profile Context:** `frontend/src/context/ProfileContext.js`
- **Design Guidelines:** `.devin/skills/ui-design/SKILL.md`
- **Material Design:** https://m3.material.io/

---

**Next Steps:**
1. Review design with Project Manager
2. Hand off to Frontend Agent for implementation
3. Create reusable components if needed
4. Test implementation against design spec
