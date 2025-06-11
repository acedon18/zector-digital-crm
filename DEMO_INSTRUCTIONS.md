# 🚀 Zector Digital CRM - Demo Instructions

## Snabbstart för att visa systemet

### 1. Klona projektet
```bash
git clone https://github.com/acedon18/zector-digital-crm.git
cd zector-digital-crm
```

### 2. Installera dependencies
```bash
npm install
```

### 3. Starta utvecklingsservern
```bash
npm run dev
```

### 4. Öppna i webbläsaren
Gå till: `http://localhost:5173` (eller den port som visas i terminalen)

## 🌟 Huvudfunktioner att visa

### 📊 Dashboard
- **URL:** `/` 
- Visar leads, statistik och live-aktivitet
- Dynamiska charts och grafer

### 🏢 Lead Tracking  
- **URL:** `/lead-tracking`
- Spåra företag som besöker webbplatsen
- Filtrera och söka bland leads

### 🤖 AI Lead Qualification
- **URL:** `/ai-qualification` 
- AI-driven lead-bedömning
- Automatiska rekommendationer
- Beteendeanalys

### ⚙️ Inställningar
- **URL:** `/settings`
- GDPR-kompatibla tracking-inställningar
- Integrationsmöjligheter
- Notifieringsinställningar

### 👨‍💼 Admin Panel
- **URL:** `/admin-panel`
- Kundhantering
- Script-generator
- Systemöversikt

## 🌍 Internationalisering
Systemet stöder 3 språk:
- **Svenska** (sv) - Primärt språk
- **English** (en) - Sekundärt språk  
- **Español** (es) - Tredje språk

Växla språk med språkväljaren i header.

## 🔧 Teknisk Stack
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Internationalisering:** react-i18next
- **Build Tool:** Vite

## 📱 Responsiv Design
Systemet är fullt responsivt och fungerar på:
- Desktop
- Tablet  
- Mobil

## 🛡️ GDPR-Kompatibilitet
- IP-anonymisering
- Cookie-medgivanden
- Datalagring enligt svenska regler
- Automatisk datarensning

---

**Utvecklad av:** Zector Digital Team  
**Version:** 2.1 (Fully Internationalized)  
**Senast uppdaterad:** December 2024

## ✨ Key Features Implemented

### 🌍 **Complete Internationalization (i18n)**
- **Full Language Support**: Swedish (primary), English, and Spanish
- **Comprehensive Translation Coverage**: All user-facing text is translated
- **Dynamic Language Switching**: Real-time language switching via the language selector
- **Components Internationalized**:
  - ✅ AI Lead Qualification system
  - ✅ Onboarding Wizard with multi-step forms
  - ✅ Admin Panel for customer management
  - ✅ Email Alert System configuration
  - ✅ Lead Tracking and filtering
  - ✅ Settings and privacy controls
  - ✅ Billing and subscription management
  - ✅ Company profiles and analytics
  - ✅ All dashboard components and navigation
- **Translation Keys**: 200+ translation keys across all components
- **Interpolation Support**: Dynamic content with variable substitution (e.g., "{{count}} companies found")

### 🎯 **Advanced Lead Intelligence**
- Real-time visitor tracking
- Company identification
- Behavioral scoring system
- AI-powered lead qualification
- Automated recommendations

### 📊 **Analytics & Reporting**
- Interactive dashboards
- Revenue tracking
- Conversion analytics
- Export capabilities
- Real-time metrics
