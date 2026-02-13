/**
 * Shared utilities for ORCID Endorsement System
 */

// Configuration
const WORKER_URL = 'https://orcid-endorsement-worker-production.excitations-org.workers.dev';

// Get the correct redirect URI for the current page
function getRedirectUri() {
  return window.location.origin + window.location.pathname;
}

/**
 * Start OAuth flow
 */
async function startOAuth(state = null) {
  try {
    showLoading('Starting authentication...');

    const body = { redirect_uri: getRedirectUri() };
    if (state) {
      body.state = state;
    }

    const response = await fetch(`${WORKER_URL}/api/oauth/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.authUrl) {
      window.location.href = data.authUrl;
    } else {
      throw new Error('Failed to get authorization URL');
    }
  } catch (error) {
    showError('Authentication failed: ' + error.message);
  }
}

/**
 * Handle OAuth callback
 */
async function handleOAuthCallback(code, onSuccess) {
  try {
    showLoading('Completing authentication...');

    const response = await fetch(`${WORKER_URL}/api/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        redirect_uri: getRedirectUri(),
      }),
    });

    const data = await response.json();
    if (data.sessionToken) {
      // Store session data
      sessionStorage.setItem('sessionToken', data.sessionToken);
      sessionStorage.setItem('userOrcid', data.orcid);
      sessionStorage.setItem('userName', data.name);
      
      // Store employment data if available
      if (data.jobTitle) {
        sessionStorage.setItem('userJobTitle', data.jobTitle);
      }
      if (data.employer) {
        sessionStorage.setItem('userEmployer', data.employer);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (error) {
    showError('Authentication failed: ' + error.message);
  }
}

/**
 * Validate if session is still valid
 */
async function validateSession(sessionToken) {
  try {
    console.log('Validating session with token:', sessionToken);
    const response = await fetch(`${WORKER_URL}/api/my-endorsements?sessionToken=${sessionToken}`);
    console.log('Validation response status:', response.status, 'ok:', response.ok);
    if (response.status === 401 || !response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
}

/**
 * Format proposal_id for display
 */
function formatProposalId(id) {
  return id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Logout - clear session and reload page
 */
function logout() {
  sessionStorage.clear();
  window.location.reload();
}

/**
 * UI Helper Functions
 */
function showLoading(message) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.innerHTML = `<div class="alert alert-info">${message}</div>`;
  }
}

function showSuccess(message) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.innerHTML = `<div class="alert alert-success">${message}</div>`;
  }
}

function showError(message) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}

function showInfo(message) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.innerHTML = `<div class="alert alert-info">${message}</div>`;
  }
}
