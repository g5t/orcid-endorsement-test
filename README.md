# ORCiD Endorsement System

A Jekyll-based website with Cloudflare Workers backend that enables researchers to endorse scientific proposals using their ORCiD credentials.

## Features

✅ **ORCiD Authentication** - Secure sign-in using ORCiD OAuth  
✅ **Per-Post Endorsement Tracking** - Each proposal has independent endorsements  
✅ **User Endorsement Management** - Users can view and manage all their endorsements  
✅ **Endorsement Removal** - Authenticated removal with confirmation  
✅ **Real-time Statistics** - Live endorsement counts per proposal and site-wide  
✅ **Reusable Widget** - Easy-to-embed endorsement counter for posts  
✅ **Session Management** - Secure 10-minute sessions for authentication  
✅ **Multi-Proposal Support** - Multiple proposals can coexist on the same site  

## Architecture

### Frontend (Jekyll + GitHub Pages)

- **Jekyll Site**: Static site generator with Chirpy theme
- **Blog Posts**: Proposals with unique `proposal_id` in frontmatter
- **Endorsement Pages**: `/endorsement/` and `/my-endorsements/`
- **JavaScript**: OAuth flow, API calls, and UI updates
- **Endorsement Widget**: Reusable include for showing endorsement count

### Backend (Cloudflare Workers)

- **API Endpoints**:
  - `POST /api/oauth/start` - Initiate ORCiD OAuth flow
  - `POST /api/oauth/callback` - Handle OAuth callback
  - `POST /api/endorse` - Submit/update endorsement
  - `DELETE /api/endorse` - Remove endorsement
  - `GET /api/my-endorsements` - List user's endorsements
  - `GET /api/stats` - Get endorsement statistics

- **Storage (Cloudflare KV)**:
  - `endorsement:{proposal_id}:{orcid}` - Individual endorsements
  - `count:{proposal_id}:total` - Per-proposal counters
  - `session:{token}` - User sessions (10-minute TTL)

## Quick Start

### 1. Deploy Cloudflare Worker

```bash
cd cloudflare-worker
npm install
# Configure wrangler.toml with your KV namespace and ORCiD credentials
npm run deploy
```

### 2. Configure Jekyll Site

Update the worker URL in JavaScript files:
- `assets/js/endorsement.js`
- `assets/js/my-endorsements.js`
- `_includes/endorsement-widget.html`

### 3. Build and Deploy Jekyll Site

```bash
bundle install
bundle exec jekyll serve
```

### 4. Get ORCiD Credentials

1. Register your application at https://orcid.org/developer-tools
2. Set redirect URIs:
   - `https://your-site.com/endorsement/`
   - `https://your-site.com/my-endorsements/`
3. Add credentials to Cloudflare Worker environment variables

## Usage

### Adding Endorsement to a Post

1. Add `proposal_id` to post frontmatter:
```yaml
---
title: "My Proposal"
proposal_id: my-proposal-2026
---
```

2. Add endorsement link and widget:
```markdown
<a href="/endorsement/?proposal=my-proposal-2026">Endorse this Proposal</a>

{% include endorsement-widget.html proposal_id=page.proposal_id %}
```

### Testing Multi-Proposal Support

1. User can endorse proposal A
2. User can endorse proposal B (separate endorsement)
3. Stats show correctly per proposal
4. User can view all endorsements in `/my-endorsements/`
5. User can remove individual endorsements
6. Counters update correctly after removal

## Security

- Session tokens expire after 10 minutes
- ORCiD authentication validates identity
- proposal_id validation (alphanumeric and hyphens only)
- CORS headers properly configured
- No sensitive data stored in frontend

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [cloudflare-worker/README.md](cloudflare-worker/README.md) - Worker deployment guide

## Contributing

Contributions welcome! Please open an issue or pull request.

## License

MIT License - See LICENSE file for details