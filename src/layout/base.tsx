import React, { Fragment } from 'react';
import { compose } from 'redux';

import { withAuthentication, withAuthorization } from '../session';
import Head from './head';
import Footer from './footer';

interface LayoutProps {
    title?: string;
    children?: React.ReactNode;
}

const Layout = ({ title, children }: LayoutProps) => (
    <Fragment>
        {!!title && <Head title={title} />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
        </div>
        <Footer />
    </Fragment>
);

// Redux compose with JS HOCs has type inference issues but works at runtime
export const LayoutGuest = (compose(
    withAuthentication,
    withAuthorization(false)
) as any)(Layout);

// Redux compose with JS HOCs has type inference issues but works at runtime
export const LayoutUser = (compose(
    withAuthentication,
    withAuthorization(true)
) as any)(Layout);