import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Settings, Lock, X, Check, Cookie, ChevronUp, ChevronDown } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

const CookieConsentBanner = () => {
  const {
    consent,
    showBanner,
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
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (consent) {
      setLocalAnalytics(Boolean(consent.analytics));
      setLocalMarketing(Boolean(consent.marketing));
      setLocalPreferences(Boolean(consent.preferences));
    } else {
      setLocalAnalytics(false);
      setLocalMarketing(false);
      setLocalPreferences(false);
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
    if (showSettings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSettings]);

  return (
    <>
      {/* ── Bottom Slide-up Cookie Popup ── */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            key="cookie-popup"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}
            role="dialog"
            aria-live="polite"
            aria-labelledby="cookie-popup-title"
          >
            {/* Solid panel — works in both light & dark */}
            <div
              style={{
                background: 'var(--bg-nav)',
                borderTop: '1px solid var(--border-default)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              }}
              className="font-outfit"
            >
              {/* Top accent gradient line */}
              <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500 w-full" />

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

                {/* Main row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">

                  {/* Icon + Text */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="shrink-0 mt-0.5 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                      <Cookie className="w-5 h-5 text-emerald-500" />
                    </span>
                    <div className="min-w-0">
                      <h2
                        id="cookie-popup-title"
                        className="font-heading text-sm sm:text-base font-bold mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        We use cookies 🍪
                      </h2>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.75 }}>
                        We use cookies to enhance your experience, analyze traffic, and personalize content.{' '}
                        <Link
                          to="/privacy-policy"
                          style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                          Privacy Policy
                        </Link>
                        {' · '}
                        <button
                          type="button"
                          onClick={() => setShowDetails(v => !v)}
                          style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                          className="underline underline-offset-2 hover:opacity-70 transition-opacity inline-flex items-center gap-1 cursor-pointer"
                        >
                          {showDetails ? 'Hide details' : 'View details'}
                          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">DPDP Act 2023 Compliant</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Reject */}
                    <button
                      id="cookie-reject-btn"
                      type="button"
                      onClick={rejectAll}
                      style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1.5px solid var(--border-muted)',
                      }}
                      className="py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:opacity-80 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      Reject All
                    </button>

                    {/* Customize */}
                    <button
                      id="cookie-customize-btn"
                      type="button"
                      onClick={openCookieSettings}
                      style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1.5px solid var(--border-muted)',
                      }}
                      className="py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:opacity-80 active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Customize
                    </button>

                    {/* Accept All */}
                    <button
                      id="cookie-accept-btn"
                      type="button"
                      onClick={acceptAll}
                      style={{
                        background: 'var(--btn-primary-bg)',
                        color: 'var(--btn-primary-text)',
                        border: '1.5px solid var(--btn-primary-bg)',
                      }}
                      className="py-2 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept All
                    </button>

                    {/* X Dismiss */}
                    <button
                      type="button"
                      onClick={rejectAll}
                      style={{ color: 'var(--text-secondary)' }}
                      className="p-2 rounded-xl hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                      aria-label="Dismiss cookie notice"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}
                      >
                        {/* Necessary */}
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }} className="p-3 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Necessary</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
                              <Lock className="w-2.5 h-2.5" /> Always On
                            </span>
                          </div>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>Login, auth, and core security.</p>
                        </div>

                        {/* Analytics */}
                        <DetailToggleCard
                          label="Analytics"
                          desc="Traffic patterns & page metrics."
                          checked={localAnalytics}
                          onChange={setLocalAnalytics}
                        />

                        {/* Marketing */}
                        <DetailToggleCard
                          label="Marketing"
                          desc="Promotions & campaign measurement."
                          checked={localMarketing}
                          onChange={setLocalMarketing}
                        />

                        {/* Preferences */}
                        <DetailToggleCard
                          label="Preferences"
                          desc="Theme, language & audio settings."
                          checked={localPreferences}
                          onChange={setLocalPreferences}
                        />
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSavePreferences}
                          style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                          className="py-2 px-5 rounded-xl text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-md"
                        >
                          Save My Preferences
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating cookie re-open button when banner is hidden */}
      <AnimatePresence>
        {!showBanner && !showSettings && (
          <motion.button
            key="cookie-fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={openCookieSettings}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '1.5rem',
              zIndex: 9990,
              background: 'var(--bg-nav)',
              border: '1.5px solid var(--border-default)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            className="p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
            title="Cookie Preferences"
            aria-label="Open Cookie Preferences"
          >
            <Cookie className="w-5 h-5 text-emerald-500 group-hover:rotate-12 transition-transform duration-200" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Full Cookie Settings Modal ── */}
      <AnimatePresence>
        {showSettings && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              }}
              className="w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 sm:p-8 font-outfit flex flex-col relative overflow-hidden"
            >
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500 rounded-t-3xl" />

              {/* Header */}
              <div
                className="flex items-start justify-between pb-4 mb-4 mt-1 shrink-0"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="p-2 rounded-xl"
                      style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                    >
                      <Settings className="w-5 h-5" />
                    </span>
                    <h2 id="cookie-settings-title" className="font-heading text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      Cookie Preferences
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                    Customize which cookie categories you allow. Essential cookies cannot be turned off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCookieSettings}
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                  className="p-2 rounded-xl hover:opacity-80 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close Cookie Settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">

                {/* Necessary */}
                <SettingsRow
                  number="1"
                  title="Necessary Cookies"
                  desc="Required for basic website functionality, secure login, authentication persistence (Firebase Auth), session management, and basic security."
                  alwaysOn
                />

                {/* Analytics */}
                <SettingsRow
                  number="2"
                  title="Analytics Cookies"
                  desc="Used to understand website usage, traffic patterns, and page metrics to help us optimize user experience."
                  checked={localAnalytics}
                  onChange={setLocalAnalytics}
                />

                {/* Marketing */}
                <SettingsRow
                  number="3"
                  title="Marketing / Advertising Cookies"
                  desc="Used to deliver relevant promotional content, announcements, and measure campaign effectiveness."
                  checked={localMarketing}
                  onChange={setLocalMarketing}
                />

                {/* Preferences */}
                <SettingsRow
                  number="4"
                  title="Preferences Cookies"
                  desc="Used to remember user preferences, interface customization, language selections, and custom audio player settings."
                  checked={localPreferences}
                  onChange={setLocalPreferences}
                />
              </div>

              {/* Footer */}
              <div
                className="pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <button
                  type="button"
                  onClick={rejectAll}
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1.5px solid var(--border-muted)' }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all hover:opacity-80 cursor-pointer"
                >
                  Reject All
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all hover:opacity-90 shadow-md cursor-pointer"
                  >
                    Save Preferences
                  </button>

                  <button
                    type="button"
                    onClick={acceptAll}
                    style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all hover:opacity-90 shadow-md cursor-pointer"
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

/* ── Small helper sub-components ── */

const DetailToggleCard = ({ label, desc, checked, onChange }) => (
  <div
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
    className="p-3 rounded-xl transition-colors"
  >
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{desc}</p>
  </div>
);

const SettingsRow = ({ number, title, desc, alwaysOn, checked, onChange }) => (
  <div
    style={{ background: alwaysOn ? 'var(--bg-elevated)' : 'var(--bg-card)', border: '1px solid var(--border-default)' }}
    className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  >
    <div className="space-y-1 pr-2">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{number}. {title}</h3>
        {alwaysOn ? (
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            <Lock className="w-3 h-3" /> Always Active
          </span>
        ) : (
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            Optional
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{desc}</p>
    </div>

    <div className="shrink-0">
      {alwaysOn ? (
        <div className="opacity-60 pointer-events-none">
          <Toggle checked={true} onChange={() => {}} />
        </div>
      ) : (
        <Toggle checked={checked} onChange={onChange} />
      )}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-600 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
  </label>
);

export default CookieConsentBanner;
