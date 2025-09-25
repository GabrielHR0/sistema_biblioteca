// components/LoanModalComponents/ErrorAlert.tsx
import React from 'react';

interface ErrorAlertProps {
  error: string | null;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      <div>{error}</div>
    </div>
  );
};