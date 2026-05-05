import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/i18n';
import { CountryProvider } from './hooks/useCountry.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CountryProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </CountryProvider>
  </React.StrictMode>
);
