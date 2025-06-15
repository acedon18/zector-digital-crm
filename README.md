# Zector Digital - Lead Intelligence Platform

En GDPR-kompatibel lead tracking och website intelligence plattform speciellt utvecklad för svenska byråer och deras kunder.

## 🆕 Recent Updates

### TypeScript Backend Improvements
The TypeScript implementation of our tracking server has been significantly improved:

- **Fixed TypeScript Errors** - Resolved issues with Express route handlers and typing
- **Properly Typed MongoDB Queries** - Replaced `any` types with proper interfaces
- **Enhanced Error Handling** - Improved error handling with consistent patterns
- **Documentation** - Added developer documentation for TypeScript implementation

For more details on the TypeScript improvements, see [TYPESCRIPT-FIX-IMPLEMENTATION.md](./TYPESCRIPT-FIX-IMPLEMENTATION.md).

### LiveVisitors Feature Implementation
The LiveVisitors (LeadTracker) feature has been fully implemented with the following enhancements:

- **MongoDB Integration** - Real-time visitor data is now stored in MongoDB Atlas
- **Advanced Filtering** - Filter leads by status (hot/warm/cold), industry, and search terms
- **Robust Error Handling** - Graceful fallbacks to in-memory data if database is unavailable
- **Improved UI/UX** - Cleaner display of company information with contact details
- **Real-time Updates** - See new visitors as they arrive on your website

See [README-BACKEND.md](./README-BACKEND.md) for detailed backend setup instructions.

## 🚀 Funktioner

### Lead Tracking & Management
- **Företagsidentifiering via IP-lookup** - Identifiera besökande företag automatiskt
- **Lead scoring och segmentering** - Konfigurerbar poängsättning baserat på beteende
- **Realtidsuppdateringar** - Se nya besökare direkt när de kommer till sajten
- **Export till CSV/Excel** - Enkelt att integrera med befintliga CRM-system

### Website Intelligence
- **Trafikanalys** - Detaljerad analys av besöksmönster och källor
- **Branschindelning** - Automatisk kategorisering av besökande företag
- **Engagemangsmätning** - Spåra tid på sida, sidor per session och återkommande besök
- **Konverteringsanalys** - Mät vilka företag som går från besökare till leads

### GDPR-Compliance
- **Cookie-hantering** - Inbyggt cookie-medgivandessystem
- **Datahantering** - Säker lagring och hantering av personuppgifter
- **Användarrättigheter** - Stöd för datarättigheter enligt GDPR
- **Tracking-script generator** - Anpassad implementering för varje kund

### Admin Panel (White-label)
- **Kundhantering** - Hantera byråns kunder och deras behörigheter
- **Intäktsuppföljning** - Spåra prenumerationer och intäkter
- **Konfiguration** - Anpassa inställningar per kund
- **Supportintegration** - Inbyggt supportsystem för kundservice

## 🛠️ Teknisk Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts för datavisualisering
- **State Management**: React Query + useState/useEffect
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns med svensk lokalisering

## 📦 Installation

1. **Klona repositoriet**
   ```bash
   git clone [repository-url]
   cd zector-digital-leads
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

4. **Öppna applikationen**
   ```
   http://localhost:5173
   ```

## 🎯 Funktionalitet

Denna applikation är nu komplett med:

- ✅ **Lead tracking** med svenska företagsdata (Volvo, Spotify, IKEA, Klarna, H&M)
- ✅ **Website Intelligence** med trafikanalys och branschindelning
- ✅ **GDPR-kompatibel tracking script generator**
- ✅ **Admin panel** för byråer att hantera kunder
- ✅ **Realtidsuppdateringar** av besökare
- ✅ **Lead scoring** med konfigurerbar poängsättning
- ✅ **Export funktionalitet** för CRM-integration
- ✅ **Responsiv design** med svenska lokalisering
- ✅ **Error handling** och loading states
- ✅ **White-label ready** för byråanpassning

## 🔧 Utveckling

Applikationen körs nu på `http://localhost:5173` och alla funktioner är testbara med mock-data.

### Nästa steg för produktion:
1. Implementera riktiga API endpoints
2. Lägg till autentisering/auktorisering
3. Integrera med IP-lookup tjänster
4. Konfigurera databas
5. Implementera CRM-integrationer

---

Utvecklad för svenska byråer som vill erbjuda lead intelligence till sina kunder.
