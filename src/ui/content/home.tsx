import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Remarkable } from 'remarkable';

import { db } from '../../firebase';
import { LayoutGuest, PublicMenu, truncate, fromObjectToList, SimplePaginate, DisplayTimeAgo } from '../../layout';
import CategorySidebar from '../../components/CategorySidebar';

const treeName = "articles";
let md = new Remarkable('full', {
    html: false,
    typographer: true,
});

type Article = {
    articleId?: string;
    title?: string;
    slug?: string;
    author?: string;
    desc?: string;
    date?: number;
    category?: string;
    [key: string]: unknown;
};

interface ArticleWidgetProps {
    title?: string;
    slug?: string;
    author?: string;
    desc?: string;
    date?: number;
    category?: string;
}

const ArticleWidget = ({ title, slug, author, desc, date, category }: ArticleWidgetProps) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate(`/article/${slug}`, { state: { title } });
    };

    return (
        <article 
            className="card p-6 mb-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
            onClick={handleClick}
        >
            <header className="mb-4">
                <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {title}
                    </h2>
                    {category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ml-3 flex-shrink-0">
                            {category}
                        </span>
                    )}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {author || 'Anonymous'}
                    </span>
                    <span className="mx-2">•</span>
                    <DisplayTimeAgo time={date} isTimeAgo={true} />
                </div>
            </header>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
                {desc && (
                    <div 
                        className="text-gray-700 dark:text-gray-300 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: md.render(truncate(desc, 300)) }} 
                    />
                )}
            </div>
            
            <footer className="mt-4 flex items-center text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300">
                <span>Read more</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </footer>
        </article>
    );
};

const ArticleWidgetEmpty = () => (
    <div className="card p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Articles Yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
            Start writing to see your articles appear here.
        </p>
    </div>
);

interface HomeState {
    currentPage: number;
    perPage: number;
    totalItemCount: number;
    datalist: Article[];
    filteredDatalist: Article[];
    categories: string[];
    selectedCategory: string;
    loading: boolean;
}

const Home = () => {
    const [state, setState] = useState<HomeState>({
        currentPage: 1,
        perPage: 20,
        totalItemCount: 0,
        datalist: [],
        filteredDatalist: [],
        categories: [],
        selectedCategory: '',
        loading: true,
    });

    const fetchArticles = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            // Fetch articles
            const snapshot = await db.ref(treeName).once('value');
            const list = fromObjectToList(snapshot.val()) as Article[];
            const sorted = list.sort((a, b) => (b.date || 0) - (a.date || 0));
            
            // Fetch categories to resolve categoryId to category name
            const categoriesSnapshot = await db.ref('categories').once('value');
            const categories = fromObjectToList(categoriesSnapshot.val());
            const categoryMap = categories.reduce((map: Record<string, string>, cat) => {
                if (cat.categoryId && typeof cat.categoryId === 'string') {
                    map[cat.categoryId] = cat.name || '';
                }
                return map;
            }, {});
            
            // Add category name to each article
            const articlesWithCategories = sorted.map(article => ({
                ...article,
                category: article.categoryId && typeof article.categoryId === 'string' 
                    ? categoryMap[article.categoryId] || null 
                    : null
            }));
            
            console.log('Articles loaded:', articlesWithCategories);
            console.log('Article categories:', articlesWithCategories.map(a => ({ title: a.title, category: a.category })));
            
            // Extract unique categories
            const uniqueCategories = Array.from(new Set(
                articlesWithCategories
                    .map(article => article.category)
                    .filter((category): category is string => Boolean(category))
            )).sort();
            
            console.log('Unique categories found:', uniqueCategories);
            
            setState(prev => ({
                ...prev,
                datalist: articlesWithCategories,
                filteredDatalist: articlesWithCategories,
                categories: uniqueCategories,
                totalItemCount: articlesWithCategories.length,
                loading: false,
            }));
        } catch (error) {
            console.error('Error getting articles:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const getDatalistPartial = useCallback((): Article[] => {
        const { filteredDatalist, perPage, currentPage } = state;
        const startIndex = (currentPage - 1) * perPage;
        return filteredDatalist.slice(startIndex, startIndex + perPage);
    }, [state.filteredDatalist, state.perPage, state.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCategoryFilter = useCallback((category: string) => {
        console.log('Filter called with category:', category);
        setState(prev => {
            const filtered = category 
                ? prev.datalist.filter(article => article.category === category)
                : prev.datalist;
            
            console.log('Filter result:', filtered);
            
            return {
                ...prev,
                selectedCategory: category,
                filteredDatalist: filtered,
                totalItemCount: filtered.length,
                currentPage: 1, // Reset to first page when filtering
            };
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageClick = useCallback((direction: 'next' | 'prev') => {
        setState(prev => {
            const totalPages = Math.max(1, Math.ceil(prev.totalItemCount / prev.perPage));
            const nextPage = direction === 'next' ? prev.currentPage + 1 : prev.currentPage - 1;
            const safePage = Math.min(Math.max(1, nextPage), totalPages);
            return { ...prev, currentPage: safePage };
        });
    }, []);

    const { filteredDatalist, loading, currentPage, totalItemCount, perPage, categories, selectedCategory } = state;

    return (
        <LayoutGuest>
            <PublicMenu />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="my-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Welcome Back!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Discover the latest articles and insights from our blog.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <main className="flex-1 w-full">
                        {/* Mobile Filter */}
                        {categories.length > 0 && (
                            <section className="mb-8 lg:hidden">
                                <div className="card p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Filter by category:
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => handleCategoryFilter(e.target.value)}
                                            className="input text-sm py-2 px-3 flex-1 sm:flex-initial"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedCategory && (
                                            <button
                                                onClick={() => handleCategoryFilter('')}
                                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                            >
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <svg className="animate-spin w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <>
                                <section className="space-y-6">
                                    {filteredDatalist.length > 0 ? (
                                        getDatalistPartial().map((article, index) => (
                                            <ArticleWidget key={article.articleId || index} {...article} />
                                        ))
                                    ) : (
                                        <ArticleWidgetEmpty />
                                    )}
                                </section>

                                <footer className="mt-12">
                                    <SimplePaginate 
                                        page={currentPage}
                                        totalPages={Math.ceil(totalItemCount / perPage)}
                                        handlePageClick={handlePageClick}
                                    />
                                </footer>
                            </>
                        )}
                    </main>

                    {/* Sidebar - Desktop Only */}
                    <aside className="hidden lg:block">
                        <CategorySidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryFilter}
                            totalArticles={state.datalist.length}
                            filteredCount={filteredDatalist.length}
                        />
                    </aside>
                </div>
            </div>
        </LayoutGuest>
    );
};

export default Home;