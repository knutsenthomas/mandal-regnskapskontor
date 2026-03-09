import { LayoutDashboard, Calendar, Layers, Image, Info, Mail, Settings, LogOut, X, Home, Palette, ShieldCheck, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';

const Sidebar = ({ activeTab, onTabChange, isOpen, toggleSidebar }) => {
    const { signOut } = useAuth();
    const { logoUrl, logoText } = useSite();

    const navItems = [
        { id: 'dashboard', label: 'Oversikt', icon: LayoutDashboard },
        { id: 'messages', label: 'Meldinger', icon: Mail },
        { id: 'hero', label: 'Forside (Hero)', icon: Image },
        { id: 'services', label: 'Tjenester', icon: Layers },
        { id: 'service-details', label: 'Tjeneste detaljer', icon: Layers },
        { id: 'about', label: 'Om oss', icon: Info },
        { id: 'calendar', label: 'Kalender', icon: Calendar },
        { id: 'contact-settings', label: 'Kontakt Info', icon: Settings },
        { id: 'innstillinger', label: 'Innstillinger', icon: Settings },
        { id: 'theme', label: 'Design', icon: Palette },
        { id: 'privacy', label: 'Personvern & Cookies', icon: ShieldCheck },
        { id: 'seo', label: 'SEO & Synlighet', icon: Globe },
        { id: 'administration', label: 'Administrasjon', icon: ShieldCheck },
    ];

    return (
        <div className={cn(
            "flex flex-col h-full w-64 bg-[#1B4965] text-white shadow-xl z-50 transition-transform duration-300 ease-in-out",
            "fixed inset-y-0 left-0 md:relative md:translate-x-0", // Mobile: Fixed & Sidebar logic. Desktop: Relative & Always visible
            isOpen ? "translate-x-0" : "-translate-x-full" // Toggle logic for mobile
        )}>

            {/* HEADER / LOGO AREA */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#2C5D7C]">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-2 rounded-lg bg-white/10">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight truncate text-white">
                        Dashboard
                    </h1>
                </div>
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
                    const isActive = activeTab === item.id;
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
            <div className="p-4 border-t border-[#2C5D7C] space-y-1">
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                    <Home className="w-5 h-5 shrink-0" />
                    <span className="truncate">Tilbake til nettsiden</span>
                </button>

                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-md transition-colors"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="truncate">Logg ut</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
