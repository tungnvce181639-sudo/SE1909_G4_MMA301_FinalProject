# SmartCampus Market - Action Plan & Milestones

**Project:** SE1909_G4_MMA301_FinalProject
**Role:** Project Manager
**Created:** 2026-10-28
**Status:** In Progress

---

## 📊 Project Status Overview

### Completed Features ✅
- LoginScreen with Email/Password & Google Sign-in
- UserProfileScreen with wallet & statistics
- AuthContext with Firebase integration
- ProfileContext with Firestore & image picker
- Firebase configuration (Auth, Firestore)
- Basic project structure

### In Progress 🚧
- Backend API endpoints (partial)
- Frontend screens (partial)

### Not Started ❌
- EditProfileScreen
- Backend auth routes
- Complete API documentation
- Test suite
- Git repository setup

---

## 🎯 Milestones

### Milestone 1: Complete Authentication & Profile (Week 1)
**Target:** Complete all authentication and profile-related features

**Tasks:**
1. **UI/UX Agent**
   - [ ] Design EditProfileScreen
   - [ ] Review LoginScreen UX for improvements
   - [ ] Design profile update confirmation flow

2. **Backend Agent**
   - [ ] Implement `/auth/firebase-login` endpoint
   - [ ] Implement `/auth/google` endpoint
   - [ ] Implement `/profile/me` GET endpoint
   - [ ] Implement `/profile/me` PUT endpoint
   - [ ] Add Firebase Admin integration
   - [ ] Create User model in MongoDB/Firestore

3. **Frontend Agent**
   - [ ] Implement EditProfileScreen
   - [ ] Connect EditProfileScreen to backend API
   - [ ] Update ProfileContext to sync with backend
   - [ ] Add avatar upload functionality
   - [ ] Test profile update flow

4. **Tester Agent**
   - [ ] Write unit tests for auth API
   - [ ] Write integration tests for profile endpoints
   - [ ] Manual test login flow
   - [ ] Manual test profile update flow

**Deliverables:**
- Working EditProfileScreen
- Complete backend auth endpoints
- Test coverage for auth & profile
- API documentation for auth endpoints

**Success Criteria:**
- User can successfully register, login, and edit profile
- All auth endpoints tested and documented
- Test coverage > 80% for auth flows

---

### Milestone 2: Product Listing System (Week 2)
**Target:** Complete product posting and management features

**Tasks:**
1. **UI/UX Agent**
   - [ ] Review PostItemScreen design
   - [ ] Review MyListingsScreen design
   - [ ] Design product detail screen improvements
   - [ ] Design image upload flow

2. **Backend Agent**
   - [ ] Implement Product model/schema
   - [ ] Implement `/products` CRUD endpoints
   - [ ] Implement image upload endpoint
   - [ ] Add product search/filter endpoints
   - [ ] Implement product-to-user relationship

3. **Frontend Agent**
   - [ ] Review PostItemScreen implementation
   - [ ] Review MyListingsScreen implementation
   - [ ] Connect product screens to backend
   - [ ] Implement image upload with progress
   - [ ] Add product search/filter UI

4. **Tester Agent**
   - [ ] Write unit tests for product API
   - [ ] Write integration tests for product endpoints
   - [ ] Manual test product posting flow
   - [ ] Manual test product listing display
   - [ ] Test image upload functionality

**Deliverables:**
- Complete product CRUD operations
- Working image upload
- Product search and filter
- Test coverage for product features

**Success Criteria:**
- Users can post, view, edit, and delete products
- Image upload works reliably
- Search and filter function correctly
- Test coverage > 80% for product features

---

### Milestone 3: Order & Transaction System (Week 3)
**Target:** Complete order management and transaction features

**Tasks:**
1. **UI/UX Agent**
   - [ ] Design order confirmation flow
   - [ ] Design order status tracking
   - [ ] Design order history screen improvements
   - [ ] Design seller notification flow

2. **Backend Agent**
   - [ ] Implement Order model/schema
   - [ ] Implement `/orders` CRUD endpoints
   - [ ] Implement order status update logic
   - [ ] Add transaction history endpoints
   - [ ] Implement seller notification system

3. **Frontend Agent**
   - [ ] Implement order confirmation screen
   - [ ] Implement order status tracking
   - [ ] Connect OrderHistoryScreen to backend
   - [ ] Add real-time order updates
   - [ ] Implement seller notifications

4. **Tester Agent**
   - [ ] Write unit tests for order API
   - [ ] Write integration tests for order endpoints
   - [ ] Manual test complete order flow
   - [ ] Test order status updates
   - [ ] Test notification system

