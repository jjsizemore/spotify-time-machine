import { Toast as FlowbiteToast } from 'flowbite-react';
import React from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function Toast({ message, onDismiss, type = 'success' }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-spotify-dark-gray text-spotify-white',
          icon: 'text-spotify-green bg-spotify-black',
          button: 'text-spotify-white hover:text-spotify-green hover:bg-spotify-medium-gray/40',
        };
      case 'error':
        return {
          container: 'bg-red-900/90 text-red-100',
          icon: 'text-red-100 bg-red-800',
          button: 'text-red-100 hover:text-red-50 hover:bg-red-800/40',
        };
      case 'warning':
        return {
          container: 'bg-yellow-900/90 text-yellow-100',
          icon: 'text-yellow-100 bg-yellow-800',
          button: 'text-yellow-100 hover:text-yellow-50 hover:bg-yellow-800/40',
        };
      default:
        return {
          container: 'bg-spotify-dark-gray text-spotify-white',
          icon: 'text-spotify-green bg-spotify-black',
          button: 'text-spotify-white hover:text-spotify-green hover:bg-spotify-medium-gray/40',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
      <FlowbiteToast
        className={`flex items-start w-full max-w-sm p-4 ${styles.container} rounded-lg shadow-sm pointer-events-auto relative`}
      >
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${styles.icon} rounded-lg`}
        >
          {getIcon()}
        </div>
        {/* Message */}
        <div className="ml-3 text-sm font-normal break-words">{message}</div>
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className={`ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-spotify-green p-1.5 inline-flex items-center justify-center h-8 w-8 absolute top-2 right-2 ${styles.button}`}
          aria-label="Close"
          style={{ lineHeight: 0 }}
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 14 14"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </FlowbiteToast>
    </div>
  );
}
