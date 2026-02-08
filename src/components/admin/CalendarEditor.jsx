import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Calendar, Link as LinkIcon, Save } from 'lucide-react';

const CalendarEditor = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [icalUrl, setIcalUrl] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const { toast } = useToast();

    // Form state for new event
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

            // Fetch manual events
            const { data: eventsData, error: eventsError } = await supabase
                .from('calendar_events')
                .select('*')
                .order('date', { ascending: true });

            if (eventsError) throw eventsError;
            setEvents(eventsData || []);

            // Fetch iCal setting
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

            setEvents([...events, data[0]]);
            setNewEvent({ title: '', date: '', type: 'manual' });

            toast({
                title: "Suksess",
                description: "Hendelse lagt til i kalenderen."
            });

        } catch (error) {
            console.error('Error adding event:', error);
            toast({
                title: "Feil",
                description: "Kunne ikke legge til hendelse.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setEvents(events.filter(event => event.id !== id));
            toast({
                title: "Slettet",
                description: "Hendelsen er slettet."
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: "Feil",
                description: "Kunne ikke slette hendelse.",
                variant: "destructive"
            });
        }
    };

    const handleSaveIcal = async () => {
        try {
            setSavingSettings(true);

            // Check if settings row exists, if not insert, else update
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

            toast({
                title: "Lagret",
                description: "Kalenderinnstillinger oppdatert."
            });

        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Feil",
                description: "Kunne ikke lagre innstillinger.",
                variant: "destructive"
            });
        } finally {
            setSavingSettings(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Administrer Kalender</h2>

            {/* EXTERNAL CALENDAR SETTINGS */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Ekstern Kalender (Google / Outlook)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Lim inn "Secret Address in iCal format" fra Google Calendar eller ICS lenke fra Outlook.
                        </p>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={icalUrl}
                                onChange={(e) => setIcalUrl(e.target.value)}
                                placeholder="https://calendar.google.com/calendar/ical/..."
                                className="flex-1 p-2 border rounded-md"
                            />
                            <Button
                                onClick={handleSaveIcal}
                                disabled={savingSettings}
                                className="bg-[#1B4965] hover:bg-[#153a51] text-white"
                            >
                                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Lagre
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MANUAL EVENTS */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Manuelle Hendelser
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Add Form */}
                    <form onSubmit={handleAddEvent} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Tittel</label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                placeholder="F.eks. Sommerfest"
                                required
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium mb-1">Dato</label>
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="bg-[#1B4965] hover:bg-[#153a51] text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Legg til
                            </Button>
                        </div>
                    </form>

                    {/* List */}
                    <div className="space-y-2">
                        {events.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Ingen manuelle hendelser lagt til.</p>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="flex justify-between items-center p-3 bg-white border rounded-md shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center w-12 bg-gray-100 rounded p-1">
                                            <span className="block text-xs uppercase font-bold text-gray-500">
                                                {new Date(event.date).toLocaleDateString('no-NO', { month: 'short' })}
                                            </span>
                                            <span className="block text-lg font-bold text-[#1B4965]">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <span className="font-medium text-lg">{event.title}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteEvent(event.id)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CalendarEditor;
