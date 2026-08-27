import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface BackButtonProps {
  fallbackRoute?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackRoute = '/dashboard',
  label = 'Back',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleBack}
      className={`px-2.5 py-1 text-xs gap-1.5 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};
