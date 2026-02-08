import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ children, activeTab, onTabChange, title }) => {
    return (
        <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans">
            {/* SIDEBAR - Fixed width */}
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

            {/* MAIN AREA - Flex grow */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* TOPBAR - Fixed height */}
                <TopBar title={title} />

                {/* CONTENT - Scrollable */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
