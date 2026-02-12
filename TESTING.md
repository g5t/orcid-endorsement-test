# Testing Guide - ORCiD Endorsement System

This guide provides comprehensive testing procedures for all features of the ORCiD endorsement system.

## Prerequisites for Testing

Before starting tests, ensure:
- [ ] Cloudflare Worker is deployed and accessible
- [ ] ORCiD application is registered with correct redirect URIs
- [ ] Jekyll site is running (locally or deployed)
- [ ] Environment variables are set in Cloudflare Worker
- [ ] KV namespace is created and bound

## Test Suite

### Test 1: Worker API Endpoints

#### 1.1 Test Stats Endpoint (No Data)

```bash
curl -X GET https://your-worker.workers.dev/api/stats

# Expected Response:
# {
#   "total": 0,
#   "proposals": {}
# }
```

#### 1.2 Test OAuth Start

```bash
curl -X POST https://your-worker.workers.dev/api/oauth/start \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri":"http://localhost:4000/endorsement/"}'

# Expected Response:
# {
#   "authUrl": "https://orcid.org/oauth/authorize?..."
# }
```

#### 1.3 Test Invalid proposal_id

```bash
curl -X POST https://your-worker.workers.dev/api/endorse \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "fake",
    "proposal_id": "invalid proposal!",
    "jobTitle": "Test",
    "employer": "Test"
  }'

# Expected Response (400):
# {
#   "error": "Invalid proposal_id format"
# }
```

**Status**: ✅ Pass / ❌ Fail

---

### Test 2: Jekyll Site Structure

#### 2.1 Verify Homepage

1. Visit: `http://localhost:4000/` or your deployed URL
2. Check for:
   - [ ] Page loads successfully
   - [ ] Welcome message is displayed
   - [ ] Links to both proposals are present
   - [ ] "My Endorsements" link is present
   - [ ] CSS is loading correctly

**Status**: ✅ Pass / ❌ Fail

#### 2.2 Verify Proposal Pages

1. Visit: `http://localhost:4000/posts/neutron-scattering-proposal/`
2. Check for:
   - [ ] Proposal content is displayed
   - [ ] "Endorse This Proposal" button is present
   - [ ] Endorsement widget is shown
   - [ ] Widget shows "0" endorsements initially

3. Visit: `http://localhost:4000/posts/another-proposal/`
4. Repeat checks above

**Status**: ✅ Pass / ❌ Fail

---

### Test 3: OAuth Authentication Flow

#### 3.1 Test Sign In from Endorsement Page

1. Visit: `http://localhost:4000/endorsement/?proposal=neutron-instrument-2026`
2. Click "Sign in with ORCiD" button
3. Should be redirected to ORCiD login page
4. Enter ORCiD credentials
5. Authorize application
6. Should be redirected back to endorsement page
7. Check for:
   - [ ] Authenticated state is shown
   - [ ] User name is displayed
   - [ ] Endorsement form is visible
   - [ ] "Sign in" section is hidden

**Status**: ✅ Pass / ❌ Fail

#### 3.2 Test Sign In from My Endorsements Page

1. Visit: `http://localhost:4000/my-endorsements/`
2. Click "Sign in with ORCiD" button
3. Complete OAuth flow
4. Check for:
   - [ ] Redirected back to my-endorsements page
   - [ ] User name is displayed
   - [ ] "No endorsements" message is shown (if first time)

**Status**: ✅ Pass / ❌ Fail

---

### Test 4: Endorsement Submission

#### 4.1 Submit First Endorsement

1. Authenticate on endorsement page with `proposal=neutron-instrument-2026`
2. Fill in:
   - Job Title: "Research Scientist"
   - Employer: "Example University"
3. Click "Submit Endorsement"
4. Check for:
   - [ ] Success message appears
   - [ ] Message says "Endorsement recorded"
   - [ ] Stats counter updates to "1"
   - [ ] "Remove Endorsement" button appears
   - [ ] Link to "View all my endorsements" is shown

**Status**: ✅ Pass / ❌ Fail

#### 4.2 Update Existing Endorsement

