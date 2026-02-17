---
layout: page
title: My Endorsements
permalink: /my-endorsements/
icon: fa-solid fa-person-circle-check
hidden: true
---

<link rel="stylesheet" href="{{ '/assets/css/endorsement.css' | relative_url }}">

<div class="endorsement-container">
  <div class="alert alert-info">
    <p><i class="fas fa-info-circle"></i> <strong>Your Data Rights:</strong> You can remove any endorsement at any time before the proposal is submitted. Once a proposal is submitted to a funding agency, your information becomes part of the official application and cannot be removed from that submission.</p>
    <p class="mb-0"><small>See our <a href="{{ '/privacy/' | relative_url }}">Privacy Policy</a> for more information.</small></p>
  </div>

  <div id="message"></div>
  
  <!-- Authentication Section -->
  <div id="auth-section">
    <div class="alert alert-info">
      <p>Sign in with your ORCiD account to view and manage your endorsements.</p>
      <button id="sign-in-btn" class="btn btn-primary">
        <img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" alt="ORCiD" style="vertical-align: middle;">
        Sign in with ORCiD
      </button>
    </div>
  </div>
  
  <!-- Content Section -->
  <div id="content-section" style="display: none;">
    <div id="user-info"></div>
    
    <div id="endorsements-list"></div>
    
    <div style="margin-top: 20px;">
      <a href="{{ '/proposals' | relative_url }}">← Browse proposals</a>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/utilities.js' | relative_url }}"></script>
<script src="{{ '/assets/js/my-endorsements.js' | relative_url }}"></script>
