---
layout: page
title: Privacy Policy
permalink: /privacy/
icon: fa-solid fa-shield-halved
hidden: true
---

## Data Collection and Use

### What Data We Collect

When you endorse a proposal through our ORCiD authentication system, we collect:

- **ORCiD identifier** - Your unique researcher ID
- **Public profile information** from your ORCiD account:
  - Your name
  - Current job title
  - Current employer/affiliation

This information is retrieved directly from your public ORCiD profile. We only access information you have marked as public.

### How We Use Your Data

Your endorsement data is used to:

1. **Display endorsement counts** - Show aggregate statistics on proposals
2. **Support proposal submissions** - Include your endorsement information in funding applications
3. **Enable endorsement management** - Allow you to view and manage your endorsements

### Data Storage

- Your endorsement data is stored in a Cloudflare Workers KV store
- Data is associated with your ORCiD identifier
- You can view all your active endorsements at any time via the "My Endorsements" page

### Your Rights

#### Right to Access
You can view all your current endorsements at [My Endorsements]({{ '/my-endorsements/' | relative_url }}).

#### Right to Erasure (Right to be Forgotten)
You can remove your endorsement for any proposal **before it is submitted** for funding:

- Navigate to [My Endorsements]({{ '/my-endorsements/' | relative_url }})
- Click "Remove" next to any endorsement
- Your data will be immediately deleted from our system

**Important Limitation**: Once a proposal incorporating your endorsement has been submitted to a funding agency, we cannot remove your information from that submitted document as it becomes part of an immutable application record. However, we will remove your data from our system so it won't be included in any future proposal submissions.

#### Right to Data Portability
You can export your endorsement data at any time from the [My Endorsements]({{ '/my-endorsements/' | relative_url }}) page.

### Legal Basis for Processing

We process your personal data based on your **explicit consent**. When you endorse a proposal:

- You are clearly informed about what data will be collected
- You actively choose to endorse by clicking the endorsement button
- You can withdraw consent (remove your endorsement) at any time before proposal submission

### Data Retention

- **Active endorsements**: Retained while the endorsement is active
- **After removal**: Immediately deleted from our system
- **After proposal submission**: Proposal data is retained according to funding agency requirements (typically 5-10 years), but you can still remove your data from our system

### Data Security

Your data is:
- Transmitted over encrypted HTTPS connections
- Stored in Cloudflare's secure infrastructure
- Accessed only through authenticated ORCiD OAuth tokens
- Never shared with third parties except as part of legitimate proposal submissions

### Third-Party Services

We use:
- **ORCiD** - For authentication and public profile data retrieval
- **Cloudflare Workers** - For data storage and API services

Please review [ORCiD's Privacy Policy](https://info.orcid.org/privacy-policy/) for information about their data practices.

### Children's Privacy

This service is not intended for use by individuals under 18 years of age. We do not knowingly collect data from children.

### Changes to This Policy

We may update this privacy policy from time to time. Significant changes will be announced on the site. Continued use of the service constitutes acceptance of any changes.

### Contact

If you have questions about this privacy policy or wish to exercise your data rights, please contact:

**Data Controller**: [Your Name/Organization Name]  
**Email**: [your-email@example.com]  
**Subject Line**: GDPR Request - ORCiD Endorsement System

### Your Consent

By endorsing a proposal, you acknowledge that you have read and understood this privacy policy and consent to the collection and use of your data as described.

---

_Last updated: {{ site.time | date: "%B %d, %Y" }}_
