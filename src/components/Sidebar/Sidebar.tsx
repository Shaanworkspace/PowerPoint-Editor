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
    const [sidebarWidth, setSidebarWidth] = useState(288);
    const [resizing, setResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizing) {
                setSidebarWidth(Math.max(180, Math.min(400, e.clientX)));
            }
        };
        const handleMouseUp = () => setResizing(false);

        if (resizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing]);

    // Drag-and-drop handlers
    const handleDragStart = (idx: number) => setDraggedIdx(idx);
    const handleDragOver = (idx: number) => setDragOverIdx(idx);
    const handleDrop = () => {
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
        dispatch(
            updateSlide({ id, content: slides[idx].content, title: editTitle })
        );
        setEditingIdx(null);
    };

    // Sidebar collapse/expand
    const toggleCollapse = () => setCollapsed((c) => !c);

    return (
        <aside
            ref={sidebarRef}
            className={`bg-gradient-to-b from-blue-700 via-indigo-600 to-purple-700 border-r flex flex-col transition-all duration-300 overflow-y-auto relative shadow-2xl ${
                collapsed ? "w-16" : ""
            }`}
            style={{ width: collapsed ? 64 : sidebarWidth, minHeight: "100vh" }}
        >
            {/* Resize handle */}
            <div
                className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-20"
                onMouseDown={() => setResizing(true)}
                style={{ userSelect: "none" }}
            />
            {/* Collapse/Expand button */}
            <button
                onClick={toggleCollapse}
                className="absolute top-6 right-14 bg-white bg-opacity-80 rounded-full shadow p-2 hover:bg-indigo-100 transition z-30"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {collapsed ? (
                    <svg
                        className="w-5 h-5 text-indigo-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                ) : (
                    <svg
                        className="w-5 h-5 text-indigo-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>
            {/* Sidebar header */}
            <div
                className={`flex items-center justify-between mb-4 px-4 pt-6 ${
                    collapsed ? "hidden" : ""
                }`}
            >
                <h2 className="text-xl font-extrabold text-white drop-shadow tracking-wide">
                    Slides
                </h2>
                <button
                    onClick={() => dispatch(addSlide())}
                    className="px-3 py-1 bg-white text-blue-700 rounded shadow hover:bg-blue-100 transition font-bold"
                    title="Add Slide"
                >
                    +
                </button>
            </div>
            {/* Slides list */}
            <ul className={`space-y-6 px-3 pb-6 ${collapsed ? "hidden" : ""}`}>
                {slides.map((slide, idx) => (
                    <li
                        key={slide.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            handleDragOver(idx);
                        }}
                        onDrop={handleDrop}
                        onClick={() => dispatch(setActiveIndex(idx))}
                        className={`relative group rounded-2xl shadow-xl cursor-pointer transition-all border-4 ${
                            activeIndex === idx
                                ? "border-white bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100"
                                : dragOverIdx === idx
                                ? "border-indigo-400 bg-indigo-50"
                                : "border-transparent bg-white bg-opacity-80 hover:border-blue-300"
                        }`}
                        style={{
                            minHeight: 110,
                            boxShadow:
                                activeIndex === idx
                                    ? "0 0 0 2px #6366f1, 0 8px 32px rgba(0,0,0,0.15)"
                                    : "0 4px 24px rgba(0,0,0,0.12)",
                        }}
                    >
                        {/* Thumbnail frame */}
                        <div className="w-full h-28 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                            {/* Simulated slide thumbnail: show title and a content preview */}
                            <div className="w-full h-full flex flex-col justify-center px-3 py-2">
                                {editingIdx === idx ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(e.target.value)
                                        }
                                        onBlur={() =>
                                            saveEditTitle(idx, slide.id)
                                        }
                                        className="font-semibold text-indigo-700 truncate border-b border-indigo-400 outline-none bg-transparent"
                                        autoFocus
                                    />
                                ) : (
                                    <div
                                        className="font-semibold text-indigo-700 truncate text-lg"
                                        onDoubleClick={() =>
                                            startEditTitle(idx, slide.title)
                                        }
                                        title="Double-click to edit title"
                                    >
                                        {slide.title}
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 truncate font-mono mt-1">
                                    {/* Show JSON preview for debugging */}
                                    {JSON.stringify({
                                        title: slide.title,
                                        content: slide.content,
                                    }).slice(0, 60)}
                                </div>
                            </div>
                        </div>
                        {/* Slide controls */}
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            {idx > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(
                                            reorderSlides({
                                                fromIndex: idx,
                                                toIndex: idx - 1,
                                            })
                                        );
                                    }}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
                                    title="Move Up"
                                >
                                    ↑
                                </button>
                            )}
                            {idx < slides.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(
                                            reorderSlides({
                                                fromIndex: idx,
                                                toIndex: idx + 1,
                                            })
                                        );
                                    }}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
                                    title="Move Down"
                                >
                                    ↓
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(removeSlide(slide.id));
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                title="Delete"
                            >
                                🗑
                            </button>
                        </div>
                        {/* Active indicator */}
                        {activeIndex === idx && (
                            <span className="absolute top-2 right-2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full shadow"></span>
                        )}
                        {/* Drag indicator */}
                        {draggedIdx === idx && (
                            <span className="absolute bottom-2 right-2 text-xs text-indigo-500">
                                Dragging
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {/* Collapsed sidebar: show slide numbers only */}
            {collapsed && (
                <ul className="flex flex-col items-center gap-2 pt-12">
                    {slides.map((slide, idx) => (
                        <li
                            key={slide.id}
                            onClick={() => dispatch(setActiveIndex(idx))}
                            className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm transition ${
                                activeIndex === idx
                                    ? "bg-white text-indigo-700 border-2 border-indigo-500"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            }`}
                            title={slide.title}
                        >
                            {idx + 1}
                        </li>
                    ))}
                </ul>
            )}
            {/* Sidebar footer */}
            <div
                className={`mt-auto px-4 py-3 text-xs text-white border-t border-indigo-200 ${
                    collapsed ? "hidden" : ""
                }`}
            >
                <span>Slides: {slides.length}</span>
                <span className="float-right">
                    © {new Date().getFullYear()} PowerPoint Editor
                </span>
            </div>
        </aside>
    );
};

export default Sidebar;
