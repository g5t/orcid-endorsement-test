# Quick Start Guide

Get your ORCiD endorsement system up and running in 15 minutes!

## Prerequisites

- ORCiD account
- Cloudflare account (free tier OK)
- GitHub account (for hosting)
- Basic command line knowledge

## Step 1: Get ORCiD Credentials (5 minutes)

1. Visit https://orcid.org/developer-tools
2. Sign in and register a new application
3. Set redirect URIs:
   ```
   http://localhost:4000/endorsement/
   http://localhost:4000/my-endorsements/
   https://yourusername.github.io/your-repo/endorsement/
   https://yourusername.github.io/your-repo/my-endorsements/
   ```
4. Save your **Client ID** and **Client Secret**

## Step 2: Deploy Cloudflare Worker (5 minutes)

1. Create KV namespace in Cloudflare dashboard
2. Update `cloudflare-worker/wrangler.toml` with your namespace ID
3. Deploy:
   ```bash
   cd cloudflare-worker
   npm install
   npx wrangler secret put ORCID_CLIENT_ID
   npx wrangler secret put ORCID_CLIENT_SECRET
   npm run deploy
   ```
4. Copy your worker URL (e.g., `https://xxx.workers.dev`)

## Step 3: Configure Jekyll Site (3 minutes)

Update worker URL in these 3 files:

1. `assets/js/endorsement.js`:
   ```javascript
   const WORKER_URL = 'https://xxx.workers.dev';
   ```

2. `assets/js/my-endorsements.js`:
   ```javascript
   const WORKER_URL = 'https://xxx.workers.dev';
   ```

3. `_includes/endorsement-widget.html`:
   ```javascript
   const workerUrl = 'https://xxx.workers.dev';
   ```

## Step 4: Test Locally (2 minutes)

```bash
bundle install
bundle exec jekyll serve
```

Visit: http://localhost:4000

## Step 5: Deploy to GitHub Pages

1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to `main` branch
4. Your site will be at: `https://yourusername.github.io/your-repo/`

## Usage

### For Users (Researchers)

1. **Browse proposals**: Visit the site and read proposals
2. **Sign in**: Click "Sign in with ORCiD" on any endorsement page
3. **Endorse**: Fill in optional details and submit
4. **Manage**: View all endorsements at `/my-endorsements/`
5. **Remove**: Click remove button with confirmation

### For Proposal Authors

1. **Create post**: Add new file to `_posts/`
2. **Add proposal_id**: Include in frontmatter
   ```yaml
   ---
   title: "Your Proposal"
   proposal_id: your-proposal-2026
   ---
   ```
3. **Add endorsement link**:
   ```markdown
   <a href="/endorsement/?proposal=your-proposal-2026">
     Endorse This Proposal
   </a>
   ```
4. **Add widget**:
   ```liquid
   {% include endorsement-widget.html proposal_id=page.proposal_id %}
   ```

## Troubleshooting

### OAuth redirect errors
- Verify redirect URIs match exactly in ORCiD app settings
- Include both local and production URLs

### Stats not loading
- Check WORKER_URL is correct in JS files
- Verify CORS headers in worker
- Check browser console for errors

### Session expired
- Sessions expire after 10 minutes
- Sign in again to continue

## Next Steps

- Customize styling in `assets/css/endorsement.css`
- Add more proposals
- Configure custom domain
- Enable analytics

## Support

- 📖 Full docs: [SETUP.md](SETUP.md)
- 🏗️ Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- 🧪 Testing: [TESTING.md](TESTING.md)
- 🐛 Issues: GitHub Issues
- 📧 Questions: Create a discussion

## Key Files Reference

```
Important files you may need to edit:

Configuration:
├── _config.yml                    # Jekyll site config
├── cloudflare-worker/wrangler.toml # Worker config
└── cloudflare-worker/worker.js    # API endpoints

Customize:
├── assets/js/endorsement.js       # WORKER_URL here
├── assets/js/my-endorsements.js   # WORKER_URL here
├── _includes/endorsement-widget.html # WORKER_URL here
└── assets/css/endorsement.css     # Styling

Content:
├── _posts/*.md                    # Proposal posts
├── endorsement.md                 # Endorsement page
├── my-endorsements.md             # Management page
└── index.md                       # Homepage
```

## Security Checklist

- [x] HTTPS only in production
- [x] ORCiD credentials stored as secrets
- [x] Session expiration (10 minutes)
- [x] Input validation for proposal_id
- [x] CORS headers configured

## Performance Tips

- Use Cloudflare CDN for static assets
- Cache endorsement counts
- Monitor KV storage usage
- Set up analytics

## Common Tasks

### Add a new proposal
1. Create `_posts/YYYY-MM-DD-title.md`
2. Add `proposal_id: unique-id-2026` to frontmatter
3. Include endorsement link and widget
4. Commit and deploy

### Update styling
1. Edit `assets/css/endorsement.css`
2. Test locally
3. Commit and deploy

### Check endorsement count
```bash
curl https://your-worker.workers.dev/api/stats?proposal_id=your-proposal-2026
```

### View all endorsements data
```bash
curl https://your-worker.workers.dev/api/stats
```

## FAQ

**Q: Can users endorse multiple proposals?**  
A: Yes! Each proposal has independent endorsements.

**Q: How long do sessions last?**  
A: 10 minutes for security.

**Q: Can I customize the form fields?**  
A: Yes, edit the form in `endorsement.md` and update worker accordingly.

**Q: Is this ready for production?**  
A: Yes, but consider adding rate limiting and monitoring.

**Q: Can I use this for non-scientific proposals?**  
A: Absolutely! Just customize the content.

---

**Ready to launch? Follow the steps above and you'll be collecting endorsements in minutes!** 🚀