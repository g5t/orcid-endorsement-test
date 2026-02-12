# Cloudflare Worker Development

This directory contains the serverless backend code for the ORCiD endorsement system.

## Files

- `worker.js` - Main worker code with OAuth and data handling
- `wrangler.toml.example` - Template configuration file for Wrangler CLI

## Setup

### Option 1: Using Wrangler CLI (Recommended)

1. Install Wrangler:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Copy and configure wrangler.toml:
```bash
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your namespace IDs
```

4. Set secrets:
```bash
wrangler secret put ORCID_CLIENT_ID
wrangler secret put ORCID_CLIENT_SECRET
```

5. Deploy:
```bash
wrangler deploy
```

### Option 2: Using Cloudflare Dashboard

1. Go to Workers & Pages > Create application > Create Worker
2. Copy the contents of `worker.js` into the editor
3. Configure environment variables and KV bindings in Settings

## Environment Variables

### Required Variables
- `ORCID_CLIENT_ID` - Your ORCiD application client ID (secret)
- `ORCID_CLIENT_SECRET` - Your ORCiD application client secret (secret)
- `ALLOWED_ORIGIN` - Your GitHub Pages URL for CORS

### Required KV Namespaces
- `ENDORSEMENTS` - Stores endorsement data
- `SESSIONS` - Stores temporary OAuth sessions

## API Endpoints

### POST /oauth/callback
Handles ORCiD OAuth callback, exchanges authorization code for token

**Request:**
```json
{
  "code": "AUTH_CODE",
  "redirect_uri": "REDIRECT_URI"
}
```

**Response:**
```json
{
  "sessionToken": "SESSION_TOKEN",
  "name": "User Name",
  "employment": [...]
}
```

### POST /endorsement/submit
Submits a new endorsement

**Request:**
```json
{
  "sessionToken": "SESSION_TOKEN",
  "jobTitle": "Professor",
  "employer": "University Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Endorsement recorded successfully"
}
```

### GET /endorsement/stats
Retrieves endorsement statistics

**Response:**
```json
{
  "totalEndorsements": 42,
  "uniqueOrganizations": 15,
  "topOrganizations": [
    { "name": "University A", "count": 5 },
    { "name": "Lab B", "count": 3 }
  ]
}
```

## Development

### Local Development
Use Wrangler dev mode:
```bash
wrangler dev
```

This starts a local server for testing.

### Testing
Test individual endpoints using curl:

```bash
# Test stats endpoint
curl https://your-worker.workers.dev/endorsement/stats

# Test OAuth callback (requires valid auth code)
curl -X POST https://your-worker.workers.dev/oauth/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"AUTH_CODE","redirect_uri":"YOUR_REDIRECT"}'
```

## Security Notes

- Never commit `wrangler.toml` with real secrets
- Use Wrangler's secret management for sensitive values
- Keep `ORCID_CLIENT_SECRET` encrypted in Cloudflare
- Regularly rotate credentials
- Monitor worker logs for suspicious activity

## Monitoring

View worker metrics in Cloudflare Dashboard:
- Request count and errors
- CPU time usage
- KV read/write operations

## Troubleshooting

### "KV namespace not found"
- Check that KV namespaces are created
- Verify bindings in wrangler.toml or dashboard

### "ORCID_CLIENT_ID is not defined"
- Ensure secrets are set using `wrangler secret put`
- Verify environment variables in dashboard

### CORS errors
- Check `ALLOWED_ORIGIN` matches your site URL
- Ensure proper CORS headers are returned

## Cost Estimates

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request
- 1GB KV storage
- 1000 KV writes per day
- 100,000 KV reads per day

For most testing/small deployments, the free tier is sufficient.
