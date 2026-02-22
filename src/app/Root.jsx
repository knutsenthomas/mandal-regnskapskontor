import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ScrollToTop from '../components/ScrollToTop';
import Navigation from '../components/Navigation';
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
import { SiteProvider } from '../contexts/SiteContext';
<<<<<<< HEAD
import { ContentProvider } from '../contexts/ContentContext';
import { useState } from 'react';
import Loader from '../components/ui/loader';
=======
import { useState } from 'react';
import Loader from '../components/ui/loader';
>>>>>>> 4d80209 (Legg til preloader og loading-sikring)

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const initGA = async () => {
      try {
        const { data, error } = await supabase
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
    Promise.all([
      initGA(),
      // Flere async kall kan legges til her
    ]).catch(() => {
      // Feil under lasting, men loader skal ikke henge
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <Loader text="Laster innhold... Vennligst vent" />
        <div style={{marginTop: 24, color: '#1B4965', fontWeight: 'bold', fontSize: 18}}>Siden starter straks alt er klart</div>
      </div>
    );
  }

  return (
    <SiteProvider>
      <AuthProvider>
        <ContentProvider>
          <ErrorBoundary>
            <Router>
              <RouteTracker />
              <ScrollToTop />
              <Navigation />
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