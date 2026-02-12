# Deployment Checklist

Use this checklist to deploy your ORCiD endorsement system step-by-step.

## Pre-Deployment (Before Configuration)

- [ ] Repository forked or cloned
- [ ] All files committed to your repository
- [ ] GitHub Pages enabled in repository settings (Settings > Pages > Source: GitHub Actions)

## Step 1: ORCiD Application Setup (5 minutes)

### Create ORCiD Developer Application

- [ ] Log in to https://orcid.org
- [ ] Navigate to Developer Tools (in account settings)
- [ ] Click "Register a public API client"
- [ ] Fill in application details:
  - [ ] Name: `ORCiD Endorsement Test`
  - [ ] Website: `https://YOUR_USERNAME.github.io/YOUR_REPO`
  - [ ] Description: `Testing ORCiD-based proposal endorsements`
  - [ ] Redirect URIs:
    - [ ] `https://YOUR_USERNAME.github.io/YOUR_REPO/endorsement-complete/`
    - [ ] `http://localhost:4000/endorsement-complete/` (for local testing)
- [ ] Submit the registration
- [ ] **SAVE YOUR CLIENT ID**: Format `APP-XXXXXXXXXXXX`
- [ ] **SAVE YOUR CLIENT SECRET**: Shown only once! Copy it immediately

### Choose Environment

- [ ] **Production** (orcid.org) - for live deployment
- [ ] **Sandbox** (sandbox.orcid.org) - for testing
  - If using sandbox, update OAuth URLs in code (see SETUP.md)

**Your ORCiD Client ID**: `_______________________________`
**Your ORCiD Client Secret**: `_______________________________`

## Step 2: Cloudflare Workers Setup (10 minutes)

### Create Cloudflare Account

- [ ] Sign up at https://dash.cloudflare.com/sign-up (free tier is sufficient)
- [ ] Verify your email address
- [ ] Log in to Cloudflare Dashboard

### Create KV Namespaces

- [ ] Click **Workers & Pages** in left sidebar
- [ ] Click **KV** tab
- [ ] Click **Create a namespace**
- [ ] Create first namespace:
  - [ ] Name: `endorsements`
  - [ ] Click **Add**
  - [ ] **SAVE NAMESPACE ID**: `_______________________________`
- [ ] Create second namespace:
  - [ ] Name: `sessions`
  - [ ] Click **Add**
  - [ ] **SAVE NAMESPACE ID**: `_______________________________`

### Deploy Worker

#### Option A: Using Cloudflare Dashboard (Easier)

- [ ] Go to **Workers & Pages** > **Create application** > **Create Worker**
- [ ] Name: `orcid-endorsement-worker`
- [ ] Click **Deploy**
- [ ] Click **Quick Edit**
- [ ] Copy contents of `cloudflare-worker/worker.js` and paste into editor
- [ ] Click **Save and Deploy**
- [ ] **SAVE WORKER URL**: `_______________________________`
  - Format: `https://orcid-endorsement-worker.YOUR-SUBDOMAIN.workers.dev`

#### Option B: Using Wrangler CLI (Advanced)

- [ ] Install Wrangler: `npm install -g wrangler`
- [ ] Login: `wrangler login`
- [ ] Copy template: `cp cloudflare-worker/wrangler.toml.example cloudflare-worker/wrangler.toml`
- [ ] Edit `wrangler.toml` with your namespace IDs
- [ ] Set secrets:
  ```bash
  cd cloudflare-worker
  wrangler secret put ORCID_CLIENT_ID
  wrangler secret put ORCID_CLIENT_SECRET
  ```
- [ ] Deploy: `wrangler deploy`
- [ ] **SAVE WORKER URL**: `_______________________________`

### Configure Worker Environment

- [ ] Go to your worker in Cloudflare Dashboard
- [ ] Click **Settings** tab
- [ ] Navigate to **Variables** section

#### Add Environment Variables

- [ ] Click **Add variable** under "Environment Variables"
- [ ] Add variable `ORCID_CLIENT_ID`:
  - [ ] Name: `ORCID_CLIENT_ID`
  - [ ] Value: Your ORCiD Client ID (APP-XXXXXXXXXXXX)
  - [ ] Type: **Secret** (encrypt it!)
