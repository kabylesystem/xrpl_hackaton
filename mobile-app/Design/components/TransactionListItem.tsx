import React from 'react';
import { ArrowUpRight, ArrowDownLeft, MessageSquare, Smartphone } from 'lucide-react';

interface TransactionListItemProps {
  amount: string;
  merchant: string;
  type: 'nfc' | 'sms' | 'qr' | 'receive';
  date: string;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({ 
  amount, 
  merchant, 
  type,
  date 
}) => {
  const icons = {
    nfc: <Smartphone size={20} className="text-[#2F80ED]" />,
    sms: <MessageSquare size={20} className="text-[#27AE60]" />,
    qr: <Smartphone size={20} className="text-[#2F80ED]" />,
    receive: <ArrowDownLeft size={20} className="text-[#27AE60]" />
  };

  const isReceive = type === 'receive';

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#F8F9FB] dark-mode:bg-[#2A2A2A] 
                      flex items-center justify-center flex-shrink-0">
        {icons[type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[#1A1A1A] dark-mode:text-white truncate">{merchant}</p>
        <small className="text-[#6B6B6B]">{date}</small>
      </div>
      
      <div className="text-right">
        <p className={`${isReceive ? 'text-[#27AE60]' : 'text-[#1A1A1A] dark-mode:text-white'}`}>
          {isReceive ? '+' : '-'}{amount} NGN
        </p>
      </div>
    </div>
  );
};
