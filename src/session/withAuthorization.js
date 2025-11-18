import React from 'react';
import { useNavigate } from 'react-router-dom';

import { firebase } from '../firebase';
import { LOGIN_ROUTE } from '../settings';

const withAuthorization = (needsAuthorization) => (Component) => {
    const WithAuthorization = (props) => {
        const navigate = useNavigate();
        
        React.useEffect(() => {
            const unsubscribe = firebase.auth.onAuthStateChanged(authUser => {
                if(!authUser && needsAuthorization) {
                    navigate(LOGIN_ROUTE);
                }
            });
            return unsubscribe;
        }, [navigate]);

        return <Component {...props} />;
    };
    
    return WithAuthorization;
}

export default withAuthorization;