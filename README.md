# ORCiD Endorsement Test

A complete Jekyll-based system for collecting community endorsements of scientific proposals using ORCiD authentication. This test environment demonstrates how to build a privacy-preserving endorsement system that leverages ORCiD's OAuth2 authentication and employment data.

## Overview

This project provides a fully functional endorsement system for scientific proposals with:

- 🔐 **ORCiD Authentication** - Secure OAuth2 flow with ORCiD integration
- 📊 **Real-time Statistics** - Track endorsements and supporting organizations
- 🔒 **Privacy-Preserving** - Names stored but not displayed publicly
- 🚀 **Serverless Backend** - Powered by Cloudflare Workers
- 📱 **Responsive Design** - Built with Jekyll Chirpy theme
- 🛡️ **Security Features** - CSRF protection, duplicate prevention, session management

## Features

### For Users
- Single sign-on with ORCiD credentials
- Auto-fill employment information from ORCiD profile
- Privacy controls over displayed information
- Real-time statistics dashboard

### For Administrators
- Serverless architecture (no server maintenance)
- Free/low-cost deployment (GitHub Pages + Cloudflare Workers)
- Secure credential storage in Cloudflare
- Simple KV-based data storage

## Architecture

```
┌─────────────┐
│   Browser   │
│  (GitHub    │
│   Pages)    │
└──────┬──────┘
       │
       │ 1. Sign in with ORCiD
       │
       ▼
┌─────────────────┐
│  ORCiD OAuth    │
│  Authorization  │
└────────┬────────┘
         │
         │ 2. Authorization code
         │
         ▼
┌─────────────────────┐      3. Exchange code     ┌──────────────┐
│ Cloudflare Worker   │◄────────────────────────►│  ORCiD API   │
│  - OAuth Handler    │      4. Get user data     └──────────────┘
│  - Data Storage     │
│  - Statistics       │
└──────┬──────────────┘
       │
       │ 5. Store endorsement
       │
       ▼
┌─────────────────┐
│ Cloudflare KV   │
│  - Endorsements │
│  - Sessions     │
└─────────────────┘
```

## Quick Start

### Prerequisites
- GitHub account
- ORCiD account ([register free](https://orcid.org/register))
- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))

### Deployment Steps

1. **Fork or clone this repository**

