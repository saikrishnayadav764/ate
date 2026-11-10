# Payment Links Manager – Specification & Acceptance Criteria

## 1. Overview
The **Payment Links Manager** allows merchants to create, track, share, and manage customized payment links sent to customers for collecting payments instantly.

---

## 2. Domain Data Model

```typescript
export type PaymentLinkStatus = 
  | 'ISSUED'          // Active link waiting for payment
  | 'PAID'            // Completely paid
  | 'PARTIALLY_PAID'   // Partial amount paid
  | 'EXPIRED'         // Past expiration timestamp without full payment
  | 'CANCELLED';      // Cancelled by merchant

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string; // 10-digit Indian mobile format or E.164
}

export interface PaymentLink {
  id: string;                    // e.g. "plink_1001"
  shortUrl: string;              // e.g. "https://rzp.io/l/demo1001"
  amount: number;                // in INR (Rupees or Paise subunit)
  amountPaid: number;            // amount collected so far
  currency: 'INR';
  description: string;
  customer: CustomerDetails;
  status: PaymentLinkStatus;
  allowPartialPayment: boolean;
  minPartialAmount?: number;
  expireBy: string | null;       // ISO timestamp or null
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  notes?: Record<string, string>;
}
```

---

## 3. Detailed Acceptance Criteria

### AC-01: Payment Links Listing & Overview
- [ ] Display list/table of all payment links with columns: Link ID, Description, Customer Info (name/email/phone), Total Amount, Amount Paid, Status Badge, Expiration Date, and Actions.
- [ ] Provide quick summary metrics at top:
  - Total Links Count
  - Total Revenue Collected (sum of `amountPaid`)
  - Active Pending Links (status = `ISSUED` or `PARTIALLY_PAID`)
  - Expired / Cancelled Count

### AC-02: Status Filtering & Search
- [ ] Search input filtering by Link ID, Customer Name, Customer Email, or Description in real-time.
- [ ] Status filter dropdown / tab bar: `All`, `Issued`, `Paid`, `Partially Paid`, `Expired`, `Cancelled`.
- [ ] Empty state displayed when no matching links exist with a "Clear Filters" or "Create Link" action.

### AC-03: Create Payment Link (Modal / Drawer)
- [ ] Triggered via prominent primary action button: `+ Create Payment Link`.
- [ ] Form Inputs with inline validation:
  - **Amount**: Required, positive numeric value (> 0).
  - **Description**: Required, max 200 characters.
  - **Customer Name**: Optional.
  - **Customer Email**: Valid email pattern (optional if phone provided, or required based on validation rules).
  - **Customer Phone**: 10-digit phone number.
  - **Partial Payments Toggle**: When enabled, validates `minPartialAmount` is >= ₹1 and < total amount.
  - **Expiry Date & Time**: Optional, but if set, must be in the future (relative to current client time).
- [ ] Clear field error messages on invalid submit attempt.
- [ ] On successful submission:
  - Generates unique ID (`plink_<timestamp>`) and short URL (`https://rzp.io/l/<hash>`).
  - Prepends new link to top of the list.
  - Persists to `localStorage`.
  - Shows success notification / toast and auto-closes the modal.

### AC-04: Copy Link & Share Feedback
- [ ] Each row provides a one-click "Copy Link" action.
- [ ] Copies the `shortUrl` to clipboard using the Clipboard API with fallback.
- [ ] Displays temporary visual confirmation ("Copied!" badge or toast notification for 2 seconds).

### AC-05: Link Cancellation / Deactivation
- [ ] Merchants can cancel active links (`ISSUED` or `PARTIALLY_PAID`).
- [ ] Requires confirmation (modal prompt or popconfirm) to prevent accidental cancellation.
- [ ] Once cancelled:
  - Status immediately updates to `CANCELLED`.
  - Action buttons disabled for already cancelled or paid links.

### AC-06: Simulate Customer Payment (Demo / Verification Flow)
- [ ] Allow merchant/evaluator to test the link flow by clicking a "Simulate Payment" action on active links.
- [ ] Can pay full amount (transitions to `PAID`) or partial amount if `allowPartialPayment` is true (transitions to `PARTIALLY_PAID`).
- [ ] Prevents overpayment (cannot pay more than remaining balance).

### AC-07: Expiry Detection
- [ ] If current time > `expireBy` and status is still `ISSUED`, automatically mark or treat link as `EXPIRED`.
- [ ] Expired links cannot receive payments.

### AC-08: Responsive Design & Polish
- [ ] Fully responsive on mobile (card view or scrollable table) and desktop.
- [ ] Polished Razorpay Blade aesthetic: clean typography, subtle borders, high contrast badges.
