import { CreatePaymentLinkInput, ValidationErrors } from '../types/paymentLink';

const EMAIL_REGEX = /^[^\s@]+@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+91|91|0)?[6-9]\d{9}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidIndianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return PHONE_REGEX.test(cleanPhone);
}

export function validateField(
  field: keyof CreatePaymentLinkInput,
  input: CreatePaymentLinkInput,
  now: Date = new Date()
): string | undefined {
  const { errors } = validatePaymentLinkForm(input, now);
  return errors[field as keyof ValidationErrors];
}

export function validatePaymentLinkForm(
  input: CreatePaymentLinkInput,
  now: Date = new Date()
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  // Amount validation
  const numAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
  if (input.amount === '' || isNaN(numAmount)) {
    errors.amount = 'Amount is required and must be a number';
  } else if (numAmount <= 0) {
    errors.amount = 'Amount must be greater than ₹0';
  } else if (numAmount > 10000000) {
    errors.amount = 'Amount cannot exceed ₹1,00,00,000';
  }

  // Description validation
  const trimmedDesc = input.description ? input.description.trim() : '';
  if (!trimmedDesc) {
    errors.description = 'Description is required';
  } else if (trimmedDesc.length > 200) {
    errors.description = 'Description cannot exceed 200 characters';
  }

  // Contact validation: Either email or phone should ideally be provided
  const hasEmail = Boolean(input.customerEmail && input.customerEmail.trim());
  const hasPhone = Boolean(input.customerPhone && input.customerPhone.trim());

  if (hasEmail && !isValidEmail(input.customerEmail)) {
    errors.customerEmail = 'Please enter a valid email address';
  }

  if (hasPhone && !isValidIndianPhone(input.customerPhone)) {
    errors.customerPhone = 'Enter a valid 10-digit Indian phone number (starts with 6-9)';
  }

  if (!hasEmail && !hasPhone) {
    errors.customerEmail = 'Provide at least an email or phone number for notification';
  }

  // Partial payment validation
  if (input.allowPartialPayment) {
    const minPartial =
      typeof input.minPartialAmount === 'string'
        ? parseFloat(input.minPartialAmount)
        : input.minPartialAmount;

    if (minPartial === undefined || isNaN(minPartial) || minPartial === null) {
      errors.minPartialAmount = 'Minimum partial amount is required';
    } else if (minPartial < 1) {
      errors.minPartialAmount = 'Minimum partial amount must be at least ₹1';
    } else if (!isNaN(numAmount) && minPartial >= numAmount) {
      errors.minPartialAmount = 'Minimum partial amount must be less than total amount';
    }
  }

  // Expiry date validation
  if (input.expireBy) {
    const expiryTime = new Date(input.expireBy).getTime();
    if (isNaN(expiryTime)) {
      errors.expireBy = 'Invalid expiry date format';
    } else if (expiryTime <= now.getTime()) {
      errors.expireBy = 'Expiry date must be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

