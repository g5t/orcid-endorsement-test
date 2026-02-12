---
layout: page
title: Endorse This Proposal
permalink: /endorsement/
---

# Community Endorsement

## Current Status

<div id="endorsement-stats" class="stats-container">
  <div class="stat-box">
    <h3 id="total-endorsements">Loading...</h3>
    <p>Total Endorsements</p>
  </div>
  <div class="stat-box">
    <h3 id="unique-organizations">Loading...</h3>
    <p>Unique Organizations</p>
  </div>
</div>

## Top Organizations

<div id="top-organizations">
  <p>Loading organization data...</p>
</div>

## Support This Proposal

Your endorsement helps demonstrate community support for this neutron scattering instrument. By endorsing with your ORCiD, you:

- Add your institutional affiliation to the list of supporting organizations
- Provide verifiable support through your professional identity
- Help us demonstrate broad community backing to funding agencies
- Join other researchers who believe in advancing neutron science

### Privacy Notice

When you endorse:
- Your **name** is stored but NOT displayed publicly
- Your **ORCiD ID** is stored to prevent duplicate endorsements
- Your **job title** and **employer** are displayed publicly (if provided)
- You can review what will be displayed before confirming

<div class="endorsement-action">
  <button id="orcid-signin-btn" class="btn btn-primary btn-lg">
    <img src="https://orcid.org/sites/default/files/images/orcid_24x24.png" alt="ORCiD" />
    Sign in with ORCiD to Endorse
  </button>
</div>

<div id="error-message" class="alert alert-danger" style="display: none;"></div>

---

## What is ORCiD?

ORCiD (Open Researcher and Contributor ID) provides a persistent digital identifier that distinguishes you from other researchers. It's free and widely used across the scientific community.

Don't have an ORCiD? [Register for free at orcid.org](https://orcid.org/register)

<style>
.stats-container {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.stat-box {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  min-width: 200px;
  flex: 1;
}

.stat-box h3 {
  font-size: 2.5rem;
  margin: 0;
  color: #007bff;
}

.stat-box p {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
}

.endorsement-action {
  text-align: center;
  margin: 2rem 0;
}

#orcid-signin-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background-color: #A6CE39;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

#orcid-signin-btn:hover {
  background-color: #8BAE2E;
}

#top-organizations {
  margin: 2rem 0;
}

.org-list {
  list-style: none;
  padding: 0;
}

.org-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.org-count {
  float: right;
  color: #007bff;
  font-weight: bold;
}

.alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>

<script src="{{ '/assets/js/endorsement.js' | relative_url }}"></script>
<script>
  // TODO: Configure these values for your deployment
  const API_BASE = 'https://your-worker.your-subdomain.workers.dev';
  const ORCID_CLIENT_ID = 'APP-XXXXXXXXXXXX';
  const REDIRECT_URI = '{{ site.url }}{{ site.baseurl }}/endorsement-complete/';

  // Initialize endorsement system
  if (typeof initEndorsement === 'function') {
    initEndorsement(API_BASE, ORCID_CLIENT_ID, REDIRECT_URI);
  }
</script>
