import React from 'react';
import { Menu } from 'semantic-ui-react';

import { auth } from '../firebase';

class MainMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            activeItem: this.props.activeItem || false,
        }
    }
    handleItemClick = (e, {name}) => {
        this.setState({activeItem: name});
        this.props.history.push(`/${name}/`);
    }
    render() {
        const { activeItem } = this.state;
        return (
            <Menu style={{marginTop: '10px'}} pointing secondary>
                <Menu.Item header name="home" onClick={this.handleItemClick}>SupernovaSoft Blog</Menu.Item>
                {/* <Menu.Item
                    name="alarms"
                    active={activeItem === 'alarms'}
                    onClick={this.handleItemClick}
                    >Alarm</Menu.Item> */}
                <Menu.Menu position="right">
                    <Menu.Item
                        name="logout"
                        active={activeItem === 'logout'}
                        onClick={() => {auth.doSignOut()}}
                        >Logout</Menu.Item>
                </Menu.Menu>
            </Menu>
        )
    }
}
export default MainMenu;