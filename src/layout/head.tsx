import React from 'react';
import { HeadProvider, Title } from 'react-head'; // , Link, Meta

type HeadProps = {
    title?: string;
};

class Head extends React.Component<HeadProps> {
    render() {
        const { title } = this.props;
        return (
            <HeadProvider>
                <meta charSet="UTF-8" />
                <Title>{!!title && title}</Title>
            </HeadProvider>
        );
    }
}

export default Head;