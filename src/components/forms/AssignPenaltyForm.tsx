'use client';

import { useState } from 'react';
import type { AssignPenaltyPayload, ExemptionPayload } from '@/types';

interface AssignPenaltyFormProps {
  citizenId:  string;
  activityId: string;
  citizenName: string;
  onAssign:  (payload: AssignPenaltyPayload) => void;
  onExempt:  (payload: ExemptionPayload) => void;
  loading?:  boolean;
}

export const AssignPenaltyForm = ({
  citizenId,
  activityId,
  citizenName,
  onAssign,
  onExempt,
  loading,
}: AssignPenaltyFormProps) => {
  const [amountRwf, setAmountRwf]   = useState('');
  const [reason,    setReason]      = useState('');
  const [exemptReason, setExemptReason] = useState('');
  const [mode,      setMode]        = useState<'penalty' | 'exempt'>('penalty');
  const [errors,    setErrors]      = useState<Record<string, string>>({});

  const validatePenalty = () => {
    const newErrors: Record<string, string> = {};
    if (!amountRwf || isNaN(Number(amountRwf)) || Number(amountRwf) <= 0)
      newErrors.amountRwf = 'Enter a valid amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExemption = () => {
    const newErrors: Record<string, string> = {};
    if (!exemptReason.trim())
      newErrors.exemptReason = 'Exemption reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = () => {
    if (!validatePenalty()) return;
    onAssign({ citizenId, activityId, amountRwf: Number(amountRwf), reason });
  };

  const handleExempt = () => {
    if (!validateExemption()) return;
    onExempt({ citizenId, activityId, reason: exemptReason });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Citizen Info */}
      <div className="bg-gray-50 rounded-lg px-4 py-3">
        <p className="text-xs text-gray-500">Absent Citizen</p>
        <p className="font-semibold text-gray-900">{citizenName}</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('penalty')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'penalty'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Assign Penalty
        </button>
        <button
          onClick={() => setMode('exempt')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'exempt'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Mark as Excused
        </button>
      </div>

      {/* Penalty Form */}
      {mode === 'penalty' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="amountRwf" className="text-sm font-medium text-gray-700">
              Penalty Amount (RWF)
            </label>
            <input
              id="amountRwf"
              type="number"
              placeholder="e.g. 5000"
              value={amountRwf}
              onChange={(e) => setAmountRwf(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.amountRwf && (
              <p className="text-xs text-red-500">{errors.amountRwf}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <input
              id="reason"
              type="text"
              placeholder="e.g. Absent without notice"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 w-fit"
          >
            {loading ? 'Assigning...' : 'Assign Penalty'}
          </button>
        </div>
      )}

      {/* Exemption Form */}
      {mode === 'exempt' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="exemptReason" className="text-sm font-medium text-gray-700">
              Exemption Reason
            </label>
            <input
              id="exemptReason"
              type="text"
              placeholder="e.g. Medical emergency"
              value={exemptReason}
              onChange={(e) => setExemptReason(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.exemptReason && (
              <p className="text-xs text-red-500">{errors.exemptReason}</p>
            )}
          </div>
          <button
            onClick={handleExempt}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 w-fit"
          >
            {loading ? 'Processing...' : 'Mark as Excused'}
          </button>
        </div>
      )}
    </div>
  );
};