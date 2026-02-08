import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const TopBar = ({ title }) => {
    const { user } = useAuth();
    const email = user?.email || 'Ukjent bruker';

    // Extract first part of email for a "Name"
    const name = email.split('@')[0];
    // Capitalize name
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">

            {/* LEFT: Context/Title */}
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>

            {/* RIGHT: User Profile & Actions */}
            <div className="flex items-center gap-6">

                {/* Placeholder Actions */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-[#1B4965] transition-colors"><Search className="w-5 h-5" /></button>
                    <button className="hover:text-[#1B4965] transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
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
