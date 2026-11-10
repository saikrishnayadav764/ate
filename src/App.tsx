import React, { useState } from 'react';
import { usePaymentLinks } from './hooks/usePaymentLinks';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { PaymentLinksTable } from './components/PaymentLinksTable';
import { CreateLinkModal } from './components/CreateLinkModal';
import { SimulatePaymentModal } from './components/SimulatePaymentModal';
import { PaymentLink, CreatePaymentLinkInput } from './types/paymentLink';
import { Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const {
    links,
    allLinks,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    createLink,
    cancelLink,
    simulatePayment,
    metrics,
  } = usePaymentLinks();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSimulateLink, setActiveSimulateLink] = useState<PaymentLink | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3000);
  };

  const handleCreateSubmit = async (input: CreatePaymentLinkInput) => {
    const created = await createLink(input);
    showToast(`Payment link ${created.id} created successfully!`);
  };

  const handleCancel = (id: string) => {
    cancelLink(id);
    showToast(`Payment link ${id} has been cancelled.`);
  };

  const handleSimulatePay = (id: string, amount: number) => {
    simulatePayment(id, amount);
    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-razorpay-dark text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-razorpay-blue flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">Razorpay</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 font-medium border border-slate-700">
                  Payment Links
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Merchant Operations Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="open-create-modal"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-razorpay-blue hover:bg-razorpay-hover rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-razorpay-dark focus:ring-razorpay-blue transition-all"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create Payment Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Metrics Cards */}
        <MetricsBar metrics={metrics} />

        {/* Filter & Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Table of Payment Links */}
        <PaymentLinksTable
          links={links}
          totalCount={allLinks.length}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
          isLoading={isLoading}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onCancelLink={handleCancel}
          onOpenSimulateModal={(link) => setActiveSimulateLink(link)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>PCI-DSS Level 1 Compliant • 128-bit Encrypted</span>
          </div>
          <p>© {new Date().getFullYear()} Razorpay Software Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <SimulatePaymentModal
        link={activeSimulateLink}
        onClose={() => setActiveSimulateLink(null)}
        onPay={handleSimulatePay}
      />
    </div>
  );
};

export default App;

