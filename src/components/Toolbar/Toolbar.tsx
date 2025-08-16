import React from 'react';
import { useDispatch } from 'react-redux';
import { addSlide, removeSlide } from '../../store/slices/slidesSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
// import './Toolbar.css';

const Toolbar: React.FC = () => {
    const dispatch = useDispatch();

    const handleAddSlide = () => {
        dispatch(addSlide());
    };

    // For removeSlide, you need to pass the slide id. Here, you should get the active slide id from props or state.
    // For demonstration, we'll use a placeholder function.
    const handleRemoveSlide = () => {
        // dispatch(removeSlide(activeSlideId));
        // Replace activeSlideId with your actual active slide id from Redux or props
    };

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar());
    };

    return (
        <div className="flex gap-2 bg-gray-200 p-2 rounded shadow">
            <button
                onClick={handleAddSlide}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Add Slide
            </button>
            <button
                onClick={handleRemoveSlide}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
                Delete Slide
            </button>
            <button
                onClick={handleToggleSidebar}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
                Toggle Sidebar
            </button>
            {/* Additional formatting buttons can be added here */}
        </div>
    );
};

export default Toolbar;