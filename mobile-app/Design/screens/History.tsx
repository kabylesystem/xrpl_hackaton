import React, { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { TransactionListItem } from '../components/TransactionListItem';

interface HistoryProps {
  onBack: () => void;
}

export const History: React.FC<HistoryProps> = ({ onBack }) => {
  const transactions = [
    {
      id: 1,
      amount: '1200',
      merchant: 'Café MamaKoko',
      type: 'nfc' as const,
      date: 'Today, 2:45 PM'
    },
    {
      id: 2,
      amount: '500',
      merchant: 'Market Vendor',
      type: 'sms' as const,
      date: 'Today, 11:20 AM'
    },
    {
      id: 3,
      amount: '3500',
      merchant: 'Grocery Store Lagos',
      type: 'qr' as const,
      date: 'Yesterday, 6:15 PM'
    },
    {
      id: 4,
      amount: '2000',
      merchant: 'Restaurant Jollof House',
      type: 'nfc' as const,
      date: 'Nov 27, 1:30 PM'
    },
    {
      id: 5,
      amount: '5000',
      merchant: 'Payment Received',
      type: 'receive' as const,
      date: 'Nov 26, 3:45 PM'
    },
    {
      id: 6,
      amount: '800',
      merchant: 'Transport Payment',
      type: 'sms' as const,
      date: 'Nov 26, 9:00 AM'
    },
    {
      id: 7,
      amount: '1500',
      merchant: 'Phone Credit',
      type: 'qr' as const,
      date: 'Nov 25, 4:20 PM'
    }
  ];

  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'received') return tx.type === 'receive';
    if (filter === 'sent') return tx.type !== 'receive';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                       flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-[#1A1A1A] dark-mode:text-white" />
          </button>
          <h2 className="text-[#1A1A1A] dark-mode:text-white">Transaction History</h2>
        </div>
        <button className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                           flex items-center justify-center shadow-sm">
          <Filter size={20} className="text-[#2F80ED]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-6">
        <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-[#2F80ED] text-white'
                : 'text-[#6B6B6B] hover:bg-gray-50 dark-mode:hover:bg-[#2A2A2A]'
            }`}
          >
            <small>All</small>
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              filter === 'sent'
                ? 'bg-[#2F80ED] text-white'
                : 'text-[#6B6B6B] hover:bg-gray-50 dark-mode:hover:bg-[#2A2A2A]'
            }`}
          >
            <small>Sent</small>
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              filter === 'received'
                ? 'bg-[#2F80ED] text-white'
                : 'text-[#6B6B6B] hover:bg-gray-50 dark-mode:hover:bg-[#2A2A2A]'
            }`}
          >
            <small>Received</small>
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-6 pb-6 space-y-3">
        {filteredTransactions.map((transaction) => (
          <TransactionListItem
            key={transaction.id}
            amount={transaction.amount}
            merchant={transaction.merchant}
            type={transaction.type}
            date={transaction.date}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="px-6 pb-8">
        <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm">
          <small className="text-[#6B6B6B]">Total Transactions</small>
          <h2 className="text-[#1A1A1A] dark-mode:text-white mt-1">
            {filteredTransactions.length}
          </h2>
        </div>
      </div>
    </div>
  );
};
