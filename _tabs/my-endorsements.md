---
layout: page
title: My Endorsements
permalink: /my-endorsements/
order: 3
icon: fa-solid fa-person-circle-check
---

<link rel="stylesheet" href="{{ '/assets/css/endorsement.css' | relative_url }}">

<div class="endorsement-container">
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

<script src="{{ '/assets/js/my-endorsements.js' | relative_url }}"></script>
