// EMERGENCY DEPLOYMENT: 2025-06-25 21:42:00 - FORCE NEW BUILD v5
// CRITICAL: Must deploy NEW LiveVisitors bundle to replace Qlpjt7JQ.js
import { createRoot } from 'react-dom/client';
import './index.css';
import './build-trigger.css'; // Force new build
import './i18n'; // Initialize i18n
import App from './App'; // Import the main App component
import { DEPLOYMENT_TIMESTAMP, FORCE_NEW_BUNDLE } from './deployment-marker';

console.log('🚨 EMERGENCY DEPLOYMENT v5: LiveVisitors substring error fix - 21:42:00');
console.log('🛡️ Deployment timestamp:', DEPLOYMENT_TIMESTAMP);
console.log('🛡️ Force new bundle:', FORCE_NEW_BUNDLE);
console.log('🛡️ New bundle MUST replace Qlpjt7JQ.js with ULTRA SAFE version');
console.log('🚀 Starting Zector Digital Leads CRM...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found");
  throw new Error("Root element not found");
}

try {
  console.log('✅ Creating React root...');
  const root = createRoot(rootElement);
  console.log('✅ Rendering main App component...');
  root.render(<App />); // Render the main application
  console.log('🎉 Zector Digital Leads CRM loaded successfully!');
} catch (error) {
  console.error('❌ Error loading React app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #fee; border: 1px solid #f00; color: #800; font-family: Arial;">
      <h1>🚨 React Loading Error</h1>
      <p>Error: ${error}</p>
      <p>Check browser console for more details.</p>
      <button onclick="location.reload()">Reload Page</button>
    </div>
  `;
}
