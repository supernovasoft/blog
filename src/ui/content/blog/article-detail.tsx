import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';

import { db } from '../../../firebase';
import { LayoutGuest, PublicMenu, fromObjectToList, DisplayTimeAgo } from '../../../layout';
import ShareButtons from '../../../components/ShareButtons';

const treeName = "articles";

let md = new Remarkable('full', {
    html: true,
    typographer: true,
    langPrefix:   'language-',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (err) {}
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {}
        return ''; // use external default escaping
    }
});

md.renderer.rules.fence = function (tokens, idx) {
    const token = tokens[idx];
    const langName = token.info ? token.info.trim() : '';
    const highlighted = token.content;
    
    return `<div class="relative group">
        <pre class="prose-pre border border-gray-300 dark:border-gray-600 rounded-lg"><code class="language-${langName}">${highlighted}</code></pre>
        <button class="copy-button" data-code="${encodeURIComponent(token.content)}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        </button>
    </div>`;
};

md.renderer.rules.table_open = () => {
    return '<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">';
};

const ArticleDetail = () => {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                let qref = await db.ref(treeName).orderByChild('slug').equalTo(slug);
                const snapshot = await qref.once('value');
                const articleList = fromObjectToList(snapshot.val());
                
                if (articleList && articleList.length > 0) {
                    const article = articleList[0];
                    
                    // Fetch category name if categoryId exists
                    if (article.categoryId) {
                        try {
                            const categorySnapshot = await db.ref('categories').child(article.categoryId).once('value');
                            const categoryData = categorySnapshot.val();
                            if (categoryData && categoryData.name) {
                                article.category = categoryData.name;
                            }
                        } catch (categoryError) {
                            console.error('Error fetching category:', categoryError);
                        }
                    }
                    
                    setData(article);
                } else {
                    setData(null);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        
        if (slug) {
            getData();
        }
    }, [slug]);

    useEffect(() => {
        // Add copy button functionality
        const handleCopyClick = (e: Event) => {
            const target = e.target as HTMLElement;
            const button = target.closest('.copy-button') as HTMLButtonElement;
            if (!button) return;
            
            const codeData = button.getAttribute('data-code');
            if (!codeData) return;
            
            try {
                navigator.clipboard.writeText(decodeURIComponent(codeData));
                const originalHTML = button.innerHTML;
                button.innerHTML = '<svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                button.style.color = '#10b981';
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        };

        document.addEventListener('click', handleCopyClick);
        return () => document.removeEventListener('click', handleCopyClick);
    }, []);
    
    if (loading) {
        return (
            <LayoutGuest>
                <PublicMenu />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </LayoutGuest>
        );
    }
    
    if (!data) {
        return (
            <LayoutGuest>
                <PublicMenu />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400">The article you're looking for doesn't exist or has been removed.</p>
                    </div>
                </div>
            </LayoutGuest>
        );
    }
    
    return (
        <LayoutGuest>
            <style>
                {`
                .prose p > code {
                    background-color: #f3f4f6;
                    color: #ef4444;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    border: 1px solid #e5e7eb;
                }
                .dark .prose p > code {
                    background-color: #374151;
                    color: #f87171;
                    border-color: #4b5563;
                }
                .prose-pre {
                    border-radius: 0.5rem; 
                    background-color: #f3f4f6;
                    color: #1f2937;
                    padding: 1rem;
                    overflow: auto;
                    line-height: 1.5;
                    margin: 1rem 0;
                    border: 1px solid #d1d5db;
                    position: relative;
                }
                .dark .prose-pre {
                    background-color: #1f2937;
                    color: #f9fafb;
                    border-color: #4b5563;
                }
                .prose-pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                }
                .copy-button {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    padding: 0.5rem;
                    background-color: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    color: #6b7280;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .dark .copy-button {
                    background-color: #374151;
                    border-color: #4b5563;
                    color: #9ca3af;
                }
                .copy-button:hover {
                    opacity: 1;
                    color: #3b82f6;
                }
                .group:hover .copy-button {
                    opacity: 1;
                }
                .prose table {
                    margin: 1rem 0;
                    border-collapse: collapse;
                }
                .prose th,
                .prose td {
                    border: 1px solid #e5e7eb;
                    padding: 0.5rem;
                    text-align: left;
                }
                .dark .prose th,
                .dark .prose td {
                    border-color: #374151;
                }
                .prose th {
                    background-color: #f9fafb;
                    font-weight: 600;
                }
                .dark .prose th {
                    background-color: #111827;
                }
                
                /* Header Animations */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .animate-fade-in-delay {
                    animation: fadeIn 0.6s ease-out 0.2s forwards;
                    opacity: 0;
                }
                
                .animate-fade-in-delay-2 {
                    animation: fadeIn 0.6s ease-out 0.4s forwards;
                    opacity: 0;
                }
                
                .animate-slide-in {
                    animation: slideIn 0.5s ease-out 0.3s forwards;
                    opacity: 0;
                }
                `}
            </style>
            <PublicMenu />
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <header className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-4 animate-fade-in">
                            {/* Left side: Title, Category, Author, Date */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                                            {data.title}
                                        </h1>
                                        {data.category && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 flex-shrink-0 animate-slide-in hover:scale-105 transition-transform duration-200">
                                                {data.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 animate-fade-in-delay">
                                        <div className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="font-medium">{data.author}</span>
                                        </div>
                                        <span className="mx-2">•</span>
                                        <div className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <DisplayTimeAgo time={data.date} isTimeAgo={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side: Share Buttons */}
                            <div className="flex items-center animate-fade-in-delay-2">
                                <ShareButtons 
                                    title={data.title || ''}
                                    url={typeof window !== 'undefined' ? window.location.href : ''}
                                    description={data.desc}
                                />
                            </div>
                        </div>
                    </header>
                    
                    <div className="px-6 py-8">
                        <div 
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{__html: md.render(data.desc)}} 
                        />
                    </div>
                </div>
            </article>
        </LayoutGuest>
    );
};

export default ArticleDetail;