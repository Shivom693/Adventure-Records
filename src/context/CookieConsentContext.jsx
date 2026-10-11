import React, { createContext, useContext, useState, useEffect } from 'react';

const CONSENT_KEY = 'adventure_records_cookie_consent_v3';
const CONSENT_VERSION = 'v3';

const defaultConsent = {
  version: CONSENT_VERSION,
  timestamp: null,
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false
};

const CookieConsentContext = createContext(null);

export const CookieConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === CONSENT_VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Unable to read cookie consent from localStorage', e);
    }
    return null;
  });

  const [showBanner, setShowBanner] = useState(() => consent === null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // If no consent has been given yet, banner should be shown
    if (consent === null) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [consent]);

  // Listen for global custom events to open settings modal from anywhere
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
    };
    window.addEventListener('adventure-open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('adventure-open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (updatedPreferences) => {
    const newConsent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: Boolean(updatedPreferences.analytics),
      marketing: Boolean(updatedPreferences.marketing),
      preferences: Boolean(updatedPreferences.preferences)
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    } catch (e) {
      console.error('Failed to save cookie consent:', e);
    }

    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);

    // Notify non-React or global listeners if analytics/marketing need gating
    window.dispatchEvent(
      new CustomEvent('adventure-cookie-consent-updated', { detail: newConsent })
    );
  };

  const acceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      preferences: true
    });
  };

  const rejectAll = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      preferences: false
    });
  };

  const openCookieSettings = () => {
    setShowSettings(true);
  };

  const closeCookieSettings = () => {
    setShowSettings(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent: consent || defaultConsent,
        hasConsented: consent !== null,
        showBanner,
        showSettings,
        acceptAll,
        rejectAll,
        saveConsent,
        openCookieSettings,
        closeCookieSettings
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

// Global helper for non-react or static triggers
export const triggerCookieSettingsModal = () => {
  window.dispatchEvent(new Event('adventure-open-cookie-settings'));
};
