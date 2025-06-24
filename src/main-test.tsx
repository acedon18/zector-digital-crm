import { createRoot } from 'react-dom/client';
import './index.css';

console.log('🚀 Starting simple test...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found");
  throw new Error("Root element not found");
}

try {
  console.log('✅ Creating React root...');
  const root = createRoot(rootElement);
  console.log('✅ Rendering simple test component...');
  root.render(
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-600">If you can see this styled, Tailwind is working!</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
  console.log('🎉 Simple test loaded successfully!');
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
