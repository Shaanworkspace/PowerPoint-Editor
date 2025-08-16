import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Slide {
    id: string;
    title: string;
    content: string;
}

interface SlidesState {
    slides: Slide[];
    activeIndex: number;
}

const initialState: SlidesState = {
    slides: [],
    activeIndex: 0,
};

const slidesSlice = createSlice({
    name: 'slides',
    initialState,
    reducers: {
        addSlide: (state, action: PayloadAction<string | undefined>) => {
            const newSlide: Slide = {
                id: Date.now().toString(),
                title: `Slide ${state.slides.length + 1}`,
                content: action.payload ?? "",
            };
            state.slides.push(newSlide);
            state.activeIndex = state.slides.length - 1;
        },
        removeSlide: (state, action: PayloadAction<string>) => {
            const idx = state.slides.findIndex(s => s.id === action.payload);
            state.slides = state.slides.filter(slide => slide.id !== action.payload);
            // After removing a slide, clamp activeIndex
            if (state.activeIndex >= state.slides.length) {
                state.activeIndex = Math.max(0, state.slides.length - 1);
            }
        },
        updateSlide: (
            state,
            action: PayloadAction<{ id: string; content: string; title?: string }>
        ) => {
            const index = state.slides.findIndex(slide => slide.id === action.payload.id);
            if (index !== -1) {
                state.slides[index].content = action.payload.content;
                if (typeof action.payload.title === 'string') {
                    state.slides[index].title = action.payload.title;
                }
            }
        },
        setActiveIndex: (state, action: PayloadAction<number>) => {
            state.activeIndex = action.payload;
        },
        reorderSlides: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
            const [movedSlide] = state.slides.splice(action.payload.fromIndex, 1);
            state.slides.splice(action.payload.toIndex, 0, movedSlide);
        },
    },
});

export const { addSlide, removeSlide, updateSlide, setActiveIndex, reorderSlides } = slidesSlice.actions;
export default slidesSlice.reducer;