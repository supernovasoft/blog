import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'

import { initStore } from './reducer';
import { Home, ArticleDetail } from './ui/content';
import { Articles, Categories, Dashboard } from './ui/admin';
import { Login } from './ui/auth';

import './App.css'

const App = () => {
    return (
        <Provider store={initStore()}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/article/:slug" element={<ArticleDetail />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/articles" element={<Articles />} />
                    <Route path="/admin/categories" element={<Categories />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
