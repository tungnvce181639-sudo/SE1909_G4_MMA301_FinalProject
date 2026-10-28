# Project Management System - SmartCampus Market

**Purpose:** Coordinate 4 sub-agents (UI/UX, Backend, Frontend, Tester) for project development
**Created:** 2026-10-28
**Status:** Active

---

## 📁 Structure

```
.devin/
├── AGENTS.md              # Team rules, responsibilities, and workflow
├── ACTION_PLAN.md         # Milestones, tasks, and project timeline
├── PROGRESS.md            # Detailed progress tracking by milestone
├── ISSUE_TRACKER.md       # Bug reports, feature requests, and blockers
├── DAILY_STANDUP.md       # Daily team updates and priorities
├── README.md              # This file
└── skills/
    ├── ui-design/         # UI/UX Agent skill - Design screens
    ├── ux-review/         # UI/UX Agent skill - Review UX flows
    ├── backend-api/        # Backend Agent skill - Create API endpoints
    ├── db-schema/         # Backend Agent skill - Design database schemas
    ├── firebase-integration/ # Backend Agent skill - Firebase Admin
    ├── frontend-screen/   # Frontend Agent skill - Implement screens
    ├── api-integration/   # Frontend Agent skill - Connect to APIs
    ├── firebase-client/   # Frontend Agent skill - Firebase Client SDK
    ├── unit-test/         # Tester Agent skill - Write unit tests
    ├── integration-test/  # Tester Agent skill - Write integration tests
    ├── e2e-test/          # Tester Agent skill - Write E2E tests
    └── manual-test/       # Tester Agent skill - Execute manual tests
```

---

## 👥 Team Structure

### 1. UI/UX Agent
**Role:** Design & User Experience Specialist
**Skills:**
- `ui-design` - Design user interfaces for new screens
- `ux-review` - Review and optimize user experience flows

**Key Files:**
- `.devin/skills/ui-design/SKILL.md`
- `.devin/skills/ux-review/SKILL.md`

---

### 2. Backend Agent
**Role:** Backend API Developer
**Skills:**
- `backend-api` - Create REST API endpoints
- `db-schema` - Design database schemas
- `firebase-integration` - Integrate Firebase Admin SDK

**Key Files:**
- `.devin/skills/backend-api/SKILL.md`
- `.devin/skills/db-schema/SKILL.md`
- `.devin/skills/firebase-integration/SKILL.md`

---

### 3. Frontend Agent
**Role:** Frontend Implementation Specialist
**Skills:**
- `frontend-screen` - Implement React Native screens
- `api-integration` - Connect frontend to backend APIs
- `firebase-client` - Integrate Firebase Client SDK

**Key Files:**
- `.devin/skills/frontend-screen/SKILL.md`
- `.devin/skills/api-integration/SKILL.md`
- `.devin/skills/firebase-client/SKILL.md`

---

### 4. Tester Agent
**Role:** Quality Assurance & Testing Specialist
**Skills:**
- `unit-test` - Write unit tests
- `integration-test` - Write integration tests
- `e2e-test` - Write end-to-end tests
- `manual-test` - Execute manual test plans

**Key Files:**
- `.devin/skills/unit-test/SKILL.md`
- `.devin/skills/integration-test/SKILL.md`
- `.devin/skills/e2e-test/SKILL.md`
- `.devin/skills/manual-test/SKILL.md`

---

## 📋 Workflow

### Phase 1: Requirements & Design
1. **UI/UX Agent** designs the screen/feature
2. **Backend Agent** designs API endpoints and database schema
3. **Project Manager** approves design

### Phase 2: Implementation
1. **Backend Agent** implements API endpoints
2. **Frontend Agent** implements screens (parallel with backend)
3. **UI/UX Agent** reviews UI implementation

### Phase 3: Testing
1. **Tester Agent** writes unit tests
2. **Tester Agent** writes integration tests
3. **Tester Agent** executes manual tests
4. All agents fix discovered bugs

### Phase 4: Review & Deploy
1. **Project Manager** reviews code quality
2. **Tester Agent** final regression test
3. Deploy to staging/production

---

## 🚀 Getting Started

### For Project Manager

