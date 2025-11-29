import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onNumberPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => key === 'del' ? onDelete() : onNumberPress(key)}
          className="aspect-square rounded-2xl bg-white dark-mode:bg-[#1E1E1E] 
                     flex items-center justify-center text-2xl
                     hover:bg-gray-50 active:scale-95 transition-all
                     shadow-sm border border-gray-100"
        >
          {key === 'del' ? (
            <Delete size={24} className="text-[#6B6B6B]" />
          ) : (
            <span className="text-[#1A1A1A] dark-mode:text-white">{key}</span>
          )}
        </button>
      ))}
    </div>
  );
};
