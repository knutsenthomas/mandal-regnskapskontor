import React from 'react';
import { LayoutDashboard, Calendar, Layers, Image, Info, Mail, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ activeTab, onTabChange, isOpen, toggleSidebar }) => {
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
        <div className={cn(
            "flex flex-col h-full w-64 bg-[#1B4965] text-white shadow-xl z-50 transition-transform duration-300 ease-in-out",
            "fixed inset-y-0 left-0 md:relative md:translate-x-0", // Mobile: Fixed & Sidebar logic. Desktop: Relative & Always visible
            isOpen ? "translate-x-0" : "-translate-x-full" // Toggle logic for mobile
        )}>

            {/* HEADER / LOGO AREA */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#2C5D7C]">
                <h1 className="text-xl font-bold tracking-tight truncate">Admin<span className="font-light opacity-70">Panel</span></h1>
                {/* Close button for mobile */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
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
                                    "w-5 h-5 transition-colors shrink-0",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                )}
                            />
                            <span className="truncate">{item.label}</span>
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
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="truncate">Logg ut</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