1. **Review Project Status**
   ```bash
   # Check current progress
   cat .devin/PROGRESS.md

   # Check active blockers
   cat .devin/ISSUE_TRACKER.md

   # Check today's priorities
   cat .devin/DAILY_STANDUP.md
   ```

2. **Assign Tasks**
   - Update `ACTION_PLAN.md` with new tasks
   - Update `PROGRESS.md` with task assignments
   - Notify assigned agent

3. **Monitor Progress**
   - Update `DAILY_STANDUP.md` daily
   - Update `PROGRESS.md` as tasks complete
   - Update `ISSUE_TRACKER.md` for bugs and blockers

### For Agents

1. **Understand Your Role**
   ```bash
   # Read team rules
   cat .devin/AGENTS.md

   # Read your specific skills
   cat .devin/skills/<your-skill>/SKILL.md
   ```

2. **Check Your Tasks**
   ```bash
   # See your assigned tasks
   cat .devin/PROGRESS.md

   # Check today's priorities
   cat .devin/DAILY_STANDUP.md
   ```

3. **Use Your Skills**
   - Invoke your skill when starting a task
   - Follow the skill's guidelines
   - Report completion to Project Manager

4. **Report Progress**
   - Update `DAILY_STANDUP.md` with your daily updates
   - Update `PROGRESS.md` when tasks complete
   - Report blockers immediately to `ISSUE_TRACKER.md`

---

## 📊 Daily Routine

### Morning (9:00 AM)
1. Update `DAILY_STANDUP.md` with:
   - Completed tasks from yesterday
   - Tasks in progress
   - Blockers (if any)
   - Next tasks

2. Check `ISSUE_TRACKER.md` for:
   - New bugs assigned to you
   - New feature requests
   - Active blockers

3. Check `PROGRESS.md` for:
   - Your upcoming tasks
   - Due dates
   - Dependencies

### During the Day
1. Work on assigned tasks
2. Use appropriate skills
3. Report progress as you complete tasks
4. Escalate blockers immediately

### End of Day (5:00 PM)
1. Update `DAILY_STANDUP.md` with:
   - Tasks completed today
   - Tasks still in progress
   - Plans for tomorrow

2. Update `PROGRESS.md` with:
   - Completed tasks marked as done
   - New tasks if assigned

3. Update `ISSUE_TRACKER.md` if:
   - New bugs discovered
   - New blockers encountered
   - Issues resolved

---

## 🎯 Using Skills

### How to Invoke a Skill

When you receive a task that matches a skill description:

1. **Read the Skill File**
   ```bash
   cat .devin/skills/<skill-name>/SKILL.md
   ```

2. **Follow the Guidelines**
   - Review prerequisites
   - Follow implementation steps
   - Use provided templates

3. **Complete the Task**
   - Implement according to skill guidelines
   - Test your work
   - Document any issues

4. **Report Completion**
   - Update `PROGRESS.md`
   - Update `DAILY_STANDUP.md`
   - Notify Project Manager

### Skill Examples

**UI/UX Agent - Design a Screen:**
1. Invoke `ui-design` skill
2. Read design guidelines
3. Create design spec
4. Save to `.devin/DESIGN_SPECS/`
5. Hand off to Frontend Agent

**Backend Agent - Create API Endpoint:**
1. Invoke `backend-api` skill
2. Follow 5-layer architecture
3. Implement route, controller, service, repository, model
4. Test with Postman
5. Document in `backend/API_DOCUMENTATION.md`

**Frontend Agent - Implement Screen:**
1. Invoke `frontend-screen` skill
2. Read design spec
3. Implement screen
4. Connect to API
5. Test on device/simulator

**Tester Agent - Write Tests:**
1. Invoke appropriate test skill (`unit-test`, `integration-test`, `e2e-test`)
2. Follow test patterns
3. Write tests
4. Run tests
5. Report coverage

---

## 📝 File Descriptions

### AGENTS.md
- Team structure and responsibilities
- Workflow rules
- Development standards
- Communication guidelines
- Success metrics

### ACTION_PLAN.md
- 6 milestones with due dates
- Detailed task breakdowns
- Current sprint tasks
- Blockers and risks
- Progress metrics

