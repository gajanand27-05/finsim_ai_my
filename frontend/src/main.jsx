import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

console.log("🚀 Stage 1: Basic React Mounting...");

const TestApp = () => (
  <div style={{ background: '#020617', color: 'white', padding: '50px', textAlign: 'center', minHeight: '100vh' }}>
    <h1 style={{ color: '#38bdf8' }}>FINSIM RECOVERY: STAGE 1 SUCCESS</h1>
    <p>React is rendering successfully. Now trying to load the main App...</p>
    <div id="app-loading-indicator" style={{ marginTop: '20px', color: '#94a3b8' }}>
      Waiting for App component import...
    </div>
  </div>
);

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);

// Now try to "hot-load" the real app to see if it crashes
import('./App.jsx').then((module) => {
  console.log("✅ Stage 2: App.jsx loaded successfully. Swapping roots...");
  const App = module.default;
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch((err) => {
  console.error("🔥 Stage 2 FAILED: App.jsx crash:", err);
  document.getElementById('app-loading-indicator').innerHTML = `
    <div style="color: #f87171; border: 1px solid #ef4444; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: left;">
      <strong>Error loading App.jsx:</strong><br/>
      ${err.message}
    </div>
  `;
});
