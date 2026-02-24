import ServiceDetailContentEditor from '@/components/admin/ServiceDetailContentEditor';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Activity, Calendar as CalIcon, Layers as LayersIcon } from 'lucide-react';

// EDITORS
import ThemeEditor from '@/components/admin/ThemeEditor';
import HeroEditor from '@/components/admin/HeroEditor';
import ServicesEditor from '@/components/admin/ServicesEditor';
import ServiceDetailEditor from '@/components/admin/ServiceDetailEditor';
import AboutEditor from '@/components/admin/AboutEditor';
import ContactEditor from '@/components/admin/ContactEditor';
import FooterEditor from '@/components/admin/FooterEditor';
import CalendarEditor from '@/components/admin/CalendarEditor';
import GeneralEditor from '@/components/admin/GeneralEditor';
import MessagesView from '@/components/admin/MessagesView';
import SearchCommand from '@/components/admin/SearchCommand';
import ProfileSettings from '@/components/admin/ProfileSettings';
import SEOEditor from '@/app/admin/SEOEditor';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
// import ContentBlocksEditor from '@/components/admin/ContentBlocksEditor';

// LAYOUT
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Loader } from '@/components/ui/loader';

const AdminDashboard = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // STATE FOR LAYOUT
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTabTitle, setActiveTabTitle] = useState('Oversikt');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, signOut } = useAuth(); // Correctly destructured now
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [fetchError, setFetchError] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // Sync state with URL params on mount/update
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Update title when tab changes
  useEffect(() => {
    const titles = {
      'dashboard': 'Mandal Regnskapskontor',
      'messages': 'Innboks & Meldinger',
      'calendar': 'Kalender & Hendelser',
      'services': 'Tjenester',
      'service-details': 'Rediger Tjenesteinnhold',
      'hero': 'Forside (Hero Seksjon)',
      'about': 'Om oss',
      'contact-settings': 'Kontaktinformasjon',
      'contact': 'Kontaktinformasjon',
      'footer': 'Footer & Innstillinger',
      'theme': 'Tema & Farger',
      'seo': 'SEO & Synlighet',
      'content-blocks': 'Alt tekstinnhold'
    };
    setActiveTabTitle(titles[activeTab] || 'Admin');
  }, [activeTab]);

  const servicesList = (content?.services_data && Array.isArray(content.services_data))
    ? content.services_data.map((service, index) => ({
      id: index.toString(),
      name: service?.title || `Tjeneste ${index + 1}`
    }))
    : [];

  // State for Settings
  const [gaId, setGaId] = useState(null);

  const fetchContent = async () => {
    try {
      setFetchError(null);

      // Set a safety timeout - if DB is slow, we still want to show the dashboard
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Tilkoblingen til databasen tok for lang tid.")), 10000)
      );

      // Parallel Fetch: Content & Settings
      const fetchPromise = Promise.all([
        supabase.from('content').select('*').single(),
        supabase.from('site_settings').select('value').eq('key', 'google_analytics_id').single()
      ]);

      const [contentResult, settingsResult] = await Promise.race([fetchPromise, timeoutPromise]);

      let { data: contentData, error: contentError } = contentResult;
      const { data: settingsData } = settingsResult;

      if (contentError) {
        if (contentError.code === 'PGRST116') {
          const { data: newContent, error: createError } = await supabase
            .from('content')
            .insert([{}])
            .select()
            .single();

          if (createError) {
            console.error("Failed to create default content:", createError);
            setFetchError("Kunne ikke opprette innholds-rad i databasen.");
          } else {
            contentData = newContent;
          }
        } else {
          console.warn("Supabase fetch error:", contentError);
          setFetchError(contentError.message);
        }
      }

      setContent(contentData || {});
      setGaId(settingsData?.value || null);

    } catch (error) {
      console.error("Critical fetch error:", error);
      setFetchError(error.message || "En ukjent feil oppstod ved henting av data.");
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return <Loader text="Laster admin-panelet..." />;
  }

  // --- RENDER HELPERS ---

  const renderDashboardHome = () => (
    <div className="space-y-6">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-[#1B4965] to-[#0F3347] rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Velkommen tilbake!</h2>
          <p className="text-blue-100 max-w-xl">
            Her har du full oversikt over nettsiden din. Bruk menyen til venstre for å redigere innhold,
            legge til kalenderhendelser eller oppdatere tjenestene dine.
          </p>
          <button
            onClick={() => handleTabChange('messages')}
            className="mt-6 bg-white text-[#1B4965] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            Gå til Meldinger <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {/* Decoration */}
        <Activity className="absolute right-4 bottom-4 w-48 h-48 text-white/5 rotate-[-15deg]" />
      </div>

      {/* GOOGLE ANALYTICS OVERSIKT */}
      <AnalyticsOverview />

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Aktive Tjenester</CardTitle>
            <LayersIcon className="h-4 w-4 text-[#1B4965]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{servicesList.length}</div>
            <p className="text-xs text-gray-400 mt-1">Ligger synlig på forsiden</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Kalender Integrasjon</CardTitle>
            <CalIcon className="h-4 w-4 text-[#1B4965]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Aktiv</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Systemet kjører
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open('https://analytics.google.com/', '_blank')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Google Analytics</CardTitle>
            <Activity className="h-4 w-4 text-[#1B4965]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{gaId ? 'Aktiv' : 'Ikke satt'}</div>
            {gaId ? (
              <div className="mt-1">
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Sporer besøkende
                </p>
                <p className="text-xs text-blue-600 mt-2 hover:underline">
                  Åpne rapport &rarr;
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Gå til Innstillinger for å koble til
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    // 1. GLOBAL ERROR HANDLER
    if (fetchError && activeTab !== 'calendar' && activeTab !== 'dashboard') {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
          <h3 className="text-lg font-medium text-red-800">Klarte ikke laste innhold</h3>
          <p className="text-red-600 mt-2">
            Det oppstod en feil med databasen som hindrer redigering av denne siden.
            Prøv å laste siden på nytt eller kontakt support.
          </p>
          <pre className="mt-4 bg-white p-4 rounded border border-red-200 text-xs text-red-500 font-mono">
            {fetchError}
          </pre>
        </div>
      );
    }

    // 2. ROUTING LOGIC
    const tabContent = (() => {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboardHome();
        case 'messages':
          return <MessagesView />;
        case 'calendar':
          return <CalendarEditor />;
        case 'services':
          return content ? (
            <ServicesEditor
              content={content}
              onUpdate={fetchContent}
              onNavigateToDetails={(id) => {
                setSelectedServiceId(id.toString());
                handleTabChange('service-details');
              }}
            />
          ) : <p>Laster...</p>;
        case 'service-details': {
          if (!content) return <p>Laster...</p>;
          // Velg automatisk første tjeneste hvis ingen valgt
          if (!selectedServiceId && servicesList.length > 0) {
            setSelectedServiceId(servicesList[0].id);
            return null; // Venter på state update
          }
          const effectiveServiceId = selectedServiceId || servicesList[0]?.id;
          const effectiveServiceName = servicesList.find(s => s.id === effectiveServiceId)?.name || '';
          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Rediger detaljer</h3>
                  <p className="text-sm text-gray-500">Velg hvilken tjeneste du vil endre innholdet på</p>
                </div>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger className="w-[280px] bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Velg tjeneste..." />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-white border border-gray-200 shadow-xl">
                    {servicesList.length > 0 ? (
                      servicesList.map(s => <SelectItem key={s.id} value={s.id} className="cursor-pointer hover:bg-gray-50">{s.name}</SelectItem>)
                    ) : (
                      <SelectItem value="none" disabled>Ingen tjenester funnet</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <ServiceDetailEditor
                selectedServiceId={effectiveServiceId}
                serviceTitle={effectiveServiceName}
              />
            </div>
          );
        }
        case 'hero':
          return content ? <HeroEditor content={content} onUpdate={fetchContent} /> : <p>Laster...</p>;
        case 'about':
          return content ? <AboutEditor content={content} onUpdate={fetchContent} /> : <p>Laster...</p>;
        case 'contact-settings':
        case 'contact':
          return content ? <ContactEditor content={content} onUpdate={fetchContent} /> : <p>Laster...</p>;
        case 'footer':
          return (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Generelle Innstillinger</h3>
                {content ? <GeneralEditor content={content} onUpdate={fetchContent} /> : <p>Laster...</p>}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Footer Informasjon</h3>
                {content ? <FooterEditor content={content} onUpdate={fetchContent} /> : <p>Laster...</p>}
              </div>
            </div>
          );
        case 'theme':
          return <ThemeEditor />;
        case 'seo':
          return <SEOEditor />;
        default:
          return renderDashboardHome();
      }
    })();

    return (
      <ErrorBoundary key={activeTab}>
        {tabContent}
      </ErrorBoundary>
    );
  };


  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title={activeTabTitle}
      onOpenSearch={() => setIsSearchOpen(true)}
      onOpenProfile={() => setIsProfileOpen(true)}
    >
      {renderContent()}

      <SearchCommand
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onNavigate={(tab, subId) => {
          setActiveTab(tab);
          if (subId !== undefined) {
            // If we need to navigate to specific service, we might need more complex state
            // For now, let's just switch tab. 
            // If subId is passed for services, we could set selectedServiceId
            if (tab === 'service-details' && subId !== undefined) {
              // Map index to ID if possible or just rely on index string if that's what we used
              // In fetchContent we mapped index to string ID.
              setSelectedServiceId(subId.toString());
            }
          }
        }}
      />

      <ProfileSettings
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />


    </DashboardLayout>
  );
};



const AdminDashboardWithBoundary = () => (
  <ErrorBoundary>
    <AdminDashboard />
  </ErrorBoundary>
);

export default AdminDashboardWithBoundary;