# SmartCampus Market - Project Management Rules

**Project:** SE1909_G4_MMA301_FinalProject
**Role:** Project Manager System
**Last Updated:** 2026-10-28

---

## 🎯 Project Overview

**SmartCampus Market** - Ứng dụng Chợ Trao đổi Đồ cũ Sinh viên tích hợp Gemini AI & Firebase

### Tech Stack
- **Frontend:** React Native (Expo SDK 52), React Navigation, Context API, AsyncStorage
- **Backend:** Node.js, Express.js (5-layer architecture)
- **Database:** Firebase Firestore, MongoDB
- **AI:** Google Gemini API
- **Auth:** Firebase Authentication (Email/Password, Google Sign-in)

---

## 👥 Team Structure & Responsibilities

### 1. **UI/UX Agent** (Sub Agent 1)
**Role:** Design & User Experience Specialist

**Responsibilities:**
- Thiết kế giao diện screens mới theo Material Design guidelines
- Đảm bảo consistency (fonts, colors, spacing) theo ThemeContext
- Optimize UX flows (navigation, loading states, error handling)
- Review accessibility và responsive design
- Tạo reusable components cho common UI patterns

**Key Deliverables:**
- Screen designs với đầy đủ states (loading, error, success, empty)
- Component library trong `frontend/src/components/common/`
- Design system documentation

**Skills Available:**
- `.devin/skills/ui-design/` - Thiết kế UI cho screens mới
- `.devin/skills/ux-review/` - Review và optimize UX flows

---

### 2. **Backend Agent** (Sub Agent 2)
**Role:** Backend API Developer

**Responsibilities:**
- Implement REST API endpoints theo 5-layer architecture
- Database schema design và migrations
- Authentication & Authorization middleware
- Firebase Admin integration
- Error handling và logging
- API documentation (Swagger/Postman)

**Key Deliverables:**
- Routes trong `backend/src/routes/`
- Controllers trong `backend/src/controllers/`
- Services trong `backend/src/services/`
- Models trong `backend/src/models/`
- Database migrations

**Skills Available:**
- `.devin/skills/backend-api/` - Tạo API endpoints
- `.devin/skills/db-schema/` - Thiết kế database schema
- `.devin/skills/firebase-integration/` - Firebase Admin integration

---

### 3. **Frontend Agent** (Sub Agent 3)
**Role:** Frontend Implementation Specialist

**Responsibilities:**
- Implement screens theo UI/UX designs
- Integrate với backend API services
- State management với Context API
- Navigation setup với React Navigation
- Firebase Client SDK integration
- Performance optimization

**Key Deliverables:**
- Screen implementations trong `frontend/src/screens/`
- API service calls trong `frontend/src/services/api/`
- Context providers trong `frontend/src/context/`
- Navigation configuration

**Skills Available:**
- `.devin/skills/frontend-screen/` - Implement screens
- `.devin/skills/api-integration/` - Kết nối API
- `.devin/skills/firebase-client/` - Firebase Client integration

---

### 4. **Tester Agent** (Sub Agent 4)
**Role:** Quality Assurance & Testing Specialist

**Responsibilities:**
- Write unit tests cho business logic
- Write integration tests cho API endpoints
- Write E2E tests cho critical user flows
- Manual testing checklist
- Bug reporting và regression testing
- Performance testing

**Key Deliverables:**
- Test suites trong `backend/__tests__/` và `frontend/__tests__/`
- Test documentation
- Bug reports trong ISSUE_TRACKER.md
- Regression test scripts

**Skills Available:**
- `.devin/skills/unit-test/` - Write unit tests
- `.devin/skills/integration-test/` - Write integration tests
- `.devin/skills/e2e-test/` - Write E2E tests
- `.devin/skills/manual-test/` - Execute manual test plans

---

## 📋 Workflow Rules

### Phase 1: Requirements & Design
1. **UI/UX Agent** thiết kế giao diện cho feature mới
2. **Backend Agent** thiết kế API endpoints và database schema
3. **Project Manager** approve design trước khi implement

### Phase 2: Implementation
1. **Backend Agent** implement API endpoints trước
2. **Frontend Agent** implement screens parallel với backend
3. **UI/UX Agent** review UI implementation

### Phase 3: Testing
1. **Tester Agent** write tests cho backend logic
2. **Tester Agent** write tests cho frontend components
3. **Tester Agent** execute manual test checklist
4. All agents fix bugs discovered

### Phase 4: Review & Deploy
1. **Project Manager** review code quality
2. **Tester Agent** final regression test
3. Deploy to staging/production

---

## 🔧 Development Standards

### Code Style
- **Frontend:** React Native best practices, functional components, hooks
- **Backend:** RESTful API, async/await, error handling middleware
- **Database:** Proper indexing, validation rules

### Git Workflow
- Branch naming: `feature/<feature-name>`, `fix/<bug-description>`
- Commit messages: Follow conventional commits
- Pull requests: Require at least 1 review before merge

### Documentation
- API endpoints: Document trong code và Swagger
- New features: Update README.md
- Breaking changes: Document in CHANGELOG.md

---

## 📊 Progress Tracking

### File: `.devin/PROGRESS.md`
Track completion status of all features and tasks.

### File: `.devin/ISSUE_TRACKER.md`
Track bugs, issues, and their resolution status.

### Daily Standup Format
```
## [Date] - Standup

### UI/UX Agent
- Completed: ...
- In Progress: ...
- Blocked: ...

### Backend Agent
- Completed: ...
- In Progress: ...
- Blocked: ...

### Frontend Agent
- Completed: ...
- In Progress: ...
- Blocked: ...

### Tester Agent
- Completed: ...
- In Progress: ...
- Blocked: ...
```

---

## 🚨 Emergency Procedures

### Bug Severity Levels
- **Critical:** App crash, data loss, security issue → Fix within 24h
- **High:** Major feature broken → Fix within 48h
- **Medium:** Minor feature broken → Fix within 72h
- **Low:** UI glitch, minor issue → Fix in next sprint

### Code Rollback
If critical bug detected in production:
1. Stop deployment
2. Rollback to previous stable version
3. Create hotfix branch
4. Test thoroughly
5. Deploy hotfix

---

## 📞 Communication

### When to Escalate to Project Manager
- Technical blockers > 4 hours
- Design conflicts between agents
- Scope changes from requirements
- Security vulnerabilities discovered
- Performance issues impacting users

### Update Frequency
- **Progress updates:** After each task completion
- **Blockers:** Immediately when identified
- **Questions:** When stuck > 30 minutes

---

## 🎯 Success Metrics

- **Code Coverage:** > 80% for critical paths
- **API Response Time:** < 500ms (p95)
- **App Launch Time:** < 3 seconds
- **Bug Fix Time:** < 48h average
- **Feature Delivery:** On time per milestone

---

## 📚 Reference Materials

- **Frontend Docs:** `frontend/README.md`
- **Backend Docs:** `backend/README.md`
- **API Docs:** `backend/API_DOCUMENTATION.md` (to be created)
- **Design System:** `frontend/src/context/ThemeContext.js`
