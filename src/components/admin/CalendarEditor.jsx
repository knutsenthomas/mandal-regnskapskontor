import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Calendar, Link as LinkIcon, Save, Info } from 'lucide-react';
import AdminHeader from './layout/AdminHeader';

const CalendarEditor = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [icalUrl, setIcalUrl] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const { toast } = useToast();

    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        type: 'manual',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: eventsData, error: eventsError } = await supabase
                .from('calendar_events')
                .select('*')
                .order('date', { ascending: true });

            if (eventsError) throw eventsError;
            setEvents(eventsData || []);

            const { data: settingsData, error: settingsError } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'ical_feed_url')
                .single();

            if (settingsError && settingsError.code !== 'PGRST116') {
                console.error("Error fetching settings:", settingsError);
            }

            if (settingsData) {
                setIcalUrl(settingsData.value || '');
            }

        } catch (error) {
            console.error('Error fetching calendar data:', error);
            toast({
                title: "Feil",
                description: "Kunne ikke laste kalenderdata.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            if (!newEvent.title || !newEvent.date) return;

            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{
                    title: newEvent.title,
                    date: newEvent.date,
                    type: 'manual'
                }])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                setEvents(prev => [...prev, data[0]]);
                setNewEvent({ title: '', date: '', type: 'manual' });

                toast({
                    title: "Suksess",
                    description: "Hendelse lagt til i kalenderen.",
                    className: "bg-green-50 border-green-200"
                });
            }

        } catch (error) {
            console.error('Error adding event:', error);
            toast({
                title: "Feil",
                description: error.message || "Kunne ikke legge til hendelse.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Er du sikker på at du vil slette denne hendelsen?")) return;
        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setEvents(prev => prev.filter(event => event.id !== id));
            toast({
                title: "Slettet",
                description: "Hendelsen er slettet."
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: "Feil",
                description: error.message || "Kunne ikke slette hendelse.",
                variant: "destructive"
            });
        }
    };

    const handleSaveIcal = async () => {
        try {
            setSavingSettings(true);

            const { error } = await supabase.rpc('upsert_site_setting', {
                p_key: 'ical_feed_url',
                p_value: icalUrl
            });

            if (error) {
                console.warn("RPC upsert failed, falling back to manual logic:", error);
                const { data: existing } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('key', 'ical_feed_url')
                    .single();

                let result;
                if (existing) {
                    result = await supabase
                        .from('site_settings')
                        .update({ value: icalUrl })
                        .eq('key', 'ical_feed_url');
                } else {
                    result = await supabase
                        .from('site_settings')
                        .insert({ key: 'ical_feed_url', value: icalUrl });
                }
                if (result.error) throw result.error;
            }

            toast({
                title: "Lagret",
                description: "Kalenderinnstillinger oppdatert.",
                className: "bg-green-50 border-green-200"
            });

        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Feil",
                description: error.message || "Kunne ikke lagre innstillinger.",
                variant: "destructive"
            });
        } finally {
            setSavingSettings(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1B4965]" />
                <p>Laster kalender...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminHeader
                icon={Calendar}
                title="Kalenderstyring"
                description="Legg til manuelle hendelser eller koble til en ekstern iCal-feed."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Legg til ny hendelse
                        </h3>
                        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tittel på hendelse</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50"
                                    placeholder="f.eks. Frist for mva-melding"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Dato</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50/50"
                                        required
                                    />
                                    <Button type="submit" className="bg-[#1B4965] hover:bg-[#153a51] text-white rounded-lg px-6 shrink-0">
                                        Legg til
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Events List */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Manuelle hendelser</h3>
                            <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm font-medium">{events.length} hendelser</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {events.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm italic">Ingen manuelle hendelser lagt til.</p>
                                </div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#1B4965]/5 rounded-xl flex flex-col items-center justify-center border border-[#1B4965]/10">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">
                                                    {new Date(event.date).toLocaleDateString('no-NO', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-black text-[#1B4965] leading-none">
                                                    {new Date(event.date).getDate()}
                                                </span>
                                            </div>
                                            <span className="font-bold text-gray-800">{event.title}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-primary" />
                                iCal-synkronisering
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Koble til Google Calendar eller Outlook ved å lime inn iCal-lenken her.
                            </p>
                            <input
                                type="text"
                                value={icalUrl}
                                onChange={(e) => setIcalUrl(e.target.value)}
                                placeholder="https://calendar.google.com/..."
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <Button
                                onClick={handleSaveIcal}
                                disabled={savingSettings}
                                className="w-full bg-[#1B4965] hover:bg-[#153a51] text-white rounded-lg font-bold"
                            >
                                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Lagre feed
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-blue-800 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                            <Info className="w-4 h-4" />
                            Hjelp
                        </div>
                        <p className="text-xs leading-relaxed opacity-80">
                            Hendelser fra eksterne kalendere hentes automatisk hver time. Manuelle hendelser vises umiddelbart.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarEditor;
