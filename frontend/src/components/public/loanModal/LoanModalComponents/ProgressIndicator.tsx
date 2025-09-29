// components/LoanModalComponents/ProgressIndicator.tsx
import React from 'react';

interface ProgressIndicatorProps {
  step: number;
  actionType: 'loan' | 'return';
  totalSteps?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  actionType,
  totalSteps = 3
}) => {
  const getSteps = () => {
    if (actionType === 'loan') {
      return ['Selecionar Cópia', 'Selecionar Leitor', 'Confirmação'];
    } else {
      return ['Selecionar Cópia', 'Confirmação'];
    }
  };

  const steps = getSteps();
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2">
        {steps.map((label, index) => (
          <div
            key={index}
            className={`text-center ${index <= step ? 'text-primary' : 'text-muted'}`}
            style={{ flex: 1 }}
          >
            <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
              index <= step ? 'bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ 
              width: '35px', 
              height: '35px', 
              fontSize: '14px',
              fontWeight: 'bold',
              border: index <= step ? '2px solid #0d6efd' : '2px solid #dee2e6'
            }}>
              {index + 1}
            </div>
            <div className="small mt-1 fw-medium">{label}</div>
          </div>
        ))}
      </div>
      <div className="progress" style={{ height: '6px' }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      
      {/* Indicador de passo atual */}
      <div className="text-center mt-2">
        <small className="text-muted">
          Passo {step + 1} de {steps.length} • 
          <span className={`badge ms-2 ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`}>
            {actionType === 'loan' ? 'EMPRÉSTIMO' : 'DEVOLUÇÃO'}
          </span>
        </small>
      </div>
    </div>
  );
};

// Versão alternativa com ícones (opcional)
export const ProgressIndicatorWithIcons: React.FC<ProgressIndicatorProps> = ({
  step,
  actionType
}) => {
  const getStepsWithIcons = () => {
    if (actionType === 'loan') {
      return [
        { label: 'Selecionar Cópia', icon: 'bi-book' },
        { label: 'Selecionar Leitor', icon: 'bi-person' },
        { label: 'Confirmação', icon: 'bi-check-circle' }
      ];
    } else {
      return [
        { label: 'Selecionar Cópia', icon: 'bi-book' },
        { label: 'Confirmação', icon: 'bi-arrow-return-left' }
      ];
    }
  };

  const steps = getStepsWithIcons();
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2">
        {steps.map((stepItem, index) => (
          <div
            key={index}
            className={`text-center ${index <= step ? 'text-primary' : 'text-muted'}`}
            style={{ flex: 1 }}
          >
            <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
              index <= step ? 'bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ 
              width: '40px', 
              height: '40px', 
              fontSize: '16px',
              border: index <= step ? '2px solid #0d6efd' : '2px solid #dee2e6'
            }}>
              <i className={stepItem.icon}></i>
            </div>
            <div className="small mt-1 fw-medium">{stepItem.label}</div>
          </div>
        ))}
      </div>
      <div className="progress" style={{ height: '6px' }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      
      {/* Indicador de passo atual */}
      <div className="text-center mt-2">
        <small className="text-muted">
          Passo {step + 1} de {steps.length} • 
          <span className={`badge ms-2 ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`}>
            {actionType === 'loan' ? 'EMPRÉSTIMO' : 'DEVOLUÇÃO'}
          </span>
        </small>
      </div>
    </div>
  );
};

// Versão simplificada para mobile
export const CompactProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  actionType
}) => {
  const steps = actionType === 'loan' ? 3 : 2;
  const progress = ((step + 1) / steps) * 100;

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <small className="text-muted">
          {actionType === 'loan' ? 'Empréstimo' : 'Devolução'} • Passo {step + 1}/{steps}
        </small>
        <span className={`badge ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`}>
          {actionType === 'loan' ? 'EMPRÉSTIMO' : 'DEVOLUÇÃO'}
        </span>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};

// Versão com barras segmentadas
export const SegmentedProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  actionType
}) => {
  const getSteps = () => {
    if (actionType === 'loan') {
      return ['Cópia', 'Leitor', 'Confirmação'];
    } else {
      return ['Cópia', 'Confirmação'];
    }
  };

  const steps = getSteps();
  const segmentWidth = 100 / steps.length;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {steps.map((label, index) => (
          <div
            key={index}
            className={`text-center ${index <= step ? 'text-primary' : 'text-muted'}`}
            style={{ flex: 1 }}
          >
            <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
              index <= step ? 'bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ 
              width: '30px', 
              height: '30px', 
              fontSize: '12px',
              fontWeight: 'bold',
              border: index <= step ? '2px solid #0d6efd' : '2px solid #dee2e6'
            }}>
              {index + 1}
            </div>
            <div className="small mt-1">{label}</div>
          </div>
        ))}
      </div>
      
      <div className="progress" style={{ height: '8px' }}>
        {steps.map((_, index) => (
          <div
            key={index}
            className={`progress-bar ${index <= step ? 'bg-primary' : 'bg-light'}`}
            style={{ 
              width: `${segmentWidth}%`,
              borderRadius: index === 0 ? '4px 0 0 4px' : 
                          index === steps.length - 1 ? '0 4px 4px 0' : '0',
              marginLeft: index === 0 ? '0' : '2px'
            }}
          ></div>
        ))}
      </div>
      
      <div className="text-center mt-1">
        <small className="text-muted">
          {actionType === 'loan' ? 'Processo de Empréstimo' : 'Processo de Devolução'} • 
          <strong className="ms-1">{step + 1}/{steps.length}</strong>
        </small>
      </div>
    </div>
  );
};

// Versão vertical (para sidebars)
export const VerticalProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  actionType
}) => {
  const getSteps = () => {
    if (actionType === 'loan') {
      return ['Selecionar Cópia', 'Selecionar Leitor', 'Confirmar Empréstimo'];
    } else {
      return ['Selecionar Cópia', 'Confirmar Devolução'];
    }
  };

  const steps = getSteps();

  return (
    <div className="mb-4">
      <div className="d-flex flex-column">
        {steps.map((label, index) => (
          <div key={index} className="d-flex align-items-center mb-3">
            {/* Linha vertical */}
            {index > 0 && (
              <div 
                className={`ms-3 ${index <= step ? 'bg-primary' : 'bg-light'}`}
                style={{ 
                  width: '2px', 
                  height: '20px', 
                  position: 'absolute',
                  marginTop: '-20px'
                }}
              ></div>
            )}
            
            {/* Círculo do passo */}
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${
              index <= step ? 'bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ 
              width: '30px', 
              height: '30px', 
              fontSize: '12px',
              fontWeight: 'bold',
              border: index <= step ? '2px solid #0d6efd' : '2px solid #dee2e6',
              zIndex: 1
            }}>
              {index + 1}
            </div>
            
            {/* Label */}
            <div className={`ms-3 ${index <= step ? 'text-primary fw-semibold' : 'text-muted'}`}>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-2">
        <span className={`badge ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`}>
          {actionType === 'loan' ? 'EMPRÉSTIMO' : 'DEVOLUÇÃO'}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;