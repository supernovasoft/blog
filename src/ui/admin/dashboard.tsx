import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutUser, MainMenu, DisplayTimeAgo, fromObjectToList } from '../../layout';
import { db } from '../../firebase';

const Dashboard = () => {
    const navigate = useNavigate();
    const [state, setState] = React.useState({
        articleCount: 0,
        categoryCount: 0,
        recentArticles: [],
        loading: true,
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Get article count
                const articlesSnapshot = await db.ref('articles').once('value');
                const articleCount = articlesSnapshot.numChildren();
                
                // Get category count
                const categoriesSnapshot = await db.ref('categories').once('value');
                const categoryCount = categoriesSnapshot.numChildren();
                
                // Get recent articles (last 5)
                const recentSnapshot = await db.ref('articles')
                    .orderByChild('date')
                    .limitToLast(5)
                    .once('value');
                const recentArticles = fromObjectToList(recentSnapshot.val())
                    .reverse();
                
                setState({
                    articleCount,
                    categoryCount,
                    recentArticles,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, []);

    const { articleCount, categoryCount, recentArticles, loading } = state;
    
    return (
        <LayoutUser title="Dashboard">
            <MainMenu />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <svg className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Welcome to your technical blog admin panel
                        </p>
                    </div>
                    
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {loading ? '...' : articleCount}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Articles</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button 
                                    className="btn btn-primary w-full"
                                    onClick={() => navigate('/admin/articles')}
                                >
                                    View All Articles
                                </button>
                            </div>
                        </div>
                        
                        <div className="card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {loading ? '...' : categoryCount}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Categories</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button 
                                    className="btn btn-primary w-full"
                                    onClick={() => navigate('/admin/categories')}
                                >
                                    View All Categories
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick Actions & Recent Articles */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Quick Actions
                                </h2>
                                <div className="space-y-3">
                                    <button 
                                        className="btn btn-secondary w-full text-left flex items-center"
                                        onClick={() => navigate('/admin/articles')}
                                    >
                                        <svg className="w-5 h-5 mr-3 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <div>
                                            <div className="font-medium">New Article</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Create a new technical blog post</div>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        className="btn btn-secondary w-full text-left flex items-center"
                                        onClick={() => navigate('/admin/categories')}
                                    >
                                        <svg className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <div>
                                            <div className="font-medium">New Category</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Add a new category or topic</div>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        className="btn btn-secondary w-full text-left flex items-center"
                                        onClick={() => navigate('/')}
                                    >
                                        <svg className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        <div>
                                            <div className="font-medium">View Public Site</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">See how your blog looks to visitors</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recent Articles
                                </h2>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <svg className="animate-spin w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : recentArticles.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentArticles.map((article) => (
                                            <div key={article.articleId} className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {article.author || 'Admin'}
                                                            <span className="mx-2">•</span>
                                                            <DisplayTimeAgo time={article.date} isTimeAgo={true} />
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles yet</h3>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigate('/admin/articles')}
                                        >
                                            Create Your First Article
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutUser>
    );
};

export default Dashboard;