---
layout: page
title: Complete Your Endorsement
permalink: /endorsement-complete/
---

# Complete Your Endorsement

<div id="loading-message">
  <p>Loading your information from ORCiD...</p>
</div>

<div id="endorsement-form" style="display: none;">
  <p>Thank you for signing in with ORCiD! Please review and complete your endorsement information below.</p>

  <form id="complete-endorsement-form">
    <div class="form-group">
      <label for="job-title">Job Title *</label>
      <input type="text" id="job-title" name="jobTitle" class="form-control" required 
             placeholder="e.g., Professor, Research Scientist, Graduate Student">
      <small class="form-text">This will be displayed publicly.</small>
    </div>

    <div class="form-group">
      <label for="employer">Employer/Institution *</label>
      <input type="text" id="employer" name="employer" class="form-control" required 
             placeholder="e.g., University of Science, National Laboratory">
      <small class="form-text">This will be displayed publicly.</small>
    </div>

    <div class="privacy-notice">
      <h4>Privacy Notice</h4>
      <p><strong>What will be displayed publicly:</strong></p>
      <ul>
        <li>Your job title: <span id="preview-job-title" class="preview-text">-</span></li>
        <li>Your employer: <span id="preview-employer" class="preview-text">-</span></li>
      </ul>
      <p><strong>What will NOT be displayed publicly:</strong></p>
      <ul>
        <li>Your name (stored for verification only)</li>
        <li>Your ORCiD ID (used to prevent duplicates)</li>
        <li>Your email address</li>
      </ul>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="privacy-consent" name="consent" required>
        I understand that my job title and employer will be displayed publicly as part of this endorsement
      </label>
    </div>

    <div class="form-actions">
      <button type="submit" id="submit-btn" class="btn btn-primary">
        Submit Endorsement
      </button>
      <button type="button" id="cancel-btn" class="btn btn-secondary">
        Cancel
      </button>
    </div>
  </form>
</div>

<div id="success-message" class="alert alert-success" style="display: none;">
  <h4>Thank you for your endorsement!</h4>
  <p>Your support has been recorded. You can view the updated endorsement statistics on the <a href="{{ '/endorsement/' | relative_url }}">endorsement page</a>.</p>
  <p><a href="{{ '/' | relative_url }}" class="btn btn-primary">Return to Home</a></p>
</div>

<div id="error-message" class="alert alert-danger" style="display: none;"></div>

<style>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.privacy-notice {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

.privacy-notice h4 {
  margin-top: 0;
  color: #495057;
}

.preview-text {
  font-weight: bold;
  color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

#loading-message {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
</style>

<script src="{{ '/assets/js/endorsement.js' | relative_url }}"></script>
<script>
  // TODO: Configure this value for your deployment
  const API_BASE = 'https://your-worker.your-subdomain.workers.dev';

  // Initialize completion form
  if (typeof initEndorsementComplete === 'function') {
    initEndorsementComplete(API_BASE);
  }
</script>
