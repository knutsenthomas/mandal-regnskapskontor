import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Loader2, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const UserManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .order('email', { ascending: true });

            if (error) throw error;
            setAdmins(data || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast({
                title: 'Feil ved henting',
                description: 'Kunne ikke hente listen over administratorer.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        const email = newEmail.toLowerCase().trim();
        if (!email) return;

        if (admins.some(a => a.email.toLowerCase() === email)) {
            toast({ title: 'Info', description: 'Denne e-posten finnes allerede i listen.' });
            return;
        }

        setAdding(true);
        try {
            const { error } = await supabase
                .from('admin_users')
                .insert([{ email }]);

            if (error) throw error;

            toast({ title: 'Suksess', description: `${email} er lagt til som administrator.` });
            setNewEmail('');
            fetchAdmins();
        } catch (error) {
            console.error('Error adding admin:', error);
            toast({
                title: 'Kunne ikke legge til',
                description: 'Sjekk at du har tilgang til å endre tabellen.',
                variant: 'destructive'
            });
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteAdmin = async (email) => {
        if (!window.confirm(`Er du sikker på at du vil fjerne ${email} fra admin-listen? Vedkommende vil miste tilgang til dette panelet.`)) return;

        try {
            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('email', email);

            if (error) throw error;

            toast({ title: 'Fjernet', description: 'Brukeren er fjernet fra admin-listen.' });
            fetchAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast({
                title: 'Kunne ikke fjerne',
                description: 'Noe gikk galt ved sletting.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#1B4965]" />
                        <CardTitle>Administrasjon</CardTitle>
                    </div>
                    <CardDescription>
                        Her administrerer du hvem som har tilgang til å logge inn på dette panelet.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Viktig informasjon om brukere:</p>
                                <p>1. Legg til personens e-post her for å gi dem tillatelse.</p>
                                <p>2. Gå deretter til <strong>Supabase Dashboard &gt; Authentication &gt; Users</strong> og velg <strong>"Invite User"</strong>.</p>
                                <p className="mt-2 opacity-80 italic text-xs">Dette sikrer at de får en offisiell invitasjon og kan sette sitt eget passord.</p>
                            </div>
                        </div>
                    </div>

                    {/* ADD FORM */}
                    <form onSubmit={handleAddAdmin} className="flex gap-2 mb-8">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="email"
                                placeholder="E-post til ny administrator..."
                                className="pl-10"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={adding} className="bg-[#1B4965] hover:bg-[#0F3347]">
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Legg til
                        </Button>
                    </form>

                    {/* LIST */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Aktive Administratorer</h4>
                        {loading ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1B4965]" />
                            </div>
                        ) : admins.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                Ingen administratorer funnet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden bg-white">
                                {admins.map((admin) => (
                                    <div key={admin.id || admin.email} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1B4965] font-bold text-xs">
                                                {admin.email[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{admin.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAdmin(admin.email)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
