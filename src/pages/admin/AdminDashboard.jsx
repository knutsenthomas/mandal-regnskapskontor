import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Pass på at alle disse filene faktisk finnes i mappen din!
import HeroEditor from '@/components/admin/HeroEditor';
import ServicesEditor from '@/components/admin/ServicesEditor';
import ServiceDetailEditor from '@/components/admin/ServiceDetailEditor';
import AboutEditor from '@/components/admin/AboutEditor';
import ContactEditor from '@/components/admin/ContactEditor';
import FooterEditor from '@/components/admin/FooterEditor';
import GeneralEditor from '@/components/admin/GeneralEditor'; // VIKTIG: Denne må være her

const AdminDashboard = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedServiceId, setSelectedServiceId] = useState("0");

  // Lager listen dynamisk
  const servicesList = content?.services_data?.map((service, index) => ({
    id: index.toString(),
    name: service.title || `Tjeneste ${index + 1}`
  })) || [];

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No content found");
        } else {
          throw error;
        }
      }
      setContent(data);
    } catch (error) {
      toast({
        title: "Feil ved lasting",
        description: "Kunne ikke hente innhold: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Laster adminpanel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-[#1B4965] p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logg ut
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
          <Tabs defaultValue="general" className="w-full flex-1 flex flex-col">

            {/* FANEMENYEN ØVERST */}
            <div className="border-b border-gray-200 px-6 pt-4 overflow-x-auto">
              <TabsList className="flex space-x-1 bg-transparent p-0 mb-[-1px] min-w-max">
                {/* HER ER DEN NYE FANEN: */}
                <TabsTrigger value="general" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Generelt</TabsTrigger>

                <TabsTrigger value="hero" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Hero</TabsTrigger>
                <TabsTrigger value="services" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Tjenester</TabsTrigger>
                <TabsTrigger value="service-details" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Tjeneste Detaljer</TabsTrigger>
                <TabsTrigger value="about" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Om oss</TabsTrigger>
                <TabsTrigger value="contact" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Kontakt</TabsTrigger>
                <TabsTrigger value="footer" className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[#1B4965] data-[state=active]:text-[#1B4965] data-[state=active]:bg-transparent rounded-none transition-colors">Footer</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-8 bg-gray-50/50">

              {/* HER ER INNHOLDET TIL DEN NYE FANEN: */}
              <TabsContent value="general" className="mt-0">
                <GeneralEditor content={content} onUpdate={fetchContent} />
              </TabsContent>

              <TabsContent value="hero" className="mt-0">
                <HeroEditor content={content} onUpdate={fetchContent} />
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <ServicesEditor content={content} onUpdate={fetchContent} />
              </TabsContent>

              <TabsContent value="service-details" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                    <span className="font-medium text-gray-700">Velg tjeneste å redigere:</span>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Velg tjeneste" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesList.length > 0 ? (
                          servicesList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                        ) : (
                          <SelectItem value="none" disabled>Ingen tjenester funnet</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <ServiceDetailEditor selectedServiceId={selectedServiceId} />
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <AboutEditor content={content} onUpdate={fetchContent} />
              </TabsContent>
              <TabsContent value="contact" className="mt-0">
                <ContactEditor content={content} onUpdate={fetchContent} />
              </TabsContent>
              <TabsContent value="footer" className="mt-0">
                <FooterEditor content={content} onUpdate={fetchContent} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;