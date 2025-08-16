import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import Editor from '../components/Editor/Editor';
import Sidebar from '../components/Sidebar/Sidebar';
import Toolbar from '../components/Toolbar/Toolbar';
// import '../styles/main.css';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <div className="app-container">
                <Sidebar />
                <Toolbar />
                <Editor />
            </div>
        </Provider>
    );
};

export default App;