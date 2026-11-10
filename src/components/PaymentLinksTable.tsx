import React from 'react';
import { PaymentLink } from '../types/paymentLink';
import { StatusBadge } from './StatusBadge';
import { formatINR, formatDateTime } from '../utils/formatters';
import { useClipboard } from '../hooks/useClipboard';
import {
  Copy,
  Check,
  CreditCard,
  Ban,
  ExternalLink,
  PlusCircle,
  Inbox,
  Loader2,
} from 'lucide-react';

interface PaymentLinksTableProps {
  links: PaymentLink[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
  onCancelLink: (id: string) => void;
  onOpenSimulateModal: (link: PaymentLink) => void;
}

export const PaymentLinksTable: React.FC<PaymentLinksTableProps> = ({
  links,
  isLoading,
  onOpenCreateModal,
  onCancelLink,
  onOpenSimulateModal,
}) => {
  const { copiedId, copy } = useClipboard();

  const confirmCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this payment link? Customers will no longer be able to pay.')) {
      onCancelLink(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 text-razorpay-blue animate-spin mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">Loading payment links...</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Inbox className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No payment links found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          There are no links matching your search or filter criteria. Create a new link to get started.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-razorpay-dark hover:bg-razorpay-navy rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          Create Payment Link
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Payment Links List">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4">Link ID & URL</th>
              <th scope="col" className="py-3.5 px-4">Customer Details</th>
              <th scope="col" className="py-3.5 px-4">Description</th>
              <th scope="col" className="py-3.5 px-4">Amount</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Expiry Date</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {links.map((link) => {
              const isCopied = copiedId === link.id;
              const isCancelable = link.status === 'ISSUED' || link.status === 'PARTIALLY_PAID';
              const isPayable = link.status === 'ISSUED' || link.status === 'PARTIALLY_PAID';

              return (
                <tr
                  key={link.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* ID & Short URL */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-semibold text-slate-900">
                      {link.id}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-slate-500 font-mono truncate max-w-[130px]">
                        {link.shortUrl}
                      </span>
                      <button
                        onClick={() => copy(link.shortUrl, link.id)}
                        title="Copy link"
                        aria-label={`Copy link for ${link.id}`}
                        className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
                          isCopied
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-400 hover:text-razorpay-blue hover:bg-blue-50'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span className="text-[10px] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{link.customer.name}</div>
                    <div className="text-xs text-slate-500">{link.customer.email || '—'}</div>
                    {link.customer.phone && (
                      <div className="text-xs text-slate-400">{link.customer.phone}</div>
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-700 text-xs line-clamp-2" title={link.description}>
                      {link.description}
                    </p>
                    {link.allowPartialPayment && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Partial Allowed (Min: {formatINR(link.minPartialAmount || 1)})
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {formatINR(link.amount)}
                    </div>
                    {link.amountPaid > 0 && (
                      <div className="text-xs font-medium text-emerald-600">
                        Paid: {formatINR(link.amountPaid)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={link.status} />
                  </td>

                  {/* Expiry */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {formatDateTime(link.expireBy)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isPayable && (
                        <button
                          onClick={() => onOpenSimulateModal(link)}
                          title="Simulate customer payment"
                          aria-label={`Simulate payment for ${link.id}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                          Pay
                        </button>
                      )}

                      {isCancelable && (
                        <button
                          onClick={() => confirmCancel(link.id)}
                          title="Cancel link"
                          aria-label={`Cancel link ${link.id}`}
                          className="p-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}

                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open link in new tab"
                        aria-label={`Open link ${link.id} in new window`}
                        className="p-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
