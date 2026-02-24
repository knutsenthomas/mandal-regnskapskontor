import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Loader2, ShieldCheck, Mail, AlertCircle, Pencil, Check, X, Phone, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AdminHeader from './layout/AdminHeader';

const UserManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [updating, setUpdating] = useState(false);

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
                description: `Databasefeil: ${error.message || 'Kunne ikke hente listen.'}`,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        if (e) e.preventDefault();
        const email = newEmail.toLowerCase().trim();
        if (!email) return;

        if (admins.some(a => a.email.toLowerCase() === email)) {
            toast({ title: 'Info', description: 'Denne e-posten finnes allerede i listen.' });
            return;
        }

        setAdding(true);
        try {
            const response = await fetch('/api/invite-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    full_name: newName.trim(),
                    phone: newPhone.trim()
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Kunne ikke invitere bruker.');
            }

            toast({
                title: 'Suksess',
                description: result.message || 'Brukeren er invitert og lagt til i listen.',
                className: "bg-green-50 border-green-200"
            });

            setNewEmail('');
            setNewName('');
            setNewPhone('');
            fetchAdmins();
        } catch (error) {
            console.error('Error adding admin:', error);
            toast({
                title: 'Kunne ikke legge til',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateAdmin = async (email) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('admin_users')
                .update({
                    full_name: editName.trim(),
                    phone: editPhone.trim()
                })
                .eq('email', email);

            if (error) throw error;

            toast({
                title: 'Oppdatert',
                description: 'Administrator-info er oppdatert.',
                className: "bg-green-50 border-green-200"
            });
            setEditingId(null);
            fetchAdmins();
        } catch (error) {
            console.error('Error updating admin:', error);
            toast({ title: 'Feil', description: 'Kunne ikke oppdatere informasjonen.', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    const startEditing = (admin) => {
        setEditingId(admin.email);
        setEditName(admin.full_name || '');
        setEditPhone(admin.phone || '');
    };

    const handleDeleteAdmin = async (email) => {
        if (!window.confirm(`Er du sikker på at du vil fjerne ${email}? Brukeren vil bli slettet helt fra systemet og miste all tilgang.`)) return;

        try {
            const response = await fetch('/api/remove-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Kunne ikke fjerne bruker.');
            }

            toast({
                title: 'Bruker slettet',
                description: result.message || 'Brukeren er fjernet fra systemet.'
            });

            fetchAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast({
                title: 'Kunne ikke fjerne',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1B4965]" />
                <p>Laster brukere...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminHeader
                icon={ShieldCheck}
                title="Administrasjon"
                description="Administrer tilgang og kontaktinformasjon for kontrollpanelet."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Aktive Administratorer</h3>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-wider">{admins.length} brukere</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {admins.map((admin) => (
                                <div key={admin.id || admin.email} className="p-6 transition-colors group">
                                    {editingId === admin.email ? (
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 px-1">Fullt Navn</Label>
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-10 bg-gray-50/50"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 px-1">Telefon</Label>
                                                    <Input
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        className="h-10 bg-gray-50/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateAdmin(admin.email)}
                                                    disabled={updating}
                                                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 px-4"
                                                >
                                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                                    Lagre
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                    className="border-gray-200 rounded-lg h-10"
                                                >
                                                    Avbryt
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm shrink-0">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-gray-900 truncate text-lg">
                                                        {admin.full_name || 'Navn ikke oppgitt'}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                            {admin.email}
                                                        </span>
                                                        {admin.phone && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                                {admin.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => startEditing(admin)}
                                                    className="text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteAdmin(admin.email)}
                                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="font-bold text-gray-800">Ny administrator</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-gray-400 px-1">Fullt Navn</Label>
                                <Input
                                    placeholder="f.eks. Ola Nordmann"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-gray-50/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-gray-400 px-1">E-post *</Label>
                                <Input
                                    type="email"
                                    placeholder="ola@eksempel.no"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="bg-gray-50/50"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-gray-400 px-1">Telefonnr</Label>
                                <Input
                                    placeholder="900 00 000"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    className="bg-gray-50/50"
                                />
                            </div>
                            <Button
                                onClick={handleAddAdmin}
                                disabled={adding}
                                className="w-full bg-[#1B4965] hover:bg-[#0F3347] text-white font-bold h-11 mt-4 rounded-xl"
                            >
                                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Legg til bruker
                            </Button>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 text-orange-800 font-bold text-[10px] uppercase tracking-widest">
                            <AlertCircle className="w-4 h-4" />
                            Viktig!
                        </div>
                        <p className="text-xs text-orange-800/80 leading-relaxed">
                            Når du legger til en bruker her, må du også sende en invitasjon via <strong>Supabase Dashboard</strong> under Authentication for at de skal kunne logge inn.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
