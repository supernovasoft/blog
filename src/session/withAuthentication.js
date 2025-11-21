import React from 'react';
import { connect } from 'react-redux';

import { firebase } from '../firebase';

const withAuthentication = (Component) => {
    const WithAuthentication = (props) => {
        const { onSetAuthUser } = props;
        
        React.useEffect(() => {
            const unsubscribe = firebase.auth.onAuthStateChanged(authUser => {
                if(authUser){
                    onSetAuthUser(authUser);
                    //history.push(HOME_ROUTE);
                    //console.log(history)
                    //window.location.reload();
                } else {
                    onSetAuthUser(null);
                }
            });
            return unsubscribe;
        }, [onSetAuthUser]);

        return <Component { ...props } />;
    };

    const mapDispatchToProps = ( dispatch) => ({
        onSetAuthUser: authUser => dispatch({type: 'AUTH_USER_SET', authUser}),
    });
    return connect(null, mapDispatchToProps)(WithAuthentication);
}

export default withAuthentication;