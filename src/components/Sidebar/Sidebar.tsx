import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setActiveIndex,
    addSlide,
    removeSlide,
    reorderSlides,
    updateSlide,
} from "../../store/slices/slidesSlice";
import { RootState } from "../../store/store";

const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const slides = useSelector((state: RootState) => state.slides.slides);
    const activeIndex = useSelector(
        (state: RootState) => state.slides.activeIndex
    );

    // For drag-and-drop reordering
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    // For slide title editing
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // For sidebar collapse/expand
    const [collapsed, setCollapsed] = useState(false);

    // For sidebar width drag
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [resizing, setResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizing) {
                setSidebarWidth(Math.max(200, Math.min(450, e.clientX)));
            }
        };
        const handleMouseUp = () => setResizing(false);

        if (resizing) {
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        
        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing]);

    // Drag-and-drop handlers
    const handleDragStart = (idx: number, e: React.DragEvent) => {
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        const target = e.target as HTMLElement;
        target.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    const handleDragOver = (idx: number, e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIdx(idx);
    };

    const handleDragLeave = () => {
        setDragOverIdx(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (
            draggedIdx !== null &&
            dragOverIdx !== null &&
            draggedIdx !== dragOverIdx
        ) {
            dispatch(
                reorderSlides({ fromIndex: draggedIdx, toIndex: dragOverIdx })
            );
        }
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    // Slide title edit handlers
    const startEditTitle = (idx: number, title: string) => {
        setEditingIdx(idx);
        setEditTitle(title);
    };

    const saveEditTitle = (idx: number, id: string) => {
        if (editTitle.trim()) {
            dispatch(
                updateSlide({ id, content: slides[idx].content, title: editTitle.trim() })
            );
        }
        setEditingIdx(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent, idx: number, id: string) => {
        if (e.key === 'Enter') {
            saveEditTitle(idx, id);
        } else if (e.key === 'Escape') {
            setEditingIdx(null);
        }
    };

    // Sidebar collapse/expand
    const toggleCollapse = () => setCollapsed((c) => !c);

    // Get slide preview content
    const getSlidePreview = (content: any) => {
        if (typeof content === 'string') {
            return content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }
        return 'Click to edit content';
    };

    return (
        <aside
            ref={sidebarRef}
            className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden relative shadow-sm ${
                collapsed ? "w-16" : ""
            }`}
            style={{ width: collapsed ? 64 : sidebarWidth, minHeight: "100vh" }}
        >
            {/* Resize handle - only show when expanded */}
            {!collapsed && (
                <div
                    className={`absolute top-0 right-0 h-full w-1 hover:w-2 cursor-ew-resize z-20 transition-all duration-200 ${
                        resizing ? 'bg-blue-500 w-2' : 'bg-gray-300 hover:bg-blue-400'
                    }`}
                    onMouseDown={() => setResizing(true)}
                />
            )}

            {/* Collapse/Expand button - Fixed positioning for both states */}
            <button
                onClick={toggleCollapse}
                className={`absolute z-30 p-2 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg ${
                    collapsed 
                        ? "top-4 left-1/2 transform -translate-x-1/2" 
                        : "top-4 right-16"
                }`}
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    {collapsed ? (
                        <path d="M9 5l7 7-7 7" />
                    ) : (
                        <path d="M15 19l-7-7 7-7" />
                    )}
                </svg>
            </button>

            {/* Sidebar header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b border-gray-200 ${collapsed ? "hidden" : ""}`}>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Slides</h2>
                </div>
                <button
                    onClick={() => dispatch(addSlide())}
                    className="flex items-center justify-center w-8 h-8 text-white transition-colors duration-200 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600"
                    title="Add Slide"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 5v14m-7-7h14" />
                    </svg>
                </button>
            </div>

            {/* Slides list */}
            <div className={`flex-1 overflow-y-auto px-4 py-4 ${collapsed ? "hidden" : ""}`}>
                <ul className="space-y-3">
                    {slides.map((slide, idx) => (
                        <li
                            key={slide.id}
                            draggable
                            onDragStart={(e) => handleDragStart(idx, e)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(idx, e)}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => dispatch(setActiveIndex(idx))}
                            className={`group relative rounded-xl cursor-pointer transition-all duration-200 border-2 overflow-hidden ${
                                activeIndex === idx
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : dragOverIdx === idx
                                    ? "border-blue-300 bg-blue-25"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            }`}
                        >
                            {/* Slide number indicator */}
                            <div className="absolute z-10 top-3 left-3">
                                <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                                    activeIndex === idx 
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}>
                                    {idx + 1}
                                </span>
                            </div>

                            {/* Slide content */}
                            <div className="p-4 pt-10">
                                {/* Title */}
                                <div className="mb-2">
                                    {editingIdx === idx ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={() => saveEditTitle(idx, slide.id)}
                                            onKeyDown={(e) => handleEditKeyDown(e, idx, slide.id)}
                                            className="w-full font-medium text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className="font-medium text-gray-900 truncate cursor-text"
                                            onDoubleClick={() => startEditTitle(idx, slide.title)}
                                            title={slide.title}
                                        >
                                            {slide.title}
                                        </h3>
                                    )}
                                </div>

                                {/* Content preview */}
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {getSlidePreview(slide.content)}
                                </p>

                                {/* Slide thumbnail placeholder */}
                                <div className="flex items-center justify-center h-16 mt-3 bg-gray-100 border border-gray-200 rounded-lg">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Slide controls */}
                            <div className="absolute flex items-center space-x-1 transition-opacity duration-200 opacity-0 top-3 right-3 group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEditTitle(idx, slide.title);
                                    }}
                                    className="p-1.5 bg-white hover:bg-gray-50 text-gray-600 rounded-md shadow-sm border border-gray-200 transition-colors"
                                    title="Edit Title"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this slide?')) {
                                            dispatch(removeSlide(slide.id));
                                        }
                                    }}
                                    className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-md shadow-sm border border-gray-200 transition-colors"
                                    title="Delete Slide"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Drag indicator */}
                            {draggedIdx === idx && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 rounded-xl">
                                    <span className="font-medium text-blue-600">Moving...</span>
                                </div>
                            )}

                            {/* Drop zone indicator */}
                            {dragOverIdx === idx && draggedIdx !== idx && (
                                <div className="absolute inset-0 bg-opacity-50 border-2 border-blue-400 border-dashed rounded-xl bg-blue-50"></div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Empty state */}
                {slides.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                        <p className="mb-2 text-sm text-gray-500">No slides yet</p>
                        <button
                            onClick={() => dispatch(addSlide())}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600"
                        >
                            Create your first slide
                        </button>
                    </div>
                )}
            </div>

            {/* Collapsed sidebar: show slide numbers only */}
            {collapsed && (
                <div className="flex flex-col items-center flex-1 py-16 space-y-2">
                    {/* Add slide button in collapsed mode */}
                    <button
                        onClick={() => dispatch(addSlide())}
                        className="flex items-center justify-center w-10 h-10 mb-4 text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                        title="Add Slide"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M12 5v14m-7-7h14" />
                        </svg>
                    </button>
                    
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => dispatch(setActiveIndex(idx))}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-all duration-200 ${
                                activeIndex === idx
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title={slide.title}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Sidebar footer */}
            <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${collapsed ? "hidden" : ""}`}>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
                    </span>
                    <span>Presentation Studio</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;