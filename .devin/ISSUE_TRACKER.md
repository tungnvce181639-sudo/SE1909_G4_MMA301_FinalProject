# SmartCampus Market - Issue Tracker

**Last Updated:** 2026-10-28
**Project Manager:** Project Manager System

---

## 🐛 Bug Reports

### Critical Bugs
| Bug ID | Title | Component | Assigned To | Status | Priority | Created |
|--------|-------|-----------|-------------|--------|----------|---------|
| BUG-001 | Backend Auth Endpoints Not Implemented | Backend | Backend Agent | � Resolved | P1 | 2026-10-28 |

### High Priority Bugs
| Bug ID | Title | Component | Assigned To | Status | Priority | Created |
|--------|-------|-----------|-------------|--------|----------|---------|
| - | - | - | - | - | - | - |

### Medium Priority Bugs
| Bug ID | Title | Component | Assigned To | Status | Priority | Created |
|--------|-------|-----------|-------------|--------|----------|---------|
| BUG-002 | Google Sign-in Requires Native Build | Frontend | Frontend Agent | 🟡 Open | P2 | 2026-10-28 |

### Low Priority Bugs
| Bug ID | Title | Component | Assigned To | Status | Priority | Created |
|--------|-------|-----------|-------------|--------|----------|---------|
| - | - | - | - | - | - | - |

---

## ✨ Feature Requests

### Approved Features
| ID | Title | Description | Assigned To | Status | Priority | Created |
|----|-------|-------------|-------------|--------|----------|---------|
| - | - | - | - | - | - | - |

### Pending Review
| ID | Title | Description | Assigned To | Status | Priority | Created |
|----|-------|-------------|-------------|--------|----------|---------|
| - | - | - | - | - | - | - |

### Backlog
| ID | Title | Description | Assigned To | Status | Priority | Created |
|----|-------|-------------|-------------|--------|----------|---------|
| - | - | - | - | - | - | - |

---

## 🚧 Known Issues

### Backend Issues
| Issue | Description | Impact | Workaround | Status |
|-------|-------------|--------|------------|--------|
| Backend auth routes not implemented | Firebase Admin routes missing | High | Use Firebase Client SDK only | 🔴 Open |

### Frontend Issues
| Issue | Description | Impact | Workaround | Status |
|-------|-------------|--------|------------|--------|
| EditProfileScreen not implemented | Screen doesn't exist | Medium | N/A | 🔴 Open |
| Google Sign-in requires native build | Won't work in Expo Go | Medium | Use email/password | 🟡 Open |

### Configuration Issues
| Issue | Description | Impact | Workaround | Status |
|-------|-------------|--------|------------|--------|
| Firebase service account not configured | Backend can't verify tokens | High | Skip backend auth for now | 🔴 Open |

---

## 📋 Blockers

### Current Blockers
| ID | Description | Component | Assigned To | ETA | Status |
|----|-------------|-----------|-------------|-----|--------|
| B001 | Backend auth routes not implemented | Backend | Backend Agent | 2026-10-30 | 🔴 Active |

### Resolved Blockers
| ID | Description | Resolution Date | Notes |
|----|-------------|-----------------|-------|
| - | - | - | - |

---

## 🔄 Change Requests

### Approved Changes
| ID | Description | Impact | Approved By | Date |
|----|-------------|--------|------------|------|
| - | - | - | - | - |

### Pending Changes
| ID | Description | Impact | Requested By | Date |
|----|-------------|--------|-------------|------|
| - | - | - | - | - |

### Rejected Changes
| ID | Description | Reason | Rejected By | Date |
|----|-------------|--------|-------------|------|
| - | - | - | - | - |

---

## 📊 Issue Statistics

### By Status
- **Open:** 5
- **In Progress:** 0
- **Resolved:** 0
- **Closed:** 0

### By Priority
- **Critical:** 1
- **High:** 2
- **Medium:** 3
- **Low:** 0

### By Component
- **Backend:** 3
- **Frontend:** 3
- **Configuration:** 1

### By Agent
- **Backend Agent:** 3
- **Frontend Agent:** 3
- **UI/UX Agent:** 0
- **Tester Agent:** 2

---

## 🐛 Bug Report Template

```markdown
### Bug ID: BUG-XXX
**Title:** [Short description]
**Component:** [Backend/Frontend/UI/UX]
**Severity:** Critical/High/Medium/Low
**Priority:** P1/P2/P3/P4
**Reporter:** [Name]
**Date Reported:** [Date]
**Assigned To:** [Agent]

#### Description
[Detailed description]

#### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

#### Expected Result
[What should happen]

#### Actual Result
[What actually happens]

#### Environment
- Platform: [iOS/Android]
- Device: [Device model]
- OS Version: [Version]
- App Version: [Version]

#### Screenshots/Videos
[Attach if available]

#### Logs
[Paste relevant logs]

#### Frequency
[Always/Sometimes/Rarely]

#### Workaround
[If available]

#### Status
[Open/In Progress/Resolved/Closed]

#### Resolution
[How it was fixed]

#### Resolution Date
[Date]

#### Notes
[Any additional information]
```

---

### Bug ID: BUG-001
**Title:** Backend Auth Endpoints Not Implemented
**Component:** Backend
**Severity:** Critical
**Priority:** P1
**Reporter:** Tester Agent
**Date Reported:** 2026-10-28
**Assigned To:** Backend Agent

#### Description
The backend authentication endpoints `/auth/firebase-login` and `/auth/google` are not implemented. This blocks the complete login flow as the frontend cannot sync with the backend to get session tokens and user profiles.

#### Steps to Reproduce
1. Attempt to login with valid credentials
2. Login fails at backend sync step
3. Error: API endpoint not found or 404

