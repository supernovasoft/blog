import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';

type Direction = 'next' | 'prev';

interface SimplePaginateProps {
    totalPages: number;
    page: number;
    handlePageClick: (direction: Direction) => void;
}

class SimplePaginate extends Component<SimplePaginateProps> {
    render() {
        const { totalPages, page, handlePageClick } = this.props;
        return (
            <div className="Pagination">
                <Button 
                    size="mini"
                    disabled={page <= 1}
                    onClick={() => handlePageClick('prev')}
                    >&larr;</Button>
                <span style={{ margin: '10px' }}>
                Page <b>{page}</b> - <b>{totalPages}</b>
                </span>
                <Button
                    size="mini"
                    disabled={page === totalPages}
                    onClick={() => handlePageClick('next')}
                    >&rarr;</Button>
            </div>
        );
    }
}

export default SimplePaginate;