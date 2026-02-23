import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ScrollToTop from '../components/ScrollToTop';
import HomePage from '../pages/HomePage';
import ServiceDetailPage from '../pages/ServiceDetailPage';
import LoginPageWithBoundary from '../pages/admin/LoginPageFixed';
// import React fjernet, behold kun én import av React nedenfor
import AdminDashboard from '../pages/admin/AdminDashboard';
import SetPasswordPage from '../pages/SetPasswordPage';
import ProtectedRoute from '../components/ProtectedRoute';
import ReactGA from 'react-ga4';
import { supabase } from '../lib/customSupabaseClient';
import { Toaster } from '../components/ui/toaster';
import ErrorBoundary from '../components/ErrorBoundary';
import { ContentProvider } from '../contexts/ContentContext';
import { SiteProvider } from '../contexts/SiteContext';

// Component to handle route changes
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Send page view on route change
    // ReactGA checks isInitialized internally, but good to be safe or rely on react-ga4 handling
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

function App() {
  useEffect(() => {
    const initGA = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'google_analytics_id')
          .single();

        if (data?.value) {
          ReactGA.initialize(data.value);
        }
      } catch (error) {
        // Silent fail for analytics
        console.warn("Failed to init GA:", error);
      }
    };
    initGA();
  }, []);

  return (
    <SiteProvider>
      <AuthProvider>
        <ContentProvider>
          <ErrorBoundary>
            <Router>
              <RouteTracker />
              <ScrollToTop />
              <main className="pt-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
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
              <Toaster />
            </Router>
          </ErrorBoundary>
        </ContentProvider>
      </AuthProvider>
    </SiteProvider>
  );
}

export default App;
