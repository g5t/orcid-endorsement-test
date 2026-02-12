# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Jekyll Static Site (GitHub Pages / Local)                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   index.md   │  │ Blog Posts   │  │ endorsement.md  │  │ │
│  │  │  (Homepage)  │  │ with         │  │ (OAuth & Form)  │  │ │
│  │  │              │  │ proposal_id  │  │                 │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  my-endorsements.md (Management Page)                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  JavaScript (endorsement.js, my-endorsements.js)     │  │ │
│  │  │  - OAuth flow management                             │  │ │
│  │  │  - API communication                                 │  │ │
│  │  │  - UI updates                                        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  worker.js - API Endpoints:                               │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  POST /api/oauth/start                              │  │ │
│  │  │  POST /api/oauth/callback                           │  │ │
│  │  │  POST /api/endorse                                  │  │ │
│  │  │  DELETE /api/endorse                                │  │ │
│  │  │  GET /api/my-endorsements                           │  │ │
│  │  │  GET /api/stats                                     │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ OAuth                             │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ORCiD OAuth Service (orcid.org)                          │ │
│  │  - User authentication                                     │ │
│  │  - Returns ORCiD ID and name                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ Store/Retrieve                    │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cloudflare KV Storage                                     │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Keys:                                               │  │ │
│  │  │  - endorsement:{proposal_id}:{orcid}                 │  │ │
│  │  │  - count:{proposal_id}:total                         │  │ │
│  │  │  - session:{token} (10-min TTL)                      │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Endorsement Submission Flow

```
User                    Jekyll Site              Worker                 ORCiD              KV Store
 │                          │                       │                     │                    │
 │  1. Visit proposal post  │                       │                     │                    │
 ├─────────────────────────>│                       │                     │                    │
 │                          │                       │                     │                    │
 │  2. Click "Endorse"      │                       │                     │                    │
 ├─────────────────────────>│                       │                     │                    │
 │                          │                       │                     │                    │
 │  3. Redirect to          │                       │                     │                    │
 │     /endorsement/        │                       │                     │                    │
 │     ?proposal=xxx        │                       │                     │                    │
 ├─────────────────────────>│                       │                     │                    │
 │                          │                       │                     │                    │
 │  4. Click "Sign in       │                       │                     │                    │
 │     with ORCiD"          │                       │                     │                    │
 ├─────────────────────────>│                       │                     │                    │
 │                          │                       │                     │                    │
 │                          │  5. POST /api/oauth/  │                     │                    │
 │                          │     start             │                     │                    │
 │                          ├──────────────────────>│                     │                    │
 │                          │                       │                     │                    │
 │                          │  6. Return authUrl    │                     │                    │
 │                          │<──────────────────────┤                     │                    │
 │                          │                       │                     │                    │
 │  7. Redirect to ORCiD    │                       │                     │                    │
 │<─────────────────────────┤                       │                     │                    │
 │                          │                       │                     │                    │
 │  8. Authenticate         │                       │                     │                    │
 ├────────────────────────────────────────────────────────────────────>│                    │
 │                          │                       │                     │                    │
 │  9. Authorize app        │                       │                     │                    │
 ├────────────────────────────────────────────────────────────────────>│                    │
 │                          │                       │                     │                    │
 │  10. Redirect back       │                       │                     │                    │
 │      with code           │                       │                     │                    │
 │<─────────────────────────┤                       │                     │                    │
 │                          │                       │                     │                    │
 │                          │  11. POST /api/oauth/ │                     │                    │
 │                          │      callback         │                     │                    │
 │                          │      (code)           │                     │                    │
 │                          ├──────────────────────>│                     │                    │
 │                          │                       │                     │                    │
 │                          │                       │  12. Exchange code  │                    │
 │                          │                       │      for token      │                    │
 │                          │                       ├────────────────────>│                    │
 │                          │                       │                     │                    │
 │                          │                       │  13. Return ORCiD   │                    │
 │                          │                       │      and name       │                    │
 │                          │                       │<────────────────────┤                    │
 │                          │                       │                     │                    │
 │                          │                       │  14. Store session  │                    │
 │                          │                       │      (10-min TTL)   │                    │
 │                          │                       ├────────────────────────────────────────>│
 │                          │                       │                     │                    │
 │                          │  15. Return           │                     │                    │
 │                          │      sessionToken     │                     │                    │
 │                          │<──────────────────────┤                     │                    │
 │                          │                       │                     │                    │
 │  16. Show form           │                       │                     │                    │
 │<─────────────────────────┤                       │                     │                    │
 │                          │                       │                     │                    │
 │  17. Fill form and       │                       │                     │                    │
 │      submit              │                       │                     │                    │
 ├─────────────────────────>│                       │                     │                    │
 │                          │                       │                     │                    │
 │                          │  18. POST /api/       │                     │                    │
 │                          │      endorse          │                     │                    │
 │                          │      (sessionToken,   │                     │                    │
 │                          │       proposal_id,    │                     │                    │
 │                          │       jobTitle,       │                     │                    │
 │                          │       employer)       │                     │                    │
 │                          ├──────────────────────>│                     │                    │
 │                          │                       │                     │                    │
 │                          │                       │  19. Validate       │                    │
 │                          │                       │      session        │                    │
 │                          │                       ├────────────────────────────────────────>│
 │                          │                       │                     │                    │
 │                          │                       │  20. Store          │                    │
 │                          │                       │      endorsement    │                    │
 │                          │                       │      & increment    │                    │
 │                          │                       │      counter        │                    │
 │                          │                       ├────────────────────────────────────────>│
 │                          │                       │                     │                    │
 │                          │  21. Success          │                     │                    │
 │                          │<──────────────────────┤                     │                    │
 │                          │                       │                     │                    │
 │  22. Show success        │                       │                     │                    │
 │      message             │                       │                     │                    │
 │<─────────────────────────┤                       │                     │                    │
```

