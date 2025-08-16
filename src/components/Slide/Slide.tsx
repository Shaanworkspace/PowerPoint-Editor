import React, { useState } from "react";

interface SlideProps {
    slideId: string;
    content: string;
    title?: string;
    onRemove: (id: string) => void;
    onUpdate: (id: string, content: string, title?: string) => void;
}

const Slide: React.FC<SlideProps> = ({
    slideId,
    content,
    title = "",
    onRemove,
    onUpdate,
}) => {
    const [editTitle, setEditTitle] = useState(title);
    const [editContent, setEditContent] = useState(content);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditContent(event.target.value);
        onUpdate(slideId, event.target.value, editTitle);
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditTitle(event.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        onUpdate(slideId, editContent, editTitle);
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-indigo-100 transition-all duration-300 max-w-2xl mx-auto my-8">
            {/* Slide header */}
            <div className="flex items-center justify-between mb-2">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        className="text-2xl font-bold text-indigo-700 border-b border-indigo-300 outline-none bg-transparent px-2 py-1 w-full"
                        autoFocus
                        placeholder="Slide Title"
                    />
                ) : (
                    <h3
                        className="text-2xl font-bold text-indigo-700 cursor-pointer px-2 py-1 hover:bg-indigo-50 rounded transition"
                        onClick={() => setIsEditingTitle(true)}
                        title="Click to edit title"
                    >
                        {editTitle || "Untitled Slide"}
                    </h3>
                )}
                <button
                    onClick={() => onRemove(slideId)}
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition font-semibold"
                    title="Remove Slide"
                >
                    Remove
                </button>
            </div>
            {/* Slide content */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600 mb-1" htmlFor={`slide-content-${slideId}`}>
                    Content
                </label>
                <textarea
                    id={`slide-content-${slideId}`}
                    value={editContent}
                    onChange={handleContentChange}
                    className="w-full min-h-[120px] max-h-[320px] p-3 border border-indigo-200 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-mono text-base transition"
                    placeholder="Edit your slide content here..."
                />
            </div>
            {/* Slide footer */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-400">
                    Slide ID: <span className="font-mono">{slideId}</span>
                </span>
                <span className="text-xs text-gray-400">
                    {editContent.length} characters
                </span>
            </div>
        </div>
    );
};

export default Slide;