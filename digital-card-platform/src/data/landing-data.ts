export const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#resources' },
];

export const FEATURE_TABS = [
  {
    id: 'lead-capture',
    label: 'Lead Capture',
    iconName: 'UserPlus' as const,
    title: 'Capture leads from every interaction',
    description:
      'Turn every handshake into a qualified lead. Embed smart forms directly into your digital card that sync contacts to your CRM in real time.',
    bullets: [
      'Instant lead capture forms with custom fields',
      'Auto-sync to Salesforce, HubSpot, and 50+ CRMs',
      'Lead scoring and intelligent routing to sales reps',
    ],
  },
  {
    id: 'contact-sharing',
    label: 'Contact Sharing',
    iconName: 'Share2' as const,
    title: 'Share your contact info in one tap',
    description:
      'Recipients save your full contact card without downloading an app. Works on every smartphone via NFC, QR, or link.',
    bullets: [
      'One-tap save to phone contacts',
      'No app download required for recipients',
      'Works with iPhone, Android, and desktop browsers',
    ],
  },
  {
    id: 'nfc-cards',
    label: 'NFC Cards',
    iconName: 'CreditCard' as const,
    title: 'Premium NFC cards that make an impression',
    description:
      'Beautiful physical cards embedded with NFC chips. Tap any smartphone to instantly share your digital profile.',
    bullets: [
      'Premium PVC and metal card options',
      'Custom branding with your logo and colors',
      'Unlimited taps — never runs out of battery',
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR Codes',
    iconName: 'QrCode' as const,
    title: 'Dynamic QR codes for every use case',
    description:
      'Auto-generated QR codes that link to your card. Update your info anytime without reprinting.',
    bullets: [
      'Dynamic QR — update details without changing the code',
      'Custom branded QR codes with your logo',
      'Track scans with detailed analytics',
    ],
  },
  {
    id: 'digital-wallets',
    label: 'Digital Wallets',
    iconName: 'Wallet' as const,
    title: 'Add your card to Apple & Google Wallet',
    description:
      'Your business card lives in your phone wallet alongside boarding passes and payment cards. Always accessible, always up to date.',
    bullets: [
      'Apple Wallet and Google Wallet support',
      'Automatic updates when you change your info',
      'NFC sharing directly from your wallet pass',
    ],
  },
  {
    id: 'email-signatures',
    label: 'Email Signatures',
    iconName: 'Mail' as const,
    title: 'Turn every email into a networking opportunity',
    description:
      'Add a branded digital card link to your email signature. Every email becomes a chance to capture leads.',
    bullets: [
      'HTML signature generator with live preview',
      'Works with Gmail, Outlook, and Apple Mail',
      'Track clicks and saves from email signatures',
    ],
  },
  {
    id: 'virtual-backgrounds',
    label: 'Virtual Backgrounds',
    iconName: 'Monitor' as const,
    title: 'Share your card during video calls',
    description:
      'Custom virtual backgrounds with your QR code baked in. Attendees scan your code right from the Zoom call.',
    bullets: [
      'Auto-generated branded backgrounds',
      'Works with Zoom, Teams, and Google Meet',
      'QR code positioned for easy scanning',
    ],
  },
  {
    id: 'crm-integrations',
    label: 'CRM Integrations',
    iconName: 'Plug' as const,
    title: 'Connect with the tools your team already uses',
    description:
      'Two-way sync with major CRMs and business tools. Leads flow automatically from card interactions into your pipeline.',
    bullets: [
      'Native Salesforce, HubSpot, and Pipedrive integrations',
      'Zapier and Make.com for custom workflows',
      'Real-time bi-directional sync',
    ],
  },
  {
    id: 'team-management',
    label: 'Team Management',
    iconName: 'Users' as const,
    title: 'Deploy and manage cards across your entire org',
    description:
      'Centralized admin console for creating, updating, and managing cards for every team member. Ensure brand consistency at scale.',
    bullets: [
      'Bulk card creation and CSV import',
      'Role-based access and admin controls',
      'Enforce brand templates across all cards',
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    iconName: 'BarChart3' as const,
    title: 'Measure the ROI of every card interaction',
    description:
      'Comprehensive analytics dashboard showing views, taps, scans, saves, and lead conversions across all your cards.',
    bullets: [
      'Real-time views, taps, and save metrics',
      'Conversion tracking from view to lead capture',
      'Export reports as CSV or connect to your BI tools',
    ],
  },
  {
    id: 'team-analytics',
    label: 'Team Analytics',
    iconName: 'TrendingUp' as const,
    title: 'See performance across your entire team',
    description:
      'Aggregate analytics for managers and admins. Compare team member performance, identify top networkers, and optimize.',
    bullets: [
      'Team leaderboards and performance comparisons',
      'Department and region rollup views',
      'Scheduled report delivery via email',
    ],
  },
  {
    id: 'api-integration',
    label: 'API Integration',
    iconName: 'Plug2' as const,
    title: 'Integrate cards into any application',
    description:
      'Connect your digital card platform with internal tools, websites, and custom applications via our comprehensive REST API.',
    bullets: [
      'RESTful API with full CRUD operations',
      'OAuth2 authentication and API key support',
      'Webhook events for real-time data flow',
    ],
  },
  {
    id: 'public-api',
    label: 'Public API',
    iconName: 'Code2' as const,
    title: 'Build on top of our open platform',
    description:
      'Our public API gives developers complete access to create cards, manage contacts, retrieve analytics, and automate workflows programmatically.',
    bullets: [
      'Comprehensive API documentation with OpenAPI spec',
      'JavaScript and Python SDK libraries',
      'Sandbox environment for testing',
    ],
  },
  {
    id: 'data-pipeline',
    label: 'Data Pipeline',
    iconName: 'Database' as const,
    title: 'Build automated data pipelines',
    description:
      'Fetch, transform, and sync contact data between your digital cards and any data warehouse or analytics platform.',
    bullets: [
      'Scheduled data exports to S3, BigQuery, or Snowflake',
      'Real-time streaming via webhooks',
      'Data transformation and enrichment rules',
    ],
  },
];

export const CAROUSEL_SLIDES = [
  {
    id: 'qr-code',
    title: 'QR Code',
    iconName: 'QrCode' as const,
    description:
      'Scan to save. Dynamic QR codes that update without reprinting. Perfect for print materials, presentations, and name badges.',
  },
  {
    id: 'apple-wallet',
    title: 'Apple Wallet',
    iconName: 'Smartphone' as const,
    description:
      'Add your card to Apple Wallet for instant NFC sharing. Always accessible, always up to date with your latest info.',
  },
  {
    id: 'google-wallet',
    title: 'Google Wallet',
    iconName: 'Wallet' as const,
    description:
      'Native Google Wallet integration. Tap to share from any Android device with NFC — no app needed.',
  },
  {
    id: 'email-signatures',
    title: 'Email Signatures',
    iconName: 'Mail' as const,
    description:
      'Embed your digital card in every email. HTML signature generator works with Gmail, Outlook, and Apple Mail.',
  },
  {
    id: 'virtual-backgrounds',
    title: 'Virtual Backgrounds',
    iconName: 'Monitor' as const,
    description:
      'Custom Zoom backgrounds with your QR code. Share your card during any video call without interrupting the flow.',
  },
  {
    id: 'social-sharing',
    title: 'Social Sharing',
    iconName: 'Share2' as const,
    description:
      'Share your card on LinkedIn, Twitter, and Instagram with rich link previews. Grow your network on social platforms.',
  },
];

export const SECURITY_ITEMS = [
  {
    id: 'soc2',
    title: 'SOC 2 Type II',
    iconName: 'Shield' as const,
    description:
      'Independently audited security controls. Our SOC 2 Type II certification validates our commitment to protecting your data with rigorous standards.',
  },
  {
    id: 'gdpr',
    title: 'GDPR Compliance',
    iconName: 'Lock' as const,
    description:
      'Full compliance with EU data protection regulations. Data residency options, right to deletion, and transparent data processing.',
  },
  {
    id: 'sso',
    title: 'SSO / SAML',
    iconName: 'KeyRound' as const,
    description:
      'Enterprise single sign-on via SAML 2.0, OAuth, and OIDC. Integrate with Okta, Azure AD, Google Workspace, and OneLogin.',
  },
  {
    id: 'encryption',
    title: 'Data Encryption',
    iconName: 'ShieldCheck' as const,
    description:
      'AES-256 encryption at rest and TLS 1.3 in transit. Your contact data and analytics are protected with bank-grade security.',
  },
];

export const INTEGRATION_ITEMS = [
  {
    id: 'n8n',
    title: 'n8n Workflow',
    iconName: 'Workflow' as const,
    description: 'Build self-hosted automation workflows with our n8n nodes.',
    capabilities: [
      'Automate card creation from HR systems',
      'Route leads to the right sales rep automatically',
      'Trigger webhook-based workflows on card interactions',
    ],
  },
  {
    id: 'make',
    title: 'Make.com Scenario',
    iconName: 'Layers' as const,
    description: 'Create visual automation scenarios with zero code.',
    capabilities: [
      'Multi-step scenarios with conditional logic',
      'Connect to 1500+ apps in the Make ecosystem',
      'Schedule batch operations and data syncs',
    ],
  },
  {
    id: 'airtable',
    title: 'Airtable Pipeline',
    iconName: 'Table2' as const,
    description: 'Sync contacts and leads directly to Airtable bases.',
    capabilities: [
      'Two-way sync between cards and Airtable records',
      'Custom views for team leads and managers',
      'Data enrichment with Airtable automations',
    ],
  },
  {
    id: 'zapier',
    title: 'Zapier',
    iconName: 'Zap' as const,
    description: 'Connect to 5000+ apps with trigger-based automations.',
    capabilities: [
      'Instant triggers on card views, saves, and leads',
      'Multi-step Zaps with filters and formatters',
      'Premium Zapier integration with full API access',
    ],
  },
  {
    id: 'rest-api',
    title: 'REST API',
    iconName: 'Code' as const,
    description: 'Full public API with CRUD operations and OAuth2 auth.',
    capabilities: [
      'Complete card and contact management via API',
      'OAuth2 and API key authentication',
      'Rate limiting with generous quotas for enterprise',
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    iconName: 'Webhook' as const,
    description: 'Real-time event notifications for your data pipelines.',
    capabilities: [
      'Events for card views, lead captures, and saves',
      'Configurable retry logic and failure alerts',
      'HMAC signature verification for security',
    ],
  },
];

export const API_CODE_EXAMPLES = {
  curl: `# Create a new digital business card
curl -X POST https://api.popl.co/v1/cards \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "title": "VP of Sales",
    "company": "Acme Corp",
    "email": "jane@acme.com",
    "phone": "+1-555-0123",
    "template": "enterprise-dark"
  }'`,
  javascript: `// Create a card and fetch leads using the JS SDK
import { PoplClient } from '@popl/sdk';

const client = new PoplClient({
  apiKey: process.env.POPL_API_KEY,
});

// Create a new card
const card = await client.cards.create({
  name: 'Jane Smith',
  title: 'VP of Sales',
  company: 'Acme Corp',
  email: 'jane@acme.com',
  template: 'enterprise-dark',
});

// Fetch leads from a card
const leads = await client.leads.list({
  cardId: card.id,
  since: '2025-01-01',
  limit: 100,
});

console.log(\`Captured \${leads.total} leads\`);`,
  python: `# Build a data pipeline with the Python SDK
from popl import PoplClient

client = PoplClient(api_key="YOUR_API_KEY")

# Create a card programmatically
card = client.cards.create(
    name="Jane Smith",
    title="VP of Sales",
    company="Acme Corp",
    email="jane@acme.com",
    template="enterprise-dark"
)

# Fetch and process leads
leads = client.leads.list(
    card_id=card.id,
    since="2025-01-01"
)

# Sync to your data warehouse
for lead in leads:
    warehouse.insert("leads", {
        "name": lead.name,
        "email": lead.email,
        "captured_at": lead.created_at,
        "source": "digital_card"
    })`,
};

export const FAQ_CATEGORIES = [
  'All',
  'General',
  'Pricing',
  'Features',
  'Security',
  'Integrations',
  'API & Developers',
  'Enterprise',
  'Support',
];

export const FAQ_ITEMS = [
  {
    id: '1',
    category: 'General',
    question: 'What is Popl and how does it work?',
    answer:
      'Popl is the #1 digital business card platform for lead capture. Create a digital profile, share it via NFC, QR code, link, or wallet pass, and instantly capture contact information from anyone you meet. No app needed for recipients.',
  },
  {
    id: '2',
    category: 'General',
    question: 'Do recipients need to download an app?',
    answer:
      'No. Recipients simply tap your NFC card, scan your QR code, or click your link. Your card opens in their browser and they can save your contact with one tap. No app download required.',
  },
  {
    id: '3',
    category: 'General',
    question: 'What devices are compatible with NFC cards?',
    answer:
      'All iPhones from iPhone 7 and newer support NFC, as well as virtually all Android phones manufactured since 2015. For devices without NFC, the QR code and link sharing options work universally.',
  },
  {
    id: '4',
    category: 'Pricing',
    question: 'Is there a free plan available?',
    answer:
      'Yes! Our free plan includes one digital card with basic customization, QR code generation, and limited analytics. Upgrade to Pro for unlimited cards, NFC support, CRM integrations, and advanced analytics.',
  },
  {
    id: '5',
    category: 'Pricing',
    question: 'How much do NFC cards cost?',
    answer:
      'NFC cards start at $7.99 per card for standard PVC cards. Premium metal cards start at $29.99. Volume discounts are available for teams of 50+. All cards include free shipping.',
  },
  {
    id: '6',
    category: 'Pricing',
    question: 'Do you offer enterprise pricing?',
    answer:
      'Yes. Enterprise plans include custom pricing based on team size, dedicated account management, SSO/SAML, custom branding, SLA guarantees, and priority support. Contact sales for a custom quote.',
  },
  {
    id: '7',
    category: 'Features',
    question: 'Can I customize the design of my card?',
    answer:
      'Absolutely. Choose from dozens of professional templates or create a fully custom design with your brand colors, fonts, and logo. Enterprise plans include white-label options.',
  },
  {
    id: '8',
    category: 'Features',
    question: 'What analytics are available?',
    answer:
      'Track card views, NFC taps, QR scans, contact saves, and lead form submissions. View data by time period, location, and device type. Team plans include aggregate team analytics and leaderboards.',
  },
  {
    id: '9',
    category: 'Features',
    question: 'Can I add my card to Apple Wallet?',
    answer:
      'Yes. Generate an Apple Wallet pass directly from your dashboard. The pass updates automatically when you change your info. Google Wallet is also supported.',
  },
  {
    id: '10',
    category: 'Security',
    question: 'How is my data protected?',
    answer:
      'We use AES-256 encryption at rest and TLS 1.3 for all data in transit. Our infrastructure is SOC 2 Type II certified, and we undergo regular third-party security audits.',
  },
  {
    id: '11',
    category: 'Security',
    question: 'Are you GDPR compliant?',
    answer:
      'Yes. We are fully GDPR compliant with EU data residency options, data processing agreements, right to deletion, and transparent privacy practices. We also comply with CCPA.',
  },
  {
    id: '12',
    category: 'Security',
    question: 'Do you support SSO and SAML?',
    answer:
      'Enterprise plans include SSO via SAML 2.0, OAuth 2.0, and OIDC. We integrate with Okta, Azure AD, Google Workspace, OneLogin, and other identity providers.',
  },
  {
    id: '13',
    category: 'Integrations',
    question: 'Which CRMs do you integrate with?',
    answer:
      'We have native integrations with Salesforce, HubSpot, Pipedrive, Zoho CRM, and Microsoft Dynamics. For other CRMs, connect via Zapier, Make.com, or our REST API.',
  },
  {
    id: '14',
    category: 'Integrations',
    question: 'How do I set up a Zapier integration?',
    answer:
      'Search for "Popl" in the Zapier app directory, connect your account with your API key, and choose from pre-built triggers (card viewed, lead captured, contact saved) and actions (create card, update card, export leads).',
  },
  {
    id: '15',
    category: 'API & Developers',
    question: 'How do I connect to the public API?',
    answer:
      'Sign up for a developer account, generate an API key from your dashboard, and make requests to api.popl.co/v1. Our API uses RESTful conventions with JSON payloads and supports OAuth2 for production integrations.',
  },
  {
    id: '16',
    category: 'API & Developers',
    question: 'What API boilerplate and scaffolding is available?',
    answer:
      'We provide starter templates for Node.js, Python, and Go. Each scaffold includes authentication setup, common API operations, webhook handling, and error handling patterns. Clone from our GitHub repository to get started in minutes.',
  },
  {
    id: '17',
    category: 'API & Developers',
    question: 'How do I set up an n8n workflow with Popl?',
    answer:
      'Install the Popl n8n community node, authenticate with your API key, and use triggers like "Card Viewed" or "Lead Captured" to start workflows. Common automations include routing leads to CRMs, sending Slack notifications, and syncing to spreadsheets.',
  },
  {
    id: '18',
    category: 'API & Developers',
    question: 'How do I create a Make.com scenario?',
    answer:
      'Add the Popl module to your Make.com scenario, connect with your API key, and choose from available triggers and actions. Build multi-step scenarios with conditional logic to automate lead routing, card creation from HR systems, and data synchronization.',
  },
  {
    id: '19',
    category: 'API & Developers',
    question: 'How do I build an Airtable pipeline?',
    answer:
      'Use our native Airtable integration or connect via API. Set up two-way sync between your Popl contacts and Airtable bases. Configure field mappings, sync schedules, and use Airtable automations for data enrichment and notifications.',
  },
  {
    id: '20',
    category: 'API & Developers',
    question: 'What are the API rate limits and deployment options?',
    answer:
      'Free tier: 100 requests/hour. Pro: 1,000 requests/hour. Enterprise: 10,000+ requests/hour with custom limits. Deploy integrations on your own infrastructure or use our managed webhooks. We support both cloud and self-hosted deployment models.',
  },
  {
    id: '21',
    category: 'API & Developers',
    question: 'How do I fetch data from the API for reporting?',
    answer:
      'Use the /v1/analytics and /v1/leads endpoints with date range filters. For large datasets, use cursor-based pagination and our streaming export endpoint. Schedule automated exports to S3, BigQuery, or your data warehouse via webhooks or cron-based API calls.',
  },
  {
    id: '22',
    category: 'Enterprise',
    question: 'Can we white-label the platform?',
    answer:
      'Yes. Enterprise plans include full white-labeling — custom domain, branded card templates, custom email domains, and removal of Popl branding. Contact our sales team for details.',
  },
  {
    id: '23',
    category: 'Enterprise',
    question: 'How do you handle bulk deployments?',
    answer:
      'Our admin console supports bulk card creation via CSV upload, SCIM provisioning from your identity provider, and API-based automation. Deploy thousands of cards in minutes with consistent branding.',
  },
  {
    id: '24',
    category: 'Enterprise',
    question: 'What SLA do you offer?',
    answer:
      'Enterprise plans include 99.9% uptime SLA with financial credits for any downtime. We also offer dedicated infrastructure, priority support with 1-hour response time, and a named customer success manager.',
  },
  {
    id: '25',
    category: 'Support',
    question: 'How can I get help?',
    answer:
      'Free users have access to our help center and community forum. Pro users get email support with 24-hour response time. Enterprise customers receive priority support with dedicated Slack channels and 1-hour response time.',
  },
  {
    id: '26',
    category: 'Support',
    question: 'Do you offer onboarding for teams?',
    answer:
      'Yes. All team plans include guided onboarding sessions, training materials, and best practices documentation. Enterprise plans include a dedicated onboarding manager and custom training for your team.',
  },
  {
    id: '27',
    category: 'Support',
    question: 'Is there a status page for uptime monitoring?',
    answer:
      'Yes. Visit status.popl.co for real-time infrastructure status, incident history, and maintenance notifications. Subscribe to get alerted about any service disruptions.',
  },
  {
    id: '28',
    category: 'Integrations',
    question: 'How do I connect my email signature to my card?',
    answer:
      'Go to your card settings, click "Email Signature", and use our HTML generator. Copy the snippet into Gmail, Outlook, or Apple Mail. Every email you send will include a clickable link and mini-preview of your digital card.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Digital Business Cards', href: '#features' },
      { label: 'NFC Cards', href: '#features' },
      { label: 'QR Codes', href: '#features' },
      { label: 'Apple Wallet', href: '#features' },
      { label: 'Email Signatures', href: '#features' },
      { label: 'Team Management', href: '#features' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Enterprise', href: '#enterprise' },
      { label: 'Small Business', href: '#solutions' },
      { label: 'Sales Teams', href: '#solutions' },
      { label: 'Marketing', href: '#solutions' },
      { label: 'Real Estate', href: '#solutions' },
      { label: 'Conferences', href: '#solutions' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/support' },
      { label: 'API Docs', href: '/docs/api' },
      { label: 'API Boilerplate', href: '/docs/boilerplate' },
      { label: 'Integration Guides', href: '/docs/integrations' },
      { label: 'Case Studies', href: '/case-studies' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
      { label: 'Partners', href: '/partners' },
    ],
  },
];
