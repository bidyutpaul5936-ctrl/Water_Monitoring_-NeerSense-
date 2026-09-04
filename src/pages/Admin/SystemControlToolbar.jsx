import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function SystemControlToolbar({ onClearAll }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onClearAll}
        className="btn text-xs px-3.5 py-1.5 bg-white border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1.5"
        title="Reset all records to empty state"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Clear All Data (Empty State)</span>
      </button>
    </div>
  );
}
