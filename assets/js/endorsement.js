/**
 * ORCiD Endorsement System - Client-Side JavaScript
 * Handles ORCiD OAuth flow, form submission, and statistics display
 */

// Configuration variables - set by page scripts
let apiBase = '';
let orcidClientId = '';
let redirectUri = '';

/**
 * Initialize endorsement page
 */
function initEndorsement(apiBaseUrl, clientId, redirect) {
  apiBase = apiBaseUrl;
  orcidClientId = clientId;
  redirectUri = redirect;

  // Load statistics
  loadStatistics();

  // Set up sign-in button
  const signInBtn = document.getElementById('orcid-signin-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', initiateOAuthFlow);
  }
}

/**
 * Initialize endorsement completion page
 */
function initEndorsementComplete(apiBaseUrl) {
  apiBase = apiBaseUrl;

  // Get OAuth code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (!code) {
    showError('No authorization code received. Please try again.');
    return;
  }

  // Exchange code for session
  exchangeCodeForSession(code, state);

  // Set up form handlers
  setupFormHandlers();
}

/**
 * Initiate ORCiD OAuth flow
 */
function initiateOAuthFlow() {
  // Generate state for CSRF protection
  const state = generateRandomString(32);
  sessionStorage.setItem('oauth_state', state);

  // Build authorization URL
  const authUrl = 'https://orcid.org/oauth/authorize?' + new URLSearchParams({
    client_id: orcidClientId,
    response_type: 'code',
    scope: '/authenticate /read-limited',
    redirect_uri: redirectUri,
    state: state
  });

  // Redirect to ORCiD
  window.location.href = authUrl;
}

/**
 * Exchange OAuth code for session token
 */
async function exchangeCodeForSession(code, state) {
  // Verify state matches (CSRF protection)
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    showError('Security verification failed. Please try again.');
    return;
  }

  sessionStorage.removeItem('oauth_state');

  try {
    const response = await fetch(`${apiBase}/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, redirect_uri: redirectUri })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to authenticate');
    }

    const data = await response.json();
    
    // Store session token
    sessionStorage.setItem('endorsement_session', data.sessionToken);

    // Populate form with data from ORCiD
    populateForm(data);

  } catch (error) {
    console.error('OAuth error:', error);
    showError('Failed to complete authentication: ' + error.message);
  }
}

/**
 * Populate form with data from ORCiD
 */
function populateForm(data) {
  document.getElementById('loading-message').style.display = 'none';
  document.getElementById('endorsement-form').style.display = 'block';

  // Pre-fill employment data if available
  if (data.employment && data.employment.length > 0) {
    const employment = data.employment[0];
    
    if (employment.roleTitle) {
      document.getElementById('job-title').value = employment.roleTitle;
    }
    
    if (employment.organization && employment.organization.name) {
      document.getElementById('employer').value = employment.organization.name;
    }
  }

  // Update preview as user types
  updateFormPreview();
}

/**
 * Set up form event handlers
 */
function setupFormHandlers() {
  const form = document.getElementById('complete-endorsement-form');
  const jobTitleInput = document.getElementById('job-title');
  const employerInput = document.getElementById('employer');
  const cancelBtn = document.getElementById('cancel-btn');

  if (jobTitleInput) {
    jobTitleInput.addEventListener('input', updateFormPreview);
  }

  if (employerInput) {
    employerInput.addEventListener('input', updateFormPreview);
  }

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel your endorsement?')) {
        window.location.href = '/endorsement/';
      }
    });
  }
}

/**
 * Update form preview
 */
function updateFormPreview() {
  const jobTitle = document.getElementById('job-title').value || '-';
  const employer = document.getElementById('employer').value || '-';

  document.getElementById('preview-job-title').textContent = jobTitle;
  document.getElementById('preview-employer').textContent = employer;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const sessionToken = sessionStorage.getItem('endorsement_session');
  if (!sessionToken) {
    showError('Session expired. Please start over.');
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  const formData = {
    jobTitle: document.getElementById('job-title').value,
    employer: document.getElementById('employer').value,
    sessionToken: sessionToken
  };

  try {
    const response = await fetch(`${apiBase}/endorsement/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit endorsement');
    }

    // Clear session
    sessionStorage.removeItem('endorsement_session');

    // Show success message
    document.getElementById('endorsement-form').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';

  } catch (error) {
    console.error('Submission error:', error);
    showError('Failed to submit endorsement: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Endorsement';
  }
}

/**
 * Load and display statistics
 */
async function loadStatistics() {
  try {
    const response = await fetch(`${apiBase}/endorsement/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to load statistics');
    }

    const stats = await response.json();
    
    // Update statistics display
    document.getElementById('total-endorsements').textContent = stats.totalEndorsements || 0;
    document.getElementById('unique-organizations').textContent = stats.uniqueOrganizations || 0;

    // Update top organizations
    if (stats.topOrganizations && stats.topOrganizations.length > 0) {
      displayTopOrganizations(stats.topOrganizations);
    } else {
      document.getElementById('top-organizations').innerHTML = 
        '<p>No endorsements yet. Be the first to endorse!</p>';
    }

  } catch (error) {
    console.error('Statistics error:', error);
    document.getElementById('endorsement-stats').innerHTML = 
      '<p class="text-muted">Unable to load statistics at this time.</p>';
  }
}

/**
 * Display top organizations
 */
function displayTopOrganizations(organizations) {
  const container = document.getElementById('top-organizations');
  
  const html = `
    <h3>Top Supporting Organizations</h3>
    <ul class="org-list">
      ${organizations.map(org => `
        <li>
          ${escapeHtml(org.name)}
          <span class="org-count">${org.count}</span>
        </li>
      `).join('')}
    </ul>
  `;
  
  container.innerHTML = html;
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide loading message if present
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }
}

/**
 * Generate random string for state parameter
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export functions for use in page scripts
if (typeof window !== 'undefined') {
  window.initEndorsement = initEndorsement;
  window.initEndorsementComplete = initEndorsementComplete;
}
