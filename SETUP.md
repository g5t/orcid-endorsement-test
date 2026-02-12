# Setup Guide - ORCiD Endorsement System

This guide walks you through setting up the complete ORCiD endorsement system from scratch.

## Prerequisites

- **ORCiD Account**: You need an ORCiD account to register your application
- **Cloudflare Account**: Free tier is sufficient for testing
- **GitHub Account**: For hosting the Jekyll site (optional)
- **Node.js**: For Cloudflare Worker development
- **Ruby**: For Jekyll development

## Part 1: ORCiD Application Setup

### 1.1 Register ORCiD Application

1. Go to https://orcid.org/developer-tools
2. Sign in with your ORCiD account
3. Click "Register for the free ORCID public API"
4. Fill in application details:
   - **Name**: ORCiD Endorsement System
   - **Description**: Collect endorsements for scientific proposals
   - **Homepage URL**: Your site URL (e.g., https://yoursite.github.io)
   - **Redirect URIs**: 
     - `https://yoursite.github.io/endorsement/`
     - `https://yoursite.github.io/my-endorsements/`
     - `http://localhost:4000/endorsement/` (for local testing)
     - `http://localhost:4000/my-endorsements/` (for local testing)

5. Save your **Client ID** and **Client Secret** - you'll need these for the worker

### 1.2 Test Authentication

ORCiD provides a sandbox environment for testing:
- Sandbox: https://sandbox.orcid.org
- Production: https://orcid.org

For initial testing, you can use the sandbox.

## Part 2: Cloudflare Worker Setup

### 2.1 Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for a free account
3. Go to Workers & Pages section

### 2.2 Create KV Namespace

1. In Cloudflare dashboard, go to **Workers & Pages** → **KV**
2. Click **Create namespace**
3. Name it: `ENDORSEMENT_KV`
4. Copy the **Namespace ID**

### 2.3 Configure Worker

1. Edit `cloudflare-worker/wrangler.toml`:
```toml
name = "orcid-endorsement-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
kv_namespaces = [
  { binding = "ENDORSEMENT_KV", id = "YOUR_KV_NAMESPACE_ID" }
]
```

2. Set environment variables using Wrangler CLI:
```bash
cd cloudflare-worker
npx wrangler secret put ORCID_CLIENT_ID
# Enter your ORCiD Client ID when prompted

npx wrangler secret put ORCID_CLIENT_SECRET
# Enter your ORCiD Client Secret when prompted
```

### 2.4 Deploy Worker

```bash
cd cloudflare-worker
npm install
npm run deploy
```

Your worker will be deployed to: `https://orcid-endorsement-worker.YOUR_SUBDOMAIN.workers.dev`

### 2.5 Test Worker

Test the stats endpoint:
```bash
curl https://orcid-endorsement-worker.YOUR_SUBDOMAIN.workers.dev/api/stats
```

Expected response:
```json
{
  "total": 0,
  "proposals": {}
}
```

## Part 3: Jekyll Site Setup

### 3.1 Install Dependencies

```bash
# Install Ruby gems
bundle install
```

### 3.2 Configure Worker URL

Update the `WORKER_URL` constant in these files:

1. `assets/js/endorsement.js`:
```javascript
const WORKER_URL = 'https://orcid-endorsement-worker.YOUR_SUBDOMAIN.workers.dev';
```

2. `assets/js/my-endorsements.js`:
```javascript
const WORKER_URL = 'https://orcid-endorsement-worker.YOUR_SUBDOMAIN.workers.dev';
```

3. `_includes/endorsement-widget.html`:
```javascript
const workerUrl = 'https://orcid-endorsement-worker.YOUR_SUBDOMAIN.workers.dev';
```

### 3.3 Test Locally

```bash
bundle exec jekyll serve
```

Visit: http://localhost:4000

### 3.4 Deploy to GitHub Pages

1. Push code to GitHub repository
2. Go to repository **Settings** → **Pages**
3. Set source to `main` branch
4. Your site will be available at: `https://username.github.io/repository-name/`

### 3.5 Update Configuration

Update `_config.yml` with your actual site URL:
```yaml
url: "https://username.github.io"
baseurl: "/repository-name"
```

Also update redirect URIs in:
- ORCiD application settings
- JavaScript files (`REDIRECT_URI` constant)

## Part 4: Adding Proposals

### 4.1 Create a New Proposal Post

Create a file: `_posts/YYYY-MM-DD-proposal-title.md`

```markdown
---
layout: post
title: "Proposal: Your Proposal Title"
date: 2026-02-12 10:00:00 +0000
categories: proposals
proposal_id: your-proposal-2026
---

## Your Proposal Content

...

## Support This Proposal

<div style="text-align: center; margin: 30px 0;">
  <a href="/endorsement/?proposal=your-proposal-2026" class="btn btn-primary">
    Endorse This Proposal
  </a>
</div>

{% include endorsement-widget.html proposal_id=page.proposal_id %}
```

### 4.2 Proposal ID Guidelines

- Use lowercase letters, numbers, and hyphens only
- Make it descriptive and unique
- Include year for easy identification
- Examples:
  - `neutron-instrument-2026`
  - `open-data-standards-2026`
  - `detector-upgrade-proposal-2026`

## Part 5: Testing the System

### 5.1 Test OAuth Flow

1. Visit a proposal post
2. Click "Endorse This Proposal"
3. Click "Sign in with ORCiD"
4. Authorize the application
5. You should be redirected back with authentication

### 5.2 Test Endorsement Submission

1. After authentication, fill in job title and employer
2. Click "Submit Endorsement"
3. Check that:
   - Success message appears
   - Endorsement count updates
   - "Remove Endorsement" button appears

### 5.3 Test My Endorsements Page

1. Visit `/my-endorsements/`
2. Sign in if not already authenticated
3. Check that your endorsement appears in the list
4. Test removing an endorsement

### 5.4 Test Multi-Proposal Support

1. Endorse the first proposal
2. Endorse the second proposal
3. Visit `/my-endorsements/` to see both
4. Remove one endorsement
5. Check that the other remains

## Part 6: Troubleshooting

### OAuth Redirect Errors

**Problem**: "Redirect URI mismatch"

**Solution**: 
- Verify redirect URIs in ORCiD application settings match exactly
- Include both production and local URLs
- Check for trailing slashes

### Worker Errors

**Problem**: "Invalid or expired session"

**Solution**:
- Sessions expire after 10 minutes
- Sign in again
- Check that `ENDORSEMENT_KV` is properly bound in wrangler.toml

### Stats Not Loading

**Problem**: Endorsement counts show "0" or don't load

**Solution**:
- Check browser console for CORS errors
- Verify WORKER_URL is correct in JavaScript files
- Test worker endpoint directly with curl

### Endorsements Not Saving

**Problem**: Endorsement submission fails

**Solution**:
- Check that proposal_id is valid (alphanumeric and hyphens only)
- Verify KV namespace is properly configured
- Check worker logs in Cloudflare dashboard

## Part 7: Advanced Configuration

### Custom Domain for Worker

1. In Cloudflare dashboard, go to **Workers & Pages**
2. Select your worker
3. Go to **Settings** → **Triggers**
4. Add a custom domain route

### Rate Limiting

Consider adding rate limiting to prevent abuse:
```javascript
// In worker.js, add rate limiting middleware
// Use Cloudflare's Rate Limiting API or implement custom logic
```

### Analytics

Add analytics to track:
- Endorsement submissions
- OAuth conversions
- Popular proposals
- Geographic distribution

### Backup and Export

Periodically export endorsement data:
```bash
# Use Wrangler CLI to list and backup KV data
npx wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

## Security Best Practices

1. **Never commit secrets**: Keep ORCiD credentials out of version control
2. **Use HTTPS only**: Ensure your site and worker use HTTPS
3. **Validate input**: proposal_id validation prevents injection attacks
4. **Session expiration**: 10-minute sessions limit exposure
5. **CORS configuration**: Restrict origins in production if needed

## Performance Optimization

1. **Cache stats**: Consider caching endorsement counts
2. **Minimize KV reads**: Batch operations where possible
3. **CDN benefits**: Use Cloudflare's CDN for static assets
4. **Lazy loading**: Load widgets only when visible

## Monitoring

Monitor your system:
1. **Cloudflare Dashboard**: Worker analytics and logs
2. **GitHub Pages**: Site availability
3. **ORCiD**: Application usage statistics
4. **Custom metrics**: Track endorsement rates and patterns

## Next Steps

1. Customize the styling to match your brand
2. Add email notifications for endorsement confirmations
3. Create admin dashboard for proposal owners
4. Add endorsement verification (require affiliation)
5. Implement proposal categories and filtering

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with details
- Include error messages and logs
- Describe expected vs actual behavior