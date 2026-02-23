import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Bell, Search, User, Menu } from 'lucide-react';

const TopBar = ({ title, onMenuClick, onOpenSearch, onOpenProfile }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const email = user?.email || 'Ukjent bruker';

    // Extract first part of email for a "Name"
    const name = email.split('@')[0];
    // Capitalize name
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    const [unreadCount, setUnreadCount] = React.useState(0);
    // supabase is already imported at the top

    React.useEffect(() => {
        const fetchUnread = async () => {
            const { count, error } = await supabase
                .from('contact_messages')
                .select('*', { count: 'exact', head: true })
                .eq('read', false);

            if (!error) setUnreadCount(count || 0);
        };

        fetchUnread();

        // Realtime subscription could go here
        const channel = supabase
            .channel('public:contact_messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
                fetchUnread();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0">

            {/* LEFT: Context/Title */}
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4965]/20"
                    aria-label="Åpne meny"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800 truncate">{title}</h2>
            </div>

            {/* RIGHT: User Profile & Actions */}
            <div className="flex items-center gap-6">

                {/* Placeholder Actions */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button onClick={onOpenSearch} className="hover:text-[#1B4965] transition-colors"><Search className="w-5 h-5" /></button>
                    <button
                        className="hover:text-[#1B4965] transition-colors relative"
                        onClick={() => navigate('/admin/dashboard?tab=messages')}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onOpenProfile}>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
                        <p className="text-xs text-gray-500 leading-tight">Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#1B4965]/10 flex items-center justify-center text-[#1B4965] border border-[#1B4965]/20">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