### PROGRESS.md
- Detailed task tracking by milestone
- Task status (Not Started, In Progress, Completed)
- Due dates and assignments
- Completed features list
- In progress features list

### ISSUE_TRACKER.md
- Bug reports by severity
- Feature requests
- Known issues
- Blockers
- Issue statistics

### DAILY_STANDUP.md
- Daily team updates
- Today's priorities
- Yesterday's progress
- Tomorrow's plan
- Project manager notes

---

## 🚨 Escalation Procedures

### When to Escalate
- Blocker unresolved for > 4 hours
- Critical bug discovered
- Security vulnerability found
- Major performance issue
- Feature scope change requested

### How to Escalate
1. Document issue in `ISSUE_TRACKER.md`
2. Add to `DAILY_STANDUP.md` under Blockers
3. Notify Project Manager immediately
4. Provide all relevant details
5. Propose solution if possible

---

## 📈 Metrics Tracking

### Progress Metrics
- Overall project progress
- Milestone completion
- Component completion
- Task completion rate

### Quality Metrics
- Code coverage
- Bug count by severity
- Test pass rate
- Performance metrics

### Delivery Metrics
- On-time delivery rate
- Feature completeness
- Documentation completeness

---

## 🎯 Success Criteria

### Quality
- Code coverage > 80%
- No critical bugs in production
- API response time < 500ms
- App launch time < 3 seconds

### Delivery
- All milestones on schedule
- 100% of planned features
- Complete documentation

### User Experience
- WCAG AA accessibility compliant
- App store rating > 4.0 stars
- Crash rate < 1%

---

## 📞 Communication

### Daily Standup
- **Time:** 9:00 AM daily
- **Format:** Async updates in `DAILY_STANDUP.md`
- **Duration:** 15 minutes

### Weekly Review
- **Time:** Every Friday
- **Focus:** Milestone progress, blockers, next week
- **Duration:** 30 minutes

### Ad-hoc Meetings
- **Trigger:** Critical blockers, major decisions
- **Format:** Immediate escalation
- **Duration:** As needed

---

## 🔧 Maintenance

### Daily
- Update `DAILY_STANDUP.md`
- Update `PROGRESS.md` for completed tasks
- Update `ISSUE_TRACKER.md` for new issues

### Weekly
- Review milestone progress
- Update `ACTION_PLAN.md` if needed
- Review and resolve blockers
- Team retrospective

### Monthly
- Review overall project health
- Adjust timelines if needed
- Update success metrics
- Plan next month's work

---

## 📚 Additional Resources

### Project Documentation
- `README.md` - Project overview
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation

### Codebase
- `backend/src/` - Backend source code
- `frontend/src/` - Frontend source code

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables

---

## 🎓 Training

### For New Agents
1. Read `AGENTS.md` to understand team structure
2. Read your specific skill files
3. Review existing codebase
4. Start with simple tasks
5. Ask questions when stuck

### Skill Development
- Practice using your skills
- Review skill files regularly
- Share learnings with team
- Suggest skill improvements

---

## 🔄 Updates

### Version History
- **v1.0** (2026-10-28) - Initial setup
  - Created project management structure
  - Defined team roles and skills
  - Set up tracking systems
  - Created action plan with 6 milestones

### Planned Updates
- Add automated progress reporting
- Integrate with Git for commit tracking
- Add time tracking
- Create dashboard for metrics

---

## 💡 Tips

### For Project Manager
- Be proactive in blocking management
- Communicate clearly and frequently
- Celebrate milestone completions
- Support agents when stuck

### For Agents
- Be clear about progress and blockers
- Use skills consistently
- Test your work before reporting complete
- Ask for help when needed

### For All
- Keep documentation up to date
- Be honest about challenges
- Support team members
- Focus on quality

---

## 📞 Support

### Questions
- Review relevant skill files
- Check `AGENTS.md` for workflow questions
- Ask Project Manager for clarification

### Issues
- Report to `ISSUE_TRACKER.md`
- Escalate if critical
- Provide all relevant details

### Suggestions
- Propose in daily standup
- Discuss in weekly review
- Submit as feature request

---

**Last Updated:** 2026-10-28
**Next Review:** 2026-10-29
