# 🚀 CRM Configuration for zectordigital.es Tracking

## Step 3: Configure Your CRM Backend

### 1. Database Setup
Add zectordigital.es to your tracking domains in MongoDB:

```javascript
// In your MongoDB, add this to the tenants collection:
{
  "tenantId": "zectordigital_main",
  "name": "Zector Digital España",
  "domain": "zectordigital.es",
  "subdomain": "zectordigital",
  "isActive": true,
  "settings": {
    "trackingDomains": ["zectordigital.es", "www.zectordigital.es"],
    "leadScoringEnabled": true,
    "autoEnrichment": true
  },
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

### 2. Environment Variables
Ensure your Vercel deployment has these variables set:
- `MONGODB_URI`: Your MongoDB connection string
- `VITE_API_ENDPOINT`: https://zector-digital-crm-leads.vercel.app

### 3. API Endpoints Available
Your tracking will send data to these endpoints:
- `/api/track` - Main tracking endpoint
- `/api/companies` - Company enrichment
- `/api/visitors` - Visitor data retrieval

## Step 4: Testing Your Setup

### Test 1: Verify Script Installation
1. Visit zectordigital.es
2. Open browser DevTools (F12)
3. Check Console tab for: "Zector Digital Lead Tracking initialized for zectordigital.es"

### Test 2: Verify Data Transmission
1. On zectordigital.es, open DevTools → Network tab
2. Navigate through pages
3. Look for POST requests to: `https://zector-digital-crm-leads.vercel.app/api/track`
4. Check if requests return 200 status

### Test 3: Check CRM Dashboard
1. Go to your CRM: https://zector-digital-crm-leads.vercel.app
2. Navigate to **Lead Tracking** or **Live Visitors**
3. You should see visitors from zectordigital.es appearing

## Step 5: Advanced Lead Identification

### For Contact Forms
Add this to your contact form submission:
```javascript
// When someone submits a contact form
window.ZectorLeadDigital.identifyLead({
  email: 'user@example.com',
  name: 'User Name',
  company: 'Company Name',
  phone: '+34 XXX XXX XXX',
  source: 'contact_form'
});
```

### For Newsletter Signups
```javascript
// Newsletter signup
window.ZectorLeadDigital.identifyLead({
  email: 'user@example.com',
  source: 'newsletter',
  interests: ['digital_marketing', 'web_development']
});
```

### For Custom Events
```javascript
// Track specific business events
window.ZectorLeadDigital.trackCustomEvent('quote_requested', {
  service: 'web_development',
  budget_range: '5000-10000',
  timeline: '2-3_months'
});
```

## Step 6: GDPR Compliance for Spain

The script includes GDPR compliance features:
- ✅ IP anonymization
- ✅ Consent banner (in Spanish)
- ✅ Local storage for consent tracking
- ✅ Option to disable tracking

### Customize the consent banner:
```javascript
// You can customize the consent message
var consentBanner = document.createElement('div');
consentBanner.innerHTML = `
  <p>Utilizamos cookies para analizar el tráfico y mejorar nuestros servicios.</p>
  <button onclick="window.ZectorLeadDigital.grantConsent()">Aceptar todas</button>
  <button onclick="window.ZectorLeadDigital.rejectTracking()">Rechazar</button>
`;
```
