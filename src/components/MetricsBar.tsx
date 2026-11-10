import React from 'react';
import { formatINR } from '../utils/formatters';
import { IndianRupee, Link2, Clock, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  metrics: {
    totalCount: number;
    totalRevenue: number;
    activeCount: number;
    paidCount: number;
    expiredOrCancelledCount: number;
  };
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(metrics.totalRevenue)}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <IndianRupee className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Links</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Link2 className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.activeCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed (Paid)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.paidCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
