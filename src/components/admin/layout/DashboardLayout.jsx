import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ children, activeTab, onTabChange, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Close sidebar when tab changes (on mobile)
    const handleTabChange = (tab) => {
        onTabChange(tab);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans relative">

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">

                {/* TOPBAR */}
                <TopBar
                    title={title}
                    onMenuClick={toggleSidebar}
                />

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
