🏢 ZECTOR DIGITAL CRM - ADMIN CLIENT ONBOARDING WORKFLOW
============================================================

## Complete Process: How You (Admin) Onboard New Clients

### 📋 STEP-BY-STEP ADMIN PROCESS:

**1️⃣ GATHER CLIENT INFORMATION**
   • Company Name: Acme Corporation
   • Domain: acme.com
   • Plan: Professional (99 USD/month)
   • Admin Name: John Smith
   • Admin Email: admin@acme.com
   • Phone: +1-555-123-4567

**2️⃣ CREATE TENANT IN SYSTEM**
   API Call: POST /api/tenants
   {
     "name": "Acme Corporation",
     "domain": "acme.com",
     "plan": "professional",
     "settings": { "brandColor": "#0066cc" }
   }
   ✅ Result: Tenant ID = acme-corp-a8f2d1

**3️⃣ CREATE ADMIN USER**
   API Call: POST /api/users
   {
     "tenantId": "acme-corp-a8f2d1",
     "email": "admin@acme.com",
     "name": "John Smith",
     "role": "admin"
   }
   ✅ Result: Temporary Password = TempPass123!

**4️⃣ GENERATE TRACKING SCRIPT**
   ```html
   <!-- Zector Digital Lead Tracking Script for acme.com -->
   <script>
   (function() {
     var script = document.createElement('script');
     script.src = 'https://zector-digital-crm-leads.vercel.app/tracking.js';
     script.setAttribute('data-tenant-id', 'acme-corp-a8f2d1');
     script.setAttribute('data-domain', 'acme.com');
     script.setAttribute('data-track-leads', 'true');
     script.async = true;
     document.head.appendChild(script);
   })();
   </script>
   ```

**5️⃣ PREPARE WELCOME PACKAGE**
   📧 Welcome Email Contents:
   • Dashboard URL: https://zector-digital-crm-leads.vercel.app
   • Login Email: admin@acme.com
   • Temporary Password: TempPass123!
   • Tenant ID: acme-corp-a8f2d1
   • Installation guide with tracking script

**6️⃣ CLIENT RECEIVES & ACTS**
   ✅ Client logs into dashboard
   ✅ Changes temporary password
   ✅ Installs tracking script on website
   ✅ Starts receiving lead data

## 📊 PLAN LIMITS AUTOMATICALLY ENFORCED:
   • Monthly Visits: 50,000
   • Users: 10 maximum
   • Data Retention: 365 days
   • API Calls: 25,000/month
   • Custom Branding: ✅ Enabled
   • Advanced Analytics: ✅ Enabled

## 🔒 SECURITY & ISOLATION:
   ✅ Complete data isolation per tenant
   ✅ JWT tokens include tenant context
   ✅ All API calls filtered by tenantId
   ✅ Role-based permissions enforced

## 🚀 AUTOMATION FEATURES:
   ✅ Automatic trial period (30 days)
   ✅ Usage monitoring and alerts
   ✅ Billing integration ready
   ✅ Auto-generated documentation

## 🎯 REAL COMMANDS TO ONBOARD A CLIENT:

**Option 1 - Interactive CLI:**
```
node scripts/interactive-onboard.js
```

**Option 2 - Direct API calls:**
```
node scripts/admin-onboard-client.js
```

**Option 3 - Manual via Dashboard:**
1. Login to admin dashboard
2. Navigate to "Add New Tenant"
3. Fill out client information form
4. Generate and send credentials

## ✅ ONBOARDING COMPLETE!
Your client is now fully set up with their own isolated CRM environment!

## 🔄 WHAT HAPPENS AFTER ONBOARDING:

**For You (Admin):**
- Monitor client usage and performance
- Handle support requests
- Manage billing and subscriptions
- Add new users as needed
- Upgrade/downgrade plans

**For Your Client:**
- Receives isolated dashboard with their branding
- Gets real-time lead tracking from their website
- Can manage their team users
- Views analytics specific to their domain
- Receives email alerts for new leads

**Data Isolation:**
- Client A cannot see Client B's data
- Each tenant has completely separate:
  - User accounts
  - Visitor tracking data
  - Company/lead information
  - Settings and customization
  - Usage analytics

## 💰 BUSINESS MODEL:
- **Starter Plan**: $29/month - 10K visits, 3 users
- **Professional Plan**: $99/month - 50K visits, 10 users  
- **Enterprise Plan**: $299/month - 250K visits, 50 users

Each client pays you directly, and you provide them with their own isolated CRM environment!

## 🎯 READY TO START ONBOARDING CLIENTS!
The system is fully functional and ready for production use.
