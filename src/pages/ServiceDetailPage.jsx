import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, FileText, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import ProcessSteps from '@/components/service-detail/ProcessSteps';
import PricingPackages from '@/components/service-detail/PricingPackages';
import FAQSection from '@/components/service-detail/FAQSection';
import OfferingsList from '@/components/service-detail/OfferingsList';
import CustomPlanCTAEditor from '@/components/admin/CustomPlanCTAEditor';
import CustomPlanEditor from '@/components/admin/CustomPlanEditor';
import { useContent } from '@/contexts/ContentContext';

const containsHtml = (value) => {
  if (!value) return false;
  return /<[a-z][\s\S]*>/i.test(value) || value.includes('</');
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = window.location.pathname.startsWith('/admin');

  const customPlanCta = useContent('custom_plan_cta');
  const customPlanTitle = useContent('custom_plan_title');
  const customPlanSubtitle = useContent('custom_plan_subtitle');
  const customPlanCtaUrl = useContent('custom_plan_cta_url');
  const primaryColor = 'hsl(var(--primary))';
  const primaryForeground = 'hsl(var(--primary-foreground))';

  const handleBack = () => {
    navigate('/#tjenester');
  };

  const handleContactClick = () => {
    const url = customPlanCtaUrl?.content || '/#kontakt';
    if (url.startsWith('/#')) {
      navigate(url);
    } else if (url.startsWith('#')) {
      document.getElementById(url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = url;
    }
  };

  const serviceConfig = [
    { icon: Calculator, label: 'Regnskap' },
    { icon: FileText, label: 'Fakturering' },
    { icon: Users, label: 'Lønn' },
    { icon: ClipboardCheck, label: 'Revisjon' },
    { icon: TrendingUp, label: 'Rådgivning' }
  ];

  const fetchServiceData = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);

    try {
      const [contentRes, detailsRes] = await Promise.all([
        supabase.from('content').select('services_data').single(),
        supabase.from('service_details').select('*').eq('service_id', id).single()
      ]);

      if (contentRes.error) throw contentRes.error;
      const contentData = contentRes.data;
      const detailsData = detailsRes.data;

      const index = parseInt(id, 10);

      if (contentData?.services_data && contentData.services_data[index]) {
        const basicServiceData = contentData.services_data[index];
        const config = serviceConfig[index] || serviceConfig[0];

        setService({
          ...basicServiceData,
          ...config
        });
        setDetails(detailsData || {});
        setError(null);
      } else {
        setError('Tjenesten ble ikke funnet.');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      // Don't show error if we already have data and this was a silent update
      if (!silent) setError('Kunne ikke laste tjenestedetaljer.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

  // Sikkerhets-timeout for å forhindre "evig lasting"
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false);
        if (!service) {
          setError('Tilkoblingen tok for lang tid. Vennligst prøv igjen.');
        }
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [loading, service]);

  useEffect(() => {
    if (!id) return undefined;

    const channel = supabase
      .channel(`service-detail-live-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_details', filter: `service_id=eq.${id}` }, () => {
        fetchServiceData({ silent: true });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchServiceData({ silent: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchServiceData]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">{error || 'Tjenesten finnes ikke'}</h2>
        <Button onClick={handleBack} className="hover:brightness-90" style={{ backgroundColor: primaryColor, color: primaryForeground }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til forsiden
        </Button>
      </div>
    );
  }

  const Icon = service.icon;
  const extendedDescription = details?.extended_description || service.description || '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{service.title} - Mandal Regnskapskontor</title>
        <meta name="description" content={service.description} />
      </Helmet>

      <Navigation />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-muted/40 z-0"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'hsl(var(--primary) / 0.12)' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-muted-foreground pl-0 group font-medium"
              onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Tilbake til oversikten
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7"
            >
              <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-border">
                <Icon className="w-8 h-8" style={{ color: primaryColor }} />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 md:mb-8 tracking-tight leading-tight">
                {service.title}
              </h1>

              <div className="prose prose-base sm:prose-lg text-muted-foreground max-w-none mb-10 md:mb-12 leading-relaxed">
                {containsHtml(extendedDescription) ? (
                  <div
                    className="[&_*]:!font-sans [&_span]:!text-inherit [&_p]:!text-inherit [&_*]:!bg-transparent"
                    dangerouslySetInnerHTML={{ __html: extendedDescription }}
                  />
                ) : (
                  extendedDescription.split('\n').filter(Boolean).map((paragraph, idx) => (
                    <p key={idx} className="mb-4 sm:mb-6">{paragraph}</p>
                  ))
                )}
              </div>



              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={handleContactClick}
                  className="px-8 h-14 rounded-xl shadow-lg transition-transform hover:scale-[1.02] hover:brightness-90"
                  style={{ backgroundColor: primaryColor, color: primaryForeground }}
                >
                  {customPlanCta?.content || `Kom i gang med ${service.title}`}
                </Button>
                {isAdmin && <CustomPlanCTAEditor />}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 lg:sticky lg:top-32 self-start"
            >
              <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-border">
                {details?.offerings && details.offerings.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full inline-block" style={{ backgroundColor: primaryColor }}></span>
                      Hva vi tilbyr
                    </h2>
                    <OfferingsList offerings={details.offerings} />
                  </>
                )}

                <div className="mt-10 sm:mt-12 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden group" style={{ backgroundColor: primaryColor }}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Icon className="w-24 h-24" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 relative z-10">
                    {customPlanTitle?.content || 'Trenger du noe mer?'}
                  </h3>
                  <p className="text-white/80 text-sm mb-6 relative z-10 opacity-90 leading-relaxed font-light">
                    {customPlanSubtitle?.content || 'Vi skreddersyr en løsning som passer din bedrift perfekt.'}
                  </p>
                  {isAdmin && <CustomPlanEditor />}
                </div>
              </div>
            </motion.div>
          </div>

          {/* TARGET AUDIENCE SECTION */}
          {details?.target_audience && (
            <div className="mt-8 lg:mt-32 relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 md:p-14 bg-card/80 backdrop-blur-md rounded-3xl md:rounded-[3rem] border border-border shadow-2xl"
              >
                <div className="flex flex-col mb-8">
                  <span className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: primaryColor }}>Målgruppe</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-16 items-start">
                  {containsHtml(details.target_audience) ? (
                    details.target_audience.split(/(?=<h[23])/i).filter(s => s.trim()).map((section, idx) => (
                      <div
                        key={idx}
                        className={`prose prose-base sm:prose-lg text-muted-foreground max-w-none 
                          [&>p]:mt-0 [&>p]:mb-2 md:[&>p]:mb-6
                          [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0
                          [&>h3]:mt-6 [&>h3]:mb-4 md:[&>h3]:mt-8 md:[&>h3]:mb-6
                          [&>ul]:mt-0 [&>ul]:mb-2 md:[&>ul]:mb-6
                          ${idx > 0 ? 'lg:border-l lg:border-border lg:pl-16' : ''}`}
                        dangerouslySetInnerHTML={{ __html: section }}
                      />
                    ))
                  ) : (
                    <div className="prose prose-base md:prose-lg text-muted-foreground max-w-none">
                      <p>{details.target_audience}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* PROCESS SECTION */}
      {details?.process_steps && details.process_steps.length > 0 && (
        <section className="py-24 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Slik fungerer det</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Vår prosess er designet for å gi deg best mulig resultat med minst mulig hodebry.</p>
            </div>
            <ProcessSteps steps={details.process_steps} />
          </div>
        </section>
      )}

      {/* PRICING SECTION */}
      {details?.pricing_packages && details.pricing_packages.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Priser & Pakker</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Velg den løsningen som passer ditt volum og behov.</p>
            </div>
            <PricingPackages packages={details.pricing_packages} />
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {details?.faqs && details.faqs.length > 0 && (
        <section className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ofte stilte spørsmål</h2>
              <p className="text-muted-foreground">Svar på det de fleste lurer på om {service.title}.</p>
            </div>
            <FAQSection faqs={details.faqs} />
          </div>
        </section>
      )}


      <Footer />
    </div >
  );
};

export default ServiceDetailPage;
