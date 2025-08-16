import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Slide type should match your usage in Editor and Slide component
interface Slide {
    id: string;
    title: string;
    content: string;
}

interface SlidesState {
    slides: Slide[];
}

const initialState: SlidesState = {
    slides: [],
};

const slidesSlice = createSlice({
    name: 'slides',
    initialState,
    reducers: {
        // Accepts optional content, defaults to empty string
        addSlide: (state, action: PayloadAction<string | undefined>) => {
            const newSlide: Slide = {
                id: Date.now().toString(),
                title: `Slide ${state.slides.length + 1}`,
                content: action.payload ?? "",
            };
            state.slides.push(newSlide);
        },
        removeSlide: (state, action: PayloadAction<string>) => {
            state.slides = state.slides.filter(slide => slide.id !== action.payload);
        },
        updateSlide: (state, action: PayloadAction<{ id: string; content: string }>) => {
            const index = state.slides.findIndex(slide => slide.id === action.payload.id);
            if (index !== -1) {
                state.slides[index].content = action.payload.content;
            }
        },
        reorderSlides: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
            const [movedSlide] = state.slides.splice(action.payload.fromIndex, 1);
            state.slides.splice(action.payload.toIndex, 0, movedSlide);
        },
    },
});

export const { addSlide, removeSlide, updateSlide, reorderSlides } = slidesSlice.actions;

export default slidesSlice.reducer;