import React, { useState, useEffect, useCallback } from 'react';
import { LayoutUser, MainMenu, SimplePaginate, slugify, fromObjectToList, randomString, DisplayTimeAgo } from '../../layout';
import { db } from '../../firebase';

const treeName = "categories";
const INITIAL_STATE = { name: '', active: true, error: '', success: '', loading: false };

const AddDataModal = ({ getDatalistRefresh }) => {
    const [state, setState] = useState({ open: false, ...INITIAL_STATE });
    
    const openModal = () => setState({ open: true, ...INITIAL_STATE });
    const closeModal = () => setState({ open: false, error: '', success: '' });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, loading: true, error: '', success: '' }));
        
        try {
            const categoryId = randomString(28);
            await db.ref(treeName).child(categoryId).set({
                name: state.name,
                slug: slugify(state.name),
                active: true,
                categoryId: categoryId,
                date: Math.floor(Date.now()),
            });
            
            setState({ name: '', loading: false, success: 'Category added successfully!' });
            setTimeout(() => {
                closeModal();
                getDatalistRefresh();
            }, 1000);
        } catch (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message || 'Failed to add category' }));
        }
    };
    
    const { open, name, loading, error, success } = state;
    const isValid = name.trim() !== '';
    
    return (
        <>
            <button 
                className="btn btn-primary text-sm px-4 py-2 flex items-center"
                onClick={openModal}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
            </button>
            
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={loading ? undefined : closeModal} />
                        
                        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Add New Category
                                    </h3>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="px-6 py-4">
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                                    </div>
                                )}
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., JavaScript, DevOps, Cloud Computing"
                                            value={name}
                                            onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-8 space-x-3">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={closeModal} 
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isValid || loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const EditDataModal = ({ dataRow, getDatalistRefresh }) => {
    const [state, setState] = useState({
        open: false,
        loading: false,
        error: '',
        success: '',
        name: dataRow.name || '',
        categoryId: dataRow.categoryId || '',
    });
    
    useEffect(() => {
        setState(prev => ({ ...prev, name: dataRow.name }));
    }, [dataRow]);
    
    const openModal = () => {
        setState({ 
            ...state,
            open: true, 
            name: dataRow.name,
            error: '', 
            success: '' 
        });
    };
    
    const closeModal = () => setState(prev => ({ ...prev, open: false, error: '', success: '' }));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, loading: true, error: '', success: '' }));
        
        try {
            const { categoryId, name } = state;
            await db.ref(treeName).child(categoryId).update({
                name: name,
                slug: slugify(name),
                dateModified: Math.floor(Date.now()),
            });
            
            setState(prev => ({ ...prev, loading: false, success: 'Category updated successfully!' }));
            setTimeout(() => {
                closeModal();
                getDatalistRefresh();
            }, 1000);
        } catch (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message || 'Failed to update category' }));
        }
    };
    
    const { name, loading, error, success, open } = state;
    const isValid = name.trim() !== '';
    
    return (
        <>
            <button 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 p-1"
                onClick={openModal}
                title="Edit category"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
            
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={loading ? undefined : closeModal} />
                        
                        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Edit Category
                                    </h3>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="px-6 py-4">
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                                    </div>
                                )}
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Category name"
                                            value={name}
                                            onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-8 space-x-3">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={closeModal} 
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isValid || loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Update
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const DataRow = ({ dataRow, getDatalistRefresh }) => {
    const [open, setOpen] = useState(false);
    
    const openDeleteModal = () => setOpen(true);
    const closeDeleteModal = () => setOpen(false);
    
    const handleDelete = async (categoryId) => {
        try {
            await db.ref(treeName).child(categoryId).remove();
            closeDeleteModal();
            getDatalistRefresh();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category: ' + error.message);
        }
    };
    
    const { name, categoryId, slug, date } = dataRow;
    
    return (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="px-6 py-4">
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {slug}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {categoryId.substring(0, 8)}...
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <DisplayTimeAgo time={date} isTimeAgo={true} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                    <EditDataModal dataRow={dataRow} getDatalistRefresh={getDatalistRefresh} />
                    <button 
                        className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 p-1"
                        onClick={openDeleteModal}
                        title="Delete category"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                
                {open && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeDeleteModal} />
                            
                            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                                <div className="px-6 py-4">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Delete Category
                                        </h3>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Are you sure you want to delete this category? This action cannot be undone.
                                    </p>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={closeDeleteModal}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(categoryId)}
                                    >
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
};

