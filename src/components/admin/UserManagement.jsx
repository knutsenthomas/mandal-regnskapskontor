import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Loader2, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Added Label import

const UserManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
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
                .insert([{
                    email,
                    full_name: newName.trim(),
                    phone: newPhone.trim()
                }]);

            if (error) throw error;

            toast({ title: 'Suksess', description: `${email} er lagt til som administrator.` });
            setNewEmail('');
            setNewName('');
            setNewPhone('');
            fetchAdmins();
        } catch (error) {
            console.error('Error adding admin:', error);
            toast({
                title: 'Kunne ikke legge til',
                description: 'Sjekk at du har kjørt SQL-oppdateringen for de nye kolonnene.',
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
                        Her administrerer du hvem som har tilgang til å logge inn på dette panelet og deres kontaktinformasjon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Viktig informasjon om brukere:</p>
                                <p>1. Legg til personens kontaktinfo og e-post her først.</p>
                                <p>2. Gå deretter til <strong>Supabase Dashboard &gt; Authentication &gt; Users</strong> og velg <strong>"Invite User"</strong>.</p>
                            </div>
                        </div>
                    </div>

                    {/* ADD FORM */}
                    <form onSubmit={handleAddAdmin} className="space-y-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700">Legg til ny administrator</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Fullt Navn</Label>
                                <Input
                                    placeholder="Ola Nordmann"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">E-post (påkrevd for innlogging)</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="ola@eksempel.no"
                                        className="pl-10"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Telefonnr</Label>
                                <Input
                                    placeholder="900 00 000"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={adding} className="bg-[#1B4965] hover:bg-[#0F3347]">
                                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Legg til i listen
                            </Button>
                        </div>
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
                            <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden bg-white shadow-sm">
                                {admins.map((admin) => (
                                    <div key={admin.id || admin.email} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-[#1B4965] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                                                {(admin.full_name || admin.email)[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-900 truncate">
                                                    {admin.full_name || 'Navn ikke oppgitt'}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 opacity-60" />
                                                        {admin.email}
                                                    </span>
                                                    {admin.phone && (
                                                        <span className="flex items-center gap-1.5">
                                                            <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></div>
                                                            Tlf: {admin.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAdmin(admin.email)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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
