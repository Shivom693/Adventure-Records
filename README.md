# Adventure Records - Music Streaming & Distribution Platform

A modern, full-stack music distribution and streaming platform built for independent artists and record labels. Powered by React, Vite, Tailwind CSS, Cloud Firestore, Firebase Hosting, and an Express.js backend with automated Dynamic UPI QR payment verification.

---

## 🌟 Key Features

### 1. Dynamic UPI QR Automated Payments
- Direct UPI payment integration supporting Google Pay, PhonePe, Paytm, and BHIM.
- Automated payment order generation with dynamic per-order UPI QR codes.
- Zero manual verification: removes manual UTR entry, screenshot uploads, and "I Have Paid" buttons.
- Real-time status synchronization via webhooks and background status polling.
- Immediate release unlock upon verified transaction confirmation.

### 2. Google Drive Submission & Ingestion Pipeline
- Artists submit master audio files (WAV, FLAC, MP3) and high-resolution cover artwork via Google Drive sharing links.
- Supports all standard Drive link formats (`/file/d/`, `/open?id=`, `uc?id=`, etc.).
- Embedded Drive link resolution at release and track levels.
- Full Admin Portal review pipeline with direct "Open Drive Link" (new tab) and 1-click "Copy Link" buttons.

### 3. Artist Portal & Dashboard
- Multi-tier distribution plan selection (Single ₹100, EP ₹500, Album ₹1,000).
- Real-time catalog tracking, status updates (Pending, Approved, Changes Required, Rejected), and UPC tracking.
- Royalties overview, earnings analytics, and payout request management.
- Integrated AI support assistant for artist inquiries.

### 4. Admin Management Console
- Centralized review queue for release submissions, audio verification, and artwork inspection.
- Granular payment transaction ledger with fraud detection and blacklisting protections.
- Support ticket queue with real-time customer communications and SMTP notifications.

### 5. High-Contrast WCAG-Compliant UI
- Theme-aware design with optimized dark and light mode contrast.
- Fully responsive across desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend:** Node.js, Express.js, Mongoose, Nodemailer, Crypto
- **Database & Services:** Google Cloud Firestore, Firebase Auth, Firebase Hosting
- **Payment Gateway:** Cashfree Dynamic UPI QR & Merchant UPI API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shivom693/Adventure-Records.git
   cd Adventure-Records
   ```

2. Install dependencies:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in root
   - Copy `server/.env.example` to `server/.env`

4. Start development servers:
   ```bash
   npm run dev
   ```

5. Production build & deployment:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 📄 License
All rights reserved © Adventure Records.
