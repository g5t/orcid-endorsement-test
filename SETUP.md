# Setup Guide

This guide will walk you through setting up the ORCiD Endorsement Test system from scratch.

## Prerequisites

Before you begin, ensure you have:

1. **GitHub Account** - For hosting the Jekyll site on GitHub Pages
2. **ORCiD Account** - Get a free ORCiD at [orcid.org/register](https://orcid.org/register)
3. **ORCiD Developer Credentials** - Register an application at ORCiD
4. **Cloudflare Account** - Free tier is sufficient for testing

## Part 1: ORCiD Application Registration

### Step 1: Register Your ORCiD Application

1. Log in to [ORCiD](https://orcid.org)
2. Go to **Developer Tools** section in your account settings
3. Navigate to **Register a public API client**
4. Fill in the application details:
   - **Name**: ORCiD Endorsement Test
   - **Website**: `https://g5t.github.io/orcid-endorsement-test`
   - **Description**: Testing ORCiD-based proposal endorsement system
   - **Redirect URIs**: 
     - `https://g5t.github.io/orcid-endorsement-test/endorsement-complete/`
     - `http://localhost:4000/endorsement-complete/` (for local testing)

5. Submit the registration form
6. Save your **Client ID** (format: `APP-XXXXXXXXXXXX`)
7. Save your **Client Secret** (shown only once!)

### Step 2: Choose the Right Environment

- **Sandbox Environment** (`sandbox.orcid.org`): For development and testing
  - Register at: https://sandbox.orcid.org/
  - API endpoint: https://sandbox.orcid.org/oauth/authorize
  
- **Production Environment** (`orcid.org`): For live deployment
  - Use your regular ORCiD account
  - API endpoint: https://orcid.org/oauth/authorize

**Note**: Start with sandbox for testing! The code in this repository defaults to production ORCiD endpoints.

## Part 2: Cloudflare Workers Setup

### Step 1: Create Cloudflare Account

1. Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up)
2. Navigate to **Workers & Pages** in the left sidebar

### Step 2: Create KV Namespaces

You need two KV namespaces for storing data:

1. Click **KV** in the Workers sidebar
2. Click **Create a namespace**
3. Create two namespaces:
   - Name: `endorsements` (for storing endorsement data)
   - Name: `sessions` (for storing OAuth session tokens)
4. Note the **Namespace IDs** for each

### Step 3: Deploy the Worker

#### Option A: Using Wrangler CLI (Recommended)

1. Install Wrangler:
```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

3. Create `wrangler.toml` in the `cloudflare-worker` directory:
```toml
name = "orcid-endorsement-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGIN = "https://g5t.github.io"

[[kv_namespaces]]
binding = "ENDORSEMENTS"
id = "YOUR_ENDORSEMENTS_NAMESPACE_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_NAMESPACE_ID"
```

4. Set environment secrets:
```bash
cd cloudflare-worker
wrangler secret put ORCID_CLIENT_ID
# Paste your ORCiD Client ID when prompted

wrangler secret put ORCID_CLIENT_SECRET
# Paste your ORCiD Client Secret when prompted
```

5. Deploy the worker:
```bash
wrangler deploy
```

6. Note your Worker URL (e.g., `https://orcid-endorsement-worker.your-subdomain.workers.dev`)

#### Option B: Using Cloudflare Dashboard

1. Go to **Workers & Pages** > **Create application** > **Create Worker**
2. Name it `orcid-endorsement-worker`
3. Click **Deploy**
4. Click **Quick Edit** and paste the contents of `cloudflare-worker/worker.js`
5. Click **Save and Deploy**
6. Go to **Settings** > **Variables**
   - Add environment variables:
     - `ORCID_CLIENT_ID`: Your ORCiD client ID
     - `ORCID_CLIENT_SECRET`: Your ORCiD client secret (encrypt this!)
     - `ALLOWED_ORIGIN`: `https://g5t.github.io`
7. Go to **Settings** > **Bindings**
   - Add KV namespace binding:
     - Variable name: `ENDORSEMENTS`, KV namespace: select your endorsements namespace
     - Variable name: `SESSIONS`, KV namespace: select your sessions namespace
8. Click **Save**

### Step 4: Configure CORS

The worker automatically sets CORS headers based on `ALLOWED_ORIGIN`. Make sure this matches your GitHub Pages URL.

## Part 3: Configure Jekyll Site

### Step 1: Update Configuration Files

1. Edit `endorsement.md`:
   - Replace `API_BASE` with your Worker URL
   - Replace `ORCID_CLIENT_ID` with your ORCiD client ID
   - The `REDIRECT_URI` is automatically set by Jekyll

2. Edit `endorsement-complete.md`:
   - Replace `API_BASE` with your Worker URL

Example:
```javascript
const API_BASE = 'https://orcid-endorsement-worker.your-subdomain.workers.dev';
const ORCID_CLIENT_ID = 'APP-XXXXXXXXXXXX';
```

### Step 2: Customize Site Settings (Optional)

Edit `_config.yml` to customize:
- `title`: Your site title
- `description`: Site description
- `url`: Your GitHub Pages URL
- `baseurl`: Your repository name

## Part 4: GitHub Pages Deployment

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under **Build and deployment**:
   - Source: **GitHub Actions**
4. The `.github/workflows/pages-deploy.yml` workflow will automatically deploy your site

### Step 2: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. Wait for the "Build and Deploy" workflow to complete
3. Your site will be available at: `https://g5t.github.io/orcid-endorsement-test/`

### Step 3: Verify Deployment

Visit your site and check:
- Homepage loads correctly
- Proposal blog post is visible
- Endorsement page displays statistics
- "Sign in with ORCiD" button works

## Part 5: Local Development (Optional)

### Setup Local Jekyll Environment

1. Install Ruby (2.7 or higher)
2. Install Jekyll and dependencies:
```bash
gem install bundler jekyll
bundle install
```

3. Run local server:
```bash
bundle exec jekyll serve
```

4. Visit `http://localhost:4000/orcid-endorsement-test/`

### Local Testing Notes

- You'll need to add `http://localhost:4000/endorsement-complete/` to your ORCiD application's redirect URIs
- Update the configuration in `endorsement.md` for local testing
- The worker CORS settings may need to include `http://localhost:4000`

## Testing Your Setup

### Test the OAuth Flow

1. Visit the endorsement page
2. Click "Sign in with ORCiD"
3. Authorize the application on ORCiD
4. You should be redirected to the completion page
5. Fill in your job title and employer
6. Submit the endorsement
7. Verify the statistics update on the endorsement page

### Test Duplicate Prevention

1. Try to endorse again with the same ORCiD
2. You should see an error message indicating you've already endorsed

### Verify Data Storage

1. Go to Cloudflare Dashboard > Workers & Pages > KV
2. Select the `endorsements` namespace
3. You should see keys like `endorsement:0000-0001-2345-6789`
4. View the stored data to verify it's correct

## Troubleshooting

### "Failed to authenticate" Error

- **Check Client ID and Secret**: Ensure they're correctly set in Cloudflare
- **Check Redirect URI**: Must exactly match what's registered in ORCiD
- **Check CORS**: Ensure `ALLOWED_ORIGIN` matches your site URL

### "Session expired" Error

- Sessions expire after 30 minutes
- Clear your browser's sessionStorage
- Try the OAuth flow again

### Statistics Not Loading

- **Check Worker URL**: Ensure `API_BASE` is correct
- **Check CORS**: Worker must allow requests from your GitHub Pages domain
- **Check KV Bindings**: Ensure KV namespaces are properly bound to the worker

### OAuth Redirect Loop

- Clear your browser cookies and cache
- Check that redirect URI in ORCiD app matches your configuration
- Verify state parameter handling in the worker

### Jekyll Build Fails

- Check Ruby version (need 2.7+)
- Run `bundle install` to ensure all gems are installed
- Check `_config.yml` syntax
- Look for liquid template errors in pages

### ORCiD Sandbox vs Production

If using sandbox:
- Register at sandbox.orcid.org
- Update OAuth URLs in `assets/js/endorsement.js` to use `https://sandbox.orcid.org`
- Update API URLs in `cloudflare-worker/worker.js` to use `https://api.sandbox.orcid.org`

## Security Considerations

### Secrets Management

- **Never commit secrets** to the repository
- Use Cloudflare's encrypted environment variables for secrets
- Rotate your ORCiD Client Secret regularly

### CSRF Protection

- The OAuth flow uses state parameter for CSRF protection
- State is generated client-side and verified server-side
- Session tokens expire after 30 minutes

### Privacy

- Names are stored but not displayed publicly
- ORCiD IDs are stored to prevent duplicates but not exposed
- Only job titles and employers are displayed publicly

## Production Checklist

Before going to production:

- [ ] Switch from ORCiD sandbox to production endpoints
- [ ] Update redirect URIs in ORCiD application
- [ ] Set up proper CORS with your production domain
- [ ] Enable HTTPS (GitHub Pages provides this automatically)
- [ ] Test the complete flow end-to-end
- [ ] Monitor Cloudflare Worker analytics
- [ ] Set up error monitoring
- [ ] Review and update privacy policy
- [ ] Test duplicate prevention
- [ ] Verify statistics calculation
- [ ] Check mobile responsiveness

## Support

For issues with:
- **ORCiD Integration**: Check [ORCiD Developer Documentation](https://info.orcid.org/documentation/api-tutorials/)
- **Cloudflare Workers**: Check [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- **Jekyll/Chirpy Theme**: Check [Chirpy Documentation](https://chirpy.cotes.page/)

## Next Steps

After successful setup:

1. Customize the proposal content in `_posts/2026-02-12-neutron-scattering-proposal.md`
2. Update the About page with your project information
3. Add additional blog posts as needed
4. Monitor endorsements via Cloudflare KV dashboard
5. Export endorsement data for analysis (using Wrangler or CF API)

## Advanced Configuration

### Custom Domain

To use a custom domain:
1. Configure your domain in GitHub Pages settings
2. Update `url` in `_config.yml`
3. Update `ALLOWED_ORIGIN` in Cloudflare Worker
4. Update redirect URIs in ORCiD application

### Analytics

Add Google Analytics or similar:
1. Edit `_config.yml` and add your analytics ID
2. Chirpy theme supports built-in analytics integration

### Email Notifications

To get notified of new endorsements:
1. Modify the worker to send emails via a service like SendGrid
2. Add email configuration to worker environment variables
3. Trigger email in `handleEndorsementSubmit` function

### Export Endorsements

Use Wrangler to export data:
```bash
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
wrangler kv:key get --namespace-id=YOUR_NAMESPACE_ID endorsement:ORCID-ID
```
