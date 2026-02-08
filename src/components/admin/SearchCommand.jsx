import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Loader2, Calendar, Mail, Layers, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

const SearchCommand = ({ open, onOpenChange, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim().length > 1) {
                performSearch(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const performSearch = async (searchTerm) => {
        setLoading(true);
        const term = `%${searchTerm}%`;

        try {
            // 1. Search Messages
            const { data: messages } = await supabase
                .from('contact_messages')
                .select('id, navn, bedriftsnavn, melding, created_at')
                .or(`navn.ilike.${term},bedriftsnavn.ilike.${term},epost.ilike.${term}`)
                .limit(3);

            // 2. Search Events
            const { data: events } = await supabase
                .from('calendar_events')
                .select('id, title, start_time')
                .ilike('title', term)
                .limit(3);

            // 3. Search Services (from content JSON - a bit trickier, fetch all and filter in memory for now as list is small)
            const { data: content } = await supabase.from('content').select('services_data').single();
            const services = (content?.services_data || [])
                .map((s, idx) => ({ ...s, originalIndex: idx }))
                .filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, 3);

            const combinedResults = [
                ...(messages || []).map(m => ({ type: 'message', data: m })),
                ...(events || []).map(e => ({ type: 'event', data: e })),
                ...(services || []).map(s => ({ type: 'service', data: s }))
            ];

            setResults(combinedResults);

        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        onOpenChange(false);
        if (item.type === 'message') {
            onNavigate('messages');
            // Ideally we'd also select the specific message, but that requires more complex state passing
        } else if (item.type === 'event') {
            onNavigate('calendar');
        } else if (item.type === 'service') {
            onNavigate('service-details', item.data.originalIndex);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden shadow-2xl bg-white">
                <div className="flex items-center px-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <Input
                        className="flex-1 border-none focus-visible:ring-0 px-2 py-4 h-14 text-lg"
                        placeholder="Søk etter meldinger, arrangementer eller tjenester..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 && query.length > 1 && !loading ? (
                        <div className="text-center py-8 text-gray-400">
                            Ingen resultater funnet for "{query}"
                        </div>
                    ) : results.length === 0 && query.length <= 1 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Skriv minst 2 tegn for å søke...
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-start gap-4 transition-colors group"
                                >
                                    <div className={`p-2 rounded-full shrink-0 ${item.type === 'message' ? 'bg-blue-50 text-blue-600' :
                                            item.type === 'event' ? 'bg-orange-50 text-orange-600' :
                                                'bg-purple-50 text-purple-600'
                                        }`}>
                                        {item.type === 'message' && <Mail className="w-4 h-4" />}
                                        {item.type === 'event' && <Calendar className="w-4 h-4" />}
                                        {item.type === 'service' && <Layers className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {item.type === 'message' && (item.data.navn || 'Ukjent avsender')}
                                            {item.type === 'event' && item.data.title}
                                            {item.type === 'service' && item.data.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 truncate">
                                            {item.type === 'message' && item.data.melding}
                                            {item.type === 'event' && format(new Date(item.data.start_time), 'd. MMM yyyy HH:mm', { locale: nb })}
                                            {item.type === 'service' && "Tjeneste"}
                                        </p>
                                    </div>

                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-400 flex justify-between">
                    <span>Trykk <strong>ESC</strong> for å lukke</span>
                    <span>Resultater fra database</span>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default SearchCommand;
