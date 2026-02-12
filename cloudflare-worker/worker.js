/**
 * Cloudflare Worker for ORCiD Endorsement System
 * 
 * This worker handles:
 * - OAuth callback and token exchange
 * - ORCiD API integration for employment data
 * - Endorsement submission and storage
 * - Statistics aggregation
 * - Session management with KV storage
 * 
 * Required Environment Variables:
 * - ORCID_CLIENT_ID: Your ORCiD application client ID
 * - ORCID_CLIENT_SECRET: Your ORCiD application client secret
 * - ALLOWED_ORIGIN: Your GitHub Pages URL (e.g., https://g5t.github.io)
 * 
 * Required KV Namespaces:
 * - ENDORSEMENTS: Stores endorsement data (bind as ENDORSEMENTS)
 * - SESSIONS: Stores temporary session tokens (bind as SESSIONS)
 */

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '', // Will be set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// ORCiD API endpoints
const ORCID_TOKEN_URL = 'https://orcid.org/oauth/token';
const ORCID_API_URL = 'https://pub.orcid.org/v3.0';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  // Set CORS origin
  const allowedOrigin = ALLOWED_ORIGIN || 'https://g5t.github.io';
  CORS_HEADERS['Access-Control-Allow-Origin'] = allowedOrigin;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Route requests
  if (url.pathname === '/oauth/callback' && request.method === 'POST') {
    return handleOAuthCallback(request);
  } else if (url.pathname === '/endorsement/submit' && request.method === 'POST') {
    return handleEndorsementSubmit(request);
  } else if (url.pathname === '/endorsement/stats' && request.method === 'GET') {
    return handleGetStats(request);
  } else {
    return jsonResponse({ error: 'Not found' }, 404);
  }
}

/**
 * Handle OAuth callback - exchange code for token and fetch user data
 */
async function handleOAuthCallback(request) {
  try {
    const data = await request.json();
    const { code, redirect_uri } = data;

    if (!code) {
      return jsonResponse({ error: 'Missing authorization code' }, 400);
    }

    // Exchange code for access token
    const tokenResponse = await fetch(ORCID_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: ORCID_CLIENT_ID,
        client_secret: ORCID_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return jsonResponse({ error: 'Failed to exchange authorization code' }, 400);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, orcid, name } = tokenData;

    // Check if already endorsed
    const existingEndorsement = await ENDORSEMENTS.get(`endorsement:${orcid}`);
    if (existingEndorsement) {
      return jsonResponse({ error: 'You have already endorsed this proposal' }, 400);
    }

    // Fetch employment data from ORCiD
    const employment = await fetchEmploymentData(orcid, access_token);

    // Create session token
    const sessionToken = generateSessionToken();
    const sessionData = {
      orcid,
      name,
      employment,
      createdAt: Date.now(),
    };

    // Store session (expires in 30 minutes)
    await SESSIONS.put(sessionToken, JSON.stringify(sessionData), {
      expirationTtl: 1800,
    });

    return jsonResponse({
      sessionToken,
      name,
      employment,
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * Fetch employment data from ORCiD API
 */
async function fetchEmploymentData(orcid, accessToken) {
  try {
    const response = await fetch(`${ORCID_API_URL}/${orcid}/employments`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch employment data');
      return [];
    }

    const data = await response.json();
    const employments = [];

    // Extract employment information
    if (data['employment-summary']) {
      for (const employment of data['employment-summary']) {
        const org = employment.organization || {};
        employments.push({
          roleTitle: employment['role-title'] || null,
          organization: {
            name: org.name || null,
            city: org.address?.city || null,
            country: org.address?.country || null,
          },
        });
      }
    }

    return employments;

  } catch (error) {
    console.error('Error fetching employment data:', error);
    return [];
  }
}

/**
 * Handle endorsement submission
 */
async function handleEndorsementSubmit(request) {
  try {
    const data = await request.json();
    const { sessionToken, jobTitle, employer } = data;

    if (!sessionToken || !jobTitle || !employer) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    // Retrieve session
    const sessionDataStr = await SESSIONS.get(sessionToken);
    if (!sessionDataStr) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401);
    }

    const sessionData = JSON.parse(sessionDataStr);
    const { orcid, name } = sessionData;

    // Check for duplicate (in case of race condition)
    const existingEndorsement = await ENDORSEMENTS.get(`endorsement:${orcid}`);
    if (existingEndorsement) {
      return jsonResponse({ error: 'You have already endorsed this proposal' }, 400);
    }

    // Store endorsement
    const endorsement = {
      orcid,
      name,
      jobTitle,
      employer,
      timestamp: Date.now(),
    };

    await ENDORSEMENTS.put(
      `endorsement:${orcid}`,
      JSON.stringify(endorsement)
    );

    // Delete session
    await SESSIONS.delete(sessionToken);

    // Invalidate stats cache
    await ENDORSEMENTS.delete('cache:stats');

    return jsonResponse({
      success: true,
      message: 'Endorsement recorded successfully',
    });

  } catch (error) {
    console.error('Endorsement submission error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * Handle statistics retrieval
 */
async function handleGetStats(request) {
  try {
    // Check cache first
    const cachedStats = await ENDORSEMENTS.get('cache:stats');
    if (cachedStats) {
      return jsonResponse(JSON.parse(cachedStats));
    }

    // Compute statistics
    const stats = await computeStatistics();

    // Cache for 5 minutes
    await ENDORSEMENTS.put(
      'cache:stats',
      JSON.stringify(stats),
      { expirationTtl: 300 }
    );

    return jsonResponse(stats);

  } catch (error) {
    console.error('Statistics retrieval error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * Compute endorsement statistics
 */
async function computeStatistics() {
  const endorsements = [];
  
  // List all endorsements
  const list = await ENDORSEMENTS.list({ prefix: 'endorsement:' });
  
  for (const key of list.keys) {
    const data = await ENDORSEMENTS.get(key.name);
    if (data) {
      endorsements.push(JSON.parse(data));
    }
  }

  const totalEndorsements = endorsements.length;

  // Count organizations
  const orgCounts = {};
  for (const endorsement of endorsements) {
    const org = endorsement.employer;
    orgCounts[org] = (orgCounts[org] || 0) + 1;
  }

  const uniqueOrganizations = Object.keys(orgCounts).length;

  // Get top organizations
  const topOrganizations = Object.entries(orgCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEndorsements,
    uniqueOrganizations,
    topOrganizations,
  };
}

/**
 * Generate secure session token
 */
function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
