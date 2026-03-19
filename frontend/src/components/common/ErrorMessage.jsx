import React from 'react';

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 right-0 p-2 text-red-500 hover:text-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
