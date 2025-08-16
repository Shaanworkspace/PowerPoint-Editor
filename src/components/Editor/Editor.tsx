import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useDispatch, useSelector } from "react-redux";
import { updateSlide } from "../../store/slices/slidesSlice";
import { RootState } from "../../store/store";
import type { ChangeEvent } from "react";

// Helper functions
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
	const activeIndex = useSelector((state: RootState) => state.slides.activeIndex);
	
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

	// Enhanced slide loading with progress
	const loadSlideContent = useCallback(async (slideIndex: number) => {
		if (!fabricRef.current || slideIndex < 0 || slideIndex >= slides.length) return;
		
		const slide = slides[slideIndex];
		setIsLoading(true);
		setLoadingProgress(0);
		
		try {
			// Clear existing objects with progress
			const objects = fabricRef.current.getObjects();
			for (let i = 0; i < objects.length; i++) {
				fabricRef.current.remove(objects[i]);
				setLoadingProgress((i / objects.length) * 40);
				await new Promise(resolve => setTimeout(resolve, 2));
			}
			
			// Update background
			fabricRef.current.backgroundColor = canvasBg;
			setLoadingProgress(60);
			
			// Load slide content if exists
			if (slide?.content) {
				await new Promise<void>((resolve) => {
					fabricRef.current!.loadFromJSON(slide.content, () => {
						setLoadingProgress(90);
						fabricRef.current!.renderAll();
						resolve();
					});
				});
			}
			
			setLoadingProgress(100);
		} catch (error) {
			console.error('Error loading slide:', error);
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				setLoadingProgress(0);
			}, 200);
		}
	}, [slides, canvasBg]);

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
		fabricRef.current.on('object:modified', saveSlideContent);
		fabricRef.current.on('object:added', saveSlideContent);
		fabricRef.current.on('object:removed', saveSlideContent);
		
		fabricRef.current.on('selection:created', (e: any) => {
			setSelectedObj(e.selected?.[0] ?? null);
			setShowProps(true);
		});
		
		fabricRef.current.on('selection:cleared', () => {
			setSelectedObj(null);
			setShowProps(false);
		});

		// Mouse wheel zoom
		fabricRef.current.on('mouse:wheel', (opt) => {
			const delta = opt.e.deltaY;
			let zoom = fabricRef.current!.getZoom();
			zoom *= 0.999 ** delta;
			zoom = Math.max(0.1, Math.min(3, zoom));
			fabricRef.current!.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY } as fabric.Point, zoom);
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

	const addShape = (type: 'rect' | 'circle') => {
		const props = {
			left: 150 + Math.random() * 200,
			top: 150 + Math.random() * 150,
			fill: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][Math.floor(Math.random() * 4)],
			stroke: "#666",
			strokeWidth: 2,
		};

		let shape: fabric.Object;
		if (type === 'rect') {
			shape = new fabric.Rect({ ...props, width: 120, height: 80, rx: 10 });
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
			(fabric.Image.fromURL as (
				url: string,
				callback: (img: fabric.Image) => void
			) => void)(imageDataUrl, (img: fabric.Image) => {
				img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
				fabricRef.current?.add(img);
				fabricRef.current?.setActiveObject(img);
			});
			setShowImageModal(false);
		} catch (error) {
			console.error('Error uploading image:', error);
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
			const dataUrl = fabricRef.current.toDataURL({ multiplier: 1, format: "png", quality: 1 });
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
		<section className="w-full flex flex-col items-center relative">
			{/* Loading indicator */}
			{isLoading && (
				<div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
						<div>
							<div className="text-sm font-semibold text-gray-700">Loading Slide...</div>
							<div className="w-32 bg-gray-200 rounded-full h-2">
								<div 
									className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${loadingProgress}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Toolbar */}
			<div className="w-full max-w-5xl flex flex-wrap gap-2 mb-6 justify-center bg-gray-50 rounded-xl p-4 border">
				<button onClick={addText} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
					📝 Text
				</button>
				<button onClick={() => addShape('rect')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold">
					⬜ Rectangle
				</button>
				<button onClick={() => addShape('circle')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold">
					🟡 Circle
				</button>
				<button onClick={() => setShowImageModal(true)} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-semibold">
					🖼️ Image
				</button>
				<button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
					📤 Export
				</button>
				<button onClick={resetCanvas} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
					🗑️ Clear
				</button>
				<div className="flex items-center gap-2 ml-4">
					<label className="font-semibold text-gray-700">Background:</label>
					<input
						type="color"
						value={canvasBg}
						onChange={(e) => {
							setCanvasBg(e.target.value);
							if (fabricRef.current) {
								fabricRef.current.backgroundColor = e.target.value;
								fabricRef.current.renderAll();
								saveSlideContent();
							}
						}}
						className="w-8 h-8 border rounded cursor-pointer"
					/>
				</div>
			</div>

			{/* Canvas */}
			<div className="bg-white rounded-xl shadow-xl p-4 border">
				<canvas ref={canvasRef} className="border border-gray-300 rounded-lg" />
			</div>

			{/* Properties Panel */}
			{showProps && selectedObj && (
				<div className="fixed right-4 top-32 bg-white rounded-xl shadow-xl p-6 w-80 border z-40">
					<h3 className="font-bold text-lg mb-4 text-indigo-700">Properties</h3>
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span>Type:</span>
							<span className="bg-indigo-100 px-3 py-1 rounded-full text-sm font-medium capitalize">
								{selectedObj.type}
							</span>
						</div>
						{"fill" in selectedObj && (
							<div className="flex justify-between items-center">
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
							<button onClick={() => selectedObj.bringToFront() && fabricRef.current?.renderAll()} className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">
								Front
							</button>
							<button onClick={() => selectedObj.sendToBack() && fabricRef.current?.renderAll()} className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">
								Back
							</button>
							<button onClick={handleDelete} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold">
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Image Modal */}
			{showImageModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-96">
						<h3 className="text-lg font-bold mb-4">Add Image</h3>
						<input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 w-full" />
						<button onClick={() => setShowImageModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full">
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Export Modal */}
			{showExportModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-96">
						<h3 className="text-lg font-bold mb-4">Export Slide</h3>
						{exportUrl && <img src={exportUrl} alt="Preview" className="mb-4 rounded border w-full" />}
						<div className="flex gap-2">
							<a href={exportUrl} download={`slide-${activeIndex + 1}.png`} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center">
								Download
							</a>
							<button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Bar */}
			<div className="w-full max-w-5xl mt-6 flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border">
				<span className="text-sm text-gray-600">Slide {activeIndex + 1} of {slides.length}</span>
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