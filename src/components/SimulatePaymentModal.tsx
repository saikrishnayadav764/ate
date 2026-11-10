import React, { useState } from 'react';
import { PaymentLink } from '../types/paymentLink';
import { formatINR } from '../utils/formatters';
import { X, CheckCircle2, IndianRupee } from 'lucide-react';

interface SimulatePaymentModalProps {
  link: PaymentLink | null;
  onClose: () => void;
  onPay: (id: string, amount: number) => void;
}

export const SimulatePaymentModal: React.FC<SimulatePaymentModalProps> = ({
  link,
  onClose,
  onPay,
}) => {
  if (!link) return null;

  const remaining = link.amount - link.amountPaid;
  const [payAmount, setPayAmount] = useState<number>(remaining);
  const [error, setError] = useState<string>('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }
    if (payAmount > remaining) {
      setError(`Payment cannot exceed remaining amount of ${formatINR(remaining)}`);
      return;
    }
    if (
      link.allowPartialPayment &&
      link.minPartialAmount &&
      payAmount < remaining &&
      payAmount < link.minPartialAmount
    ) {
      setError(`Minimum partial payment allowed is ${formatINR(link.minPartialAmount)}`);
      return;
    }

    onPay(link.id, payAmount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulate-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 id="simulate-modal-title" className="text-lg font-bold text-slate-900">
            Simulate Customer Payment
          </h2>
          <button
            onClick={onClose}
            aria-label="Close payment modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Link ID:</span>
            <span className="font-mono font-semibold text-slate-800">{link.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Description:</span>
            <span className="text-slate-800 font-medium text-right truncate max-w-[200px]">
              {link.description}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Amount:</span>
            <span className="text-slate-900 font-bold">{formatINR(link.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Already Paid:</span>
            <span className="text-emerald-600 font-semibold">{formatINR(link.amountPaid)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
            <span className="text-slate-800">Remaining Balance:</span>
            <span className="text-blue-600">{formatINR(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handlePay} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="simulate-amount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Amount to Pay (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="simulate-amount"
                type="number"
                step="any"
                min="1"
                max={remaining}
                value={payAmount}
                onChange={(e) => {
                  setPayAmount(parseFloat(e.target.value) || 0);
                  setError('');
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-razorpay-blue"
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPayAmount(remaining)}
              className="text-xs font-semibold text-razorpay-blue hover:underline"
            >
              Pay Full ({formatINR(remaining)})
            </button>
            {link.allowPartialPayment && link.minPartialAmount && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setPayAmount(link.minPartialAmount || 1)}
                  className="text-xs font-semibold text-slate-600 hover:underline"
                >
                  Pay Min Partial ({formatINR(link.minPartialAmount)})
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Authorize & Pay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

