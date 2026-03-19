import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
