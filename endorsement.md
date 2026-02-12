---
layout: page
title: Endorse Proposal
permalink: /endorsement/
---

<link rel="stylesheet" href="{{ '/assets/css/endorsement.css' | relative_url }}">

<div class="endorsement-container">
  <h1>Endorse This Proposal</h1>
  
  <div id="proposal-info"></div>
  
  <div id="stats"></div>
  
  <div id="message"></div>
  
  <!-- Authentication Section -->
  <div id="auth-section">
    <div class="alert alert-info">
      <p>Sign in with your ORCiD account to endorse this proposal.</p>
      <button id="sign-in-btn" class="btn btn-primary">
        <img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" alt="ORCiD" style="vertical-align: middle;">
        Sign in with ORCiD
      </button>
    </div>
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

<script src="{{ '/assets/js/endorsement.js' | relative_url }}"></script>
