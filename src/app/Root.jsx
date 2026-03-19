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
import { SpeedInsights } from '@vercel/speed-insights/react';

// Unified Component to handle Google Analytics 4 initialization and route tracking based on consent
const GoogleAnalytics = () => {
  const location = useLocation();
  const { cookiePreferences, gaId, cookieConsent } = useSite();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Initialize GA immediately with DEFAULT consent (denied) if gaId is present
  useEffect(() => {
    const measurementId = String(gaId).trim();
    if (measurementId && measurementId !== 'null' && measurementId !== '' && !isInitialized) {
      try {
        // Set default consent state before initializing
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }

        // Only set default if we haven't set consent yet
        if (cookieConsent === null) {
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
          });
        }

        ReactGA.initialize(measurementId);
        setIsInitialized(true);
        console.log('Google Analytics 4 initialisert med Consent Mode:', measurementId);
      } catch (error) {
        console.error('GA4 initialiseringsfeil:', error);
      }
    }
  }, [gaId, isInitialized, cookieConsent]);

  // 2. Update Consent Mode when preferences change
  useEffect(() => {
    if (isInitialized) {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }

      const hasAnalyticsConsent = cookiePreferences?.statistics === true;
      const hasMarketingConsent = cookiePreferences?.marketing === true;

      gtag('consent', 'update', {
        'analytics_storage': hasAnalyticsConsent ? 'granted' : 'denied',
        'ad_storage': hasMarketingConsent ? 'granted' : 'denied',
        'ad_user_data': hasMarketingConsent ? 'granted' : 'denied',
        'ad_personalization': hasMarketingConsent ? 'granted' : 'denied',
      });
      console.log('GA4 Consent oppdatert:', { analytics: hasAnalyticsConsent, marketing: hasMarketingConsent });
    }
  }, [cookiePreferences, isInitialized]);

  // 3. Track page views on route change (GA4 handles the anonymization automatically based on consent state)
  useEffect(() => {
    if (isInitialized) {
      try {
        ReactGA.send({
          hitType: "pageview",
          page: location.pathname + location.search
        });
      } catch (error) {
        console.error('GA4 trackingfeil:', error);
      }
    }
  }, [isInitialized, location]);

  return null;
};

const GlobalLoader = ({ children }) => {
  const { loading: siteLoading } = useSite();
  const { loading: contentLoading } = React.useContext(ContentContext);
  const [forceClose, setForceClose] = React.useState(false);
  const hasPendingInitialLoad = siteLoading || contentLoading;
  const isBlocking = hasPendingInitialLoad && !forceClose;

  React.useEffect(() => {
    let timer;
    if (hasPendingInitialLoad) {
      // Force exit loading state after 8 seconds to prevent indefinite freezing.
      timer = setTimeout(() => {
        console.warn('GlobalLoader timed out. Forcing app to render.');
        setForceClose(true);
      }, 8000);
    } else {
      setForceClose(false);
    }
    return () => clearTimeout(timer);
  }, [hasPendingInitialLoad]);

  if (isBlocking) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-4 text-card-foreground shadow-xl"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm font-semibold tracking-wide">
            Laster nettstedet...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {children}
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
                <GoogleAnalytics />
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
                <SpeedInsights />
              </Router>
            </GlobalLoader>
          </ContentProvider>
        </AuthProvider>
      </SiteProvider>
    </ErrorBoundary>
  );
}

export default App;