- [ ] Add variable `ORCID_CLIENT_SECRET`:
  - [ ] Name: `ORCID_CLIENT_SECRET`
  - [ ] Value: Your ORCiD Client Secret
  - [ ] Type: **Secret** (encrypt it!)
- [ ] Add variable `ALLOWED_ORIGIN`:
  - [ ] Name: `ALLOWED_ORIGIN`
  - [ ] Value: `https://YOUR_USERNAME.github.io`
  - [ ] Type: Text (not encrypted)
- [ ] Click **Save and Deploy**

#### Bind KV Namespaces

- [ ] Navigate to **Settings** > **Bindings**
- [ ] Click **Add binding** under "KV Namespace Bindings"
- [ ] Add first binding:
  - [ ] Variable name: `ENDORSEMENTS`
  - [ ] KV namespace: Select `endorsements` from dropdown
  - [ ] Click **Add binding**
- [ ] Add second binding:
  - [ ] Variable name: `SESSIONS`
  - [ ] KV namespace: Select `sessions` from dropdown
  - [ ] Click **Add binding**
- [ ] Click **Save**

### Test Worker

- [ ] Test stats endpoint in browser:
  - Visit: `https://your-worker-url.workers.dev/endorsement/stats`
  - Expected: JSON response with `{"totalEndorsements":0,...}`

## Step 3: Configure Jekyll Site (2 minutes)

### Update endorsement.md

- [ ] Open `endorsement.md` in editor
- [ ] Find line ~150 (the TODO comment)
- [ ] Replace configuration values:
  ```javascript
  const API_BASE = 'YOUR_WORKER_URL';  // No trailing slash
  const ORCID_CLIENT_ID = 'APP-XXXXXXXXXXXX';
  ```
- [ ] **Example**:
  ```javascript
  const API_BASE = 'https://orcid-endorsement-worker.example.workers.dev';
  const ORCID_CLIENT_ID = 'APP-1234567890123456';
  ```
- [ ] Save file

### Update endorsement-complete.md

- [ ] Open `endorsement-complete.md` in editor
- [ ] Find line ~177 (the TODO comment)
- [ ] Replace configuration value:
  ```javascript
  const API_BASE = 'YOUR_WORKER_URL';  // No trailing slash
  ```
- [ ] Save file

### Update _config.yml (if needed)

- [ ] Open `_config.yml`
- [ ] Verify `url` is set correctly: `https://YOUR_USERNAME.github.io`
- [ ] Verify `baseurl` is set correctly: `/YOUR_REPO_NAME`
- [ ] Update `github.username` if needed
- [ ] Save file

### Commit Changes

- [ ] Stage files: `git add endorsement.md endorsement-complete.md _config.yml`
- [ ] Commit: `git commit -m "Configure ORCiD and Cloudflare settings"`
- [ ] Push: `git push origin main` (or your branch name)

## Step 4: Deploy to GitHub Pages (Automatic)

### Enable GitHub Pages

- [ ] Go to repository on GitHub
- [ ] Navigate to **Settings** > **Pages**
- [ ] Under "Build and deployment":
  - [ ] Source: **GitHub Actions**
- [ ] If already set, no action needed

### Monitor Deployment

- [ ] Go to **Actions** tab in your repository
- [ ] Wait for "Build and Deploy Jekyll Site" workflow to complete
- [ ] Check for green checkmark (success) or red X (failure)
- [ ] If failed, click on workflow run to see error logs

### Verify Deployment

- [ ] Visit your site: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
- [ ] Check homepage loads
- [ ] Check proposal post is visible
- [ ] Click through to endorsement page

## Step 5: Test Complete System

### Test Statistics Display

- [ ] Visit endorsement page: `https://YOUR_SITE/endorsement/`
- [ ] Verify statistics show "0" endorsements (initially)
- [ ] Check "Sign in with ORCiD" button displays

### Test OAuth Flow

- [ ] Click "Sign in with ORCiD" button
- [ ] You should be redirected to ORCiD authorization page
- [ ] Log in with your ORCiD account
- [ ] Click "Authorize" to grant permissions
- [ ] You should be redirected back to endorsement-complete page

