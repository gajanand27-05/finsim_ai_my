import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("🚀 FINSIM Entry Point: main.jsx loaded");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element identified, mounting React tree...");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
