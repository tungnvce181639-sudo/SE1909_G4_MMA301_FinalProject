# Manual Test Skill

**Agent:** Tester Agent
**Purpose:** Execute manual test plans and report findings

## When to Use This Skill

Use this skill when you need to:
- Perform manual testing of features
- Test UI/UX flows that are hard to automate
- Test on real devices
- Test accessibility manually
- Perform exploratory testing
- Verify fixes for reported bugs

## Prerequisites

- Have the app running on device/simulator
- Review test plan or feature requirements
- Understand expected behavior
- Have test account credentials ready

## Test Plan Template

### Test Plan Structure

```markdown
## Manual Test Plan: [Feature Name]

**Date:** [Date]
**Tester:** [Name]
**Environment:** [iOS/Android, Device/Emulator]
**App Version:** [Version]

### Test Cases

#### TC001: [Test Case Name]
**Priority:** High/Medium/Low
**Preconditions:**
- User is logged in
- App is on home screen

**Steps:**
1. Navigate to [screen]
2. Tap [button]
3. Enter [input]
4. Tap [submit]

**Expected Result:**
- [Expected behavior]

**Actual Result:**
- [Actual behavior]

**Status:** Pass/Fail

**Notes:**
- [Any observations]
```

## Authentication Testing

### Login Screen Testing

```markdown
## Manual Test Plan: Login Screen

### TC001: Successful Login with Valid Credentials
**Priority:** Critical
**Preconditions:** User is on login screen

**Steps:**
1. Enter valid email: test@fpt.edu.vn
2. Enter valid password: password123
3. Tap "ĐĂNG NHẬP" button

**Expected Result:**
- Loading indicator appears
- User is redirected to home screen
- User profile is loaded

**Status:** ✅ Pass / ❌ Fail

---

### TC002: Login with Invalid Email Format
**Priority:** High
**Preconditions:** User is on login screen

**Steps:**
1. Enter invalid email: invalid-email
2. Enter any password
3. Tap "ĐĂNG NHẬP" button

**Expected Result:**
- Validation error message appears
- Error message: "Vui lòng sử dụng định dạng MSSV@fpt.edu.vn"
- User remains on login screen

**Status:** ✅ Pass / ❌ Fail

---

### TC003: Login with Wrong Password
**Priority:** High
**Preconditions:** User is on login screen

**States:**
1. Enter valid email: test@fpt.edu.vn
2. Enter wrong password: wrongpassword
3. Tap "ĐĂNG NHẬP" button

**Expected Result:**
- Error message appears
- Error message: "Mật khẩu hoặc email không chính xác"
- User remains on login screen

**Status:** ✅ Pass / ❌ Fail

---

### TC004: Login with Empty Fields
**Priority:** High
**Preconditions:** User is on login screen

**Steps:**
1. Leave email field empty
2. Leave password field empty
3. Tap "ĐĂNG NHẬP" button

**Expected Result:**
- Validation error for email field
- Validation error for password field
- Form is not submitted

**Status:** ✅ Pass / ❌ Fail

---

### TC005: Google Sign-in Flow
**Priority:** High
**Preconditions:** User is on login screen, Google account configured

**Steps:**
1. Tap "Google FPT Edu" button
2. Select Google account (if prompted)
3. Authorize app (if prompted)

**Expected Result:**
- Google sign-in screen appears
- User can select account
- After authorization, user is redirected to home screen
- User profile is loaded with Google account info

**Status:** ✅ Pass / ❌ Fail

---

### TC006: Password Visibility Toggle
**Priority:** Medium
**Preconditions:** User is on login screen

**Steps:**
1. Enter password in password field
2. Tap eye icon in password field
3. Verify password is visible
4. Tap eye icon again
5. Verify password is hidden

**Expected Result:**
- Password toggles between visible and hidden
- Eye icon changes to reflect state

**Status:** ✅ Pass / ❌ Fail

---

### TC007: Forgot Password Navigation
**Priority:** Medium
**Preconditions:** User is on login screen

**Steps:**
1. Tap "Quên mật khẩu?" link

**Expected Result:**
- User is navigated to ForgotPassword screen
- ForgotPassword screen loads correctly

**Status:** ✅ Pass / ❌ Fail

---

### TC008: Register Navigation
**Priority:** Medium
**Preconditions:** User is on login screen

**Steps:**
1. Tap "Đăng ký tài khoản mới" button

**Expected Result:**
- User is navigated to Register screen
- Register screen loads correctly

**Status:** ✅ Pass / ❌ Fail
```

## Product Listing Testing

### Post Product Screen Testing

