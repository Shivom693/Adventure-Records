import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock, X } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

const CookieConsentBanner = () => {
  const {
    consent,
    showBanner,
    setShowBanner,
    showSettings,
    acceptAll,
    rejectAll,
    saveConsent,
    openCookieSettings,
    closeCookieSettings
  } = useCookieConsent();

  const [localAnalytics, setLocalAnalytics] = useState(false);
  const [localMarketing, setLocalMarketing] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(false);

  useEffect(() => {
    if (consent) {
      setLocalAnalytics(Boolean(consent.analytics));
      setLocalMarketing(Boolean(consent.marketing));
      setLocalPreferences(Boolean(consent.preferences));
    }
  }, [consent, showSettings]);

  const handleSavePreferences = () => {
    saveConsent({
      analytics: localAnalytics,
      marketing: localMarketing,
      preferences: localPreferences
    });
  };

  useEffect(() => {
    document.body.style.overflow = showSettings ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSettings]);

  return (
    <>
      {/* ── Compact Privacy & Necessary Data Popup ── */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            key="cookie-mini-popup"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-live="polite"
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[9999] w-[calc(100vw-2rem)] max-w-[390px]"
          >
            <div className="cookie-mini-popup bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] font-sans">
              
              {/* Header row: Shield + Title + Close X */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Duotone Shield icon matching screenshot */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] shrink-0"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3.2L5.4 5.6v5.49c0 4.2 2.8 8.1 6.6 9.2V3.2z"
                      fill="#94a3b8"
                    />
                  </svg>
                  <h3 className="font-semibold text-slate-800 text-[14px] sm:text-[15px] tracking-tight m-0">
                    Privacy &amp; Necessary Data
                  </h3>
                </div>

                {/* Close 'X' Button */}
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Dismiss cookie notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body text */}
              <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-600 my-2.5 font-normal">
                We strictly adhere to <strong className="font-bold text-slate-800">data minimization</strong>. We only collect details required for logistics services &amp; session security.
              </p>

              {/* Action buttons row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={rejectAll}
                  className="flex-1 py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold text-[12px] sm:text-[12.5px] hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all cursor-pointer text-center whitespace-nowrap"
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="flex-1 py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold text-[12px] sm:text-[12.5px] hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all cursor-pointer text-center whitespace-nowrap"
                >
                  Customize
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-[#0f172a] text-white font-bold text-[12px] sm:text-[12.5px] hover:bg-[#1e293b] active:scale-95 transition-all cursor-pointer text-center whitespace-nowrap shadow-sm"
                >
                  Accept All
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Re-open Cookie Button (bottom-left when closed) ── */}
      <AnimatePresence>
        {!showBanner && !showSettings && (
          <motion.button
            key="cookie-fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={() => setShowBanner(true)}
            title="Privacy & Cookie Preferences"
            aria-label="Open Privacy & Cookie Preferences"
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[9990] p-2.5 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-slate-600 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 shrink-0"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3.2L5.4 5.6v5.49c0 4.2 2.8 8.1 6.6 9.2V3.2z"
                fill="#94a3b8"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Full Settings Modal (Customize) ── */}
      <AnimatePresence>
        {showSettings && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeCookieSettings();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="cookie-mini-popup w-full max-w-xl max-h-[90vh] bg-white rounded-2xl p-6 sm:p-7 flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="cookie-settings-title"
                      className="font-bold text-lg text-slate-900 m-0"
                    >
                      Cookie Preferences
                    </h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Configure your cookie preferences. Essential cookies are required for system security.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeCookieSettings}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Toggles */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <SettingsCard
                  title="Necessary Cookies"
                  desc="Required for user authentication, session persistence, and API security."
                  alwaysOn
                />
                <SettingsCard
                  title="Analytics Cookies"
                  desc="Helps us understand platform usage patterns to optimize performance."
                  checked={localAnalytics}
                  onChange={setLocalAnalytics}
                />
                <SettingsCard
                  title="Marketing Cookies"
                  desc="Used to announce feature updates and evaluate distribution campaigns."
                  checked={localMarketing}
                  onChange={setLocalMarketing}
                />
                <SettingsCard
                  title="Preferences Cookies"
                  desc="Remembers your language, theme, and audio playback settings."
                  checked={localPreferences}
                  onChange={setLocalPreferences}
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={rejectAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reject All
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                  >
                    Accept All
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Toggle Sub-component ── */
const SettingsCard = ({ title, desc, alwaysOn, checked, onChange }) => (
  <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-slate-900">{title}</span>
        {alwaysOn ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Required
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-600">
            Optional
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 m-0 leading-relaxed">{desc}</p>
    </div>
    <div className="shrink-0">
      {alwaysOn ? (
        <div className="opacity-50 pointer-events-none">
          <ToggleSwitch checked={true} onChange={() => {}} />
        </div>
      ) : (
        <ToggleSwitch checked={checked} onChange={onChange} />
      )}
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-slate-900 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
  </label>
);

export default CookieConsentBanner;
