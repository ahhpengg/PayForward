import React from 'react';
import { Target, TrendingUp, ChevronUp } from 'lucide-react';

export default function SavingsTracker() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero Balance */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p className="text-muted">Total Emergency Fund</p>
        <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--success)', margin: '8px 0' }}>
          RM 23.50
        </div>
        <div className="badge badge-success" style={{ gap: '4px' }}>
          <TrendingUp size={14} />
          +RM 3.00 this month
        </div>
      </div>

      {/* Goal Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target size={20} color="var(--primary)" />
            <h3 className="font-semibold">Safety Net Goal</h3>
          </div>
          <span className="font-semibold">RM 150.00</span>
        </div>
        
        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '15%', height: '100%', background: 'var(--primary)' }}></div>
        </div>
        
        <p className="text-sm mt-3 text-center">
          You're doing great! Keep repaying on time to reach your goal faster.
        </p>
      </div>

      {/* Savings Chart */}
      <div className="card">
        <h3 className="mb-4 font-semibold" style={{ fontSize: '14px' }}>Savings Growth</h3>
        <div className="flex items-end justify-between" style={{ height: '150px', paddingBottom: '8px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
          {[
            { label: 'W1', value: '2.00', percent: 10 },
            { label: 'W2', value: '5.00', percent: 25 },
            { label: 'W3', value: '10.00', percent: 45 },
            { label: 'W4', value: '15.00', percent: 65 },
            { label: 'W5', value: '18.50', percent: 80 },
            { label: 'Now', value: '23.50', percent: 100 },
          ].map((bar, i) => (
             <div key={i} className="flex flex-col items-center" style={{ flex: 1, gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
               <span style={{ fontSize: '10px', color: i === 5 ? 'var(--primary)' : 'var(--text-main)', fontWeight: i === 5 ? 'bold' : 'normal', marginBottom: '4px' }}>
                 {bar.value}
               </span>
               <div style={{ 
                 width: '100%', 
                 maxWidth: '24px',
                 height: `${bar.percent}%`, 
                 background: i === 5 ? 'var(--primary)' : 'var(--primary-light)', 
                 borderRadius: '4px 4px 0 0',
                 transition: 'height 0.5s ease-out'
               }}></div>
               <span style={{ fontSize: '11px', color: i === 5 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: i === 5 ? 'bold' : 'normal' }}>{bar.label}</span>
             </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="mt-4 mb-2">Savings History</h3>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {[
          { date: 'Today', note: 'From Groceries Repayment', amount: '+RM 1.00' },
          { date: 'Oct 12', note: 'From Bike Repair Repayment', amount: '+RM 1.00' },
          { date: 'Oct 05', note: 'From Bike Repair Repayment', amount: '+RM 1.00' },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center" style={{ borderBottom: idx !== 2 ? '1px solid var(--border)' : 'none', paddingBottom: idx !== 2 ? '16px' : '0' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronUp size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.note}</p>
                <p className="text-xs text-muted mt-1">{item.date}</p>
              </div>
            </div>
            <div className="font-bold text-success">{item.amount}</div>
          </div>
        ))}

      </div>
    </div>
  );
}
