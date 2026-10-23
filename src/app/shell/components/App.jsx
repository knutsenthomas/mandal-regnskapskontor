import ErrorBoundary from "@/components/ErrorBoundary";
import { SiteProvider } from "@/contexts/SiteContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { GlobalLoader } from "./GlobalLoader";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleAnalytics } from "./GoogleAnalytics";
import DynamicSEO from "@/components/DynamicSEO";
import ScrollToTop from "@/components/ScrollToTop";
import React from "react";
import { Loader2 } from "lucide-react";
import HomePage from "@/pages/HomePage";
import { PrivacyPage } from "../lib/PrivacyPage";
import { ServiceDetailPage } from "../lib/ServiceDetailPage";
import { LoginPageWithBoundary } from "../lib/LoginPageWithBoundary";
import { SetPasswordPage } from "../lib/SetPasswordPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminDashboard } from "../lib/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";

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
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/personvern" element={<PrivacyPage />} />
                      <Route
                        path="/service/:id"
                        element={<ServiceDetailPage />}
                      />
                      <Route
                        path="/admin/login"
                        element={<LoginPageWithBoundary />}
                      />
                      <Route
                        path="/set-password"
                        element={<SetPasswordPage />}
                      />
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

export { App };
