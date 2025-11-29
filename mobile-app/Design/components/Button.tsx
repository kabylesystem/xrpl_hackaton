import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = '',
  icon
}) => {
  const baseStyles = "w-full px-6 py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantStyles = {
    primary: "bg-[#2F80ED] text-white hover:bg-[#2570D8] active:scale-[0.98] disabled:bg-gray-300",
    secondary: "bg-[#27AE60] text-white hover:bg-[#229954] active:scale-[0.98] disabled:bg-gray-300",
    outline: "bg-transparent border-2 border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]/10 active:scale-[0.98] disabled:border-gray-300 disabled:text-gray-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};
