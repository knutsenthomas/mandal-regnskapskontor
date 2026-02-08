import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Mail, MailOpen, Trash2, Check, X, Search, Calendar, User, Phone, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";

const MessagesView = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Fetch messages ordered by created_at descending (newest first)
            // Assuming 'created_at' exists. If not, we might need to rely on ID.
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Kunne ikke laste meldinger.');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id, currentStatus) => {
        if (currentStatus) return; // Already read

        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setMessages(prev => prev.map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            ));

            // Update selected message if open
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(prev => ({ ...prev, read: true }));
            }

        } catch (err) {
            console.error('Error marking as read:', err);
            toast({
                title: "Feil",
                description: "Kunne ikke markere som lest.",
                variant: "destructive"
            });
        }
    };

    const deleteMessage = async (id) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.filter(msg => msg.id !== id));
            setSelectedMessage(null); // Close modal if deleted
            toast({
                title: "Melding slettet",
                description: "Meldingen ble slettet permanent.",
            });
        } catch (err) {
            console.error('Error deleting message:', err);
            toast({
                title: "Feil",
                description: "Kunne ikke slette meldingen.",
                variant: "destructive"
            });
        }
    };

    const filteredMessages = messages.filter(msg => {
        const searchLower = searchTerm.toLowerCase();
        return (
            msg.navn?.toLowerCase().includes(searchLower) ||
            msg.epost?.toLowerCase().includes(searchLower) ||
            msg.bedriftsnavn?.toLowerCase().includes(searchLower) ||
            msg.melding?.toLowerCase().includes(searchLower)
        );
    });

    const unreadCount = messages.filter(m => !m.read).length;

    const markAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ read: true })
                .eq('read', false);

            if (error) throw error;

            setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
            toast({
                title: "Suksess",
                description: "Alle meldinger er markert som lest.",
            });
        } catch (err) {
            console.error('Error marking all as read:', err);
            toast({
                title: "Feil",
                description: "Kunne ikke markere alle som lest.",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Laster meldinger...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
                <p>{error}</p>
                <Button variant="outline" onClick={fetchMessages} className="mt-4">Prøv igjen</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Innboks</h2>
                    <p className="text-gray-500">
                        Du har <span className="font-semibold text-[#1B4965]">{unreadCount}</span> uleste meldinger
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead} className="whitespace-nowrap">
                            <MailOpen className="w-4 h-4 mr-2" />
                            Marker alle som lest
                        </Button>
                    )}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Søk i meldinger..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div className="grid gap-3">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Ingen meldinger funnet</h3>
                        <p className="text-gray-500">Prøv et annet søkeord eller vent på nye henvendelser.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${msg.read ? 'border-l-gray-200 bg-white opacity-80' : 'border-l-[#1B4965] bg-blue-50/30'}`}
                            onClick={() => {
                                setSelectedMessage(msg);
                                markAsRead(msg.id, msg.read);
                            }}
                        >
                            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`p-2 rounded-full shrink-0 ${msg.read ? 'bg-gray-100 text-gray-400' : 'bg-[#1B4965]/10 text-[#1B4965]'}`}>
                                        {msg.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-base truncate ${msg.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                {msg.navn}
                                            </h4>
                                            {msg.bedriftsnavn && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full truncate max-w-[150px]">
                                                    {msg.bedriftsnavn}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm line-clamp-1 ${msg.read ? 'text-gray-500' : 'text-gray-800'}`}>
                                            {msg.melding}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{format(new Date(msg.created_at), 'd. MMM yyyy HH:mm', { locale: nb })}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 shrink-0" onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMessage(msg.id);
                                }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            Melding fra {selectedMessage?.navn}
                            {selectedMessage?.bedriftsnavn && (
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {selectedMessage.bedriftsnavn}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Mottatt: {selectedMessage && format(new Date(selectedMessage.created_at), 'd. MMMM yyyy kl. HH:mm', { locale: nb })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Contact Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{selectedMessage?.epost}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{selectedMessage?.telefon}</span>
                            </div>
                        </div>

                        {/* Message Body */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Melding</h4>
                            <div className="bg-white p-4 border rounded-md text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {selectedMessage?.melding}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between gap-2 sm:justify-between w-full">
                        <Button
                            variant="destructive"
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Slett melding
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <a href={`mailto:${selectedMessage?.epost}`}>
                                    <Mail className="w-4 h-4 mr-2" /> Svar på e-post
                                </a>
                            </Button>
                            <Button onClick={() => setSelectedMessage(null)}>
                                Lukk
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MessagesView;
