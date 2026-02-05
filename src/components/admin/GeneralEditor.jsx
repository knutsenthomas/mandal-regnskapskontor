import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

const GeneralEditor = ({ content, onUpdate }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        if (content) {
            setLogoUrl(content.logo_url || '');
        }
    }, [content]);

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Last opp til Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Hent offentlig URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setLogoUrl(data.publicUrl);

            toast({
                title: "Bilde lastet opp",
                description: "Husk å lagre endringene.",
                className: "bg-green-50 border-green-200"
            });

        } catch (error) {
            toast({
                title: "Feil ved opplasting",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!content?.id) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('content')
                .update({ logo_url: logoUrl })
                .eq('id', content.id);

            if (error) throw error;

            toast({
                title: "Lagret!",
                description: "Logoen er oppdatert.",
                className: "bg-green-50 border-green-200"
            });

            if (onUpdate) onUpdate();
        } catch (error) {
            toast({
                title: "Feil ved lagring",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generelle Innstillinger</h3>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Nettside Logo</label>

                {/* Forhåndsvisning */}
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                    {logoUrl ? (
                        <div className="relative group">
                            <img src={logoUrl} alt="Logo Preview" className="h-20 object-contain mb-4" />
                        </div>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center mb-4">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm">Ingen logo lastet opp</span>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="logo-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="logo-upload"
                            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {uploading ? 'Laster opp...' : 'Last opp ny logo'}
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Anbefalt: PNG med gjennomsiktig bakgrunn</p>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-[#1B4965] hover:bg-[#0F3347] text-white"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lagre endringer
                </Button>
            </div>
        </div>
    );
};

export default GeneralEditor;