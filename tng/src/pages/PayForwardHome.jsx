import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, PiggyBank, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';

export default function PayForwardHome() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Hero Section */}
      <div className="card card-gradient">
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
          PayForward Credit
        </h1>
        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          RM 150.00
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Next Payment</p>
            <p className="font-semibold mt-1">RM 25.00 due in 3 days</p>
          </div>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <ShieldCheck size={14} style={{ marginRight: '4px' }} />
            High Trust Score
          </div>
        </div>
      </div>

      {/* Auto Savings Link */}
      <div 
        className="card flex items-center justify-between" 
        style={{ cursor: 'pointer', padding: '16px' }}
        onClick={() => navigate('/savings')}
      >
        <div className="flex items-center gap-4">
          <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
            <PiggyBank size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-main">Emergency Fund</h3>
            <p className="text-sm mt-1">RM 23.50 saved</p>
          </div>
        </div>
        <ArrowRight size={20} color="var(--text-muted)" />
      </div>

      {/* Actions */}
      <h3 className="mt-4 mb-2">Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/pay')} style={{ padding: '16px', flexDirection: 'column', gap: '8px' }}>
          <QrCode size={24} />
          <span style={{ fontSize: '14px' }}>Scan & PayLater</span>
        </button>
        <button className="btn" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '16px', flexDirection: 'column', gap: '8px' }}>
          <Wallet size={24} color="var(--primary)" />
          <span style={{ fontSize: '14px' }}>Pay Bills</span>
        </button>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Why use PayForward?</h3>
        <p className="text-sm">Borrow for today. Save for tomorrow. With every repayment, we automatically put a little into your emergency fund.</p>
      </div>

    </div>
  );
}