2. **Register your ORCiD application**
   - Follow the detailed guide in [SETUP.md](SETUP.md#part-1-orcid-application-registration)
   - Save your Client ID and Secret

3. **Set up Cloudflare Worker**
   - Create KV namespaces for endorsements and sessions
   - Deploy the worker from `cloudflare-worker/worker.js`
   - Configure environment variables
   - Full instructions in [SETUP.md](SETUP.md#part-2-cloudflare-workers-setup)

4. **Configure the Jekyll site**
   - Edit `endorsement.md` with your Worker URL and ORCiD Client ID
   - Edit `endorsement-complete.md` with your Worker URL
   - Update `_config.yml` if needed

5. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"
   - Wait for deployment workflow to complete

6. **Test your deployment**
   - Visit your GitHub Pages URL
   - Try the endorsement flow
   - Verify statistics display

👉 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

## Project Structure

```
├── _config.yml                 # Jekyll configuration
├── _posts/                     # Blog posts (proposals)
│   └── 2026-02-12-neutron-scattering-proposal.md
├── _tabs/                      # Site navigation pages
│   ├── about.md
│   ├── archives.md
│   ├── categories.md
│   └── tags.md
├── _data/
│   └── contact.yml            # Contact information
├── assets/
│   └── js/
│       └── endorsement.js     # Client-side OAuth & API logic
├── cloudflare-worker/
│   └── worker.js              # Serverless backend
├── endorsement.md             # Main endorsement page
├── endorsement-complete.md    # OAuth completion page
├── .github/
│   └── workflows/
│       └── pages-deploy.yml   # GitHub Actions deployment
├── Gemfile                    # Ruby dependencies
├── SETUP.md                   # Detailed setup guide
└── README.md                  # This file
```

## Technology Stack

- **Frontend**: Jekyll 4.3 with Chirpy theme 6.x
- **Backend**: Cloudflare Workers (serverless)
- **Storage**: Cloudflare KV (key-value store)
- **Authentication**: ORCiD OAuth2
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Privacy & Security

### What We Store
- ✅ ORCiD ID (for duplicate prevention)
- ✅ Full name (for verification, not displayed)
- ✅ Job title (displayed publicly)
- ✅ Employer/institution (displayed publicly)
- ✅ Timestamp of endorsement

### What We Display Publicly
- ✅ Job titles of endorsers
- ✅ Employer/institution names
- ✅ Aggregated statistics
- ❌ Names of endorsers
- ❌ ORCiD IDs
- ❌ Email addresses

### Security Features
- CSRF protection via OAuth state parameter
- Secure session tokens with 30-minute expiration
- Duplicate endorsement prevention
- CORS configuration for cross-origin security
- Encrypted storage of ORCiD client secrets

## Customization

### Change the Proposal
Edit `_posts/2026-02-12-neutron-scattering-proposal.md` to customize:
- Title and content
- Categories and tags
- Endorsement call-to-action

### Update Site Branding
Edit `_config.yml`:
- Site title and description
- URL and baseurl
- Social links
- Contact information

### Modify Endorsement Pages
- `endorsement.md` - Main endorsement page with statistics
- `endorsement-complete.md` - Form completion page

### Style Customization
The Chirpy theme provides extensive customization options. See the [Chirpy documentation](https://chirpy.cotes.page/) for details.

## Development

### Local Development

```bash
# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Visit http://localhost:4000/orcid-endorsement-test/
```

### Testing OAuth Locally

1. Add `http://localhost:4000/endorsement-complete/` to your ORCiD app's redirect URIs
2. Update `ALLOWED_ORIGIN` in your Cloudflare Worker to include `http://localhost:4000`
3. Update the configuration in `endorsement.md` for local testing

## Monitoring & Analytics

### View Endorsements
Use Wrangler CLI to inspect stored data:
```bash
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
wrangler kv:key get --namespace-id=YOUR_NAMESPACE_ID "endorsement:ORCID-ID"
```

### Worker Analytics
- Visit Cloudflare Dashboard > Workers & Pages
- View request metrics, errors, and performance

### GitHub Pages Analytics
- Use GitHub's traffic insights
- Integrate Google Analytics via `_config.yml`

## Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| "Failed to authenticate" | Check ORCiD Client ID/Secret, verify redirect URI |
| "Session expired" | Sessions expire after 30 minutes, restart OAuth flow |
| Statistics not loading | Verify Worker URL and CORS configuration |
| Jekyll build fails | Check Ruby version (2.7+), run `bundle install` |

See [SETUP.md](SETUP.md#troubleshooting) for detailed troubleshooting.

## Contributing

This is a test/example project demonstrating ORCiD integration patterns. Feel free to:
- Fork and adapt for your own proposals
- Submit issues for bugs or improvements
- Share your implementations

## License

This project is provided as-is for testing and educational purposes. Adapt as needed for your use case.

## Acknowledgments

- **ORCiD** for providing the authentication infrastructure
- **Cloudflare** for serverless Workers and KV storage
- **Jekyll Chirpy Theme** for the beautiful site design
- **GitHub Pages** for free hosting

## Support & Resources

- 📖 [Detailed Setup Guide](SETUP.md)
- 🔗 [ORCiD API Documentation](https://info.orcid.org/documentation/)
- 🔗 [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- 🔗 [Jekyll Documentation](https://jekyllrb.com/docs/)
- 🔗 [Chirpy Theme Guide](https://chirpy.cotes.page/)

---

**Live Demo**: Visit the deployed site at https://g5t.github.io/orcid-endorsement-test/

**Questions?** Open an issue or check the [SETUP.md](SETUP.md) guide.