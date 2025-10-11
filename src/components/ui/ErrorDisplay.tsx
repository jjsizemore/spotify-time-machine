import React from 'react';
import ActionButton from './ActionButton';
import Toast from './Toast';

interface ErrorDisplayProps {
  message: string;
  retry?: () => void;
}

const handleDismiss = () => {
  // No-op since this is a persistent error display
};

export default function ErrorDisplay({ message, retry }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg bg-red-900/30 border border-red-500 p-4 text-center">
      <Toast message={message} onDismiss={handleDismiss} type="error" />
      {retry && (
        <ActionButton onClick={retry} variant="primary">
          Try Again
        </ActionButton>
      )}
    </div>
  );
}
