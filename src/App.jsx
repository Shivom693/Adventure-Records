import React, { useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Waveform from './components/Waveform';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Immediate Load for Instant Home Page Rendering
import Home from './pages/Home';

// Lazy Loaded Route Chunks (Optimizes initial load time from O(N) pages down to O(1))
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Artists = lazy(() => import('./pages/Artists'));
const Labels = lazy(() => import('./pages/Labels'));
const Resources = lazy(() => import('./pages/Resources'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UploadRelease = lazy(() => import('./pages/UploadRelease'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const IsrcRules = lazy(() => import('./pages/IsrcRules'));
const CopyrightPolicy = lazy(() => import('./pages/CopyrightPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ContentPolicy = lazy(() => import('./pages/ContentPolicy'));

// SEO & Content Optimization Pages Lazy Loaded
const FreeMusicDistribution = lazy(() => import('./pages/FreeMusicDistribution'));
const MusicDistribution = lazy(() => import('./pages/MusicDistribution'));
const ArtistDistributionGuide = lazy(() => import('./pages/ArtistDistributionGuide'));
const IndiaDistributionGuide = lazy(() => import('./pages/IndiaDistributionGuide'));
const SingleDistribution = lazy(() => import('./pages/SingleDistribution'));
const EpDistribution = lazy(() => import('./pages/EpDistribution'));
const AlbumDistribution = lazy(() => import('./pages/AlbumDistribution'));
const IsrcGuide = lazy(() => import('./pages/IsrcGuide'));
const UpcGuide = lazy(() => import('./pages/UpcGuide'));
const CopyrightGuide = lazy(() => import('./pages/CopyrightGuide'));

// High Performance Lightweight Fallback Loader
const PageLoader = () => (
  <div className="pt-32 flex flex-col items-center justify-center min-h-[400px] text-zinc-100 font-outfit">
    <div className="w-8 h-8 rounded-full border-2 border-t-red-500 border-zinc-800 animate-spin mb-3" />
    <span className="font-heading font-semibold text-zinc-500 text-xs tracking-widest uppercase">Loading Adventure Records...</span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative bg-[#070709] font-outfit" style={{ backgroundColor: 'var(--bg-primary)' }}>
        
        {/* Animated Waveform Background globally behind cards */}
        <Waveform />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Main Routed Content with Accessibility Landmark & Suspense Fallback */}
        <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
          <Suspense fallback={<PageLoader />}>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/distribution" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/labels" element={<Labels />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Public SEO & Content Optimization Routes */}
              <Route path="/free-music-distribution" element={<FreeMusicDistribution />} />
              <Route path="/music-distribution" element={<MusicDistribution />} />
              <Route path="/music-distribution-for-artists" element={<ArtistDistributionGuide />} />
              <Route path="/music-distribution-india" element={<IndiaDistributionGuide />} />
              <Route path="/single-distribution" element={<SingleDistribution />} />
              <Route path="/ep-distribution" element={<EpDistribution />} />
              <Route path="/album-distribution" element={<AlbumDistribution />} />
              <Route path="/isrc" element={<IsrcGuide />} />
              <Route path="/upc" element={<UpcGuide />} />
              <Route path="/copyright" element={<CopyrightGuide />} />
              
              {/* Legal Routes */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/terms-of-use" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/upc-isrc-rules" element={<IsrcRules />} />
              <Route path="/isrc-rules" element={<IsrcRules />} />
              <Route path="/upc-rules" element={<IsrcRules />} />
              <Route path="/copyright-policy" element={<CopyrightPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/content-policy" element={<ContentPolicy />} />

              {/* Auth & Verification Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Login Gate */}
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Protected SaaS Dashboards & Music Upload UI */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <UploadRelease />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings/security" 
                element={
                  <ProtectedRoute>
                    <SecuritySettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>


        {/* Global Floating AI Assistant */}
        <Chatbot />

        {/* Global Footer */}
        <Footer />

      </div>
    </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

