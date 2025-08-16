import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSlide, removeSlide, updateSlide } from '../../store/slices/slidesSlice';
import { RootState } from '../../store/store';
import Slide from '../Slide/Slide';

const Editor: React.FC = () => {
    const dispatch = useDispatch();
    const slides = useSelector((state: RootState) => state.slides.slides);

    // Improved: addSlide should create a new slide with default content if needed
    const handleAddSlide = () => {
        dispatch(addSlide("")); // or some default content
    };

    const handleRemoveSlide = (id: string) => {
        dispatch(removeSlide(id));
    };

    const handleUpdateSlide = (id: string, content: string) => {
        dispatch(updateSlide({ id, content }));
    };

    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-50 p-6">
            <button
                onClick={handleAddSlide}
                className="mb-4 px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            >
                Add Slide
            </button>
            <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
                {slides.map(slide => (
                    <Slide 
                        key={slide.id}
                        slideId={slide.id}
                        content={slide.content}
                        onRemove={handleRemoveSlide}
                        onUpdate={handleUpdateSlide}
                    />
                ))}
            </div>
        </div>
    );
};

export default Editor;