### 2. My Endorsements Page Flow

```
User                    Jekyll Site              Worker                 KV Store
 │                          │                       │                       │
 │  1. Visit                │                       │                       │
 │     /my-endorsements/    │                       │                       │
 ├─────────────────────────>│                       │                       │
 │                          │                       │                       │
 │  2. Authenticate         │                       │                       │
 │     (if needed)          │                       │                       │
 ├─────────────────────────>│  (OAuth flow)         │                       │
 │                          │                       │                       │
 │  3. Request              │                       │                       │
 │     endorsements         │                       │                       │
 ├─────────────────────────>│                       │                       │
 │                          │                       │                       │
 │                          │  4. GET /api/my-      │                       │
 │                          │     endorsements      │                       │
 │                          │     ?sessionToken=xxx │                       │
 │                          ├──────────────────────>│                       │
 │                          │                       │                       │
 │                          │                       │  5. Validate session  │
 │                          │                       ├──────────────────────>│
 │                          │                       │                       │
 │                          │                       │  6. List all keys     │
 │                          │                       │     endorsement:*     │
 │                          │                       ├──────────────────────>│
 │                          │                       │                       │
 │                          │                       │  7. Filter by ORCiD   │
 │                          │                       │     and retrieve data │
 │                          │                       │<──────────────────────┤
 │                          │                       │                       │
 │                          │  8. Return list       │                       │
 │                          │<──────────────────────┤                       │
 │                          │                       │                       │
 │  9. Display table        │                       │                       │
 │<─────────────────────────┤                       │                       │
```

### 3. Endorsement Removal Flow

