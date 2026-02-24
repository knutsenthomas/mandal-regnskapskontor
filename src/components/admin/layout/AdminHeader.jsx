import React from 'react';

const AdminHeader = ({ icon: Icon, title, description, badge, children }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shrink-0">
                        <Icon className="w-6 h-6 text-[#1B4965]" />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        {badge && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/20">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
};

export default AdminHeader;