#### Expected Result
Backend endpoints should:
- Accept Firebase ID token
- Verify token with Firebase Admin SDK
- Create/update user in database
- Return session JWT and user profile

#### Actual Result
Backend endpoints return 404 or do not exist.

#### Environment
- Platform: All
- Backend: Node.js, Express.js
- Frontend: React Native, Expo SDK 52

#### Impact
- Users cannot fully authenticate
- Session persistence may not work correctly
- User profile data cannot be synchronized
- All login tests are blocked

#### Workaround
Use Firebase Client SDK only (no backend sync), but this limits functionality.

#### Status
🔴 Open

#### Resolution
Pending implementation by Backend Agent

#### Due Date
2026-10-30

#### Notes
This is a critical blocker for Milestone 1. Frontend is ready but backend auth routes are missing.

---

### Bug ID: BUG-002
**Title:** Google Sign-in Requires Native Build
**Component:** Frontend
**Severity:** Medium
**Priority:** P2
**Reporter:** Tester Agent
**Date Reported:** 2026-10-28
**Assigned To:** Frontend Agent

#### Description
Google Sign-in requires native build (EAS Build or Android/iOS build) and does not work in Expo Go environment. This limits testing and development workflow.

#### Steps to Reproduce
1. Run app in Expo Go
2. Tap Google Sign-in button
3. Error: "Đăng nhập Google yêu cầu cấu hình native hoặc development build"

#### Expected Result
Google Sign-in should work in Expo Go or provide clear guidance.

#### Actual Result
Google Sign-in fails in Expo Go with error message.

#### Environment
- Platform: iOS/Android
- Environment: Expo Go
- App Version: 1.0.0

#### Impact
- Cannot test Google Sign-in in Expo Go
- Requires native build for full testing
- Development workflow is slower

#### Workaround
Use email/password login for testing in Expo Go.

#### Status
🟡 Open

#### Resolution
Document as known limitation or implement alternative solution

#### Due Date
2026-10-31

#### Notes
This is a known limitation. The error message is user-friendly and clearly communicates the requirement. Consider adding a fallback authentication method or improving documentation.

---

## ✨ Feature Request Template

```markdown
### Feature ID: FR-XXX
**Title:** [Short description]
**Component:** [Backend/Frontend/UI/UX]
**Priority:** P1/P2/P3/P4
**Requested By:** [Name]
**Date Requested:** [Date]
**Assigned To:** [Agent]

#### Description
[Detailed description]

#### Rationale
[Why this feature is needed]

#### Acceptance Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

#### Impact
[Impact on timeline, scope, etc.]

#### Effort Estimate
[Low/Medium/High]

#### Status
[Approved/Pending Review/Backlog/Rejected]

#### Decision Date
[Date]

#### Notes
[Any additional information]
```

---

## 🚧 Blocker Template

```markdown
### Blocker ID: B-XXX
**Title:** [Short description]
**Component:** [Backend/Frontend/UI/UX]
**Severity:** Critical/High
**Reported By:** [Name]
**Date Reported:** [Date]
**Assigned To:** [Agent]

#### Description
[Detailed description]

#### Impact
[What is blocked because of this]

#### Affected Tasks
- [Task 1]
- [Task 2]
- [Task 3]

#### ETA for Resolution
[Estimated date]

#### Resolution Plan
[How to resolve]

#### Status
[Active/Resolved]

#### Resolution Date
[Date]

#### Notes
[Any additional information]
```

---

## 📝 Workflow

### Reporting a Bug
1. Create bug using Bug Report Template
2. Assign to appropriate agent
3. Set severity and priority
4. Add to this tracker
5. Notify assigned agent

### Requesting a Feature
1. Create feature request using Feature Request Template
2. Submit to Project Manager for review
3. Manager approves or rejects
4. If approved, assign to agent
5. Add to this tracker

### Escalating a Blocker
1. Identify blocking issue
2. Create blocker using Blocker Template
3. Immediately notify Project Manager
4. Add to this tracker
5. Track resolution

### Resolving an Issue
1. Agent implements fix
2. Agent tests fix
3. Tester Agent verifies fix
4. Update status to Resolved
5. Add resolution details
6. Close issue when verified

---

## 📞 Escalation Guidelines

### When to Escalate
- Blocker unresolved for > 4 hours
- Critical bug discovered
- Security vulnerability found
- Major performance issue
- Feature scope change requested

### Escalation Process
1. Document issue in tracker
2. Notify Project Manager immediately
3. Provide all relevant details
4. Propose solution if possible
5. Follow up until resolved

---

## 📈 Trend Analysis

### Bug Trend (Last 7 Days)
- New Bugs: 0
- Resolved Bugs: 0
- Current Open: 3

### Feature Request Trend (Last 7 Days)
- New Requests: 0
- Approved: 0
- Rejected: 0

### Blocker Trend (Last 7 Days)
- New Blockers: 1
- Resolved Blockers: 0
- Current Active: 1

---

## 🎯 Goals

### Bug Resolution Goals
- **Critical bugs:** Resolve within 24 hours
- **High priority bugs:** Resolve within 48 hours
- **Medium priority bugs:** Resolve within 72 hours
- **Low priority bugs:** Resolve within 1 week

### Feature Delivery Goals
- **P1 features:** Deliver in current sprint
- **P2 features:** Deliver in next sprint
- **P3 features:** Deliver when capacity allows
- **Backlog:** Review quarterly

### Blocker Resolution Goals
- **All blockers:** Resolve within 24 hours
- **Critical blockers:** Resolve within 4 hours

---

## 📝 Notes

- Update this file daily
- Mark resolved issues as closed after verification
- Escalate blockers immediately
- Keep statistics up to date
- Review trends weekly
