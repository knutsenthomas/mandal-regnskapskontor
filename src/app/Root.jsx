import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// BRUKER NÅ KONSEKVENT @/ FOR Å FORHINDRE DOBLE KONTEKSTER
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { SiteProvider, useSite } from '@/contexts/SiteContext';

import ScrollToTop from '@/components/ScrollToTop';
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

function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <ContentProvider>
          <ErrorBoundary>
            <Router>
              <RouteTracker />
              <GASetup />
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
          </ErrorBoundary>
        </ContentProvider>
      </AuthProvider>
    </SiteProvider>
  );
}

export default App;