**Deliverables:**
- Complete order management system
- Real-time order status updates
- Working notification system
- Test coverage for order features

**Success Criteria:**
- Users can create and track orders
- Sellers receive notifications
- Order status updates in real-time
- Test coverage > 80% for order features

---

### Milestone 4: AI Integration (Week 4)
**Target:** Complete AI features (Estimator & Chatbot)

**Tasks:**
1. **UI/UX Agent**
   - [ ] Review AIEstimatorScreen design
   - [ ] Review AIChatbotScreen design
   - [ ] Design AI loading states
   - [ ] Design AI error handling

2. **Backend Agent**
   - [ ] Implement Gemini AI integration
   - [ ] Create AI price estimation endpoint
   - [ ] Create AI chatbot endpoint
   - [ ] Add AI request logging
   - [ ] Implement AI fallback logic

3. **Frontend Agent**
   - [ ] Review AIEstimatorScreen implementation
   - [ ] Review AIChatbotScreen implementation
   - [ ] Connect AI screens to backend
   - [ ] Add AI loading indicators
   - [ ] Implement AI error handling

4. **Tester Agent**
   - [ ] Write unit tests for AI endpoints
   - [ ] Test AI estimation accuracy
   - [ ] Test AI chatbot responses
   - [ ] Manual test AI features
   - [ ] Test AI fallback scenarios

**Deliverables:**
- Working AI price estimator
- Working AI chatbot
- AI endpoint documentation
- Test coverage for AI features

**Success Criteria:**
- AI estimator provides reasonable price estimates
- AI chatbot responds to user queries
- Fallback logic works when AI fails
- Test coverage > 70% for AI features

---

### Milestone 5: Testing & Polish (Week 5)
**Target:** Complete testing, bug fixes, and app polish

**Tasks:**
1. **UI/UX Agent**
   - [ ] Review all screens for consistency
   - [ ] Optimize animations and transitions
   - [ ] Improve error messages
   - [ ] Add loading states where missing

2. **Backend Agent**
   - [ ] Add comprehensive error handling
   - [ ] Optimize API response times
   - [ ] Add rate limiting
   - [ ] Complete API documentation

3. **Frontend Agent**
   - [ ] Fix all reported bugs
   - [ ] Optimize app performance
   - [ ] Add offline support where possible
   - [ ] Improve accessibility

4. **Tester Agent**
   - [ ] Complete E2E test suite
   - [ ] Perform full regression testing
   - [ ] Test on multiple devices
   - [ ] Perform accessibility audit
   - [ ] Performance testing

**Deliverables:**
- Comprehensive test suite
- Bug-free application
- Complete documentation
- Performance-optimized app

**Success Criteria:**
- All critical bugs fixed
- Test coverage > 80% overall
- App performs well on target devices
- Accessibility score meets standards

---

### Milestone 6: Deployment & Handoff (Week 6)
**Target:** Deploy application and prepare for handoff

**Tasks:**
1. **All Agents**
   - [ ] Create deployment documentation
   - [ ] Prepare production builds
   - [ ] Test production deployment
   - [ ] Create user documentation
   - [ ] Prepare technical report

2. **Backend Agent**
   - [ ] Set up production database
   - [ ] Configure production environment
   - [ ] Set up monitoring
   - [ ] Deploy backend to production

3. **Frontend Agent**
   - [ ] Build production APK/IPA
   - [ ] Test production build
   - [ ] Deploy to app stores (if required)
   - [ ] Set up crash reporting

4. **Tester Agent**
   - [ ] Final smoke testing
   - [ ] Production validation
   - [ ] User acceptance testing
   - [ ] Create test report

**Deliverables:**
- Deployed production application
- Complete documentation
- Technical report
- User guide

**Success Criteria:**
- Application deployed successfully
- Documentation complete
- Technical report submitted
- User acceptance achieved

---

## 📋 Current Sprint (Week 1 - Milestone 1)

### Active Tasks

#### Task 1: EditProfileScreen Implementation
**Assigned To:** Frontend Agent
**Priority:** High
**Status:** Not Started
**Due:** 2026-10-30

**Subtasks:**
- [ ] UI/UX Agent: Design EditProfileScreen
- [ ] Frontend Agent: Implement screen
- [ ] Frontend Agent: Connect to ProfileContext
- [ ] Frontend Agent: Connect to backend API
- [ ] Tester Agent: Manual test

#### Task 2: Backend Auth Endpoints
**Assigned To:** Backend Agent
**Priority:** High
**Status:** Not Started
**Due:** 2026-10-30

