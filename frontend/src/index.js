import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
// import App from "@/App";
import App from './App-v1';

// Suppress ResizeObserver loop errors (harmless browser errors from Radix UI)
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Also suppress in console
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args[0]?.message || args[0];
  if (typeof msg === 'string' &&
      (msg.includes('ResizeObserver loop') ||
       msg.includes('ResizeObserver loop completed'))) {
    return;
  }
  originalConsoleError(...args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
