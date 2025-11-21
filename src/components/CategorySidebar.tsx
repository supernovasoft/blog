import React from 'react';

interface CategorySidebarProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    totalArticles: number;
    filteredCount: number;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
    categories, 
    selectedCategory, 
    onCategoryChange, 
    totalArticles, 
    filteredCount 
}) => {
    return (
        <div className="hidden lg:block">
            <div className="sticky top-4 w-64">
                <div className="card p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Filter by Category
                    </h3>
                    
                    <div className="space-y-2">
                        <button
                            onClick={() => onCategoryChange('')}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedCategory === ''
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            All Categories
                            <span className="float-right text-xs">
                                {totalArticles}
                            </span>
                        </button>
                        
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => onCategoryChange(category)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {category}
                                <span className="float-right text-xs">
                                    {/* Count would need to be calculated */}
                                </span>
                            </button>
                        ))}
                    </div>

                    {selectedCategory && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Showing {filteredCount} of {totalArticles} articles
                            </div>
                            <button
                                onClick={() => onCategoryChange('')}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                            >
                                Clear filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Additional sidebar content */}
                <div className="card p-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        About This Blog
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Technologies and Thoughts by <a href="https://about.supernovasoft.com" target="_blank" rel="noopener noreferrer">Supernova Software</a>. 
                        Sharing insights on development, design, and innovation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CategorySidebar;