1. Change job title to "Senior Research Scientist"
2. Click "Submit Endorsement" again
3. Check for:
   - [ ] Success message appears
   - [ ] Message says "Endorsement updated"
   - [ ] Stats counter remains "1" (not incremented)
   - [ ] Form fields retain updated values

**Status**: ✅ Pass / ❌ Fail

---

### Test 5: Per-Proposal Endorsement Independence

#### 5.1 Endorse Second Proposal

1. Visit: `http://localhost:4000/endorsement/?proposal=open-data-standards-2026`
2. Should already be authenticated (session active)
3. Fill in different values:
   - Job Title: "Data Scientist"
   - Employer: "Another Institution"
4. Click "Submit Endorsement"
5. Check for:
   - [ ] Success message appears
   - [ ] Stats for this proposal shows "1"
   - [ ] Original proposal still has "1" endorsement

**Status**: ✅ Pass / ❌ Fail

#### 5.2 Verify Stats Independence

1. Check stats for proposal 1:
```bash
curl https://your-worker.workers.dev/api/stats?proposal_id=neutron-instrument-2026
```
Expected: `{"proposal_id":"neutron-instrument-2026","total":1}`

2. Check stats for proposal 2:
```bash
curl https://your-worker.workers.dev/api/stats?proposal_id=open-data-standards-2026
```
Expected: `{"proposal_id":"open-data-standards-2026","total":1}`

3. Check site-wide stats:
```bash
curl https://your-worker.workers.dev/api/stats
```
Expected: 
```json
{
  "total": 2,
  "proposals": {
    "neutron-instrument-2026": 1,
    "open-data-standards-2026": 1
  }
}
```

**Status**: ✅ Pass / ❌ Fail

---

### Test 6: My Endorsements Page

#### 6.1 View All Endorsements

1. Visit: `http://localhost:4000/my-endorsements/`
2. Should be authenticated from previous tests
3. Check for:
   - [ ] Table/list shows 2 endorsements
   - [ ] Both proposals are listed
   - [ ] Job titles and employers are shown correctly
   - [ ] Dates are displayed
   - [ ] "Remove" buttons are present for each

**Status**: ✅ Pass / ❌ Fail

#### 6.2 Verify Endorsement Details

Check that the table shows:
- [ ] Proposal 1: "Neutron Instrument 2026" (or formatted name)
- [ ] Job Title: "Senior Research Scientist" (the updated value)
- [ ] Employer: "Example University"
- [ ] Proposal 2: "Open Data Standards 2026"
- [ ] Job Title: "Data Scientist"
- [ ] Employer: "Another Institution"

**Status**: ✅ Pass / ❌ Fail

---

### Test 7: Endorsement Removal

#### 7.1 Remove Endorsement with Confirmation

1. On my-endorsements page, click "Remove" for first proposal
2. Check for:
   - [ ] Confirmation dialog appears
   - [ ] Dialog says "Are you sure you want to remove..."
3. Click "Cancel"
   - [ ] Endorsement remains in list
4. Click "Remove" again, then confirm
5. Check for:
   - [ ] Success message appears
   - [ ] Endorsement is removed from list
   - [ ] Only 1 endorsement remains

**Status**: ✅ Pass / ❌ Fail

#### 7.2 Verify Counter Decrements

1. Check stats for removed proposal:
```bash
curl https://your-worker.workers.dev/api/stats?proposal_id=neutron-instrument-2026
```
Expected: `{"proposal_id":"neutron-instrument-2026","total":0}`

2. Check site-wide stats:
```bash
curl https://your-worker.workers.dev/api/stats
```
Expected:
```json
{
  "total": 1,
  "proposals": {
    "neutron-instrument-2026": 0,
    "open-data-standards-2026": 1
  }
}
```

**Status**: ✅ Pass / ❌ Fail

#### 7.3 Attempt to Remove Non-existent Endorsement

1. Try to remove the same endorsement again (should fail)
2. Expected error message

**Status**: ✅ Pass / ❌ Fail

---

### Test 8: Session Expiration

#### 8.1 Test 10-Minute Session Timeout

