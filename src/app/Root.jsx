import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
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

import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';

// Optional measurements load only after the first-party consent choice.
const GoogleAnalytics = () => {
  const { pathname } = useLocation();
  const { gaId } = useSite();
  const [allowed, setAllowed] = React.useState(() => window.SitePrivacy?.allows('analytics') === true);
  useEffect(() => {
    const sync = () => setAllowed(window.SitePrivacy?.allows('analytics') === true);
    window.addEventListener('siteprivacychange', sync);
    sync();
    return () => window.removeEventListener('siteprivacychange', sync);
  }, []);
  useEffect(() => { window.SitePrivacy?.setMeasurementId(gaId); }, [gaId]);
  useEffect(() => {
    window.SitePrivacy?.pageView();
    setAllowed(window.SitePrivacy?.allows('analytics') === true);
  }, [pathname]);
  return allowed ? <Analytics beforeSend={event => window.SitePrivacy?.cleanEvent(event) ?? null} /> : null;
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
