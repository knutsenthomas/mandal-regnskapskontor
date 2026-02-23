import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSettings = ({ open, onOpenChange }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Profile Data State
    const [profileData, setProfileData] = useState({
        full_name: '',
        address: '',
        phone: '',
        birthdate: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch Profile Data on Mount/Open
    React.useEffect(() => {
        if (open && user) {
            fetchProfile();
        }
    }, [open, user]);

    const fetchProfile = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
            }

            if (data) {
                setProfileData({
                    full_name: data.full_name || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    birthdate: data.birthdate || ''
                });
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update Password if provided
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    toast({ title: 'Feil', description: 'Passordene er ikke like.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                if (newPassword.length < 6) {
                    toast({ title: 'Feil', description: 'Passordet må være minst 6 tegn.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
                if (pwError) throw pwError;
            }

            // 2. Update Profile Data (Upsert)
            const updates = {
                id: user.id,
                updated_at: new Date(),
                ...profileData
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (profileError) throw profileError;

            toast({ title: 'Suksess', description: 'Profilen din er oppdatert.' });

            // Clear password fields only
            setNewPassword('');
            setConfirmPassword('');

            // Close modal? Maybe keep open to show success
            // onOpenChange(false); 

        } catch (err) {
            console.error("Update error:", err);
            toast({ title: 'Feil', description: 'Kunne ikke oppdatere profilen.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Min Profil</DialogTitle>
                    <DialogDescription>
                        Administrer din personlige informasjon og sikkerhet.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Read-only User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <User className="w-6 h-6 text-[#1B4965]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">E-postadresse</label>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">

                        {/* PERSONAL DETAILS */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-[#1B4965] pl-2">
                                Personlig Informasjon
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Fullt Navn</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="Ola Nordmann"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthdate">Fødselsdato</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={profileData.birthdate}
                                        onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+47 123 45 678"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse</Label>
                                    <Input
                                        id="address"
                                        placeholder="Storgata 1, 4515 Mandal"
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-orange-400 pl-2">
                                Sikkerhet (Endre Passord)
                            </h3>
                            <p className="text-xs text-gray-500">La feltene stå tomme hvis du ikke vil endre passordet.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nytt passord</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="new-password"
                                            type="password"
                                            className="pl-9"
                                            placeholder="Min. 6 tegn"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Bekreft nytt passord</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            className="pl-9"
                                            placeholder="Gjenta passord"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Avbryt
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#1B4965] hover:bg-[#0F3347]">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Lagre endringer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSettings;
