# Quick Reference Guide

## What's Been Set Up

This repository now contains a complete, production-ready ORCiD endorsement system with:

✅ **Jekyll Site with Chirpy Theme**
✅ **ORCiD OAuth2 Integration**
✅ **Cloudflare Workers Backend**
✅ **Privacy-Preserving Data Storage**
✅ **GitHub Actions Deployment**
✅ **Comprehensive Documentation**

## File Structure

```
orcid-endorsement-test/
├── _config.yml                 # Jekyll site configuration
├── index.md                    # Homepage
├── endorsement.md              # Main endorsement page
├── endorsement-complete.md     # OAuth completion form
│
├── _posts/                     # Blog posts (proposals)
│   └── 2026-02-12-neutron-scattering-proposal.md
│
├── _tabs/                      # Navigation pages
│   ├── about.md               # About page
│   ├── archives.md            # Archives
│   ├── categories.md          # Categories
│   └── tags.md                # Tags
│
├── _data/
│   └── contact.yml            # Contact links
│
├── assets/
│   └── js/
│       └── endorsement.js     # Client-side OAuth & API
│
├── cloudflare-worker/
│   ├── worker.js              # Serverless backend
│   ├── wrangler.toml.example  # Deployment config template
│   └── README.md              # Worker documentation
│
├── .github/
│   └── workflows/
│       └── pages-deploy.yml   # Automated deployment
│
├── Gemfile                    # Ruby dependencies
├── SETUP.md                   # Complete setup guide
└── README.md                  # Project overview
```

## Next Steps (After Deployment)

### 1. Register ORCiD Application (5 minutes)
- Go to https://orcid.org/developer-tools
- Register a new public API client
- Note your Client ID and Secret
- Add redirect URI: `https://g5t.github.io/orcid-endorsement-test/endorsement-complete/`

### 2. Set Up Cloudflare Worker (10 minutes)
- Create a Cloudflare account (free)
- Create two KV namespaces: `endorsements` and `sessions`
- Deploy `cloudflare-worker/worker.js`
- Set environment variables (Client ID, Secret, ALLOWED_ORIGIN)
- Bind KV namespaces

### 3. Configure Jekyll Site (2 minutes)
- Edit `endorsement.md`: Add your Worker URL and ORCiD Client ID
- Edit `endorsement-complete.md`: Add your Worker URL

### 4. Deploy to GitHub Pages (Automatic)
- Push to main/master branch
- GitHub Actions will build and deploy automatically
- Visit https://g5t.github.io/orcid-endorsement-test/

## Configuration Checklist

Before the site works, you need to configure these values:

### In `endorsement.md` (line ~100)
```javascript
const API_BASE = 'https://your-worker.your-subdomain.workers.dev';  // ← Your Worker URL
const ORCID_CLIENT_ID = 'APP-XXXXXXXXXXXX';  // ← Your ORCiD Client ID
```

### In `endorsement-complete.md` (line ~110)
```javascript
const API_BASE = 'https://your-worker.your-subdomain.workers.dev';  // ← Your Worker URL
```

### In Cloudflare Worker Environment
```
ORCID_CLIENT_ID = APP-XXXXXXXXXXXX
ORCID_CLIENT_SECRET = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ALLOWED_ORIGIN = https://g5t.github.io
```

### In Cloudflare Worker KV Bindings
```
ENDORSEMENTS → your-endorsements-namespace
SESSIONS → your-sessions-namespace
```

## Testing the System

Once configured, test the complete flow:

1. **Visit the site**: https://g5t.github.io/orcid-endorsement-test/
2. **Read the proposal**: Click on the blog post
3. **Go to endorsement page**: Click "Endorse" link
4. **Sign in with ORCiD**: Click the green button
5. **Authorize**: Grant permissions on ORCiD
6. **Complete endorsement**: Fill in job title and employer
7. **Submit**: Confirm and submit
8. **Verify**: Check that statistics update

## Common Issues & Solutions

### "Failed to authenticate"
**Cause**: Configuration mismatch
**Fix**: Double-check Client ID, Secret, and redirect URI

