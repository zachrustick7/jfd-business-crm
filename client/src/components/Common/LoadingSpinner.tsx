import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="spinner"></div>
      <p className="mt-4 text-gray-600 text-lg">Loading...</p>
    </div>
  );
};

export default LoadingSpinner; 