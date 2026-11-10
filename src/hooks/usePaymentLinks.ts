import { useState, useEffect, useMemo, useCallback } from 'react';
import { PaymentLink, CreatePaymentLinkInput, PaymentLinkStatus } from '../types/paymentLink';
import { INITIAL_MOCK_LINKS } from '../utils/mockData';
import { generateShortUrl } from '../utils/formatters';

const STORAGE_KEY = 'razorpay_payment_links_v1';

export function usePaymentLinks() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hydrate from localStorage or seed initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PaymentLink[] = JSON.parse(stored);
        setLinks(parsed);
      } else {
        setLinks(INITIAL_MOCK_LINKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_LINKS));
      }
    } catch (e) {
      console.error('Error hydrating links from localStorage', e);
      setLinks(INITIAL_MOCK_LINKS);
    } finally {
      // Simulate quick natural network hydration delay
      const timer = setTimeout(() => setIsLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save to localStorage whenever links change (after initial load)
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      } catch (e) {
        console.error('Failed to persist payment links to localStorage', e);
      }
    }
  }, [links, isLoading]);

  // Periodic automatic expiry check
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      setLinks((prev) =>
        prev.map((link) => {
          if (
            link.status === 'ISSUED' &&
            link.expireBy &&
            new Date(link.expireBy).getTime() <= now
          ) {
            return {
              ...link,
              status: 'EXPIRED' as PaymentLinkStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return link;
        })
      );
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Create Link
  const createLink = useCallback(async (input: CreatePaymentLinkInput): Promise<PaymentLink> => {
    setIsLoading(true);

    // Simulate async network request
    await new Promise((res) => setTimeout(res, 350));

    const id = `plink_${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();
    const parsedAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
    const parsedMinPartial =
      input.allowPartialPayment && input.minPartialAmount !== undefined
        ? typeof input.minPartialAmount === 'string'
          ? parseFloat(input.minPartialAmount)
          : input.minPartialAmount
        : undefined;

    const newLink: PaymentLink = {
      id,
      shortUrl: generateShortUrl(id),
      amount: parsedAmount,
      amountPaid: 0,
      currency: 'INR',
      description: input.description.trim(),
      customer: {
        name: input.customerName.trim() || 'Valued Customer',
        email: input.customerEmail.trim(),
        phone: input.customerPhone.trim(),
      },
      status: 'ISSUED',
      allowPartialPayment: input.allowPartialPayment,
      minPartialAmount: parsedMinPartial,
      expireBy: input.expireBy ? new Date(input.expireBy).toISOString() : null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setLinks((prev) => [newLink, ...prev]);
    setIsLoading(false);
    return newLink;
  }, []);

  // Cancel Link
  const cancelLink = useCallback((id: string) => {
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id && (link.status === 'ISSUED' || link.status === 'PARTIALLY_PAID')) {
          return {
            ...link,
            status: 'CANCELLED' as PaymentLinkStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return link;
      })
    );
  }, []);

  // Simulate Payment (Full or Partial)
  const simulatePayment = useCallback((id: string, paymentAmount: number) => {
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id !== id) return link;
        if (link.status === 'CANCELLED' || link.status === 'EXPIRED') return link;

        const newPaid = Math.min(link.amount, link.amountPaid + paymentAmount);
        const newStatus: PaymentLinkStatus =
          newPaid >= link.amount ? 'PAID' : 'PARTIALLY_PAID';

        return {
          ...link,
          amountPaid: newPaid,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Status filter
      if (statusFilter !== 'ALL' && link.status !== statusFilter) {
        return false;
      }

      // Search query filter (matches ID, Description, Customer Name, Email, Phone)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = link.id.toLowerCase().includes(query);
        const matchesDesc = link.description.toLowerCase().includes(query);
        const matchesName = link.customer.name.toLowerCase().includes(query);
        const matchesEmail = link.customer.email.toLowerCase().includes(query);
        const matchesPhone = link.customer.phone.includes(query);
        return matchesId || matchesDesc || matchesName || matchesEmail || matchesPhone;
      }

      return true;
    });
  }, [links, statusFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCount = links.length;
    const totalRevenue = links.reduce((sum, item) => sum + item.amountPaid, 0);
    const activeCount = links.filter(
      (l) => l.status === 'ISSUED' || l.status === 'PARTIALLY_PAID'
    ).length;
    const paidCount = links.filter((l) => l.status === 'PAID').length;
    const expiredOrCancelledCount = links.filter(
      (l) => l.status === 'EXPIRED' || l.status === 'CANCELLED'
    ).length;

    return {
      totalCount,
      totalRevenue,
      activeCount,
      paidCount,
      expiredOrCancelledCount,
    };
  }, [links]);

  return {
    links: filteredLinks,
    allLinks: links,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    createLink,
    cancelLink,
    simulatePayment,
    metrics,
  };
}

