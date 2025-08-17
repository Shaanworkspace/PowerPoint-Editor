import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useDispatch, useSelector } from "react-redux";
import { updateSlide } from "../../store/slices/slidesSlice";
import { RootState } from "../../store/store";
import type { ChangeEvent } from "react";


const readImageFile = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

const debounce = (func: Function, wait: number) => {
	let timeout: NodeJS.Timeout;
	return function executedFunction(...args: any[]) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const slides = useSelector((state: RootState) => state.slides.slides);
	const activeIndex = useSelector(
		(state: RootState) => state.slides.activeIndex
	);

	// Refs and core state
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const [selectedObj, setSelectedObj] = useState<any>(null);
	const [canvasBg, setCanvasBg] = useState("#ffffff");
	const [showProps, setShowProps] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [showImageModal, setShowImageModal] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);
	const [exportUrl, setExportUrl] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Auto-save with debounce
	const saveSlideContent = useCallback(
		debounce(() => {
			if (!fabricRef.current || !slides[activeIndex]) return;
			const content = JSON.stringify(fabricRef.current.toJSON());
			dispatch(updateSlide({ id: slides[activeIndex].id, content }));
			setLastSaved(new Date());
		}, 800),
		[dispatch, activeIndex, slides]
	);

	
	    // Enhanced slide loading with better preservation and smoother progress
    const loadSlideContent = useCallback(
        async (slideIndex: number) => {
            if (
                !fabricRef.current ||
                slideIndex < 0 ||
                slideIndex >= slides.length
            )
                return;
    
            const slide = slides[slideIndex];
            
            // Only show loading for slides with substantial content or first load
            const shouldShowLoading = !slide.content || slide.content.length > 1000;
            
            if (shouldShowLoading) {
                setIsLoading(true);
                setLoadingProgress(0);
            }
    
            try {
                // Store current canvas state before clearing (for undo functionality)
                const currentContent = fabricRef.current.toJSON();
                
                // Quick progress update
                if (shouldShowLoading) {
                    setLoadingProgress(20);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
    
                // Clear existing objects efficiently
                fabricRef.current.clear();
                
                if (shouldShowLoading) {
                    setLoadingProgress(40);
                    await new Promise(resolve => setTimeout(resolve, 30));
                }
    
                // Set background
                fabricRef.current.backgroundColor = canvasBg;
                
                if (shouldShowLoading) {
                    setLoadingProgress(60);
                }
    
                // Load slide content if exists
                if (slide?.content) {
                    await new Promise<void>((resolve) => {
                        try {
                            fabricRef.current!.loadFromJSON(slide.content, () => {
                                if (shouldShowLoading) {
                                    setLoadingProgress(90);
                                }
                                fabricRef.current!.renderAll();
                                resolve();
                            });
                        } catch (error) {
                            console.warn("Error loading slide content:", error);
                            resolve();
                        }
                    });
                } else {
                    // For empty slides, just render
                    fabricRef.current.renderAll();
                }
    
                if (shouldShowLoading) {
                    setLoadingProgress(100);
                    // Quick finish
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
    
            } catch (error) {
                console.error("Error loading slide:", error);
            } finally {
                if (shouldShowLoading) {
                    setTimeout(() => {
                        setIsLoading(false);
                        setLoadingProgress(0);
                    }, 150);
                }
            }
        },
        [slides, canvasBg]
    );

	// Initialize canvas
	useEffect(() => {
		if (!canvasRef.current || fabricRef.current) return;

		fabricRef.current = new fabric.Canvas(canvasRef.current, {
			backgroundColor: canvasBg,
			width: 1000,
			height: 600,
			selection: true,
			preserveObjectStacking: true,
		});

		// Event listeners
		fabricRef.current.on("object:modified", saveSlideContent);
		fabricRef.current.on("object:added", saveSlideContent);
		fabricRef.current.on("object:removed", saveSlideContent);

		fabricRef.current.on("selection:created", (e: any) => {
			setSelectedObj(e.selected?.[0] ?? null);
			setShowProps(true);
		});

		fabricRef.current.on("selection:cleared", () => {
			setSelectedObj(null);
			setShowProps(false);
		});

		// Mouse wheel zoom
		fabricRef.current.on("mouse:wheel", (opt) => {
			const delta = opt.e.deltaY;
			let zoom = fabricRef.current!.getZoom();
			zoom *= 0.999 ** delta;
			zoom = Math.max(0.1, Math.min(3, zoom));
			fabricRef.current!.zoomToPoint(
				{ x: opt.e.offsetX, y: opt.e.offsetY } as fabric.Point,
				zoom
			);
			opt.e.preventDefault();
		});
	}, [saveSlideContent, canvasBg]);

	// Load slide when activeIndex changes
	useEffect(() => {
		if (fabricRef.current && slides.length > 0) {
			loadSlideContent(activeIndex);
		}
	}, [activeIndex, loadSlideContent]);

	// Tool functions
	const addText = () => {
		const text = new fabric.Textbox("Edit me", {
			left: 100 + Math.random() * 200,
			top: 100 + Math.random() * 200,
			fontSize: 32,
			fill: "#2d3748",
			fontFamily: "Arial, sans-serif",
			fontWeight: "bold",
		});
		fabricRef.current?.add(text);
		fabricRef.current?.setActiveObject(text);
	};

	const addShape = (type: "rect" | "circle") => {
		const props = {
			left: 150 + Math.random() * 200,
			top: 150 + Math.random() * 150,
			fill: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"][
				Math.floor(Math.random() * 4)
			],
			stroke: "#666",
			strokeWidth: 2,
		};

		let shape: fabric.Object;
		if (type === "rect") {
			shape = new fabric.Rect({
				...props,
				width: 120,
				height: 80,
				rx: 10,
			});
		} else {
			shape = new fabric.Circle({ ...props, radius: 50 });
		}

		fabricRef.current?.add(shape);
		fabricRef.current?.setActiveObject(shape);
	};

	const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !fabricRef.current) return;

		try {
			const imageDataUrl = await readImageFile(file);
			(
				fabric.Image.fromURL as (
					url: string,
					callback: (img: fabric.Image) => void
				) => void
			)(imageDataUrl, (img: fabric.Image) => {
				img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
				fabricRef.current?.add(img);
				fabricRef.current?.setActiveObject(img);
			});
			setShowImageModal(false);
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};

	const handleDelete = () => {
		if (selectedObj && fabricRef.current) {
			fabricRef.current.remove(selectedObj);
			setSelectedObj(null);
			setShowProps(false);
		}
	};

	const handleExport = () => {
		if (fabricRef.current) {
			const dataUrl = fabricRef.current.toDataURL({
				multiplier: 1,
				format: "png",
				quality: 1,
			});
			setExportUrl(dataUrl);
			setShowExportModal(true);
		}
	};

	const resetCanvas = () => {
		if (fabricRef.current) {
			fabricRef.current.clear();
			fabricRef.current.backgroundColor = canvasBg;
			fabricRef.current.renderAll();
			saveSlideContent();
		}
	};

	return (
		<section className="relative flex flex-col items-center w-full">
			{/* Loading indicator */}
			{isLoading && (
				<div className="fixed z-50 p-4 bg-white rounded-lg shadow-lg bottom-4 right-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 border-2 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
						<div>
							<div className="text-sm font-semibold text-gray-700">
								Loading Slide...
							</div>
							<div className="w-32 h-2 bg-gray-200 rounded-full">
								<div
									className="h-2 transition-all duration-300 bg-indigo-600 rounded-full"
									style={{ width: `${loadingProgress}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Toolbar */}
			<div className="w-full max-w-6xl mx-auto mb-6">
				<div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
					{/* Primary Toolbar */}
					<div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
						<div className="flex items-center space-x-1">
							{/* Insert Group */}
							<div className="flex items-center pr-4 space-x-1 border-r border-gray-300">
								<span className="px-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
									Insert
								</span>
								<button
									onClick={addText}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-blue-50 group"
									title="Add Text"
								>
									<svg
										className="w-5 h-5 mb-1 text-blue-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M4 7V4a1 1 0 011-1h5M4 7H2m2 0h3m6 0V4a1 1 0 011-1h5m0 3v3m0-3H9m10 0h2m-2 0v3m-9 8V7m0 11H2m2 0h3" />
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
										Text
									</span>
								</button>
								<button
									onClick={() => addShape("rect")}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-gray-50 group"
									title="Add Rectangle"
								>
									<svg
										className="w-5 h-5 mb-1 text-gray-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<rect
											x="3"
											y="3"
											width="18"
											height="18"
											rx="2"
											ry="2"
										/>
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-gray-600">
										Rectangle
									</span>
								</button>
								<button
									onClick={() => addShape("circle")}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-yellow-50 group"
									title="Add Circle"
								>
									<svg
										className="w-5 h-5 mb-1 text-yellow-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<circle cx="12" cy="12" r="10" />
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-yellow-600">
										Circle
									</span>
								</button>
								<button
									onClick={() => setShowImageModal(true)}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-purple-50 group"
									title="Add Image"
								>
									<svg
										className="w-5 h-5 mb-1 text-purple-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<rect
											x="3"
											y="3"
											width="18"
											height="18"
											rx="2"
											ry="2"
										/>
										<circle cx="8.5" cy="8.5" r="1.5" />
										<path d="M21 15l-5-5L5 21" />
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">
										Image
									</span>
								</button>
							</div>

							{/* Actions Group */}
							<div className="flex items-center pr-4 space-x-1 border-r border-gray-300">
								<span className="px-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
									Actions
								</span>
								<button
									onClick={handleExport}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-green-50 group"
									title="Export Presentation"
								>
									<svg
										className="w-5 h-5 mb-1 text-green-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-green-600">
										Export
									</span>
								</button>
								<button
									onClick={resetCanvas}
									className="flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-lg hover:bg-red-50 group"
									title="Clear Canvas"
								>
									<svg
										className="w-5 h-5 mb-1 text-red-600"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									<span className="text-xs font-medium text-gray-700 group-hover:text-red-600">
										Clear
									</span>
								</button>
							</div>

							{/* Background Group */}
							<div className="flex items-center space-x-3">
								<span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
									Background
								</span>
								<div className="flex items-center space-x-2">
									<div className="relative">
										<input
											type="color"
											value={canvasBg}
											onChange={(e) => {
												setCanvasBg(e.target.value);
												if (fabricRef.current) {
													fabricRef.current.backgroundColor =
														e.target.value;
													fabricRef.current.renderAll();
													saveSlideContent();
												}
											}}
											className="sr-only"
											id="background-color"
										/>
										<label
											htmlFor="background-color"
											className="flex items-center justify-center w-8 h-8 transition-colors border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
											style={{
												backgroundColor: canvasBg,
											}}
											title="Change Background Color"
										>
											<svg
												className="w-4 h-4 text-white drop-shadow-sm"
												fill="none"
												stroke="currentColor"
												strokeWidth={2}
												viewBox="0 0 24 24"
											>
												<path d="M7 21a4 4 0 01-4-4c0-5 4-7 4-7s4 2 4 7a4 4 0 01-4 4zM20.2 15.9A2 2 0 0019 18h-1a2 2 0 01-2-2 2 2 0 012-2h1a2 2 0 011.2.9z" />
											</svg>
										</label>
									</div>
									<span className="text-sm font-medium text-gray-600">
										{canvasBg.toUpperCase()}
									</span>
								</div>
							</div>
						</div>

						{/* Secondary Actions */}
						<div className="flex items-center space-x-2">
							<div className="flex items-center p-1 space-x-1 bg-gray-100 rounded-lg">
								<button className="px-3 py-1 text-sm font-medium text-gray-700 transition-all rounded hover:bg-white hover:shadow-sm">
									Undo
								</button>
								<button className="px-3 py-1 text-sm font-medium text-gray-700 transition-all rounded hover:bg-white hover:shadow-sm">
									Redo
								</button>
							</div>
							<div className="w-px h-6 bg-gray-300"></div>
							<button
								className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100"
								title="More Options"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<circle cx="12" cy="12" r="1" />
									<circle cx="19" cy="12" r="1" />
									<circle cx="5" cy="12" r="1" />
								</svg>
							</button>
						</div>
					</div>

					{/* Quick Access Toolbar (Optional) */}
					<div className="flex items-center justify-between px-6 py-2 text-sm bg-white">
						<div className="flex items-center space-x-4">
							<span className="text-gray-500">Quick Access:</span>
							<button className="font-medium text-blue-600 transition-colors hover:text-blue-700">
								Bold
							</button>
							<button className="font-medium text-blue-600 transition-colors hover:text-blue-700">
								Italic
							</button>
							<button className="font-medium text-blue-600 transition-colors hover:text-blue-700">
								Align Center
							</button>
						</div>
						<div className="flex items-center space-x-4 text-gray-500">
							<span>Zoom: 100%</span>
							<span>•</span>
							<span>Canvas: 1920 × 1080</span>
						</div>
					</div>
				</div>
			</div>

			{/* Canvas */}
			{/* Canvas Container */}
			<div className="flex items-center justify-center flex-1 p-6 bg-gray-50">
				<div className="relative">
					{/* Canvas Wrapper */}
					<div className="relative overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
						{/* Canvas Header */}
						<div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
							<div className="flex items-center space-x-3">
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								</div>
								<span className="text-sm font-medium text-gray-700">
									Slide {activeIndex + 1} of {slides.length}
								</span>
							</div>
							<div className="flex items-center space-x-3">
								{/* Zoom Controls */}
								<div className="flex items-center p-1 space-x-1 bg-white border border-gray-200 rounded-lg">
									<button
										className="p-1 text-gray-600 transition-colors rounded hover:bg-gray-100"
										title="Zoom Out"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											viewBox="0 0 24 24"
										>
											<circle cx="11" cy="11" r="8" />
											<path d="M21 21l-4.35-4.35" />
											<path d="M11 8h6" />
										</svg>
									</button>
									<span className="px-2 font-mono text-sm text-gray-600">
										100%
									</span>
									<button
										className="p-1 text-gray-600 transition-colors rounded hover:bg-gray-100"
										title="Zoom In"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											viewBox="0 0 24 24"
										>
											<circle cx="11" cy="11" r="8" />
											<path d="M21 21l-4.35-4.35" />
											<path d="M11 8v6" />
											<path d="M8 11h6" />
										</svg>
									</button>
								</div>
								{/* Fit to Screen */}
								<button
									className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
									title="Fit to Screen"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
									</svg>
								</button>
							</div>
						</div>

						{/* Canvas Area */}
						<div className="relative p-8 bg-gray-100">
							{/* Ruler - Top */}
							<div className="absolute top-0 flex items-end h-6 bg-white border-b border-gray-300 left-8 right-8">
								{Array.from({ length: 20 }, (_, i) => (
									<div key={i} className="relative flex-1">
										<div className="absolute bottom-0 left-0 w-px h-2 bg-gray-400"></div>
										{i % 5 === 0 && (
											<span className="absolute font-mono text-xs text-gray-500 bottom-2 left-1">
												{i * 50}
											</span>
										)}
									</div>
								))}
							</div>

							{/* Ruler - Left */}
							<div className="absolute left-0 flex flex-col justify-between w-8 bg-white border-r border-gray-300 top-6 bottom-8">
								{Array.from({ length: 12 }, (_, i) => (
									<div key={i} className="relative flex-1">
										<div className="absolute top-0 right-0 w-2 h-px bg-gray-400"></div>
										{i % 3 === 0 && (
											<span className="absolute font-mono text-xs text-gray-500 origin-center -rotate-90 right-2 top-1">
												{i * 50}
											</span>
										)}
									</div>
								))}
							</div>

							{/* Canvas Shadow */}
							<div
								className="absolute mt-6 ml-8 rounded-lg shadow-2xl"
								style={{
									width: "calc(100% - 4rem)",
									height: "calc(100% - 3rem)",
									background:
										"linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)",
									transform: "translate(4px, 4px)",
									zIndex: 0,
								}}
							></div>

							{/* Main Canvas */}
							<div
								className="relative mt-6 ml-8 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg"
								style={{ zIndex: 1 }}
							>
								<canvas
									ref={canvasRef}
									className="block"
									style={{
										display: "block",
										borderRadius: "0.5rem",
									}}
								/>

								{/* Canvas Overlay - Selection Indicators */}
								<div className="absolute inset-0 pointer-events-none">
									{/* Corner resize handles (shown when object is selected) */}
									<div className="absolute w-2 h-2 transition-opacity bg-blue-500 border border-white rounded-full shadow-md opacity-0 top-2 left-2"></div>
									<div className="absolute w-2 h-2 transition-opacity bg-blue-500 border border-white rounded-full shadow-md opacity-0 top-2 right-2"></div>
									<div className="absolute w-2 h-2 transition-opacity bg-blue-500 border border-white rounded-full shadow-md opacity-0 bottom-2 left-2"></div>
									<div className="absolute w-2 h-2 transition-opacity bg-blue-500 border border-white rounded-full shadow-md opacity-0 bottom-2 right-2"></div>
								</div>
							</div>

							{/* Grid Pattern Background */}
							<div
								className="absolute mt-6 ml-8 pointer-events-none opacity-30"
								style={{
									width: "calc(100% - 4rem)",
									height: "calc(100% - 3rem)",
									backgroundImage: `
							 radial-gradient(circle, #cbd5e0 1px, transparent 1px)
						 `,
									backgroundSize: "20px 20px",
									zIndex: 0,
								}}
							></div>
						</div>

						{/* Canvas Footer */}
						<div className="flex items-center justify-between px-4 py-2 text-sm border-t border-gray-200 bg-gray-50">
							<div className="flex items-center space-x-4 text-gray-600">
								<span className="flex items-center space-x-1">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
									<span>Objects: 0</span>
								</span>
								<span>•</span>
								<span>Position: 0, 0</span>
								<span>•</span>
								<span>Size: 1920 × 1080</span>
							</div>
							<div className="flex items-center space-x-2 text-gray-500">
								<span className="flex items-center space-x-1">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<span>Auto-saved</span>
								</span>
								<span>•</span>
								<span>
									{new Date().toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
					</div>

					{/* Floating Action Button */}
					<button className="absolute w-12 h-12 text-white transition-all duration-200 bg-blue-500 rounded-full shadow-lg bottom-4 right-4 hover:bg-blue-600 hover:shadow-xl">
						<svg
							className="w-6 h-6 mx-auto"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path d="M12 5v14m-7-7h14" />
						</svg>
					</button>

					{/* Properties Panel Toggle */}
					<button className="absolute p-2 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm top-4 right-4 hover:bg-gray-50">
						<svg
							className="w-5 h-5 text-gray-600"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</button>
				</div>
			</div>

			{/* Properties Panel */}
			{showProps && selectedObj && (
				<div className="fixed z-40 p-6 bg-white border shadow-xl right-4 top-32 rounded-xl w-80">
					<h3 className="mb-4 text-lg font-bold text-indigo-700">
						Properties
					</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span>Type:</span>
							<span className="px-3 py-1 text-sm font-medium capitalize bg-indigo-100 rounded-full">
								{selectedObj.type}
							</span>
						</div>
						{"fill" in selectedObj && (
							<div className="flex items-center justify-between">
								<label>Fill:</label>
								<input
									type="color"
									value={selectedObj.fill as string}
									onChange={(e) => {
										selectedObj.set("fill", e.target.value);
										fabricRef.current?.renderAll();
										saveSlideContent();
									}}
									className="w-8 h-8 border rounded cursor-pointer"
								/>
							</div>
						)}
						<div className="flex gap-2 mt-4">
							<button
								onClick={() =>
									selectedObj.bringToFront() &&
									fabricRef.current?.renderAll()
								}
								className="flex-1 px-3 py-2 text-sm font-semibold transition bg-gray-100 rounded-lg hover:bg-gray-200"
							>
								Front
							</button>
							<button
								onClick={() =>
									selectedObj.sendToBack() &&
									fabricRef.current?.renderAll()
								}
								className="flex-1 px-3 py-2 text-sm font-semibold transition bg-gray-100 rounded-lg hover:bg-gray-200"
							>
								Back
							</button>
							<button
								onClick={handleDelete}
								className="flex-1 px-3 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg hover:bg-red-600"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Image Modal */}
			{showImageModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="p-6 bg-white shadow-xl rounded-xl w-96">
						<h3 className="mb-4 text-lg font-bold">Add Image</h3>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="w-full mb-4"
						/>
						<button
							onClick={() => setShowImageModal(false)}
							className="w-full px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Export Modal */}
			{showExportModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="p-6 bg-white shadow-xl rounded-xl w-96">
						<h3 className="mb-4 text-lg font-bold">Export Slide</h3>
						{exportUrl && (
							<img
								src={exportUrl}
								alt="Preview"
								className="w-full mb-4 border rounded"
							/>
						)}
						<div className="flex gap-2">
							<a
								href={exportUrl}
								download={`slide-${activeIndex + 1}.png`}
								className="flex-1 px-4 py-2 text-center text-white bg-green-600 rounded hover:bg-green-700"
							>
								Download
							</a>
							<button
								onClick={() => setShowExportModal(false)}
								className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Bar */}
			<div className="flex items-center justify-between w-full max-w-5xl px-4 py-3 mt-6 border bg-gray-50 rounded-xl">
				<span className="text-sm text-gray-600">
					Slide {activeIndex + 1} of {slides.length}
				</span>
				{lastSaved && (
					<span className="text-sm text-gray-500">
						Last saved: {lastSaved.toLocaleTimeString()}
					</span>
				)}
			</div>
		</section>
	);
};

export default Editor;
