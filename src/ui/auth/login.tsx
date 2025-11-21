import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGuest } from '../../layout';
import { auth, fs } from '../../firebase';
import { HOME_ROUTE } from '../../settings';

const INITIAL_STATE = { email: "", password: "", loading: false, error: null };

const Login = () => {
    const navigate = useNavigate();
    const [state, setState] = useState(INITIAL_STATE);

    const handleSubmit = async e => {
        const { email, password } = state;
        e.preventDefault();
        setState(prev => ({ ...prev, loading: true, error: '' }));
        
        try {
            const data = await auth.doSignInWithEmailAndPassword(email, password);
            const { user } = data;
            const ref = fs.collection("admins").doc(user.uid);
            const snapshot = await ref.get();
            const admin = snapshot.data();
            
            if (admin?.admin === true) {
                navigate(HOME_ROUTE);
            } else {
                setState(prev => ({ ...prev, error: "User does not have permission to login" }));
                await auth.doSignOut();
            }
        } catch (error) {
            setState(prev => ({ ...prev, error: error.message }));
        }
        
        setState(prev => ({ ...prev, loading: false }));
    };

    const handleChange = (field, value) => {
        setState(prev => ({ ...prev, [field]: value }));
    };

    const { email, password, error, loading } = state;
    const isInvalid = password === '' || email === '';

    return (
        <LayoutGuest>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                            <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            Admin Login
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Sign in to manage your blog
                        </p>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="card p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="input pl-10"
                                            value={email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="input pl-10"
                                            value={password}
                                            onChange={e => handleChange('password', e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isInvalid || loading}
                                    className="btn btn-primary w-full py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </LayoutGuest>
    );
};

export const Logout = () => (
    <button 
        onClick={e => auth.doSignOut()}
        className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
    >
        Logout
    </button>
);

export default Login;