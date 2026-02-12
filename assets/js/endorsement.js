/**
 * ORCiD Endorsement System - Frontend JavaScript
 * Handles OAuth flow, endorsement submission, and stats display
 */

// Configuration
const WORKER_URL = 'https://orcid-endorsement-worker-production.excitations-org.workers.dev'; // Update with your worker URL
const REDIRECT_URI = window.location.origin + window.location.pathname;

// State management
let sessionToken = null;
let proposalId = null;
let userOrcid = null;
let userName = null;

/**
 * Initialize the endorsement page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Extract proposal_id from URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for OAuth callback first
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code && state) {
    // Restore proposal_id from state parameter
    proposalId = state;
    sessionStorage.setItem('proposal_id', proposalId);
    handleOAuthCallback(code);
  } else {
    // Normal page load - get proposal from URL
    proposalId = urlParams.get('proposal');
    
    if (!proposalId) {
      // Try to get from sessionStorage as fallback
      proposalId = sessionStorage.getItem('proposal_id');
      if (!proposalId) {
        showError('No proposal specified. Please access this page from a proposal post.');
        return;
      }
    }
    
    // Store in sessionStorage for OAuth flow
    sessionStorage.setItem('proposal_id', proposalId);
    
    // Check if already authenticated
    sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken) {
      showEndorsementForm();
    }
  }

  // Display proposal info
  displayProposalInfo();

  // Load and display stats
  loadStats();

  // Set up event listeners
  document.getElementById('sign-in-btn')?.addEventListener('click', startOAuth);
  document.getElementById('endorse-form')?.addEventListener('submit', submitEndorsement);
  document.getElementById('remove-btn')?.addEventListener('click', removeEndorsement);
});

/**
 * Display proposal information
 */