```
User                    Jekyll Site              Worker                 KV Store
 │                          │                       │                       │
 │  1. Click "Remove"       │                       │                       │
 ├─────────────────────────>│                       │                       │
 │                          │                       │                       │
 │  2. Confirm dialog       │                       │                       │
 │<─────────────────────────┤                       │                       │
 │                          │                       │                       │
 │  3. Confirm "Yes"        │                       │                       │
 ├─────────────────────────>│                       │                       │
 │                          │                       │                       │
 │                          │  4. DELETE /api/      │                       │
 │                          │     endorse           │                       │
 │                          │     (sessionToken,    │                       │
 │                          │      proposal_id)     │                       │
 │                          ├──────────────────────>│                       │
 │                          │                       │                       │
 │                          │                       │  5. Validate session  │
 │                          │                       ├──────────────────────>│
 │                          │                       │                       │
 │                          │                       │  6. Check if exists   │
 │                          │                       ├──────────────────────>│
 │                          │                       │                       │
 │                          │                       │  7. Delete            │
 │                          │                       │     endorsement &     │
 │                          │                       │     decrement counter │
 │                          │                       ├──────────────────────>│
 │                          │                       │                       │
 │                          │  8. Success           │                       │
 │                          │<──────────────────────┤                       │
 │                          │                       │                       │
 │  9. Show success &       │                       │                       │
 │     reload list          │                       │                       │
 │<─────────────────────────┤                       │                       │
```

## Storage Schema

### KV Key Patterns

```
endorsement:{proposal_id}:{orcid}
├─ Example: endorsement:neutron-instrument-2026:0000-0001-2345-6789
└─ Value: {
     "orcid": "0000-0001-2345-6789",
     "name": "John Doe",
     "jobTitle": "Research Scientist",
     "employer": "Example University",
     "timestamp": "2026-02-12T10:30:00Z",
     "proposal_id": "neutron-instrument-2026"
   }

count:{proposal_id}:total
├─ Example: count:neutron-instrument-2026:total
└─ Value: "42"

session:{token}
├─ Example: session:550e8400-e29b-41d4-a716-446655440000
├─ TTL: 600 seconds (10 minutes)
└─ Value: {
     "orcid": "0000-0001-2345-6789",
     "name": "John Doe",
     "createdAt": 1707736200000
   }
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│  Security Layers                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. HTTPS Only                                          │
│     - All communications encrypted                       │
│     - No mixed content                                   │
│                                                          │
│  2. ORCiD OAuth                                         │
│     - Official ORCiD authentication                     │
│     - Verified identities                               │
│     - User consent required                             │
│                                                          │
│  3. Session Management                                  │
│     - 10-minute TTL on sessions                         │
│     - Cryptographically secure UUIDs                    │
│     - Server-side validation                            │
│                                                          │
│  4. Input Validation                                    │
│     - proposal_id: ^[a-zA-Z0-9-]+$                     │
│     - Session token validation                          │
│     - CORS headers configured                           │
│                                                          │
│  5. Data Privacy                                        │
│     - Only ORCiD ID stored (public)                    │
│     - Optional job title/employer                       │
│     - No sensitive personal data                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Model

```
Development          Staging              Production
    │                   │                     │
    │                   │                     │
    ▼                   ▼                     ▼
┌────────┐         ┌────────┐           ┌────────┐
│ Local  │         │ Test   │           │ GitHub │
│ Jekyll │         │ Deploy │           │ Pages  │
└────────┘         └────────┘           └────────┘
    │                   │                     │
    │                   │                     │
    ▼                   ▼                     ▼
┌─────────────────────────────────────────────────┐
│        Cloudflare Worker (Shared)                │
│  - KV Namespace: ENDORSEMENT_KV                 │
│  - Environment Variables:                        │
│    * ORCID_CLIENT_ID                            │
│    * ORCID_CLIENT_SECRET                        │
└─────────────────────────────────────────────────┘
    │
    │
    ▼
┌─────────────────────────────────────────────────┐
│        ORCiD OAuth (Production/Sandbox)         │
└─────────────────────────────────────────────────┘
```