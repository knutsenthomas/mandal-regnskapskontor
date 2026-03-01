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
const ServiceDetailPage = React.lazy(() => import('@/pages/ServiceDetailPage'));
const LoginPageWithBoundary = React.lazy(() => import('@/pages/admin/LoginPageFixed'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const SetPasswordPage = React.lazy(() => import('@/pages/SetPasswordPage'));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'));

import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import CookieConsent from '@/components/CookieConsent';

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

  return (
    <>
      {children}
      {isLoading && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white shadow-2xl rounded-full px-5 py-3 border border-gray-100 flex items-center gap-3 pointer-events-auto"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-primary font-bold tracking-widest uppercase text-[10px] m-0 leading-none mt-[2px]">
              Oppdaterer data...
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
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
                  <React.Suspense fallback={
                    <div className="flex items-center justify-center min-h-[50vh]">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  }>
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
                  </React.Suspense>
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