### "Session expired"
**Cause**: Took too long to complete form (>30 min)
**Fix**: Start OAuth flow again

### Statistics not loading
**Cause**: Worker URL incorrect or CORS issue
**Fix**: Verify API_BASE and ALLOWED_ORIGIN match

### GitHub Pages not deploying
**Cause**: Workflow not enabled
**Fix**: Go to Settings > Pages, set Source to "GitHub Actions"

## Features Included

### Security
- ✅ CSRF protection via OAuth state parameter
- ✅ Secure session tokens with expiration
- ✅ Duplicate prevention by ORCiD ID
- ✅ CORS configuration for cross-origin requests
- ✅ Encrypted secret storage in Cloudflare

### Privacy
- ✅ Names stored but not displayed publicly
- ✅ ORCiD IDs used for deduplication only
- ✅ Job titles and employers displayed with consent
- ✅ Clear privacy notice before submission

### User Experience
- ✅ Auto-fill employment data from ORCiD
- ✅ Real-time preview of public information
- ✅ Confirmation checkbox for explicit consent
- ✅ Clear error messages
- ✅ Responsive design for mobile devices

### Analytics
- ✅ Total endorsement count
- ✅ Unique organizations count
- ✅ Top supporting organizations
- ✅ Statistics caching for performance

## Customization

### Change the Proposal
Edit `_posts/2026-02-12-neutron-scattering-proposal.md`:
- Update title, content, tags
- Change call-to-action text
- Add images or diagrams

### Modify Site Theme
Edit `_config.yml`:
- Change site title and description
- Update social links
- Customize theme colors (via Chirpy theme options)

### Add More Pages
Create new files in `_tabs/`:
```yaml
---
layout: page
title: Your Page
icon: fas fa-icon
order: 5
---

Your content here...
```

### Extend the Worker
Add new endpoints in `cloudflare-worker/worker.js`:
- Email notifications
- Admin dashboard
- Data export API
- Multi-proposal support

## Resources

- 📖 **Full Setup Guide**: [SETUP.md](SETUP.md)
- 📖 **Project Overview**: [README.md](README.md)
- 🔗 **ORCiD API Docs**: https://info.orcid.org/documentation/
- 🔗 **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- 🔗 **Jekyll Docs**: https://jekyllrb.com/docs/
- 🔗 **Chirpy Theme**: https://chirpy.cotes.page/

## Architecture Flow

```
User clicks "Sign in with ORCiD"
         ↓
Redirect to ORCiD (with state parameter)
         ↓
User authorizes application
         ↓
Redirect to /endorsement-complete/ with code
         ↓
JavaScript sends code to Worker
         ↓
Worker exchanges code for access token
         ↓
Worker fetches employment data from ORCiD API
         ↓
Worker creates session, returns data
         ↓
User reviews and edits information
         ↓
User submits endorsement
         ↓
Worker validates session
         ↓
Worker stores in KV, invalidates cache
         ↓
Success! Statistics update
```

## Data Storage

### Cloudflare KV: ENDORSEMENTS
```
Key: endorsement:0000-0001-2345-6789
Value: {
  "orcid": "0000-0001-2345-6789",
  "name": "Jane Researcher",
  "jobTitle": "Professor",
  "employer": "University of Science",
  "timestamp": 1707747600000
}
```

### Cloudflare KV: SESSIONS
```
Key: random-session-token-here
Value: {
  "orcid": "0000-0001-2345-6789",
  "name": "Jane Researcher",
  "employment": [...],
  "createdAt": 1707747600000
}
TTL: 1800 seconds (30 minutes)
```

### Cloudflare KV: ENDORSEMENTS (cache)
```
Key: cache:stats
Value: {
  "totalEndorsements": 42,
  "uniqueOrganizations": 15,
  "topOrganizations": [...]
}
TTL: 300 seconds (5 minutes)
```

## Support

For help:
1. Check [SETUP.md](SETUP.md) troubleshooting section
2. Review [Cloudflare Worker README](cloudflare-worker/README.md)
3. Check ORCiD API documentation
4. Open an issue on GitHub

## License

Open source - adapt and modify as needed for your proposals!
