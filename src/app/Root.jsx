import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// BRUKER NÅ KONSEKVENT @/ FOR Å FORHINDRE DOBLE KONTEKSTER
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider, ContentContext } from '@/contexts/ContentContext';
import { SiteProvider, useSite } from '@/contexts/SiteContext';

import ScrollToTop from '@/components/ScrollToTop';
import DynamicSEO from '@/components/DynamicSEO';
import HomePage from '@/pages/HomePage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import LoginPageWithBoundary from '@/pages/admin/LoginPageFixed';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import SetPasswordPage from '@/pages/SetPasswordPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import CookieConsent from '@/components/CookieConsent';
import PrivacyPage from '@/pages/PrivacyPage';

import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/lib/customSupabaseClient';

// Component to handle Google Analytics 4 based on consent
const GASetup = () => {
  const { cookiePreferences, gaId } = useSite();

  useEffect(() => {
    if (cookiePreferences?.statistics && gaId) {
      const measurementId = String(gaId).trim();
      ReactGA.initialize(measurementId);
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search,
      });
    }
  }, [cookiePreferences?.statistics, gaId]);

  return null;
};

// Component to handle route changes
const RouteTracker = () => {
  const location = useLocation();
  const { cookiePreferences } = useSite();

  useEffect(() => {
    // Send page view on route change ONLY if consent is given
    if (cookiePreferences?.statistics) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location, cookiePreferences?.statistics]);

  return null;
};

const GlobalLoader = ({ children }) => {
  const { loading: siteLoading } = useSite();
  const { loading: contentLoading } = React.useContext(ContentContext);
  const [forceClose, setForceClose] = React.useState(false);
  const isLoading = (siteLoading || contentLoading) && !forceClose;

  React.useEffect(() => {
    let timer;
    if (siteLoading || contentLoading) {
      // Force exit loading state after 8 seconds to prevent indefinite freezing
      timer = setTimeout(() => {
        console.warn('GlobalLoader timed out. Forcing app to render.');
        setForceClose(true);
      }, 8000);
    } else {
      setForceClose(false);
    }
    return () => clearTimeout(timer);
  }, [siteLoading, contentLoading]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-primary font-medium tracking-widest uppercase text-xs">
            Henter innhold...
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <SiteProvider>
        <AuthProvider>
          <ContentProvider>
            <GlobalLoader>
              <Router>
                <RouteTracker />
                <GASetup />
                <DynamicSEO page="home" />
                <ScrollToTop />
                <main className="pt-0">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/personvern" element={<PrivacyPage />} />
                    <Route path="/service/:id" element={<ServiceDetailPage />} />
                    <Route path="/admin/login" element={<LoginPageWithBoundary />} />
                    <Route path="/set-password" element={<SetPasswordPage />} />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <CookieConsent />
                <Toaster />
              </Router>
            </GlobalLoader>
          </ContentProvider>
        </AuthProvider>
      </SiteProvider>
    </ErrorBoundary>
  );
}

export default App;