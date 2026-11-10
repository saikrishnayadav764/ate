import { describe, it, expect } from 'vitest';
import {
  validatePaymentLinkForm,
  isValidEmail,
  isValidIndianPhone,
} from '../src/utils/validators';
import { CreatePaymentLinkInput } from '../src/types/paymentLink';

describe('Payment Link Form Validation Logic', () => {
  const baseValidInput: CreatePaymentLinkInput = {
    amount: 1500,
    description: 'Quarterly SaaS Subscription',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '9876543210',
    allowPartialPayment: false,
    expireBy: '',
  };

  describe('Unit Test 1: Amount and Description Validation Rules', () => {
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

    it('should fail when amount is empty or non-numeric', () => {
      const emptyResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: '',
      });
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors.amount).toBe('Amount is required and must be a number');
    });

    it('should fail when description is empty or exceeds 200 characters', () => {
      const emptyDescResult = validatePaymentLinkForm({
        ...baseValidInput,
        description: '   ',
      });
      expect(emptyDescResult.isValid).toBe(false);
      expect(emptyDescResult.errors.description).toBe('Description is required');

      const longDesc = 'a'.repeat(201);
      const longDescResult = validatePaymentLinkForm({
        ...baseValidInput,
        description: longDesc,
      });
      expect(longDescResult.isValid).toBe(false);
      expect(longDescResult.errors.description).toBe('Description cannot exceed 200 characters');
    });

    it('should succeed with valid amount and description', () => {
      const validResult = validatePaymentLinkForm(baseValidInput);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual({});
    });
  });

  describe('Unit Test 2: Contact Details (Email & Phone) and Partial Payment Logic', () => {
    it('should validate standard email and Indian mobile phone formats', () => {
      expect(isValidEmail('valid.user@razorpay.com')).toBe(true);
      expect(isValidEmail('invalid-email-no-domain')).toBe(false);

      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('+919876543210')).toBe(true);
      expect(isValidIndianPhone('1234567890')).toBe(false); // Does not start with 6-9
      expect(isValidIndianPhone('98765')).toBe(false); // Too short
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

    it('should reject partial payment when minPartialAmount >= total amount or < 1', () => {
      const invalidPartialResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 1000,
        allowPartialPayment: true,
        minPartialAmount: 1000, // Equal to total amount
      });
      expect(invalidPartialResult.isValid).toBe(false);
      expect(invalidPartialResult.errors.minPartialAmount).toBe(
        'Minimum partial amount must be less than total amount'
      );

      const tooSmallPartialResult = validatePaymentLinkForm({
        ...baseValidInput,
        amount: 1000,
        allowPartialPayment: true,
        minPartialAmount: 0,
      });
      expect(tooSmallPartialResult.isValid).toBe(false);
      expect(tooSmallPartialResult.errors.minPartialAmount).toBe(
        'Minimum partial amount must be at least ₹1'
      );
    });

    it('should reject past expiry dates', () => {
      const mockNow = new Date('2026-11-10T12:00:00Z');
      const pastResult = validatePaymentLinkForm(
        {
          ...baseValidInput,
          expireBy: '2026-11-09T12:00:00Z',
        },
        mockNow
      );
      expect(pastResult.isValid).toBe(false);
      expect(pastResult.errors.expireBy).toBe('Expiry date must be in the future');
    });
  });
});