**Subtasks:**
- [ ] Backend Agent: Create User model
- [ ] Backend Agent: Implement `/auth/firebase-login`
- [ ] Backend Agent: Implement `/auth/google`
- [ ] Backend Agent: Implement `/profile/me` endpoints
- [ ] Tester Agent: Write integration tests

#### Task 3: Profile API Integration
**Assigned To:** Frontend Agent
**Priority:** High
**Status:** Not Started
**Due:** 2026-10-31

**Subtasks:**
- [ ] Frontend Agent: Create profileApi.js
- [ ] Frontend Agent: Update ProfileContext
- [ ] Frontend Agent: Test API integration
- [ ] Tester Agent: Manual test

---

## 🚨 Blockers & Risks

### Current Blockers
1. **Backend auth routes not implemented** - Blocking frontend profile integration
   - **Impact:** High
   - **Owner:** Backend Agent
   - **ETA:** 2026-10-30

### Risks
1. **Google Sign-in native module** - May require EAS build
   - **Mitigation:** Have fallback to email/password
   - **Impact:** Medium

2. **Firebase Admin setup** - Requires service account credentials
   - **Mitigation:** Use existing Firebase project
   - **Impact:** High

3. **Test environment setup** - May need additional configuration
   - **Mitigation:** Start with manual testing, add automated later
   - **Impact:** Medium

---

## 📈 Progress Metrics

### Overall Progress: 35%

**By Milestone:**
- Milestone 1 (Auth & Profile): 40%
- Milestone 2 (Product System): 0%
- Milestone 3 (Order System): 0%
- Milestone 4 (AI Integration): 0%
- Milestone 5 (Testing & Polish): 0%
- Milestone 6 (Deployment): 0%

**By Component:**
- Authentication: 70%
- Profile: 50%
- Products: 30%
- Orders: 0%
- AI: 30%
- Testing: 0%

---

## 📅 Daily Standup Template

```markdown
## Daily Standup - [Date]

### UI/UX Agent
**Completed:**
- [Task 1]
- [Task 2]

**In Progress:**
- [Task 3]

**Blocked:**
- [ blocker if any]

**Next:**
- [Next task]

---

### Backend Agent
**Completed:**
- [Task 1]
- [Task 2]

**In Progress:**
- [Task 3]

**Blocked:**
- [ blocker if any]

**Next:**
- [Next task]

---

### Frontend Agent
**Completed:**
- [Task 1]
- [Task 2]

**In Progress:**
- [Task 3]

**Blocked:**
- [ blocker if any]

**Next:**
- [Next task]

---

### Tester Agent
**Completed:**
- [Task 1]
- [Task 2]

**In Progress:**
- [Task 3]

**Blocked:**
- [ blocker if any]

**Next:**
- [Next task]

---

### Project Manager Notes
- [Important updates]
- [Blockers to address]
- [Schedule changes]
```

---

## 🎯 Success Metrics

### Quality Metrics
- **Code Coverage:** > 80%
- **Bug Severity:** No critical bugs in production
- **API Response Time:** < 500ms (p95)
- **App Launch Time:** < 3 seconds

### Delivery Metrics
- **On-Time Delivery:** All milestones on schedule
- **Feature Completeness:** 100% of planned features
- **Documentation:** Complete API and user docs

### User Experience Metrics
- **Accessibility Score:** WCAG AA compliant
- **App Store Rating:** > 4.0 stars (target)
- **Crash Rate:** < 1%

---

## 📞 Communication Plan

### Daily Standups
- **Time:** 9:00 AM daily
- **Duration:** 15 minutes
- **Format:** Async updates in `.devin/DAILY_STANDUP.md`

### Weekly Reviews
- **Time:** Every Friday
- **Duration:** 30 minutes
- **Focus:** Milestone progress, blockers, next week planning

### Ad-hoc Meetings
- **Trigger:** Critical blockers, major decisions
- **Duration:** As needed
- **Format:** Immediate escalation to Project Manager

---

## 🔄 Change Management

### Process for Changes
1. Submit change request to Project Manager
2. Assess impact on timeline and scope
3. Get approval from Project Manager
4. Update ACTION_PLAN.md
5. Notify all affected agents

### Scope Changes
- Document change with justification
- Estimate impact on timeline
- Adjust milestones if needed
- Communicate to all team members

---

## 📝 Notes

- This action plan is a living document
- Update weekly based on progress
- Escalate blockers immediately
- Celebrate milestone completions
