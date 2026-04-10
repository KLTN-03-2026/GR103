import React, { useState, useEffect } from 'react';
import * as Icons from '../../icons';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setErrorInfo(event.message);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <Icons.ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6">We encountered an error. Please try refreshing the page.</p>
          <pre className="text-[10px] bg-slate-100 p-4 rounded-xl text-left overflow-auto max-h-40 mb-6">
            {errorInfo}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
