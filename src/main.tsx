// EMERGENCY DEPLOYMENT: 2025-06-25 20:40:00 - FORCE NEW BUILD
// CRITICAL: Must deploy LiveVisitors-CEKabh3E.js to replace Qlpjt7JQ.js
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n'; // Initialize i18n
import App from './App'; // Import the main App component

console.log('🚨 EMERGENCY DEPLOYMENT: LiveVisitors substring error fix');
console.log('🛡️ New bundle CEKabh3E.js should replace Qlpjt7JQ.js');
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
