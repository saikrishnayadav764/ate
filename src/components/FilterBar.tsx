import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  const tabs = [
    { label: 'All Links', value: 'ALL' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Expired', value: 'EXPIRED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      {/* Status Filter Tabs */}
      <div
        className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
        role="tablist"
        aria-label="Filter payment links by status"
      >
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusChange(tab.value)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-razorpay-dark text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <label htmlFor="search-links" className="sr-only">
          Search payment links
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          id="search-links"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, customer, desc..."
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-razorpay-blue focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            aria-label="Clear search query"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