const Categories = () => {
    const [state, setState] = useState({
        currentPage: 1,
        perPage: 20,
        totalItemCount: 1,
        datalistStack: [],
        datalist: [],
        searchFilter: "",
        loading: true,
    });
    
    const getDatalistCount = useCallback(async () => {
        try {
            const snapshot = await db.ref(treeName).once("value");
            setState(prev => ({ ...prev, totalItemCount: snapshot.numChildren() }));
        } catch (error) {
            console.error('Error getting category count:', error);
        }
    }, []);
    
    const getDatalist = useCallback(async (queryDict = {}) => {
        try {
            const { currentPage, perPage, datalistStack } = state;
            const startAt = currentPage * perPage - perPage;
            const direction = queryDict.direction || 'next';
            const searchFilter = queryDict.searchFilter || '';
            
            let qref = db.ref(treeName);
            let datalist;
            
            if (direction === 'next') {
                if (startAt > 0) {
                    const lastObj = state.datalist[state.datalist.length - 1];
                    qref = qref.startAt(lastObj.categoryId);
                }
                if (datalistStack[currentPage - 1]) {
                    datalist = datalistStack[currentPage - 1];
                } else {
                    qref = qref.orderByKey().limitToFirst(perPage + 1);
                    const snapshot = await qref.once("value");
                    datalist = fromObjectToList(snapshot.val());
                    setState(prev => ({ 
                        ...prev, 
                        datalistStack: [...prev.datalistStack, datalist] 
                    }));
                }
            } else if (direction === 'prev') {
                datalist = datalistStack[currentPage - 1];
            }
            
            if (datalist === null) datalist = [];
            setState(prev => ({ ...prev, datalist, searchFilter, loading: false }));
        } catch (error) {
            console.error('Error getting categories:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [state.currentPage, state.perPage, state.datalist, state.datalistStack, setState]);
    
    const getDatalistRefresh = useCallback(() => {
        setState(prev => ({ ...prev, datalistStack: [], loading: true }));
    }, [setState]);
    
    useEffect(() => {
        if (state.loading) {
            const fetchData = async () => {
                await getDatalistCount();
                await getDatalist();
            };
            fetchData();
        }
    }, [state.loading, getDatalistCount, getDatalist]);
    
    const getDatalistPartial = useCallback(() => {
        const { datalist, perPage } = state;
        if (datalist.length === perPage + 1) {
            return datalist.slice(0, -1);
        }
        return datalist;
    }, [state.datalist, state.perPage]);
    
    const handlePageClick = useCallback((direction) => {
        const nextPage = direction === 'next' ? state.currentPage + 1 : state.currentPage - 1;
        setState(prev => ({ ...prev, currentPage: nextPage }));
    }, [state.currentPage, setState]);
    
    useEffect(() => {
        getDatalistRefresh();
    }, [getDatalistRefresh]);
    
    const datalist = getDatalistPartial();
    const { totalItemCount, currentPage, perPage, loading } = state;
    
    return (
        <LayoutUser>
            <MainMenu />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Categories
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Manage your blog categories and topics
                                    </p>
                                </div>
                            </div>
                            <AddDataModal 
                                getDatalistRefresh={getDatalistRefresh} 
                            />
                        </div>
                    </div>
                    
                    <div className="px-6 py-4">
                        <div className="flex items-center mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Total: {totalItemCount}
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <svg className="animate-spin w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {datalist.length > 0 ? (
                                            datalist.map((dataRow, key) => (
                                                <DataRow 
                                                    key={dataRow.categoryId || key} 
                                                    getDatalistRefresh={getDatalistRefresh} 
                                                    dataRow={dataRow} 
                                                />
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center">
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No categories found</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Create your first category to organize your articles</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {totalItemCount > perPage && (
                            <div className="mt-6 flex justify-center">
                                <SimplePaginate 
                                    page={currentPage}
                                    totalPages={Math.ceil(totalItemCount / perPage)}
                                    handlePageClick={handlePageClick}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutUser>
    );
};

export default Categories;