/**
 * My Endorsements Page - JavaScript
 * Displays and manages user's endorsements
 */

// State
let sessionToken = null;
let userOrcid = null;
let userName = null;

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check for OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    handleOAuthCallback(code, (data) => {
      sessionToken = data.sessionToken;
      userOrcid = data.orcid;
      userName = data.name;

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      loadEndorsements();
    });
  } else {
    // Check if already authenticated
    sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken) {
      // Validate session before loading endorsements
      validateSession().then(isValid => {
        if (isValid) {
          loadEndorsements();
        } else {
          // Session expired, clear and show login
          sessionStorage.clear();
          sessionToken = null;
          showError('Your session has expired. Please sign in again.');
        }
      });
    }
  }

  // Set up event listeners
  document.getElementById('sign-in-btn')?.addEventListener('click', () => startOAuth());
});

/**
 * Load user's endorsements
 */
async function loadEndorsements() {
  try {
    showLoading('Loading your endorsements...');

    // Hide auth section, show content
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content-section');
    if (authSection) authSection.style.display = 'none';
    if (contentSection) contentSection.style.display = 'block';

    // Restore user info
    if (!userName) {
      userName = sessionStorage.getItem('userName');
      userOrcid = sessionStorage.getItem('userOrcid');
    }

    const userInfo = document.getElementById('user-info');
    if (userInfo && userName) {
      userInfo.innerHTML = `
        <p>
          Signed in as: <strong>${userName}</strong> (${userOrcid})
          <button id="logout-btn" class="btn btn-sm" style="margin-left: 10px;">Logout</button>
        </p>
      `;
      
      // Add logout handler
      document.getElementById('logout-btn')?.addEventListener('click', logout);
    }

    const response = await fetch(`${WORKER_URL}/api/my-endorsements?sessionToken=${sessionToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to load endorsements');
    }

    const data = await response.json();
    displayEndorsements(data.endorsements || []);
  } catch (error) {
    showError('Failed to load endorsements: ' + error.message);
  }
}

/**
 * Display endorsements in a table
 */
function displayEndorsements(endorsements) {
  const container = document.getElementById('endorsements-list');
  const messageDiv = document.getElementById('message');
  
  if (!container) return;

  if (endorsements.length === 0) {
    const basePath = window.location.pathname.replace(/my-endorsements\/$/, 'proposals/');
    container.innerHTML = `
      <div class="alert alert-info">
        <p>You haven't endorsed any proposals yet.</p>
        <p><a href="${basePath}">Browse proposals</a> to get started.</p>
      </div>
    `;
    if (messageDiv) messageDiv.innerHTML = '';
    return;
  }

  // Clear message
  if (messageDiv) messageDiv.innerHTML = '';

  // Create table
  let html = `
    <table class="endorsements-table">
      <thead>
        <tr>
          <th>Proposal</th>
          <th>Job Title</th>
          <th>Employer</th>
          <th>Date Endorsed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  endorsements.forEach(endorsement => {
    const proposalTitle = formatProposalId(endorsement.proposal_id);
    const basePath = window.location.pathname.replace(/my-endorsements\/$/, '');
    const proposalLink = `${basePath}proposal/${endorsement.proposal_id}/`;
    const date = new Date(endorsement.timestamp).toLocaleDateString();
    
    html += `
      <tr>
        <td><a href="${proposalLink}">${proposalTitle}</a></td>
        <td>${escapeHtml(endorsement.jobTitle || '-')}</td>
        <td>${escapeHtml(endorsement.employer || '-')}</td>
        <td>${date}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="removeEndorsement('${endorsement.proposal_id}')">
            Remove
          </button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

/**
 * Remove an endorsement
 */
async function removeEndorsement(proposal_id) {
  if (!confirm('Are you sure you want to remove your endorsement for this proposal?')) {
    return;
  }

  try {
    showLoading('Removing endorsement...');

    const response = await fetch(`${WORKER_URL}/api/endorse`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        proposal_id,
      }),
    });

    const data = await response.json();
    if (data.success) {
      showSuccess('Endorsement removed successfully!');
      // Reload endorsements
      setTimeout(() => loadEndorsements(), 1000);
    } else {
      throw new Error(data.error || 'Failed to remove endorsement');
    }
  } catch (error) {
    showError('Failed to remove endorsement: ' + error.message);
  }
}

/**
 * Format proposal_id for display
 */