```markdown
## Manual Test Plan: Post Product Screen

### TC001: Successful Product Posting
**Priority:** Critical
**Preconditions:** User is logged in, on PostItem screen

**Steps:**
1. Enter title: "iPhone 13"
2. Enter description: "Like new condition"
3. Enter price: "15000000"
4. Select category: "Electronics"
5. Select condition: "Like New"
6. Upload image from gallery
7. Tap "Đăng tin" button

**Expected Result:**
- Loading indicator appears
- Success message appears: "Đăng tin thành công!"
- User is redirected to MyListings screen
- Product appears in listings

**Status:** ✅ Pass / ❌ Fail

---

### TC002: Validation - Missing Required Fields
**Priority:** High
**Preconditions:** User is on PostItem screen

**Steps:**
1. Leave all fields empty
2. Tap "Đăng tin" button

**Expected Result:**
- Validation errors for all required fields
- Form is not submitted
- Error messages are clear

**Status:** ✅ Pass / ❌ Fail

---

### TC003: Image Upload from Gallery
**Priority:** High
**Preconditions:** User is on PostItem screen

**Steps:**
1. Tap "Thêm ảnh" button
2. Select "Thư viện ảnh"
3. Select an image from gallery
4. Verify image preview appears

**Expected Result:**
- Image picker opens
- User can select image
- Selected image appears in preview
- Image can be removed if needed

**Status:** ✅ Pass / ❌ Fail

---

### TC004: Image Upload from Camera
**Priority:** Medium
**Preconditions:** User is on PostItem screen, camera permission granted

**Steps:**
1. Tap "Thêm ảnh" button
2. Select "Chụp ảnh"
3. Take a photo
4. Verify image preview appears

**Expected Result:**
- Camera opens
- User can take photo
- Photo appears in preview

**Status:** ✅ Pass / ❌ Fail

---

### TC005: Category Selection
**Priority:** Medium
**Preconditions:** User is on PostItem screen

**Steps:**
1. Tap category dropdown
2. Select "Electronics"
3. Verify selection is displayed

**Expected Result:**
- Category dropdown opens
- All categories are displayed
- Selected category is shown in dropdown

**Status:** ✅ Pass / ❌ Fail

---

### TC006: Price Input Validation
**Priority:** High
**Preconditions:** User is on PostItem screen

**Steps:**
1. Enter negative price: "-100"
2. Tap "Đăng tin" button

**Expected Result:**
- Validation error for price
- Error message: "Giá phải lớn hơn 0"

**Status:** ✅ Pass / ❌ Fail
```

## Profile Testing

### User Profile Screen Testing

```markdown
## Manual Test Plan: User Profile Screen

### TC001: Display User Information
**Priority:** High
**Preconditions:** User is logged in, on Profile screen

**Steps:**
1. Navigate to Profile screen
2. Verify user information is displayed

**Expected Result:**
- User avatar is displayed
- User name is displayed
- Student ID is displayed
- Major is displayed
- All information is correct

**Status:** ✅ Pass / ❌ Fail

---

### TC002: Edit Profile Navigation
**Priority:** High
**Preconditions:** User is on Profile screen

**Steps:**
1. Tap "Chỉnh sửa hồ sơ" menu item

**Expected Result:**
- User is navigated to EditProfile screen
- Current profile data is pre-filled

**Status:** ✅ Pass / ❌ Fail

---

### TC003: MyListings Navigation
**Priority:** High
**Preconditions:** User is on Profile screen

**Steps:**
1. Tap "Quản lý tin đăng" menu item

**Expected Result:**
- User is navigated to MyListings screen
- User's listings are displayed

**Status:** ✅ Pass / ❌ Fail

---

### TC004: Settings Navigation
**Priority:** Medium
**Preconditions:** User is on Profile screen

**Steps:**
1. Tap "Cài đặt ứng dụng" menu item

**Expected Result:**
- User is navigated to Settings screen
- Settings options are displayed

**Status:** ✅ Pass / ❌ Fail

---

### TC005: Logout
**Priority:** Critical
**Preconditions:** User is on Profile screen

**Steps:**
1. Scroll to bottom
2. Tap "Đăng xuất" button
3. Confirm logout if prompted

**Expected Result:**
- User is logged out
- User is redirected to Login screen
- Session is cleared

**Status:** ✅ Pass / ❌ Fail

---

### TC006: Wallet Points Display
**Priority:** Medium
**Preconditions:** User is on Profile screen

**Steps:**
1. Verify wallet balance is displayed
2. Verify SmartPoints are displayed

**Expected Result:**
- Wallet balance is shown in VND
- SmartPoints are shown with "Xu" label
- Values are correct

**Status:** ✅ Pass / ❌ Fail
```

## Accessibility Testing

### Accessibility Checklist

```markdown
## Accessibility Test Plan

### Visual Accessibility
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Text is scalable without breaking layout
- [ ] Icons have meaningful labels
- [ ] Images have alt text or descriptions
- [ ] UI elements have sufficient size (min 44x44px touch targets)

### Screen Reader Testing
- [ ] All interactive elements are announced by screen reader
- [ ] Text fields have accessible labels
- [ ] Buttons have accessible labels
- [ ] Navigation is predictable
- [ ] Error messages are announced

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space activates buttons
- [ ] Escape cancels modals

### Cognitive Accessibility
- [ ] Error messages are clear and actionable
- [ ] Form validation provides helpful feedback
- [ ] Instructions are clear and concise
- [ ] Consistent terminology throughout app
- [ ] Sufficient time to complete tasks

### Motor Accessibility
- [ ] Touch targets are at least 44x44px
- [ ] Gestures have alternative (non-gesture) controls
- [ ] No time-limited interactions (or provide extensions)
- [ ] Interface doesn't require fine motor precision
```

