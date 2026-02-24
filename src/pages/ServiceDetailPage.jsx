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
  const primaryColor = 'hsl(var(--primary))';
  const primaryForeground = 'hsl(var(--primary-foreground))';

  const handleBack = () => {
    navigate('/#tjenester');
  };

  const handleContactClick = () => {
    navigate('/#kontakt');
  };

  const serviceConfig = [
    { icon: Calculator, gradient: 'from-[#1B4965] to-[#2A6F97]', label: 'Regnskap' },
    { icon: FileText, gradient: 'from-[#1B4965] to-[#0F3347]', label: 'Fakturering' },
    { icon: Users, gradient: 'from-[#2A6F97] to-[#468FAF]', label: 'Lønn' },
    { icon: ClipboardCheck, gradient: 'from-[#0F3347] to-[#1B4965]', label: 'Revisjon' },
    { icon: TrendingUp, gradient: 'from-[#1B4965] to-[#2C7DA0]', label: 'Rådgivning' }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Tjenesten finnes ikke'}</h2>
        <Button onClick={handleBack} className="hover:brightness-90" style={{ backgroundColor: primaryColor, color: primaryForeground }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til forsiden
        </Button>
      </div>
    );
  }

  const Icon = service.icon;
  const extendedDescription = details?.extended_description || service.description || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{service.title} - Mandal Regnskapskontor</title>
        <meta name="description" content={service.description} />
      </Helmet>

      <Navigation />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-gray-50 z-0"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-gray-500 pl-0 group font-medium"
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
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-blue-50">
                <Icon className="w-8 h-8" style={{ color: primaryColor }} />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-950 mb-8 tracking-tight leading-tight">
                {service.title}
              </h1>

              <div className="prose prose-lg text-gray-700 max-w-none mb-12 leading-relaxed">
                {containsHtml(extendedDescription) ? (
                  <div
                    className="[&_*]:!font-sans [&_span]:!text-inherit [&_p]:!text-inherit [&_*]:!bg-transparent"
                    dangerouslySetInnerHTML={{ __html: extendedDescription }}
                  />
                ) : (
                  extendedDescription.split('\n').filter(Boolean).map((paragraph, idx) => (
                    <p key={idx} className="mb-6">{paragraph}</p>
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
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100">
                {details?.offerings && details.offerings.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-blue-950 mb-8 flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full inline-block" style={{ backgroundColor: primaryColor }}></span>
                      Hva vi tilbyr
                    </h2>
                    <OfferingsList offerings={details.offerings} />
                  </>
                )}

                <div className="mt-12 rounded-2xl p-8 text-white relative overflow-hidden group" style={{ backgroundColor: primaryColor }}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Icon className="w-24 h-24" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 relative z-10">
                    {customPlanTitle?.content || 'Trenger du noe mer?'}
                  </h3>
                  <p className="text-blue-100 text-sm mb-6 relative z-10 opacity-90 leading-relaxed font-light">
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
                className="p-6 md:p-14 bg-white/80 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5"
              >
                <div className="flex flex-col mb-8">
                  <span className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: primaryColor }}>Målgruppe</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 lg:gap-16 items-start">
                  {containsHtml(details.target_audience) ? (
                    details.target_audience.split(/(?=<h[23])/i).filter(s => s.trim()).map((section, idx) => (
                      <div
                        key={idx}
                        className={`prose prose-base md:prose-lg text-gray-700 max-w-none 
                          [&>p]:mt-0 [&>p]:mb-2 md:[&>p]:mb-6
                          [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0
                          [&>h3]:mt-6 [&>h3]:mb-4 md:[&>h3]:mt-8 md:[&>h3]:mb-6
                          [&>ul]:mt-0 [&>ul]:mb-2 md:[&>ul]:mb-6
                          ${idx > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-16' : ''}`}
                        dangerouslySetInnerHTML={{ __html: section }}
                      />
                    ))
                  ) : (
                    <div className="prose prose-base md:prose-lg text-gray-700 max-w-none">
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
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">Slik fungerer det</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Vår prosess er designet for å gi deg best mulig resultat med minst mulig hodebry.</p>
            </div>
            <ProcessSteps steps={details.process_steps} />
          </div>
        </section>
      )}

      {/* PRICING SECTION */}
      {details?.pricing_packages && details.pricing_packages.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">Priser & Pakker</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Velg den løsningen som passer ditt volum og behov.</p>
            </div>
            <PricingPackages packages={details.pricing_packages} />
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {details?.faqs && details.faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-950 mb-4">Ofte stilte spørsmål</h2>
              <p className="text-gray-500">Svar på det de fleste lurer på om {service.title}.</p>
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
