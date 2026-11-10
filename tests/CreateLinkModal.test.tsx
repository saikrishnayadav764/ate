import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateLinkModal } from '../src/components/CreateLinkModal';

describe('CreateLinkModal Component - Intensive Form UX & Restrictions Testing', () => {
  it('should render form fields and communicative helper text when open', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create Payment Link/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Description/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 200/i)).toBeInTheDocument();
    expect(screen.getByText(/Min ₹1 • Max ₹1 Cr/i)).toBeInTheDocument();
    expect(screen.getByText(/10 digits/i)).toBeInTheDocument();
  });

  it('should strictly restrict customer phone input to 10 digits and numbers only', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const phoneInput = screen.getByLabelText(/Customer Phone/i) as HTMLInputElement;

    // Attempt to type 14 characters with letters
    fireEvent.change(phoneInput, { target: { name: 'customerPhone', value: '98765432109999' } });
    // Must be capped at exactly 10 digits
    expect(phoneInput.value).toBe('9876543210');
    expect(phoneInput.value.length).toBe(10);

    // Attempt to type non-numeric characters
    fireEvent.change(phoneInput, { target: { name: 'customerPhone', value: 'abc-98765-xyz' } });
    expect(phoneInput.value).toBe('98765');
  });

  it('should show immediate inline errors on field blur without requiring form submit', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const amountInput = screen.getByLabelText(/Amount/i);
    // Blur without entering anything
    fireEvent.blur(amountInput);

    // Immediate inline error should appear right below the amount input
    expect(screen.getByText('Amount is required and must be a number', { selector: '#amount-error' })).toBeInTheDocument();

    const descInput = screen.getByLabelText(/Payment Description/i);
    fireEvent.blur(descInput);
    expect(screen.getByText('Description is required', { selector: '#description-error' })).toBeInTheDocument();
  });

  it('should show immediate inline validation error when typing an invalid 10-digit phone number', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const phoneInput = screen.getByLabelText(/Customer Phone/i);
    // 10 digits starting with 1 (invalid for Indian mobile)
    fireEvent.change(phoneInput, { target: { name: 'customerPhone', value: '1234567890' } });

    // Immediate inline error should trigger as soon as 10 digits are typed
    expect(
      screen.getByText('Enter a valid 10-digit Indian phone number (starts with 6-9)', {
        selector: '#phone-error',
      })
    ).toBeInTheDocument();

    // Now change to valid starting digit 9
    fireEvent.change(phoneInput, { target: { name: 'customerPhone', value: '9876543210' } });
    expect(
      screen.queryByText('Enter a valid 10-digit Indian phone number (starts with 6-9)', {
        selector: '#phone-error',
      })
    ).not.toBeInTheDocument();
  });

  it('should display error summary alert banner and inline field errors on empty submit attempt', () => {
    const mockSubmit = vi.fn();
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={mockSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Create Payment Link/i });
    fireEvent.click(submitBtn);

    // Form should not submit
    expect(mockSubmit).not.toHaveBeenCalled();

    // Communicative error summary banner should appear
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Please resolve the following errors:/i)).toBeInTheDocument();

    // Inline field errors appear both in summary alert and below input
    expect(screen.getAllByText(/Amount is required and must be a number/i)).toHaveLength(2);
    expect(screen.getAllByText(/Description is required/i)).toHaveLength(2);
    expect(
      screen.getAllByText(/Provide at least an email or phone number for notification/i)
    ).toHaveLength(2);
  });

  it('should update character counter as user types into description', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const descInput = screen.getByLabelText(/Payment Description/i);
    expect(screen.getByText('0 / 200')).toBeInTheDocument();

    fireEvent.change(descInput, { target: { name: 'description', value: 'Monthly retainer invoice' } });
    expect(screen.getByText('24 / 200')).toBeInTheDocument();
  });

  it('should dynamically display minimum partial amount input when partial payment toggle is checked', () => {
    render(
      <CreateLinkModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByLabelText(/Minimum Partial Amount/i)).not.toBeInTheDocument();

    const partialCheckbox = screen.getByLabelText(/Allow Partial Payments/i);
    fireEvent.click(partialCheckbox);

    expect(screen.getByLabelText(/Minimum Partial Amount/i)).toBeInTheDocument();
  });
});
