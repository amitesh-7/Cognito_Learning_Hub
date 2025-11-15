import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext"; // Import the provider
import App from "./App.jsx";
import "./index.css";
import "./enhanced-animations.css"; // Modern animations and effects
import "./glassmorphism.css"; // Glassmorphism utilities
import "./styles/mobile-optimizations.css"; // Mobile performance optimizations
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";

// Register service worker for offline support
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
