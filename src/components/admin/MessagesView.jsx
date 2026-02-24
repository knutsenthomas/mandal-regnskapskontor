import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Mail, MailOpen, Trash2, Check, X, Search, Calendar, User, Phone, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AdminHeader from './layout/AdminHeader';
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
        if (currentStatus) return;

        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            ));

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
            setSelectedMessage(null);
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
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1B4965]" />
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
            <AdminHeader
                icon={Mail}
                title="Innboks & Meldinger"
                description={`Du har ${unreadCount} uleste meldinger i innboksen din.`}
            >
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead} className="whitespace-nowrap bg-white border-gray-200">
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
                            className="pl-9 bg-gray-50/50 border-gray-200"
                        />
                    </div>
                </div>
            </AdminHeader>

            <div className="grid gap-4">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Mail className="w-8 h-8 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Ingen meldinger funnet</h3>
                        <p className="text-gray-500">Prøv et annet søkeord eller vent på nye henvendelser.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`cursor-pointer transition-all hover:shadow-md border-none rounded-xl overflow-hidden ${msg.read ? 'bg-white/80 grayscale-[0.5]' : 'bg-white shadow-sm ring-1 ring-primary/10'}`}
                            onClick={() => {
                                setSelectedMessage(msg);
                                markAsRead(msg.id, msg.read);
                            }}
                        >
                            <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                                <div className={`w-1.5 shrink-0 ${msg.read ? 'bg-gray-100' : 'bg-[#1B4965]'}`}></div>
                                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-1">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${msg.read ? 'bg-gray-50 text-gray-400' : 'bg-primary/5 text-primary'}`}>
                                            {msg.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                        </div>

                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className={`text-base truncate ${msg.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                    {msg.navn}
                                                </h4>
                                                {msg.bedriftsnavn && (
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded flex-shrink-0">
                                                        {msg.bedriftsnavn}
                                                    </span>
                                                )}
                                                {!msg.read && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                                            </div>
                                            <p className={`text-sm line-clamp-1 ${msg.read ? 'text-gray-500' : 'text-gray-800'}`}>
                                                {msg.melding}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(msg.created_at), 'd. MMM yyyy HH:mm', { locale: nb })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 transition-colors" onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMessage(msg.id);
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex flex-wrap items-center gap-3">
                            {selectedMessage?.navn}
                            {selectedMessage?.bedriftsnavn && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                    {selectedMessage.bedriftsnavn}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {selectedMessage && format(new Date(selectedMessage.created_at), "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">E-post</p>
                                    <p className="text-sm font-semibold truncate">{selectedMessage?.epost}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Telefon</p>
                                    <p className="text-sm font-semibold truncate">{selectedMessage?.telefon || 'Ikke oppgitt'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Meldingstekst</h4>
                            <div className="bg-white p-6 border border-gray-100 rounded-2xl text-gray-800 whitespace-pre-wrap leading-relaxed shadow-sm min-h-[150px]">
                                {selectedMessage?.melding}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-50">
                        <Button
                            variant="ghost"
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Slett henvendelse
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-gray-200 rounded-xl"
                                onClick={() => {
                                    if (selectedMessage?.epost) {
                                        window.location.href = `mailto:${selectedMessage.epost}`;
                                        navigator.clipboard.writeText(selectedMessage.epost);
                                        toast({
                                            title: "E-post kopiert",
                                            description: "Adressen er kopiert til utklippstavlen.",
                                        });
                                    }
                                }}
                            >
                                <Mail className="w-4 h-4 mr-2" /> Svar nå
                            </Button>
                            <Button className="rounded-xl px-8" onClick={() => setSelectedMessage(null)}>
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