function displayProposalInfo() {
  const proposalInfo = document.getElementById('proposal-info');
  if (proposalInfo) {
    proposalInfo.innerHTML = `
      <div class="alert alert-info">
        <strong>Proposal:</strong> ${formatProposalId(proposalId)}
      </div>
    `;
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
 * Start OAuth flow
 */
async function startOAuth() {
  try {
    showLoading('Starting authentication...');

    const response = await fetch(`${WORKER_URL}/api/oauth/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        redirect_uri: REDIRECT_URI,
        state: proposalId  // Pass proposal_id as state parameter
      }),
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
async function handleOAuthCallback(code) {
  try {
    showLoading('Completing authentication...');

    const response = await fetch(`${WORKER_URL}/api/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (data.sessionToken) {
      sessionToken = data.sessionToken;
      userOrcid = data.orcid;
      userName = data.name;

      sessionStorage.setItem('sessionToken', sessionToken);
      sessionStorage.setItem('userOrcid', userOrcid);
      sessionStorage.setItem('userName', userName);
      
      // Store employment data if available
      if (data.jobTitle) {
        sessionStorage.setItem('userJobTitle', data.jobTitle);
      }
      if (data.employer) {
        sessionStorage.setItem('userEmployer', data.employer);
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname + '?proposal=' + proposalId);

      showEndorsementForm();
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (error) {
    showError('Authentication failed: ' + error.message);
  }
}

/**
 * Show endorsement form
 */
function showEndorsementForm() {
  const authSection = document.getElementById('auth-section');
  const formSection = document.getElementById('form-section');

  if (authSection) authSection.style.display = 'none';
  if (formSection) formSection.style.display = 'block';

  // Restore user info from sessionStorage if available
  if (!userName) {
    userName = sessionStorage.getItem('userName');
    userOrcid = sessionStorage.getItem('userOrcid');
  }

  const userInfo = document.getElementById('user-info');
  if (userInfo && userName) {
    userInfo.innerHTML = `
      <p>Signed in as: <strong>${userName}</strong> (${userOrcid})</p>
    `;
  }

  // Check if user already endorsed this proposal
  checkExistingEndorsement();
}

/**
 * Check if user has already endorsed this proposal
 */
async function checkExistingEndorsement() {
  try {
    const response = await fetch(`${WORKER_URL}/api/my-endorsements?sessionToken=${sessionToken}`);
    const data = await response.json();

    if (data.endorsements) {
      const existing = data.endorsements.find(e => e.proposal_id === proposalId);
      if (existing) {
        // Pre-fill form with existing endorsement data
        document.getElementById('job-title').value = existing.jobTitle || '';
        document.getElementById('employer').value = existing.employer || '';

        // Show remove button
        const removeBtn = document.getElementById('remove-btn');
        if (removeBtn) {
          removeBtn.style.display = 'inline-block';
        }

        showInfo('You have already endorsed this proposal. You can update your endorsement or remove it.');
      } else {
        // No existing endorsement - pre-fill with ORCID profile data
        const orcidJobTitle = sessionStorage.getItem('userJobTitle');
        const orcidEmployer = sessionStorage.getItem('userEmployer');
        
        if (orcidJobTitle) {
          document.getElementById('job-title').value = orcidJobTitle;
        }
        if (orcidEmployer) {
          document.getElementById('employer').value = orcidEmployer;
        }
      }
    }
  } catch (error) {
    console.error('Failed to check existing endorsement:', error);
    
    // Even if check fails, try to pre-fill with ORCID data
    const orcidJobTitle = sessionStorage.getItem('userJobTitle');
    const orcidEmployer = sessionStorage.getItem('userEmployer');
    
    if (orcidJobTitle) {
      document.getElementById('job-title').value = orcidJobTitle;
    }
    if (orcidEmployer) {
      document.getElementById('employer').value = orcidEmployer;
    }
  }
}

/**
 * Submit endorsement
 */
async function submitEndorsement(event) {
  event.preventDefault();

  const jobTitle = document.getElementById('job-title').value.trim();
  const employer = document.getElementById('employer').value.trim();

  if (!sessionToken) {
    showError('Please sign in first');
    return;
  }

  // Validate required fields
  if (!jobTitle || !employer) {
    showError('Job title and employer/institution are required fields');
    return;
  }

  try {
    showLoading('Submitting endorsement...');

    const response = await fetch(`${WORKER_URL}/api/endorse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        proposal_id: proposalId,
        jobTitle,
        employer,
      }),
    });

    const data = await response.json();
    if (data.success) {
      showSuccess(data.message + '! <a href="' + window.location.origin + window.location.pathname.replace(/endorsement\/$/, 'my-endorsements/') + '">View all your endorsements</a>');
      loadStats();
      
      // Show remove button
      const removeBtn = document.getElementById('remove-btn');
      if (removeBtn) {
        removeBtn.style.display = 'inline-block';
      }
    } else {
      throw new Error(data.error || 'Failed to submit endorsement');
    }
  } catch (error) {
    showError('Failed to submit endorsement: ' + error.message);
  }
}

/**
 * Remove endorsement
 */
async function removeEndorsement() {
  if (!confirm('Are you sure you want to remove your endorsement?')) {
    return;
  }

  if (!sessionToken) {
    showError('Please sign in first');
    return;
  }

  try {
    showLoading('Removing endorsement...');

    const response = await fetch(`${WORKER_URL}/api/endorse`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        proposal_id: proposalId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      showSuccess('Endorsement removed successfully!');
      loadStats();
      
      // Clear form
      document.getElementById('job-title').value = '';
      document.getElementById('employer').value = '';
      
      // Hide remove button
      const removeBtn = document.getElementById('remove-btn');
      if (removeBtn) {
        removeBtn.style.display = 'none';
      }
    } else {
      throw new Error(data.error || 'Failed to remove endorsement');
    }
  } catch (error) {
    showError('Failed to remove endorsement: ' + error.message);
  }
}

/**
 * Load and display statistics
 */
async function loadStats() {
  try {
    const response = await fetch(`${WORKER_URL}/api/stats?proposal_id=${proposalId}`);
    const data = await response.json();

    const statsDiv = document.getElementById('stats');
    if (statsDiv && data.total !== undefined) {
      statsDiv.innerHTML = `
        <div class="stats-box">
          <h3>Endorsements</h3>
          <p class="stat-number">${data.total}</p>
          <p class="stat-label">Total endorsements for this proposal</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
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
