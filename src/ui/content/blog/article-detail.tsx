import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';

import { db } from '../../../firebase';
import { LayoutGuest, PublicMenu, fromObjectToList, DisplayTimeAgo } from '../../../layout';

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
                setData(articleList[0] || null);
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
                }
                .dark .prose p > code {
                    background-color: #374151;
                    color: #f87171;
                }
                .prose pre {
                    border-radius: 0.5rem; 
                    background-color: #f3f4f6;
                    padding: 1rem;
                    overflow: auto;
                    line-height: 1.5;
                    margin: 1rem 0;
                }
                .dark .prose pre {
                    background-color: #1f2937;
                }
                .prose pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
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
                `}
            </style>
            <PublicMenu />
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <header className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            {data.title}
                        </h1>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{data.author}</span>
                            </div>
                            <span className="mx-2">•</span>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <DisplayTimeAgo time={data.date} isTimeAgo={true} />
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