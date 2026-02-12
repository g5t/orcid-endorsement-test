# Cloudflare Worker - ORCiD Endorsement API

This Cloudflare Worker provides the backend API for the ORCiD endorsement system.

## Endpoints

### OAuth Endpoints

#### `POST /api/oauth/start`
Start the ORCiD OAuth flow.

**Request:**
```json
{
  "redirect_uri": "https://yoursite.com/endorsement/"
}
```

**Response:**
```json
{
  "authUrl": "https://orcid.org/oauth/authorize?..."
}
```

#### `POST /api/oauth/callback`
Handle OAuth callback and create session.

**Request:**
```json
{
  "code": "authorization_code",
  "redirect_uri": "https://yoursite.com/endorsement/"
}
```

**Response:**
```json
{
  "sessionToken": "uuid",
  "orcid": "0000-0001-2345-6789",
  "name": "John Doe"
}
```

### Endorsement Endpoints

#### `POST /api/endorse`
Submit or update an endorsement.

**Request:**
```json
{
  "sessionToken": "uuid",
  "proposal_id": "neutron-instrument-2026",
  "jobTitle": "Research Scientist",
  "employer": "Example University"
}
```

**Response:**
```json
{
  "success": true,
  "isNew": true,
  "message": "Endorsement recorded"
}
```

#### `DELETE /api/endorse`
Remove an endorsement.

**Request:**
```json
{
  "sessionToken": "uuid",
  "proposal_id": "neutron-instrument-2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Endorsement removed"
}
```

#### `GET /api/my-endorsements?sessionToken=uuid`
List all endorsements for the authenticated user.

**Response:**
```json
{
  "endorsements": [
    {
      "proposal_id": "neutron-instrument-2026",
      "jobTitle": "Research Scientist",
      "employer": "Example University",
      "timestamp": "2026-02-12T10:30:00Z",
      "orcid": "0000-0001-2345-6789",
      "name": "John Doe"
    }
  ]
}
```

### Statistics Endpoint

#### `GET /api/stats?proposal_id=neutron-instrument-2026`
Get endorsement statistics for a specific proposal.

**Response:**
```json
{
  "proposal_id": "neutron-instrument-2026",
  "total": 42
}
```

#### `GET /api/stats`
Get site-wide statistics across all proposals.

**Response:**
```json
{
  "total": 127,
  "proposals": {
    "neutron-instrument-2026": 42,
    "open-data-standards-2026": 85
  }
}
```

## Storage Schema

### KV Keys

- `endorsement:{proposal_id}:{orcid}` - Individual endorsement data
- `count:{proposal_id}:total` - Endorsement count for a proposal
- `session:{token}` - User session (10-minute TTL)

### Endorsement Data Structure

```json
{
  "orcid": "0000-0001-2345-6789",
  "name": "John Doe",
  "jobTitle": "Research Scientist",
  "employer": "Example University",
  "timestamp": "2026-02-12T10:30:00Z",
  "proposal_id": "neutron-instrument-2026"
}
```

### Session Data Structure

```json
{
  "orcid": "0000-0001-2345-6789",
  "name": "John Doe",
  "createdAt": 1707736200000
}
```

## Environment Variables

Required environment variables:

- `ORCID_CLIENT_ID` - Your ORCiD application client ID
- `ORCID_CLIENT_SECRET` - Your ORCiD application client secret

KV namespace binding:

- `ENDORSEMENT_KV` - KV namespace for storing endorsements

## Deployment

### Using Wrangler CLI

```bash
# Install dependencies
npm install

# Configure wrangler.toml with your settings
# Set environment variables
npx wrangler secret put ORCID_CLIENT_ID
npx wrangler secret put ORCID_CLIENT_SECRET

# Deploy
npm run deploy
```

### Configuration

Edit `wrangler.toml`:

```toml
name = "orcid-endorsement-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
kv_namespaces = [
  { binding = "ENDORSEMENT_KV", id = "your-kv-namespace-id" }
]
```

## Security Features

1. **Session Expiration**: Sessions expire after 10 minutes
2. **proposal_id Validation**: Only alphanumeric and hyphens allowed
3. **CORS Headers**: Configured for cross-origin requests
4. **ORCiD Verification**: All endorsements tied to verified ORCiD IDs

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (invalid/expired session)
- `404` - Not found (endorsement doesn't exist)

Error response format:
```json
{
  "error": "Error message description"
}
```

## Testing

Test endpoints using curl:

```bash
# Test stats endpoint
curl https://your-worker.workers.dev/api/stats

# Test OAuth start
curl -X POST https://your-worker.workers.dev/api/oauth/start \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri":"http://localhost:4000/endorsement/"}'
```

## Monitoring

Monitor your worker:
1. View logs in Cloudflare dashboard
2. Check analytics for request volume
3. Monitor KV storage usage
4. Track error rates

## Rate Limiting

Consider implementing rate limiting for production:
- Limit OAuth attempts per IP
- Limit endorsement submissions per session
- Monitor for abuse patterns

## Future Enhancements

Potential improvements:
- Add proposal metadata storage
- Implement endorsement verification workflows
- Add email notifications
- Create admin API for proposal owners
- Add endorsement export functionality