---
layout: page
title: My Endorsements
permalink: /my-endorsements/
---

<link rel="stylesheet" href="/assets/css/endorsement.css">

<div class="endorsement-container">
  <h1>My Endorsements</h1>
  
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
      <a href="/posts/">← Browse proposals</a>
    </div>
  </div>
</div>

<script src="/assets/js/my-endorsements.js"></script>
