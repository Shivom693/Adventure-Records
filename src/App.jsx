import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Waveform from './components/Waveform';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Artists from './pages/Artists';
import Labels from './pages/Labels';
import Resources from './pages/Resources';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import SecuritySettings from './pages/SecuritySettings';
import Dashboard from './pages/Dashboard';
import UploadRelease from './pages/UploadRelease';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import IsrcRules from './pages/IsrcRules';
import CopyrightPolicy from './pages/CopyrightPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ContentPolicy from './pages/ContentPolicy';
import ScrollToTop from './components/ScrollToTop';

// Import SEO & Content Optimization Pages
import FreeMusicDistribution from './pages/FreeMusicDistribution';
import MusicDistribution from './pages/MusicDistribution';
import ArtistDistributionGuide from './pages/ArtistDistributionGuide';
import IndiaDistributionGuide from './pages/IndiaDistributionGuide';
import SingleDistribution from './pages/SingleDistribution';
import EpDistribution from './pages/EpDistribution';
import AlbumDistribution from './pages/AlbumDistribution';
import IsrcGuide from './pages/IsrcGuide';
import UpcGuide from './pages/UpcGuide';
import CopyrightGuide from './pages/CopyrightGuide';

function App() {
  
  // Global Session Inactivity Monitor
  useEffect(() => {
    let timeoutId;
    
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Auto log out after 15 minutes of inactivity
      timeoutId = setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-change'));
          alert('Your session has expired due to inactivity. Please sign in again.');
          window.location.href = '/login';
        }
      }, 15 * 60 * 1000);
    };

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    // Start monitor
    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative bg-[#070709] font-outfit">
        
        {/* Animated Waveform Background globally behind cards */}
        <Waveform />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Main Routed Content */}
        <div className="flex-grow">
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
        </div>

        {/* Global Floating AI Assistant */}
        <Chatbot />

        {/* Global Footer */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;
