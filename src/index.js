import React from 'react';
import ReactDOM from 'react-dom';
import posthog from 'posthog-js';
import './index.css';
import App from './App';
import { ThemeProvider } from './pages/Theme';

const PH_KEY = process.env.REACT_APP_POSTHOG_KEY || 'phc_AzfY6u0HSlNg9bIX3fNMP9QRtX0a2nRSfML10GhUqTM';
const PH_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

if (PH_KEY) {
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    capture_pageview: false,   // we fire these manually on SPA route changes
    capture_pageleave: true,
    autocapture: true,
  });
} else if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[PostHog] Not initialized: REACT_APP_POSTHOG_KEY is missing. Copy .env.example to .env and add your project API key.'
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

