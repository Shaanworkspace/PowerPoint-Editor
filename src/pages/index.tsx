import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import Editor from '../components/Editor/Editor';
import Sidebar from '../components/Sidebar/Sidebar';
import Toolbar from '../components/Toolbar/Toolbar';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <Toolbar />
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar />
                    {/* Main Content */}
                    <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        {/* Decorative background */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-200 via-indigo-200 to-transparent rounded-full blur-3xl opacity-30" />
                            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-200 via-indigo-100 to-transparent rounded-full blur-2xl opacity-20" />
                        </div>
                        {/* Editor */}
                        <div className="relative z-10 w-full max-w-5xl">
                            <Editor />
                        </div>
                        {/* Footer */}
                        <footer className="w-full max-w-5xl mt-8 flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 rounded-xl shadow border border-indigo-200">
                            <span className="text-sm text-gray-500">PowerPoint Editor</span>
                            <span className="text-sm text-gray-400">© {new Date().getFullYear()} Shaanworkspace</span>
                        </footer>
                    </main>
                </div>
            </div>
        </Provider>
    );
};

export default App;