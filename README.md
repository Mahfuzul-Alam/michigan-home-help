# Michigan Home Jobs — Clean Frontend Version

Files:
- index.html — main questionnaire
- knowledge.html — knowledge-base information page
- privacy.html — general privacy-policy draft for client review
- style.css — shared styling
- script.js — questionnaire logic and n8n integration point

Important:
- The knowledge-base CTA appears ONLY after a successful submission.
- N/A/unsuccessful submissions keep Start Over only.
- Footer has no About Us, Contact Us, or social-media sections.
- n8n remains unconnected until the client confirms the intended workflow.

When the n8n webhook is ready, update:
const N8N_WEBHOOK_URL = "";
