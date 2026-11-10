export type PaymentLinkStatus =
  | 'ISSUED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'EXPIRED'
  | 'CANCELLED';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface PaymentLink {
  id: string;
  shortUrl: string;
  amount: number;
  amountPaid: number;
  currency: 'INR';
  description: string;
  customer: CustomerDetails;
  status: PaymentLinkStatus;
  allowPartialPayment: boolean;
  minPartialAmount?: number;
  expireBy: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: Record<string, string>;
}

export interface CreatePaymentLinkInput {
  amount: number | string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  allowPartialPayment: boolean;
  minPartialAmount?: number | string;
  expireBy?: string;
}

export interface ValidationErrors {
  amount?: string;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
  minPartialAmount?: string;
  expireBy?: string;
}