1. Authenticate and note the time
2. Wait 11 minutes
3. Try to submit an endorsement
4. Check for:
   - [ ] Error message about expired session
   - [ ] Redirected to sign in

**Status**: ✅ Pass / ❌ Fail

---

### Test 9: Endorsement Widget

#### 9.1 Verify Widget Display

1. Visit a proposal page: `http://localhost:4000/posts/neutron-scattering-proposal/`
2. Scroll to endorsement widget
3. Check for:
   - [ ] Widget is visible
   - [ ] Current count is displayed
   - [ ] "Endorse this Proposal" button works
   - [ ] Count updates after endorsement

**Status**: ✅ Pass / ❌ Fail

---

### Test 10: Multiple Users

#### 10.1 Test with Second User

If possible, test with a second ORCiD account:

1. Sign in with second user
2. Endorse the same proposal
3. Check for:
   - [ ] Counter increments to 2
   - [ ] Both users can see their own endorsements
   - [ ] Removing one doesn't affect the other

**Status**: ✅ Pass / ❌ Fail

---

### Test 11: Edge Cases

#### 11.1 Missing proposal_id Parameter

1. Visit: `http://localhost:4000/endorsement/` (no ?proposal=)
2. Check for:
   - [ ] Error message is shown
   - [ ] Message says "No proposal specified"

**Status**: ✅ Pass / ❌ Fail

#### 11.2 Invalid proposal_id Format

1. Visit: `http://localhost:4000/endorsement/?proposal=invalid proposal!`
2. Try to submit endorsement
3. Check for:
   - [ ] Error message about invalid format

**Status**: ✅ Pass / ❌ Fail

#### 11.3 Empty Form Fields

1. Try to submit endorsement with empty job title and employer
2. Should still work (fields are optional)
3. Check in my-endorsements page:
   - [ ] Shows "-" or empty for optional fields

**Status**: ✅ Pass / ❌ Fail

---

### Test 12: Browser Compatibility

Test on multiple browsers:

#### 12.1 Chrome/Edge
- [ ] All features work
- [ ] CSS renders correctly
- [ ] OAuth flow works

#### 12.2 Firefox
- [ ] All features work
- [ ] CSS renders correctly
- [ ] OAuth flow works

#### 12.3 Safari
- [ ] All features work
- [ ] CSS renders correctly
- [ ] OAuth flow works

**Status**: ✅ Pass / ❌ Fail

---

### Test 13: Mobile Responsiveness

#### 13.1 Mobile Layout

Test on mobile device or responsive mode:
- [ ] Pages are readable on small screens
- [ ] Buttons are clickable
- [ ] Forms are usable
- [ ] Tables scroll or adapt on my-endorsements page

**Status**: ✅ Pass / ❌ Fail

---

### Test 14: Security

#### 14.1 HTTPS Only

- [ ] Production site uses HTTPS
- [ ] Worker uses HTTPS
- [ ] No mixed content warnings

#### 14.2 Session Security

- [ ] Sessions expire after 10 minutes
- [ ] Can't use another user's session token
- [ ] Can't submit endorsement without valid session

**Status**: ✅ Pass / ❌ Fail

---

## Test Results Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| Worker API | ⬜ | |
| Jekyll Site | ⬜ | |
| OAuth Flow | ⬜ | |
| Endorsement Submission | ⬜ | |
| Per-Proposal Independence | ⬜ | |
| My Endorsements Page | ⬜ | |
| Endorsement Removal | ⬜ | |
| Session Expiration | ⬜ | |
| Widget Display | ⬜ | |
| Multiple Users | ⬜ | |
| Edge Cases | ⬜ | |
| Browser Compatibility | ⬜ | |
| Mobile Responsiveness | ⬜ | |
| Security | ⬜ | |

## Known Issues

Document any issues found during testing:

1. Issue description
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

## Performance Metrics

Track performance:
- Page load time: ___ ms
- OAuth flow time: ___ seconds
- Endorsement submission time: ___ ms
- Stats loading time: ___ ms

## Recommendations

Based on testing, note any recommendations for:
- UI improvements
- Performance optimizations
- Feature additions
- Bug fixes