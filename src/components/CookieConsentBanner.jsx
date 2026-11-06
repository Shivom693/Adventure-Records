import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Settings, Lock, X, Check, Cookie } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

/* ─── Main Banner Component ─────────────────────────────────────────── */
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

  const [localAnalytics, setLocalAnalytics]     = useState(false);
  const [localMarketing, setLocalMarketing]     = useState(false);
  const [localPreferences, setLocalPreferences] = useState(false);

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
      analytics:   localAnalytics,
      marketing:   localMarketing,
      preferences: localPreferences
    });
  };

  // Lock body scroll when settings modal is open
  useEffect(() => {
    document.body.style.overflow = showSettings ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSettings]);

  return (
    <>
      {/* ── Small Floating Popup (bottom-right) ───────────────────── */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            key="cookie-popup"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-live="polite"
            aria-labelledby="cookie-popup-title"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 9999,
              width: '100%',
              maxWidth: '340px',
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.97)',
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '1.25rem',
                boxShadow:
                  '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <div style={{
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              }} />

              <div style={{ padding: '1rem 1.1rem 1.1rem' }}>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck
                      style={{ width: '1rem', height: '1rem', color: '#6366f1', flexShrink: 0 }}
                    />
                    <span
                      id="cookie-popup-title"
                      style={{
                        fontFamily: "'Outfit','Inter',sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#050315',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Privacy &amp; Necessary Data
                    </span>
                  </div>
                  {/* X button */}
                  <button
                    type="button"
                    onClick={rejectAll}
                    aria-label="Dismiss"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#71717a',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <X style={{ width: '0.9rem', height: '0.9rem' }} />
                  </button>
                </div>

                {/* Body text */}
                <p style={{
                  fontSize: '0.72rem',
                  lineHeight: 1.55,
                  color: '#52525b',
                  marginBottom: '1rem',
                }}>
                  We strictly adhere to{' '}
                  <strong style={{ color: '#050315', fontWeight: 600 }}>data minimization</strong>
                  . We only collect details required for logistics services &amp; session security.{' '}
                  <Link
                    to="/privacy-policy"
                    style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    Learn more
                  </Link>
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                  {/* Essential Only */}
                  <button
                    type="button"
                    onClick={rejectAll}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.6rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid rgba(0,0,0,0.14)',
                      background: '#ffffff',
                      color: '#050315',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Outfit','Inter',sans-serif",
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'}
                  >
                    Essential Only
                  </button>

                  {/* Customize */}
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.6rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid rgba(0,0,0,0.14)',
                      background: '#ffffff',
                      color: '#050315',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Outfit','Inter',sans-serif",
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'}
                  >
                    Customize
                  </button>

                  {/* Accept All */}
                  <button
                    type="button"
                    onClick={acceptAll}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.6rem',
                      borderRadius: '0.65rem',
                      border: 'none',
                      background: '#050315',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Outfit','Inter',sans-serif",
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1f1f2e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#050315'}
                  >
                    Accept All
                  </button>
                </div>

                {/* DPDP compliance badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  marginTop: '0.65rem',
                }}>
                  <ShieldCheck style={{ width: '0.65rem', height: '0.65rem', color: '#059669' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#059669' }}>
                    DPDP Act 2023 Compliant
                  </span>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Cookie Re-open Button ────────────────────────── */}
      <AnimatePresence>
        {!showBanner && !showSettings && (
          <motion.button
            key="cookie-fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1   }}
            exit={{    opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={openCookieSettings}
            title="Cookie Preferences"
            aria-label="Open Cookie Preferences"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '1.5rem',
              zIndex: 9990,
              background: 'rgba(255,255,255,0.97)',
              border: '1.5px solid rgba(0,0,0,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              borderRadius: '9999px',
              padding: '0.55rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Cookie style={{ width: '1.1rem', height: '1.1rem', color: '#6366f1' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Full Cookie Settings Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            onClick={e => { if (e.target === e.currentTarget) closeCookieSettings(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.10)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Accent line */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)', flexShrink: 0 }} />

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '1.4rem 1.5rem 1rem',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      background: '#050315', borderRadius: '0.5rem', padding: '0.35rem',
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Settings style={{ width: '0.9rem', height: '0.9rem', color: '#fff' }} />
                    </span>
                    <h2
                      id="cookie-settings-title"
                      style={{ fontFamily: "'Outfit','Inter',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#050315' }}
                    >
                      Cookie Preferences
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#71717a', lineHeight: 1.5, maxWidth: '380px' }}>
                    Customize which cookie categories you allow. Essential cookies cannot be turned off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCookieSettings}
                  aria-label="Close"
                  style={{
                    background: '#f4f4f6', border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: '0.6rem', padding: '0.35rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                  }}
                >
                  <X style={{ width: '0.9rem', height: '0.9rem', color: '#52525b' }} />
                </button>
              </div>

              {/* Categories — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <SettingsRow
                  number="1" title="Necessary Cookies" alwaysOn
                  desc="Required for secure login, Firebase Auth sessions, and core security. Cannot be disabled."
                />
                <SettingsRow
                  number="2" title="Analytics Cookies"
                  desc="Traffic patterns & page metrics to help us improve user experience."
                  checked={localAnalytics} onChange={setLocalAnalytics}
                />
                <SettingsRow
                  number="3" title="Marketing Cookies"
                  desc="Promotions, announcements, and campaign effectiveness measurement."
                  checked={localMarketing} onChange={setLocalMarketing}
                />
                <SettingsRow
                  number="4" title="Preferences Cookies"
                  desc="Theme, language, and audio player settings."
                  checked={localPreferences} onChange={setLocalPreferences}
                />
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                flexWrap: 'wrap',
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}>
                <button
                  type="button" onClick={rejectAll}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: '0.75rem',
                    border: '1.5px solid rgba(0,0,0,0.14)', background: '#ffffff',
                    color: '#050315', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Outfit','Inter',sans-serif",
                  }}
                >
                  Reject All
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button" onClick={handleSavePreferences}
                    style={{
                      padding: '0.55rem 1.1rem', borderRadius: '0.75rem',
                      border: '1.5px solid rgba(0,0,0,0.14)', background: '#ffffff',
                      color: '#050315', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Outfit','Inter',sans-serif",
                    }}
                  >
                    Save Preferences
                  </button>
                  <button
                    type="button" onClick={acceptAll}
                    style={{
                      padding: '0.55rem 1.1rem', borderRadius: '0.75rem',
                      border: 'none', background: '#050315',
                      color: '#ffffff', fontSize: '0.75rem', fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'Outfit','Inter',sans-serif",
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
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

/* ─── Settings Row ──────────────────────────────────────────────────── */
const SettingsRow = ({ number, title, desc, alwaysOn, checked, onChange }) => (
  <div style={{
    background: alwaysOn ? '#f9f9fb' : '#ffffff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '0.9rem',
    padding: '0.85rem 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Outfit','Inter',sans-serif", fontWeight: 700, fontSize: '0.78rem', color: '#050315' }}>
          {number}. {title}
        </span>
        {alwaysOn && (
          <span style={{
            background: '#050315', color: '#fff', borderRadius: '9999px',
            padding: '1px 7px', fontSize: '0.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <Lock style={{ width: '0.55rem', height: '0.55rem' }} /> Always On
          </span>
        )}
        {!alwaysOn && (
          <span style={{
            background: '#f4f4f6', color: '#71717a', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '9999px', padding: '1px 7px', fontSize: '0.6rem', fontWeight: 600,
          }}>
            Optional
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.68rem', color: '#71717a', lineHeight: 1.5 }}>{desc}</p>
    </div>
    <div style={{ flexShrink: 0 }}>
      {alwaysOn ? (
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <Toggle checked={true} onChange={() => {}} />
        </div>
      ) : (
        <Toggle checked={checked} onChange={onChange} />
      )}
    </div>
  </div>
);

/* ─── Toggle Switch ─────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
    />
    <div style={{
      width: '2.4rem', height: '1.3rem', borderRadius: '9999px',
      background: checked ? '#6366f1' : '#d4d4d8',
      position: 'relative', transition: 'background 0.2s ease',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute',
        top: '0.15rem',
        left: checked ? 'calc(100% - 1.1rem)' : '0.15rem',
        width: '1rem', height: '1rem',
        borderRadius: '9999px',
        background: '#ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  </label>
);

export default CookieConsentBanner;
