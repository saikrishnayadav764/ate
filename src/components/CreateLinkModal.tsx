import React, { useState, useEffect, useRef } from 'react';
import { CreatePaymentLinkInput, ValidationErrors } from '../types/paymentLink';
import { validatePaymentLinkForm } from '../utils/validators';
import { X, Loader2, IndianRupee, Calendar, Mail, Phone, User, FileText } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePaymentLinkInput) => Promise<unknown>;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreatePaymentLinkInput>({
    amount: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    allowPartialPayment: false,
    minPartialAmount: '',
    expireBy: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      // Reset form on close
      setFormData({
        amount: '',
        description: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        allowPartialPayment: false,
        minPartialAmount: '',
        expireBy: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error as user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validatePaymentLinkForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Failed to create payment link', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transition-all transform animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">
              Create Payment Link
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a shareable link to collect payments instantly
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                ref={firstInputRef}
                id="amount"
                name="amount"
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 2500"
                value={formData.amount}
                onChange={handleChange}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-razorpay-blue'
                }`}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="text-xs text-rose-500 mt-1 font-medium">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Payment Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" aria-hidden="true" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={2}
                maxLength={200}
                placeholder="e.g. Consultation fee for Invoice #401"
                value={formData.description}
                onChange={handleChange}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-razorpay-blue'
                }`}
              />
            </div>
            {errors.description && (
              <p id="description-error" className="text-xs text-rose-500 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label
              htmlFor="customerName"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Customer Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="customerName"
                name="customerName"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-razorpay-blue transition-all"
              />
            </div>
          </div>

          {/* Customer Email & Phone (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="customerEmail"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Customer Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.customerEmail)}
                  aria-describedby={errors.customerEmail ? 'email-error' : undefined}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.customerEmail
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-razorpay-blue'
                  }`}
                />
              </div>
              {errors.customerEmail && (
                <p id="email-error" className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.customerEmail}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Customer Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.customerPhone)}
                  aria-describedby={errors.customerPhone ? 'phone-error' : undefined}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.customerPhone
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-razorpay-blue'
                  }`}
                />
              </div>
              {errors.customerPhone && (
                <p id="phone-error" className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Partial Payment Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="allowPartialPayment"
                name="allowPartialPayment"
                type="checkbox"
                checked={formData.allowPartialPayment}
                onChange={handleChange}
                className="w-4 h-4 rounded text-razorpay-blue border-slate-300 focus:ring-razorpay-blue cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">
                Allow Partial Payments
              </span>
            </label>

            {formData.allowPartialPayment && (
              <div className="mt-3 pl-6">
                <label
                  htmlFor="minPartialAmount"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Minimum Partial Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="minPartialAmount"
                  name="minPartialAmount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 500"
                  value={formData.minPartialAmount}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.minPartialAmount)}
                  aria-describedby={errors.minPartialAmount ? 'min-partial-error' : undefined}
                  className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.minPartialAmount
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-razorpay-blue'
                  }`}
                />
                {errors.minPartialAmount && (
                  <p id="min-partial-error" className="text-xs text-rose-500 mt-1 font-medium">
                    {errors.minPartialAmount}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label
              htmlFor="expireBy"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Expire Link On (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="expireBy"
                name="expireBy"
                type="datetime-local"
                value={formData.expireBy}
                onChange={handleChange}
                aria-invalid={Boolean(errors.expireBy)}
                aria-describedby={errors.expireBy ? 'expiry-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.expireBy
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-razorpay-blue'
                }`}
              />
            </div>
            {errors.expireBy && (
              <p id="expiry-error" className="text-xs text-rose-500 mt-1 font-medium">
                {errors.expireBy}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-link"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-razorpay-dark hover:bg-razorpay-navy rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-razorpay-dark flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                'Create Payment Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
