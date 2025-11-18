import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { auth } from '../firebase';

interface MainMenuProps {
    activeItem?: string;
}

const MainMenu: React.FC<MainMenuProps> = ({ activeItem }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleItemClick = (path) => {
        navigate(`/admin${path}`);
    };

    const isActive = (path) => {
        return location.pathname === `/admin${path}`;
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <button
                            onClick={() => handleItemClick('')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive('')
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            Blog Administration
                        </button>
                        <button
                            onClick={() => handleItemClick('/articles')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive('/articles')
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            Articles
                        </button>
                        <button
                            onClick={() => handleItemClick('/categories')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive('/categories')
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            Categories
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={() => auth.doSignOut()}
                            className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

interface PublicMenuProps {
    activeItem?: string;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({ activeItem }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleItemClick = (path) => {
        navigate(path);
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => handleItemClick('/')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                location.pathname === '/'
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <strong>Blog</strong> | Supernova Software
                        </button>
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MainMenu;