import React from 'react';
import { PaymentLinkStatus } from '../types/paymentLink';
import { CheckCircle2, Clock, AlertCircle, XCircle, PieChart } from 'lucide-react';

interface StatusBadgeProps {
  status: PaymentLinkStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PAID':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
          role="status"
          aria-label="Status: Paid"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          Paid
        </span>
      );
    case 'PARTIALLY_PAID':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
          role="status"
          aria-label="Status: Partially Paid"
        >
          <PieChart className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          Partially Paid
        </span>
      );
    case 'ISSUED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          role="status"
          aria-label="Status: Issued"
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          Issued
        </span>
      );
    case 'EXPIRED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300"
          role="status"
          aria-label="Status: Expired"
        >
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          Expired
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          role="status"
          aria-label="Status: Cancelled"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};
