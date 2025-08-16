import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSlide, removeSlide, reorderSlides } from '../../store/slices/slidesSlice';
import { RootState } from '../../store/store';

const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const slides = useSelector((state: RootState) => state.slides.slides);

    const handleAddSlide = () => {
        dispatch(addSlide());
    };

    const handleRemoveSlide = (id: string) => {
        dispatch(removeSlide(id));
    };

    const handleReorderSlides = (fromIndex: number, toIndex: number) => {
        dispatch(reorderSlides({ fromIndex, toIndex }));
    };

    return (
        <div className="w-64 bg-gray-100 p-4 border-r">
            <h2 className="text-lg font-bold mb-4">Slides</h2>
            <button 
                onClick={handleAddSlide} 
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            >
                Add Slide
            </button>
            <ul>
                {slides.map((slide, idx) => (
                    <li key={slide.id} className="flex items-center justify-between mb-2 p-2 bg-white rounded shadow">
                        <span>{slide.title}</span>
                        <button 
                            onClick={() => handleRemoveSlide(slide.id)} 
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Delete
                        </button>
                        {idx > 0 && (
                            <button 
                                onClick={() => handleReorderSlides(idx, idx - 1)} 
                                className="ml-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                            >
                                ↑
                            </button>
                        )}
                        {idx < slides.length - 1 && (
                            <button 
                                onClick={() => handleReorderSlides(idx, idx + 1)} 
                                className="ml-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                            >
                                ↓
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;