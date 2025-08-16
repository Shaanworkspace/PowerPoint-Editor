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
        <header className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-lg flex items-center px-8 py-4 gap-6 sticky top-0 z-20">
            <img src="/window.svg" alt="App Icon" className="w-10 h-10 mr-3 drop-shadow" />
            <span className="font-extrabold text-2xl text-white tracking-wide drop-shadow-lg flex-1">
                PowerPoint Editor
            </span>
            <button
                onClick={handleAddSlide}
                className="px-5 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-100 transition duration-200"
            >
                + Add Slide
            </button>
            <button
                onClick={handleToggleSidebar}
                className="px-5 py-2 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-100 transition duration-200"
            >
                Toggle Sidebar
            </button>
            {/* Example tool icons */}
            <button
                className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                title="Text Tool"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M4 6V4h16v2M9 20V10m6 10V10" />
                </svg>
                Text
            </button>
            <button
                className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                title="Shape Tool"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                Shape
            </button>
            <button
                className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                title="Image Tool"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="2.5" />
                    <path d="M21 15l-5-5-4 4-6-6" />
                </svg>
                Image
            </button>
        </header>
    );
};

export default Toolbar;