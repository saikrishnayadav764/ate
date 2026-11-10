import { describe, it, expect } from 'vitest';
import {
  validatePaymentLinkForm,
  isValidEmail,
  isValidIndianPhone,
} from '../src/utils/validators';
import { CreatePaymentLinkInput } from '../src/types/paymentLink';

describe('Payment Link Form Validation Logic - Intensive Test Suite', () => {
  const baseValidInput: CreatePaymentLinkInput = {
    amount: 1500,
    description: 'Quarterly SaaS Subscription',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '9876543210',
    allowPartialPayment: false,
    expireBy: '',
  };

  describe('1. Amount Validation Edge Cases', () => {
    it('should fail when amount is zero or negative', () => {
      const zeroResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 0,
      });
      expect(zeroResult.isValid).toBe(false);
      expect(zeroResult.errors.amount).toBe('Amount must be greater than ₹0');

      const negativeResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: -250,
      });
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.errors.amount).toBe('Amount must be greater than ₹0');
    });

    it('should fail when amount is empty, NaN, or non-numeric', () => {
      const emptyResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: '',
      });
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors.amount).toBe('Amount is required and must be a number');

      const nanResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 'abc',
      });
      expect(nanResult.isValid).toBe(false);
      expect(nanResult.errors.amount).toBe('Amount is required and must be a number');
    });

    it('should fail when amount exceeds maximum limit of ₹1,00,00,000', () => {
      const maxResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 10000001,
      });
      expect(maxResult.isValid).toBe(false);
      expect(maxResult.errors.amount).toBe('Amount cannot exceed ₹1,00,00,000');
    });

    it('should accept valid amounts, including decimals and maximum allowed limit', () => {
      const decimalResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 499.5,
      });
      expect(decimalResult.isValid).toBe(true);

      const maxAllowedResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 10000000,
      });
      expect(maxAllowedResult.isValid).toBe(true);
    });
  });

  describe('2. Description Validation Edge Cases', () => {
    it('should fail when description is empty or whitespace-only', () => {
      const emptyDescResult = validatePaymentLinkForm({
        ...baseValidInput,
        description: '   ',
      });
      expect(emptyDescResult.isValid).toBe(false);
      expect(emptyDescResult.errors.description).toBe('Description is required');
    });

    it('should fail when description exceeds 200 characters', () => {
      const longDesc = 'A'.repeat(201);
      const longDescResult = validatePaymentLinkForm({
        ...baseValidInput,
        description: longDesc,
      });
      expect(longDescResult.isValid).toBe(false);
      expect(longDescResult.errors.description).toBe('Description cannot exceed 200 characters');
    });

    it('should accept description at exact boundary of 200 characters', () => {
      const boundaryDesc = 'A'.repeat(200);
      const result = validatePaymentLinkForm({
        ...baseValidInput,
        description: boundaryDesc,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('3. Contact Information (Email & Phone) Validation', () => {
    it('should validate standard and complex email formats', () => {
      expect(isValidEmail('valid.user@razorpay.com')).toBe(true);
      expect(isValidEmail('support+tag@fintech.co.in')).toBe(true);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('user@.missingdomain.com')).toBe(false);
      expect(isValidEmail('user with space@domain.com')).toBe(false);
    });

    it('should validate Indian phone numbers with various formats (+91, 0, hyphens, spaces)', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('+919876543210')).toBe(true);
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true);
      expect(isValidIndianPhone('09876543210')).toBe(true);
      expect(isValidIndianPhone('98765-43210')).toBe(true);

      // Invalid phone numbers
      expect(isValidIndianPhone('5876543210')).toBe(false); // starts with 5 (must be 6-9)
      expect(isValidIndianPhone('1234567890')).toBe(false); // starts with 1
      expect(isValidIndianPhone('987654321')).toBe(false);  // 9 digits (too short)
      expect(isValidIndianPhone('987654321000')).toBe(false); // 12 digits (too long)
    });

    it('should fail when both email and phone are omitted', () => {
      const noContactResult = validatePaymentLinkForm({
        ...baseValidInput,
        customerEmail: '',
        customerPhone: '',
      });
      expect(noContactResult.isValid).toBe(false);
      expect(noContactResult.errors.customerEmail).toBe(
        'Provide at least an email or phone number for notification'
      );
    });

    it('should succeed when only email is provided and valid', () => {
      const emailOnlyResult = validatePaymentLinkForm({
        ...baseValidInput,
        customerEmail: 'kavita@domain.com',
        customerPhone: '',
      });
      expect(emailOnlyResult.isValid).toBe(true);
    });

    it('should succeed when only phone is provided and valid', () => {
      const phoneOnlyResult = validatePaymentLinkForm({
        ...baseValidInput,
        customerEmail: '',
        customerPhone: '9876543210',
      });
      expect(phoneOnlyResult.isValid).toBe(true);
    });
  });

  describe('4. Partial Payment Rules', () => {
    it('should reject partial payment when minPartialAmount is missing or non-numeric', () => {
      const missingMinResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 5000,
        allowPartialPayment: true,
        minPartialAmount: '',
      });
      expect(missingMinResult.isValid).toBe(false);
      expect(missingMinResult.errors.minPartialAmount).toBe('Minimum partial amount is required');
    });

    it('should reject partial payment when minPartialAmount is equal to or greater than total amount', () => {
      const equalResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 2000,
        allowPartialPayment: true,
        minPartialAmount: 2000,
      });
      expect(equalResult.isValid).toBe(false);
      expect(equalResult.errors.minPartialAmount).toBe(
        'Minimum partial amount must be less than total amount'
      );

      const greaterResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 2000,
        allowPartialPayment: true,
        minPartialAmount: 2500,
      });
      expect(greaterResult.isValid).toBe(false);
      expect(greaterResult.errors.minPartialAmount).toBe(
        'Minimum partial amount must be less than total amount'
      );
    });

    it('should reject partial payment when minPartialAmount is less than ₹1', () => {
      const zeroMinResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 2000,
        allowPartialPayment: true,
        minPartialAmount: 0.5,
      });
      expect(zeroMinResult.isValid).toBe(false);
      expect(zeroMinResult.errors.minPartialAmount).toBe(
        'Minimum partial amount must be at least ₹1'
      );
    });

    it('should succeed when minPartialAmount is valid and strictly less than total amount', () => {
      const validPartialResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 5000,
        allowPartialPayment: true,
        minPartialAmount: 1000,
      });
      expect(validPartialResult.isValid).toBe(true);
    });
  });

  describe('5. Expiry Date Constraints', () => {
    const fixedNow = new Date('2026-11-10T12:00:00.000Z');

    it('should reject past expiry timestamp', () => {
      const pastResult = validatePaymentLinkForm(
        {
          ...baseValidInput,
          expireBy: '2026-11-10T11:59:59.000Z',
        },
        fixedNow
      );
      expect(pastResult.isValid).toBe(false);
      expect(pastResult.errors.expireBy).toBe('Expiry date must be in the future');
    });

    it('should reject invalid date string', () => {
      const invalidDateResult = validatePaymentLinkForm(
        {
          ...baseValidInput,
          expireBy: 'not-a-valid-date-string',
        },
        fixedNow
      );
      expect(invalidDateResult.isValid).toBe(false);
      expect(invalidDateResult.errors.expireBy).toBe('Invalid expiry date format');
    });

    it('should accept valid future timestamp', () => {
      const futureResult = validatePaymentLinkForm(
        {
          ...baseValidInput,
          expireBy: '2026-11-10T12:05:00.000Z',
        },
        fixedNow
      );
      expect(futureResult.isValid).toBe(true);
    });
  });
});
