---
layout: page
title: Endorse Proposal
permalink: /endorsement/
hidden: true
---

<link rel="stylesheet" href="{{ '/assets/css/endorsement.css' | relative_url }}">

<div class="endorsement-container">
  <!-- Compact header section -->
  <div class="endorsement-header">
    <div id="proposal-info"></div>
    <div id="stats"></div>
  </div>
  
  <div id="message"></div>
  
  <!-- GDPR Notice Before Authentication -->
  {% include gdpr-notice.html %}
  
  <!-- Authentication Section -->
  <div id="auth-section">
    <div class="form-group">
      <label>
        <input type="checkbox" id="pre-auth-consent" required>
        I have read and agree to the <a href="{{ '/privacy/' | relative_url }}" target="_blank">Privacy Policy</a> and consent to accessing my public ORCiD profile data. <span style="color: red;">*</span>
      </label>
    </div>
    
    <button id="sign-in-btn" class="btn btn-primary" disabled>
      <img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" alt="ORCiD" style="vertical-align: middle;">
      Sign in with ORCiD
    </button>
  </div>
  
  <!-- Endorsement Form Section -->
  <div id="form-section" style="display: none;">
    <div id="user-info"></div>
    
    <form id="endorse-form">
      <div class="form-group">
        <label for="job-title">Job Title <span style="color: red;">*</span>:</label>
        <input type="text" id="job-title" class="form-control" placeholder="e.g., Research Scientist" required>
      </div>
      
      <div class="form-group">
        <label for="employer">Employer/Institution <span style="color: red;">*</span>:</label>
        <input type="text" id="employer" class="form-control" placeholder="e.g., Example University" required>
      </div>
      
      <button type="submit" class="btn btn-primary">Submit Endorsement</button>
      <button type="button" id="remove-btn" class="btn btn-danger">Remove Endorsement</button>
    </form>
    
    <div style="margin-top: 20px;">
      <a href="{{ '/my-endorsements/' | relative_url }}">View all my endorsements</a>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/utilities.js' | relative_url }}"></script>
<script src="{{ '/assets/js/endorsement.js' | relative_url }}"></script>
