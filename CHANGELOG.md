# Changelog - Adventure Records

All notable changes and architectural updates for Adventure Records are documented in this file.

---

## [1.2.0] - 2026-11-15

### Added
- **Google Drive Submission Integration:** Support for direct master audio and high-resolution cover artwork ingestion via Google Drive sharing URLs.
- **Enhanced Drive Link Validation:** Broad link format acceptance for `/file/d/`, `/open?id=`, `uc?id=`, and standard Drive URLs without URL corruption.
- **Admin Direct Access Tools:** Instant "Open Drive Link" (new tab with security attributes) and 1-click clipboard copy with visual confirmation.
- **Multi-Track Breakdown:** Granular per-track Drive links for EP and Album submissions in both queue cards and the review modal.

### Changed
- **Firestore Schema Modernization:** Persistent top-level storage of `audioDriveLink`, `artworkDriveLink`, `audioUrl`, and embedded `tracks` array.
- **Backward Compatibility:** Hydration fallback in `fetchAllReleasesAdmin` and `fetchUserReleases` to backfill audio links for historical submissions from the `tracks` collection.

---

## [1.1.0] - 2026-11-14

### Added
- **Automated Dynamic UPI QR Payments:** Replaced legacy Razorpay manual verification with native Cashfree Dynamic UPI QR gateway integration.
- **Instant Release Unlocking:** Automatic unlock upon cryptographically verified gateway webhook or real-time polling check.
- **Automated Payment Test Suite:** 10 end-to-end automated tests verifying order creation, webhook signatures, idempotency, underpayment rejection, and fraud blacklisting.

### Removed
- Completely removed manual "I Have Paid", "Check Status", UTR input fields, and screenshot verification dependencies.

---

## [1.0.0] - 2026-11-12

### Added
- **Global Theme & WCAG Contrast Fixes:** Comprehensive dark and light mode audit ensuring readable text, visible input fields, and consistent card contrast.
- **Security & Fraud Mitigation:** Hardened blacklisting checks for flagged fraudulent accounts and fake transaction references.
