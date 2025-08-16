import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarVisible: boolean;
    toolbarVisible: boolean;
}

const initialState: UIState = {
    sidebarVisible: true,
    toolbarVisible: true,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.sidebarVisible = !state.sidebarVisible;
        },
        toggleToolbar(state) {
            state.toolbarVisible = !state.toolbarVisible;
        },
        setSidebarVisibility(state, action: PayloadAction<boolean>) {
            state.sidebarVisible = action.payload;
        },
        setToolbarVisibility(state, action: PayloadAction<boolean>) {
            state.toolbarVisible = action.payload;
        },
    },
});

export const { toggleSidebar, toggleToolbar, setSidebarVisibility, setToolbarVisibility } = uiSlice.actions;

export default uiSlice.reducer;