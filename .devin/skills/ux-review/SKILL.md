# UX Review Skill

**Agent:** UI/UX Agent
**Purpose:** Review and optimize user experience flows

## When to Use This Skill

Use this skill when you need to:
- Review user flows for a feature
- Identify UX issues in existing screens
- Optimize navigation patterns
- Improve error handling and feedback
- Enhance accessibility

## Review Checklist

### 1. Navigation
- [ ] Clear back navigation
- [ ] Logical flow between screens
- [ ] Breadcrumbs if needed
- [ ] Deep linking support
- [ ] Tab bar consistency

### 2. Feedback
- [ ] Loading states for async operations
- [ ] Success confirmations
- [ ] Error messages are clear and actionable
- [ ] Progress indicators for long operations
- [ ] Haptic feedback for key actions

### 3. Input Validation
- [ ] Real-time validation feedback
- [ ] Clear error messages per field
- [ ] Disabled states for invalid forms
- [ ] Helper text for complex inputs
- [ ] Input masks for formatted data

### 4. Empty States
- [ ] Helpful message when no data
- [ ] Call-to-action to add data
- [ ] Illustration or icon
- [ ] Consistent with app branding

### 5. Error Boundaries
- [ ] Graceful error handling
- [ ] Retry mechanisms
- [ ] Error reporting to user
- [ ] App doesn't crash on errors

### 6. Accessibility
- [ ] Proper contrast ratios
- [ ] Touch targets ≥ 44x44px
- [ ] Screen reader labels
- [ ] Semantic HTML components
- [ ] Keyboard navigation support

### 7. Performance
- [ ] Fast initial load
- [ ] Smooth animations (60fps)
- [ ] No blocking operations on main thread
- [ ] Optimized images
- [ ] Lazy loading for lists

## Review Process

1. **Analyze the user flow**
   - Map out the complete user journey
   - Identify decision points
   - Note potential friction points

2. **Evaluate each screen**
   - Check against review checklist
   - Identify issues
   - Prioritize by severity

3. **Provide recommendations**
   - Specific improvements
   - Implementation suggestions
   - Priority levels (Critical, High, Medium, Low)

## Output Format

```markdown
## UX Review: [Feature/Screen Name]

### User Flow Analysis
[Description of the flow]

### Issues Found

#### Critical
- **Issue:** [Description]
- **Impact:** [Why it's critical]
- **Recommendation:** [How to fix]

#### High
- **Issue:** [Description]
- **Impact:** [Why it's high priority]
- **Recommendation:** [How to fix]

#### Medium
- **Issue:** [Description]
- **Impact:** [Why it's medium priority]
- **Recommendation:** [How to fix]

#### Low
- **Issue:** [Description]
- **Impact:** [Why it's low priority]
- **Recommendation:** [How to fix]

### Positive Aspects
- [List what's working well]

### Overall Score
- Navigation: X/10
- Feedback: X/10
- Validation: X/10
- Accessibility: X/10
- Performance: X/10

**Total Score:** X/10
```

## Example

### Review: LoginScreen

**Issues Found:**

#### Critical
- None

#### High
- **Issue:** No loading state during Google Sign-in
- **Impact:** User doesn't know if sign-in is processing
- **Recommendation:** Add loading indicator on Google button

#### Medium
- **Issue:** Error messages are generic
- **Impact:** Users can't troubleshoot
- **Recommendation:** Provide specific error messages (e.g., "Wrong password" vs "Network error")

#### Low
- **Issue:** No password strength indicator
- **Impact:** Users create weak passwords
- **Recommendation:** Add password strength meter during registration

**Overall Score:** 7/10

## After Review

1. Save review in `.devin/UX_REVIEWS/<feature-name>.md`
2. Share with Frontend Agent for implementation
3. Track fixes in `.devin/PROGRESS.md`
