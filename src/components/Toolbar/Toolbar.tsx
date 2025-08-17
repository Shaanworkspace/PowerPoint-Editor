import React from 'react';
import { useDispatch } from 'react-redux';
import { addSlide } from '../../store/slices/slidesSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Toolbar: React.FC = () => {
    const dispatch = useDispatch();

    const handleAddSlide = () => {
        dispatch(addSlide());
    };

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar());
    };

    return (
        <header className="sticky top-0 z-30 flex items-center w-full gap-4 px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
            {/* App Logo & Title */}
            <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        PowerPoint Editor
                    </span>
                    <span className="text-xs text-gray-500">Presentation Studio</span>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Main Actions */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleAddSlide}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all duration-200 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600 hover:shadow-md"
                    title="Add New Slide"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 5v14m-7-7h14" />
                    </svg>
                    Add Slide
                </button>

                <button
                    onClick={handleToggleSidebar}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 hover:shadow-md"
                    title="Toggle Sidebar"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Sidebar
                </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* Design Tools */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center p-1 border border-gray-200 rounded-lg bg-gray-50">
                    <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-md hover:bg-white hover:shadow-sm"
                        title="Add Text"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M4 6V4h16v2M9 20V10m6 10V10" />
                        </svg>
                        Text
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-md hover:bg-white hover:shadow-sm"
                        title="Add Shape"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                        </svg>
                        Shape
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-md hover:bg-white hover:shadow-sm"
                        title="Add Image"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="2.5" />
                            <path d="M21 15l-5-5-4 4-6-6" />
                        </svg>
                        Image
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* File Actions */}
            <div className="flex items-center space-x-2">
                <button
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                    title="Save Presentation"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17,21 17,13 7,13 7,21" />
                        <polyline points="7,3 7,8 15,8" />
                    </svg>
                    Save
                </button>

                <button
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                    title="Export Presentation"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                </button>

                <div className="relative group">
                    <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                        title="More Options"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                        More
                    </button>
                    
                    {/* Dropdown menu (hidden by default, can be shown with JavaScript) */}
                    <div className="absolute right-0 z-50 invisible w-48 mt-2 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible">
                        <div className="py-1">
                            <button className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Duplicate Slide
                            </button>
                            <button className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Settings
                            </button>
                            <hr className="my-1" />
                            <button className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                                </svg>
                                Preferences
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center ml-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Toolbar;