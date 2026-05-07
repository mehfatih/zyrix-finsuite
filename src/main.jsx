import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/i18n';
import { CountryProvider } from './hooks/useCountry.jsx';
import "./styles/mobile-fixes.css";
import "./styles/a11y.css";
import { initAnalytics } from "./utils/analytics";
import { initErrorReporting } from "./utils/errorReporting";
import { initWebVitals } from "./utils/performance";

initAnalytics();
initErrorReporting();
initWebVitals();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CountryProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </CountryProvider>
  </React.StrictMode>
);
