import { createRoot } from 'react-dom/client';

console.log('🚀 Test script loaded!');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found");
} else {
  console.log("✅ Root element found");
  
  try {
    const root = createRoot(rootElement);
    console.log("✅ React root created");
    
    root.render(
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <h1>🎉 React is working!</h1>
        <p>This is a simple test to verify React is loading correctly.</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    );
    
    console.log("✅ React app rendered successfully!");
  } catch (error) {
    console.error("❌ Error rendering React app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee; border: 1px solid #f00; color: #800; font-family: Arial;">
        <h1>🚨 React Error</h1>
        <p>Error: ${error}</p>
      </div>
    `;
  }
}
