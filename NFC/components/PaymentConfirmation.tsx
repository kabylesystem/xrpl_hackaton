import { CheckCircle2, XCircle, Store, MapPin, Calendar, Hash, DollarSign } from 'lucide-react';

interface MerchantData {
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
}

interface TransactionData {
  amount: string;
  merchantData: MerchantData | null;
  transactionId: string;
  timestamp: string;
  success: boolean;
}

interface PaymentConfirmationProps {
  transaction: TransactionData;
  onNewPayment: () => void;
}

export function PaymentConfirmation({ transaction, onNewPayment }: PaymentConfirmationProps) {
  const { success, amount, merchantData, transactionId, timestamp } = transaction;

  const formattedDate = new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex flex-col items-center mb-8">
        <div className={`p-4 rounded-full mb-4 ${success ? 'bg-green-100' : 'bg-red-100'}`}>
          {success ? (
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          ) : (
            <XCircle className="w-16 h-16 text-red-600" />
          )}
        </div>
        
        <h1 className={`text-center mb-2 ${success ? 'text-green-600' : 'text-red-600'}`}>
          {success ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        
        <p className="text-gray-500 text-center">
          {success 
            ? 'Your payment has been processed'
            : 'Transaction could not be completed'}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-gray-200">
          <span className="text-gray-600">Amount Paid</span>
          <span className="text-indigo-600">${parseFloat(amount).toFixed(2)}</span>
        </div>

        {merchantData && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Store className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-500">Merchant</p>
                <p className="text-gray-900">{merchantData.merchantName}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-500">Location</p>
                <p className="text-gray-900">{merchantData.merchantAddress}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Hash className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-500">Merchant ID</p>
                <p className="text-gray-900">{merchantData.merchantId}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Transaction ID</span>
          <span className="text-gray-900">{transactionId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Date & Time</span>
          <span className="text-gray-900">{formattedDate}</span>
        </div>
      </div>

      {success ? (
        <div className="space-y-3">
          <button
            onClick={onNewPayment}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            New Payment
          </button>
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Download Receipt
          </button>
        </div>
      ) : (
        <button
          onClick={onNewPayment}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
