import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Remarkable } from 'remarkable';

import { db } from '../../firebase';
import { LayoutGuest, PublicMenu, truncate, fromObjectToList, SimplePaginate, DisplayTimeAgo } from '../../layout';

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
    [key: string]: unknown;
};

interface ArticleWidgetProps {
    title?: string;
    slug?: string;
    author?: string;
    desc?: string;
    date?: number;
}

const ArticleWidget = ({ title, slug, author, desc, date }: ArticleWidgetProps) => {
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {title}
                </h2>
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
    loading: boolean;
}

const Home = () => {
    const [state, setState] = useState<HomeState>({
        currentPage: 1,
        perPage: 20,
        totalItemCount: 0,
        datalist: [],
        loading: true,
    });

    const fetchArticles = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const snapshot = await db.ref(treeName).once('value');
            const list = fromObjectToList(snapshot.val()) as Article[];
            const sorted = list.sort((a, b) => (b.date || 0) - (a.date || 0));
            setState(prev => ({
                ...prev,
                datalist: sorted,
                totalItemCount: sorted.length,
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
        const { datalist, perPage, currentPage } = state;
        const startIndex = (currentPage - 1) * perPage;
        return datalist.slice(startIndex, startIndex + perPage);
    }, [state.datalist, state.perPage, state.currentPage]);

    const handlePageClick = useCallback((direction: 'next' | 'prev') => {
        setState(prev => {
            const totalPages = Math.max(1, Math.ceil(prev.totalItemCount / prev.perPage));
            const nextPage = direction === 'next' ? prev.currentPage + 1 : prev.currentPage - 1;
            const safePage = Math.min(Math.max(1, nextPage), totalPages);
            return { ...prev, currentPage: safePage };
        });
    }, []);

    const { datalist, loading, currentPage, totalItemCount, perPage } = state;

    return (
        <LayoutGuest>
            <PublicMenu />
            
            <main className="max-w-4xl mx-auto">
                <header className="my-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Welcome Back!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Discover the latest articles and insights from our blog.
                    </p>
                </header>

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
                            {datalist.length > 0 ? (
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
        </LayoutGuest>
    );
};

export default Home;