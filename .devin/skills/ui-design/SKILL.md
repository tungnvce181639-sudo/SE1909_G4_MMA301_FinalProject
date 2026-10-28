# UI Design Skill

**Agent:** UI/UX Agent
**Purpose:** Design user interfaces for new screens and features

## When to Use This Skill

Use this skill when you need to:
- Design a new screen from scratch
- Redesign an existing screen
- Create reusable UI components
- Define design patterns for the app

## Prerequisites

- Review existing screens in `frontend/src/screens/` to understand current design patterns
- Check `frontend/src/context/ThemeContext.js` for available theme colors and styles
- Review `frontend/src/components/common/` for existing reusable components

## Design Guidelines

### 1. Material Design Principles
- Follow Material Design 3 guidelines
- Use elevation for depth
- Proper spacing (4px grid system)
- Consistent corner radius (8-16px)

### 2. Theme Consistency
Always use theme colors from ThemeContext:
- `theme.background` - Main background
- `theme.card` - Card/panel background
- `theme.text` - Primary text
- `theme.textSecondary` - Secondary text
- `theme.border` - Border colors
- `primaryColor` - Brand accent color (#f26f21)

### 3. Responsive Design
- Support different screen sizes
- Use `fontSizeScale` from ThemeContext for font scaling
- Ensure touch targets are at least 44x44px

### 4. States to Design
For each screen, design all states:
- **Loading state:** Show loading indicators
- **Empty state:** Show helpful message when no data
- **Error state:** Show error message with retry option
- **Success state:** Show confirmation

## Output Format

After designing, provide:

1. **Screen Structure**
   ```javascript
   // Component hierarchy
   Screen
   ├── Header
   ├── Content
   │   ├── Section 1
   │   └── Section 2
   └── Footer
   ```

2. **Component Specifications**
   - Component name
   - Props needed
   - Style references
   - State requirements

3. **Design Tokens**
   - Colors used
   - Font sizes
   - Spacing values
   - Border radius

4. **Mockup Description**
   - Layout description
   - Key UI elements
   - User interactions

## Example

### Task: Design EditProfileScreen

**Input:**
- Screen: EditProfileScreen
- Purpose: Allow users to edit their profile information
- Context: User can edit fullName, studentId, major, phone, address

**Output:**

**Screen Structure:**
```
EditProfileScreen
├── Header (title "Chỉnh sửa hồ sơ", back button, save button)
├── ScrollView
│   ├── AvatarSection (avatar image, change avatar button)
│   ├── FormSection
│   │   ├── TextField (fullName)
│   │   ├── TextField (studentId)
│   │   ├── TextField (major)
│   │   ├── TextField (phone)
│   │   └── TextField (address)
│   └── ActionButtons (cancel, save)
└── LoadingOverlay (when saving)
```

**Component Specifications:**
- `ProfileAvatar`: Displays avatar with edit button
- `FormTextField`: Reusable text input with label
- `ActionButtons`: Cancel and Save buttons

**Design Tokens:**
- Primary: #f26f21
- Card background: theme.card
- Input background: theme.input
- Border radius: 12px
- Padding: 16px

**Mockup Description:**
- Top: Header with back button and "Chỉnh sửa hồ sơ" title
- Avatar section: Centered avatar (82x82px) with camera icon button
- Form: Vertical stack of labeled text fields
- Bottom: Save button (primary color, full width), Cancel button (secondary)

## After Design

1. Save design spec in `.devin/DESIGN_SPECS/<screen-name>.md`
2. Update `frontend/src/components/common/` if creating reusable components
3. Hand off to Frontend Agent for implementation
