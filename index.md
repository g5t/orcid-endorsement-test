---
layout: default
title: Home
---

<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1>ORCiD Endorsement System</h1>
  
  <p class="lead">
    Welcome to the ORCiD Endorsement System - a platform for collecting community support for scientific proposals using ORCiD authentication.
  </p>
  
  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
    <h2>How It Works</h2>
    <ol>
      <li><strong>Browse Proposals</strong> - Explore scientific proposals in our <a href="/posts/">blog</a></li>
      <li><strong>Sign In with ORCiD</strong> - Authenticate using your ORCiD credentials</li>
      <li><strong>Endorse Proposals</strong> - Show your support for proposals you believe in</li>
      <li><strong>Manage Endorsements</strong> - View and update your endorsements anytime</li>
    </ol>
  </div>
  
  <div style="margin: 30px 0;">
    <h2>Current Proposals</h2>
    
    <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3><a href="/posts/neutron-scattering-proposal/">Advanced Neutron Scattering Instrument</a></h3>
      <p>A next-generation neutron scattering instrument for groundbreaking research in materials science and physics.</p>
      <p>
        <a href="/posts/neutron-scattering-proposal/" class="btn btn-primary">Read More</a>
        <a href="/endorsement/?proposal=neutron-instrument-2026" class="btn btn-primary">Endorse</a>
      </p>
    </div>
    
    <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3><a href="/posts/another-proposal/">Open Data Standards for Neutron Scattering</a></h3>
      <p>Universal open data standards to enhance reproducibility and enable data sharing across facilities.</p>
      <p>
        <a href="/posts/another-proposal/" class="btn btn-primary">Read More</a>
        <a href="/endorsement/?proposal=open-data-standards-2026" class="btn btn-primary">Endorse</a>
      </p>
    </div>
  </div>
  
  <div style="background: #cce5ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin: 30px 0;">
    <h3>Your Endorsements</h3>
    <p>Already endorsed some proposals? View and manage all your endorsements:</p>
    <p>
      <a href="/my-endorsements/" class="btn btn-primary">My Endorsements</a>
    </p>
  </div>
  
  <div style="margin: 30px 0;">
    <h2>Features</h2>
    <ul>
      <li>✅ Secure ORCiD authentication</li>
      <li>✅ Per-proposal endorsement tracking</li>
      <li>✅ Real-time endorsement statistics</li>
      <li>✅ Manage all your endorsements in one place</li>
      <li>✅ Remove endorsements with confirmation</li>
      <li>✅ Multiple proposals supported</li>
    </ul>
  </div>
  
  <div style="margin: 30px 0;">
    <h2>About</h2>
    <p>
      This system demonstrates how ORCiD authentication can be used to collect verifiable endorsements
      for scientific proposals. Each endorsement is tied to a verified ORCiD identity, ensuring authenticity
      while maintaining user privacy.
    </p>
    <p>
      The system is built using:
    </p>
    <ul>
      <li>Jekyll for the frontend</li>
      <li>Cloudflare Workers for the backend API</li>
      <li>Cloudflare KV for data storage</li>
      <li>ORCiD OAuth for authentication</li>
    </ul>
  </div>
  
  <div style="margin: 30px 0;">
    <h2>Documentation</h2>
    <ul>
      <li><a href="https://github.com/g5t/orcid-endorsement-test">GitHub Repository</a></li>
      <li><a href="https://github.com/g5t/orcid-endorsement-test/blob/main/README.md">README</a></li>
      <li><a href="https://github.com/g5t/orcid-endorsement-test/blob/main/SETUP.md">Setup Guide</a></li>
    </ul>
  </div>
</div>

<link rel="stylesheet" href="/assets/css/endorsement.css">
