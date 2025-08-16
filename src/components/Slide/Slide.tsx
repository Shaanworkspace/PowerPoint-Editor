import React from 'react';

interface SlideProps {
    slideId: string;
    content: string;
    onRemove: (id: string) => void;
    onUpdate: (id: string, content: string) => void;
}

const Slide: React.FC<SlideProps> = ({ slideId, content, onRemove, onUpdate }) => {
    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(slideId, event.target.value);
    };

    return (
        <div className="bg-white rounded shadow p-4 flex flex-col">
            <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full h-32 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Edit your slide content here..."
            />
            <button
                onClick={() => onRemove(slideId)}
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition self-end"
            >
                Remove Slide
            </button>
        </div>
    );
};

export default Slide;