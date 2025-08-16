import { configureStore } from '@reduxjs/toolkit';
import slidesReducer from './slices/slidesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    slides: slidesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;