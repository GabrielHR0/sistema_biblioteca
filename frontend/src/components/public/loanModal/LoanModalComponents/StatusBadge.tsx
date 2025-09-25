// components/LoanModalComponents/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: "available" | "borrowed" | "lost";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    available: "bg-success",
    borrowed: "bg-warning text-dark",
    lost: "bg-danger"
  };
  
  const texts = {
    available: "Disponível",
    borrowed: "Emprestado",
    lost: "Perdido"
  };
  
  return (
    <span className={`badge ${styles[status]}`}>
      {texts[status]}
    </span>
  );
};