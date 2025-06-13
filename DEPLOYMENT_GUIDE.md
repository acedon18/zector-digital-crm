# 🚀 Zector Digital CRM - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. **Environment Configuration**
```bash
# Copy and configure environment variables
cp .env.example .env

# Configure required API keys in .env:
VITE_CLEARBIT_API_KEY=your_actual_clearbit_key
VITE_HUNTER_API_KEY=your_actual_hunter_key
VITE_IPINFO_TOKEN=your_actual_ipinfo_token
```

### 2. **Database Setup**
Configure your preferred database for visitor tracking:
- PostgreSQL (recommended)
- MySQL
- MongoDB

### 3. **Tracking Server Deployment**
Deploy the tracking server (`src/backend/trackingServer.ts`) to:
- Vercel
- Netlify Functions
- AWS Lambda
- Traditional Node.js server

---

## 🔨 **Build Commands**

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Linting
```bash
npm run lint
```

---

## 🌐 **Deployment Options**

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: Configure in Netlify dashboard
```

### Option 3: Traditional Hosting
```bash
# Build the project
npm run build

# Upload dist/ folder to your web server
# Configure reverse proxy for tracking API endpoints
```

---

## 🔐 **Security Configuration**

### CORS Setup (Important!)
```javascript
// In your tracking server
app.use(cors({
  origin: ['https://yourdomain.com', 'https://client-domain.com'],
  credentials: true
}));
```

### GDPR Compliance
- Ensure tracking scripts include proper consent mechanisms
- Configure data retention policies
- Implement data deletion procedures

---

## 📊 **Monitoring & Analytics**

### Application Monitoring
- Set up error tracking (Sentry recommended)
- Configure performance monitoring
- Monitor API endpoint health

### Tracking Performance
- Monitor visitor data collection
- Track API response times
- Monitor data enrichment success rates

---

## 🔧 **Post-Deployment Tasks**

### 1. **Test All Features**
- [ ] Language switching (EN/ES/SV)
- [ ] Visitor tracking
- [ ] Data enrichment
- [ ] Export functionality
- [ ] Platform integrations

### 2. **Configure Customer Accounts**
- [ ] Create customer profiles
- [ ] Set up tracking domains
- [ ] Configure branding settings
- [ ] Test tracking script generation

### 3. **Monitor Performance**
- [ ] Check error logs
- [ ] Verify API integrations
- [ ] Test data collection
- [ ] Validate GDPR compliance

---

## 📞 **Support & Maintenance**

### Regular Tasks
- Monitor API key usage and limits
- Update dependencies monthly
- Backup visitor data
- Review GDPR compliance

### Emergency Contacts
- Support: support@zectordigital.com
- Technical: tech@zectordigital.com

---

**🎯 Your CRM is ready for production deployment!**
