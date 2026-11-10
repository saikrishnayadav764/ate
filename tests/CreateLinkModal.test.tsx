import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateLinkModal } from '../src/components/CreateLinkModal';

describe('CreateLinkModal Component - Intensive Form UX Testing', () => {
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

    // Initially partial amount input should not exist
    expect(screen.queryByLabelText(/Minimum Partial Amount/i)).not.toBeInTheDocument();

    // Toggle partial payment checkbox
    const partialCheckbox = screen.getByLabelText(/Allow Partial Payments/i);
    fireEvent.click(partialCheckbox);

    // Now minimum partial amount input should appear
    expect(screen.getByLabelText(/Minimum Partial Amount/i)).toBeInTheDocument();
  });
});
