/**
 * ORCiD Endorsement System - Cloudflare Worker
 * 
 * Handles endorsements for multiple proposals with ORCiD authentication.
 * 
 * Storage Keys:
 * - endorsement:{proposal_id}:{orcid} - Individual endorsement data
 * - count:{proposal_id}:total - Total endorsements for a proposal
 * - session:{token} - Session data with ORCiD info
 */

// ORCiD OAuth Configuration (Production)
const ORCID_AUTH_URL = 'https://orcid.org/oauth/authorize';
const ORCID_TOKEN_URL = 'https://orcid.org/oauth/token';
const ORCID_API_URL = 'https://pub.orcid.org/v3.0';

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Validate KV binding exists
    if (!env.ENDORSEMENT_KV) {
      return new Response(JSON.stringify({ error: 'KV namespace not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // Route handling
    if (url.pathname === '/api/oauth/start') {
      return handleOAuthStart(request, env);
    } else if (url.pathname === '/api/oauth/callback') {
      return handleOAuthCallback(request, env);
    } else if (url.pathname === '/api/endorse' && request.method === 'POST') {
      return handleEndorsement(request, env);
    } else if (url.pathname === '/api/endorse' && request.method === 'DELETE') {
      return handleRemoveEndorsement(request, env);
    } else if (url.pathname === '/api/my-endorsements') {
      return handleMyEndorsements(request, env);
    } else if (url.pathname === '/api/stats') {
      return handleStats(request, env);
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
};

/**
 * Start OAuth flow
 */
async function handleOAuthStart(request, env) {
  try {
    const { redirect_uri, state } = await request.json();
    
    const params = new URLSearchParams({
      client_id: env.ORCID_CLIENT_ID,
      response_type: 'code',
      scope: '/authenticate',
      redirect_uri: redirect_uri,
    });

    // Include state parameter if provided
    if (state) {
      params.set('state', state);
    }

    const authUrl = `${ORCID_AUTH_URL}?${params}`;

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle OAuth callback
 */
async function handleOAuthCallback(request, env) {
  try {
    const { code, redirect_uri } = await request.json();

    // Exchange code for access token
    const tokenResponse = await fetch(ORCID_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.ORCID_CLIENT_ID,
        client_secret: env.ORCID_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const orcid = tokenData.orcid;
    const name = tokenData.name;

    // Fetch employment information from ORCID public API
    let jobTitle = null;
    let employer = null;
    
    try {
      const profileResponse = await fetch(`${ORCID_API_URL}/${orcid}/employments`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // ORCID v3.0 structure: affiliation-group[0].summaries[0]['employment-summary']
        if (profileData['affiliation-group'] && profileData['affiliation-group'].length > 0) {
          const group = profileData['affiliation-group'][0];
          
          if (group.summaries && group.summaries.length > 0) {
            const summary = group.summaries[0];
            
            // The actual employment data is nested inside employment-summary
            const employment = summary['employment-summary'];
            
            if (employment) {
              // Role title
              if (employment['role-title']) {
                jobTitle = employment['role-title'];
              }
              
              // Organization name
              if (employment.organization && employment.organization.name) {
                employer = employment.organization.name;
              }
              
              console.log('Extracted employment:', { jobTitle, employer });
            }
          }
        }
      } else {
        console.error('Failed to fetch employment data:', profileResponse.status, await profileResponse.text());
      }
    } catch (error) {
      // Employment data is optional, don't fail if we can't fetch it
      console.error('Failed to fetch employment data:', error.message);
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const sessionData = {
      orcid,
      name,
      jobTitle,
      employer,
      createdAt: Date.now(),
    };

    // Store session (expires in 10 minutes)
    await env.ENDORSEMENT_KV.put(
      `session:${sessionToken}`,
      JSON.stringify(sessionData),
      { expirationTtl: 600 }
    );

    return new Response(JSON.stringify({ sessionToken, orcid, name, jobTitle, employer }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Validate proposal_id format
 */
function validateProposalId(proposal_id) {
  if (!proposal_id) {
    return false;
  }
  // Only allow alphanumeric and hyphens
  return /^[a-zA-Z0-9-]+$/.test(proposal_id);
}

/**
 * Get session data from token
 */
async function getSession(sessionToken, env) {
  const sessionData = await env.ENDORSEMENT_KV.get(`session:${sessionToken}`);
  if (!sessionData) {
    return null;
  }
  return JSON.parse(sessionData);
}

/**
 * Handle endorsement submission
 */
async function handleEndorsement(request, env) {
  try {
    const { sessionToken, proposal_id, jobTitle, employer } = await request.json();

    // Validate proposal_id
    if (!validateProposalId(proposal_id)) {
      return new Response(JSON.stringify({ error: 'Invalid proposal_id format' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Validate session
    const session = await getSession(sessionToken, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const orcid = session.orcid;
    const endorsementKey = `endorsement:${proposal_id}:${orcid}`;

    // Check if already endorsed
    const existing = await env.ENDORSEMENT_KV.get(endorsementKey);
    const isNew = !existing;

    // Store endorsement
    const endorsementData = {
      orcid,
      name: session.name,
      jobTitle,
      employer,
      timestamp: new Date().toISOString(),
      proposal_id,
    };

    await env.ENDORSEMENT_KV.put(endorsementKey, JSON.stringify(endorsementData));

    // Update counter only if new endorsement
    if (isNew) {
      const countKey = `count:${proposal_id}:total`;
      const currentCount = await env.ENDORSEMENT_KV.get(countKey);
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      await env.ENDORSEMENT_KV.put(countKey, newCount.toString());
    }

    return new Response(JSON.stringify({ 
      success: true, 
      isNew,
      message: isNew ? 'Endorsement recorded' : 'Endorsement updated'
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle endorsement removal
 */
async function handleRemoveEndorsement(request, env) {
  try {
    const { sessionToken, proposal_id } = await request.json();

    // Validate proposal_id
    if (!validateProposalId(proposal_id)) {
      return new Response(JSON.stringify({ error: 'Invalid proposal_id format' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Validate session
    const session = await getSession(sessionToken, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const orcid = session.orcid;
    const endorsementKey = `endorsement:${proposal_id}:${orcid}`;

    // Check if endorsement exists
    const existing = await env.ENDORSEMENT_KV.get(endorsementKey);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Endorsement not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Delete endorsement
    await env.ENDORSEMENT_KV.delete(endorsementKey);

    // Decrement counter
    const countKey = `count:${proposal_id}:total`;
    const currentCount = await env.ENDORSEMENT_KV.get(countKey);
    if (currentCount) {
      const newCount = Math.max(0, parseInt(currentCount) - 1);
      await env.ENDORSEMENT_KV.put(countKey, newCount.toString());
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Endorsement removed'
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Get user's endorsements
 */
async function handleMyEndorsements(request, env) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get('sessionToken');

    // Validate session
    const session = await getSession(sessionToken, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const orcid = session.orcid;
    const endorsements = [];

    // List all endorsement keys
    const list = await env.ENDORSEMENT_KV.list({ prefix: 'endorsement:' });
    
    for (const key of list.keys) {
      // Check if this endorsement belongs to the user
      if (key.name.endsWith(`:${orcid}`)) {
        const data = await env.ENDORSEMENT_KV.get(key.name);
        if (data) {
          const endorsement = JSON.parse(data);
          endorsements.push(endorsement);
        }
      }
    }

    return new Response(JSON.stringify({ endorsements }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Get endorsement statistics
 */
async function handleStats(request, env) {
  try {
    const url = new URL(request.url);
    const proposal_id = url.searchParams.get('proposal_id');

    if (proposal_id) {
      // Get stats for specific proposal
      if (!validateProposalId(proposal_id)) {
        return new Response(JSON.stringify({ error: 'Invalid proposal_id format' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const countKey = `count:${proposal_id}:total`;
      const count = await env.ENDORSEMENT_KV.get(countKey);

      return new Response(JSON.stringify({ 
        proposal_id,
        total: count ? parseInt(count) : 0 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } else {
      // Get site-wide stats across all proposals
      const countList = await env.ENDORSEMENT_KV.list({ prefix: 'count:' });
      let totalCount = 0;
      const proposalCounts = {};

      for (const key of countList.keys) {
        const count = await env.ENDORSEMENT_KV.get(key.name);
        if (count) {
          const value = parseInt(count);
          totalCount += value;
          
          // Extract proposal_id from key: count:{proposal_id}:total
          const match = key.name.match(/^count:(.+):total$/);
          if (match) {
            proposalCounts[match[1]] = value;
          }
        }
      }

      return new Response(JSON.stringify({ 
        total: totalCount,
        proposals: proposalCounts
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
