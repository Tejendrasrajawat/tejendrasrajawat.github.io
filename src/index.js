import React from 'react';
import ReactDOM from 'react-dom';
import posthog from 'posthog-js';
import './index.css';
import App from './App';
import { ThemeProvider } from './pages/Theme';

const PH_KEY = process.env.REACT_APP_POSTHOG_KEY;
const PH_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

if (PH_KEY) {
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    capture_pageview: false,   // we fire these manually on SPA route changes
    capture_pageleave: true,
    autocapture: true,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

