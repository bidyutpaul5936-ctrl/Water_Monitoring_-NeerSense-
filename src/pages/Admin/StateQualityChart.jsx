import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StateQualityChart() {
  const { waterReports = [] } = useAlertNotification() || {};
  const safeWaterReports = Array.isArray(waterReports) ? waterReports : [];
  
  // Count only reports that have been classified
  const safeCount = safeWaterReports.filter(r => r.safetyStatus === 'SAFE').length;
  const warningCount = safeWaterReports.filter(r => r.safetyStatus === 'WARNING').length;
  const contaminatedCount = safeWaterReports.filter(r => r.safetyStatus === 'CONTAMINATED').length;
  
  const total = safeCount + warningCount + contaminatedCount;
  
  const data = {
    labels: ['Safe', 'Warning', 'Contaminated'],
    datasets: [
      {
        label: 'Water Quality %',
        data: [
          total ? ((safeCount / total) * 100).toFixed(1) : 0,
          total ? ((warningCount / total) * 100).toFixed(1) : 0,
          total ? ((contaminatedCount / total) * 100).toFixed(1) : 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // emerald
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(239, 68, 68, 0.8)'   // red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 'bold'
          },
          color: '#082f49'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(8, 47, 73, 0.9)',
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
        padding: 12,
        callbacks: {
          label: function(context) {
            return ' ' + context.label + ': ' + context.formattedValue + '%';
          }
        }
      }
    },
    cutout: '65%',
    maintainAspectRatio: false
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-extrabold text-sky-950">Statewide Water Quality Overview</h3>
        <p className="text-xs text-sky-700 mt-1">Percentage of classified water sources across the state</p>
      </div>
      
      <div className="w-full h-64 max-w-md relative flex justify-center">
        {total > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-slate-50 rounded-full border border-dashed border-slate-200">
            <span className="text-sm font-semibold text-slate-400">No classified reports yet</span>
          </div>
        )}
        
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-3xl font-extrabold text-sky-950">{total}</span>
            <span className="text-3xs font-bold text-sky-600 uppercase tracking-wider">Reports</span>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Safe</div>
            <div className="text-lg font-extrabold text-emerald-600 mt-1">{safeCount}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">Warning</div>
            <div className="text-lg font-extrabold text-amber-600 mt-1">{warningCount}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
            <div className="text-xs font-bold text-red-800 uppercase tracking-wide">Contam</div>
            <div className="text-lg font-extrabold text-red-600 mt-1">{contaminatedCount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
