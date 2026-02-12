---
layout: page
title: About
icon: fas fa-info-circle
order: 4
---

# About This Project

## Overview

This site is a **test environment** for demonstrating how to implement an ORCiD-based endorsement system for scientific proposals. It showcases a complete, production-ready architecture that combines:

- Jekyll static site generation with the Chirpy theme
- ORCiD OAuth2 authentication
- Serverless backend with Cloudflare Workers
- Privacy-preserving data collection
- Real-time statistics and visualization

## The Proposal

The sample proposal on this site describes a hypothetical neutron scattering instrument. This serves as a realistic example of the kind of scientific proposal that might benefit from community endorsement:

- **Large-scale infrastructure projects** requiring broad community support
- **Funding proposals** that need to demonstrate user demand
- **Policy initiatives** seeking stakeholder validation
- **Research programs** gathering expression of interest

## Why ORCiD?

[ORCiD](https://orcid.org) (Open Researcher and Contributor ID) provides several advantages for academic endorsement systems:

1. **Persistent Identity** - Each researcher has a unique, persistent identifier
2. **Verified Credentials** - Employment and affiliation data can be automatically imported
3. **Wide Adoption** - Used by researchers worldwide across all disciplines
4. **Privacy Controls** - Researchers control what information they share
5. **Free Service** - No cost for researchers or applications
6. **Standards-Based** - OAuth2 authentication with well-documented APIs

## Technical Architecture

### Frontend (Jekyll + GitHub Pages)
- Static site generation for fast, secure pages
- Chirpy theme provides modern, responsive design
- Client-side JavaScript handles OAuth flow
- No server-side rendering required

### Backend (Cloudflare Workers)
- Serverless functions eliminate server maintenance
- KV storage provides fast, distributed data storage
- Handles OAuth token exchange securely
- Aggregates statistics on-demand
- Scales automatically with traffic

### Data Flow
1. User clicks "Sign in with ORCiD"
2. Redirected to ORCiD for authentication
3. Authorization code sent to completion page
4. Worker exchanges code for access token
5. Worker fetches employment data from ORCiD API
6. User reviews and confirms information
7. Endorsement stored in Cloudflare KV
8. Statistics updated and cached

## Privacy & Ethics

This system is designed with privacy as a core principle:

### What We Collect
- **ORCiD ID**: Stored to prevent duplicate endorsements
- **Name**: Stored for verification but NOT displayed publicly
- **Employment**: Job title and employer (user can edit before submitting)
- **Timestamp**: When the endorsement was made

### What We Display
- **Aggregate statistics**: Total endorsements, unique organizations
- **Organization list**: Which institutions support the proposal
- **NOT names**: Individual endorser names remain private
- **NOT ORCiD IDs**: These are never displayed publicly

### User Control
- Users review exactly what will be displayed before confirming
- Employment information can be edited before submission
- Privacy notice clearly explains what is public vs. private

## Use Cases

This system can be adapted for:

### Academic Use Cases
- **Facility proposals**: Gather support for new instruments or infrastructure
- **Conference organization**: Track interested participants
- **Working groups**: Identify potential collaborators
- **Open letters**: Collect signatures from researchers
- **Curriculum development**: Survey interest in new courses

### Policy Use Cases
- **Position statements**: Gather expert endorsements
- **Policy recommendations**: Show stakeholder support
- **Standards development**: Identify interested parties
- **Community consultations**: Structured feedback collection

## Advantages of This Approach

### For Users
- ✅ Single sign-on (no new account required)
- ✅ Auto-fill employment data
- ✅ Privacy protection
- ✅ Verifiable credentials
- ✅ Easy to use

### For Organizers
- ✅ No server to maintain
- ✅ Low/no cost (free tiers available)
- ✅ Secure credential storage
- ✅ Automatic duplicate prevention
- ✅ Real-time statistics
- ✅ Export data for analysis

### For Institutions
- ✅ Verifiable support metrics
- ✅ Institutional representation statistics
- ✅ Transparent process
- ✅ Privacy-compliant data handling

## Extending This System

This codebase can be extended to add:

- **Email notifications** when new endorsements arrive
- **Admin dashboard** for detailed analytics
- **Export functionality** for reports and presentations
- **Multi-proposal support** for multiple active proposals
- **Comments/feedback** alongside endorsements
- **Deadline management** for time-limited proposals
- **Custom fields** based on your needs

## Getting Started

If you want to deploy your own version:

1. Read the [SETUP.md](../SETUP.md) guide
2. Register an ORCiD developer application
3. Set up a Cloudflare Worker
4. Fork this repository and configure it
5. Deploy to GitHub Pages

## Technical Support

This is an open-source test project. For assistance:

- **Setup issues**: Check [SETUP.md](../SETUP.md) troubleshooting section
- **ORCiD integration**: See [ORCiD API documentation](https://info.orcid.org/documentation/)
- **Cloudflare Workers**: See [Cloudflare documentation](https://developers.cloudflare.com/workers/)
- **Jekyll/Chirpy**: See [Chirpy theme guide](https://chirpy.cotes.page/)

## License & Attribution

This project demonstrates integration patterns for ORCiD and Cloudflare Workers. Feel free to:

- Use this code for your own proposals
- Adapt and modify as needed
- Share improvements with the community

### Acknowledgments

- **ORCiD** for the authentication infrastructure
- **Cloudflare** for serverless Workers and KV
- **Jekyll Chirpy Theme** for the site design
- **GitHub** for hosting and CI/CD

## Contact

For questions about this test deployment or to discuss adapting it for your use case, see the repository on GitHub: [g5t/orcid-endorsement-test](https://github.com/g5t/orcid-endorsement-test)

---

*This is a demonstration project. The proposal described on this site is fictional and for testing purposes only.*
