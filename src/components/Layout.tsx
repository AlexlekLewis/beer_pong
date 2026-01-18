import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';

type ViewMode = 'admin' | 'dashboard' | 'bracket';

interface LayoutProps {
    children: ReactNode;
    currentView: ViewMode;
    onChangeView: (view: ViewMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
    return (
        <div className="layout-container">
            <Sidebar currentView={currentView} onChangeView={onChangeView} />
            <main className="main-content">
                <div className="fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