### Test Form Completion

- [ ] Verify your name is displayed (if available from ORCiD)
- [ ] Check if job title and employer are pre-filled
- [ ] Edit job title if needed
- [ ] Edit employer if needed
- [ ] Review privacy notice
- [ ] Check the consent checkbox
- [ ] Click "Submit Endorsement"

### Test Success

- [ ] Verify success message displays
- [ ] Return to endorsement page
- [ ] Check statistics updated (should show 1 endorsement)
- [ ] Verify your employer appears in organization list

### Test Duplicate Prevention

- [ ] Try to endorse again with same ORCiD
- [ ] Verify error message: "You have already endorsed this proposal"

## Step 6: Final Verification

### Browser Console Check

- [ ] Open browser developer tools (F12)
- [ ] Check Console tab for JavaScript errors
- [ ] There should be no red errors

### Cross-Browser Testing

- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on mobile device

### Accessibility Check

- [ ] Test keyboard navigation (Tab key)
- [ ] Test screen reader (if available)
- [ ] Verify all interactive elements are accessible

## Troubleshooting

### Common Issues

**"Failed to authenticate"**
- [ ] Double-check ORCiD Client ID in endorsement.md matches Cloudflare
- [ ] Verify Client Secret is set correctly in Cloudflare
- [ ] Check redirect URI matches exactly in ORCiD app settings

**"Session expired"**
- [ ] Complete OAuth flow within 30 minutes
- [ ] Clear browser sessionStorage and try again

**Statistics not loading**
- [ ] Verify API_BASE URL is correct (no trailing slash)
- [ ] Check CORS: ALLOWED_ORIGIN should match your GitHub Pages domain
- [ ] Open browser console to see specific error

**GitHub Actions workflow fails**
- [ ] Check workflow logs in Actions tab
- [ ] Common issue: Invalid YAML syntax in _config.yml
- [ ] Fix error and push again

**Worker deployment fails**
- [ ] Verify KV namespaces are created
- [ ] Check all environment variables are set
- [ ] Verify KV bindings use exact variable names (ENDORSEMENTS, SESSIONS)

## Post-Deployment Tasks

### Optional Enhancements

- [ ] Set up custom domain (see SETUP.md)
- [ ] Add Google Analytics to _config.yml
- [ ] Customize proposal content
- [ ] Add more blog posts
- [ ] Update About page with your information
- [ ] Configure email notifications (advanced)

### Monitoring

- [ ] Check Cloudflare Worker analytics regularly
- [ ] Monitor GitHub Pages build status
- [ ] Review endorsement data in KV dashboard
- [ ] Export data periodically for backup

### Security

- [ ] Review Cloudflare security logs
- [ ] Rotate ORCiD Client Secret periodically
- [ ] Monitor for suspicious activity
- [ ] Keep secrets secure (never commit to git)

## Documentation Reference

- [ ] Read SETUP.md for detailed explanations
- [ ] Check QUICKSTART.md for quick reference
- [ ] Review cloudflare-worker/README.md for API docs

## Success Criteria

Your deployment is successful when:

- [x] Site loads at your GitHub Pages URL
- [x] Proposal blog post is visible and readable
- [x] Endorsement page displays statistics (even if 0)
- [x] "Sign in with ORCiD" button redirects to ORCiD
- [x] OAuth flow completes and returns to site
- [x] Employment data auto-fills (if available in ORCiD)
- [x] Endorsement submission succeeds
- [x] Statistics update after submission
- [x] Duplicate endorsement is prevented
- [x] No JavaScript errors in browser console

## Notes

**Estimated Total Time**: 15-20 minutes

**Cost**: $0 (using free tiers)
- GitHub Pages: Free
- Cloudflare Workers: Free tier (100k requests/day)
- ORCiD API: Free

**Support Resources**:
- ORCiD: https://info.orcid.org/documentation/
- Cloudflare: https://developers.cloudflare.com/workers/
- Jekyll: https://jekyllrb.com/docs/
- This repo: SETUP.md, README.md, QUICKSTART.md

---

**Congratulations!** Once all items are checked, your ORCiD endorsement system is live! 🎉