## Performance Testing

### Performance Checklist

```markdown
## Performance Test Plan

### App Launch
- [ ] Cold launch time < 3 seconds
- [ ] Warm launch time < 1 second
- [ ] No visible jank during launch

### Screen Transitions
- [ ] Navigation animations are smooth (60fps)
- [ ] No lag when switching tabs
- [ ] Modals open/close smoothly

### List Performance
- [ ] Lists scroll smoothly at 60fps
- [ ] Images load progressively
- [ ] Infinite scroll works without jank

### Input Responsiveness
- [ ] Text input responds immediately
- [ ] Button feedback is instant
- [ ] Loading states appear quickly

### Memory Usage
- [ ] No memory leaks (monitor over time)
- [ ] Memory usage stays within limits
- [ ] Background memory usage is reasonable

### Network Performance
- [ ] API calls complete within acceptable time
- [ ] Offline mode is handled gracefully
- [ ] Retry logic works correctly
```

## Cross-Device Testing

### Device Matrix

```markdown
## Cross-Device Test Plan

### iOS Devices
- [ ] iPhone 14 Pro Max (largest screen)
- [ ] iPhone 14 (standard screen)
- [ ] iPhone SE (smallest screen)
- [ ] iPad (tablet layout)

### Android Devices
- [ ] Samsung Galaxy S23 Ultra (large screen)
- [ ] Google Pixel 7 (standard screen)
- [ ] Small Android device (compact screen)
- [ ] Android tablet (tablet layout)

### Screen Sizes
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 13)
- [ ] 428x926 (iPhone 14 Pro Max)
- [ ] Various Android screen sizes

### OS Versions
- [ ] iOS 15+
- [ ] Android 10+

### Test Areas
- [ ] Layout adapts to different screen sizes
- [ ] Text doesn't overflow
- [ ] Touch targets remain accessible
- [ ] Images scale correctly
- [ ] Navigation works on all devices
```

## Bug Report Template

```markdown
## Bug Report

**Bug ID:** BUG-001
**Title:** [Short description of bug]
**Severity:** Critical/High/Medium/Low
**Priority:** P1/P2/P3/P4
**Reporter:** [Name]
**Date Reported:** [Date]

### Environment
- **Platform:** iOS/Android
- **Device:** [Device model]
- **OS Version:** [Version]
- **App Version:** [Version]

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Screenshots/Videos
[Attach if available]

### Logs
[Paste relevant logs]

### Frequency
[Always/Sometimes/Rarely]

### Workaround
[If there's a workaround, describe it]

### Additional Notes
[Any other relevant information]
```

## Test Execution Process

### Before Testing
1. Review test plan
2. Set up test environment
3. Prepare test data/accounts
4. Clear app data/cache if needed
5. Ensure app is at correct version

### During Testing
1. Follow test steps exactly
2. Document actual results
3. Take screenshots/videos of issues
4. Note any unexpected behavior
5. Collect logs if bugs occur

### After Testing
1. Complete test report
2. Log any bugs found
3. Categorize bugs by severity
4. Provide recommendations
5. Share report with team

## Test Report Template

```markdown
## Manual Test Report

**Feature:** [Feature Name]
**Date:** [Date]
**Tester:** [Name]
**Environment:** [Details]

### Summary
- **Total Test Cases:** [Number]
- **Passed:** [Number]
- **Failed:** [Number]
- **Blocked:** [Number]
- **Pass Rate:** [Percentage]%

### Test Results

| TC ID | Test Case | Priority | Status | Notes |
|-------|-----------|----------|--------|-------|
| TC001 | [Name] | High | Pass | - |
| TC002 | [Name] | High | Fail | Bug ID: BUG-001 |

### Bugs Found
1. **BUG-001:** [Title] - [Severity]
2. **BUG-002:** [Title] - [Severity]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

### Sign-off
**Tester Signature:** [Name]
**Date:** [Date]
```

## Best Practices

### 1. Document Everything
- Take screenshots of bugs
- Record videos of hard-to-reproduce issues
- Keep detailed notes

### 2. Be Thorough
- Test edge cases
- Test with different data
- Test in different states (logged in/out, etc.)

### 3. Be Objective
- Report facts, not opinions
- Provide clear evidence
- Don't assume intent

### 4. Communicate Early
- Report critical bugs immediately
- Don't wait until end of testing
- Escalate blockers

### 5. Follow Up
- Verify bug fixes
- Retest after fixes
- Close bugs when resolved

## After Testing

1. Complete test report
2. Log bugs in issue tracker
3. Share report with Project Manager
4. Schedule follow-up testing if needed
5. Update `.devin/PROGRESS.md`
