export interface Slide {
    id: string;
    title: string;
    content: string;
}

export interface UIState {
    isSidebarOpen: boolean;
    isToolbarVisible: boolean;
}

export interface AppState {
    slides: Slide[];
    ui: UIState;
}