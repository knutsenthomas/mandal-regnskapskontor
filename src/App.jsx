import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ReactGA from 'react-ga4';
import { supabase } from './lib/customSupabaseClient';
import { Toaster } from './components/ui/toaster';

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
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'google_analytics_id')
          .single();

        if (data?.value) {
          ReactGA.initialize(data.value);
          console.log("GA Initialized:", data.value);
        }
      } catch (error) {
        // Silent fail for analytics
        console.warn("Failed to init GA:", error);
      }
    };
    initGA();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <RouteTracker />
        <ScrollToTop />
        <Navigation />
        <main className="pt-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
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
    </AuthProvider>
  );
}

export default App;