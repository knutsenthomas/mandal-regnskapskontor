import React from 'react';
import { LayoutDashboard, Calendar, Layers, Image, Info, Mail, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ activeTab, onTabChange }) => {
    const { signOut } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Oversikt', icon: LayoutDashboard },
        { id: 'calendar', label: 'Kalender', icon: Calendar },
        { id: 'services', label: 'Tjenester', icon: Layers },
        { id: 'service-details', label: 'Tjeneste Detaljer', icon: Layers }, // Sub-item conceptually, but flat for now
        { id: 'hero', label: 'Forside (Hero)', icon: Image },
        { id: 'about', label: 'Om oss', icon: Info },
        { id: 'contact', label: 'Kontakt', icon: Mail },
        { id: 'footer', label: 'Footer / Innstillinger', icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-[#1B4965] text-white transition-all duration-300 shadow-xl z-20">

            {/* HEADER / LOGO AREA */}
            <div className="h-16 flex items-center px-6 border-b border-[#2C5D7C]">
                <h1 className="text-xl font-bold tracking-tight">Admin<span className="font-light opacity-70">Panel</span></h1>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === 'services' && activeTab === 'service-details');
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                )}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* BOTTOM ACTION */}
            <div className="p-4 border-t border-[#2C5D7C]">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-200 hover:text-white hover:bg-red-900/20 rounded-md transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logg ut
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
