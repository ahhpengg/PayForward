import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  QrCode,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { calculateMetricsFromHistory } from "../utils/userDataCalculator";

export default function PayForwardHome() {
  const navigate = useNavigate();
  const [riskLevel, setRiskLevel] = useState(null);
  const [creditLimit, setCreditLimit] = useState(500);
  const [spendingData, setSpendingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const assessRisk = async (data) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE}/risk-assessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setRiskLevel(result.risk_level);
        setCreditLimit(result.credit_limit);
      } else {
        console.error("Failed to assess risk");
      }
    } catch (error) {
      console.error("Error assessing risk:", error);
    }
  };

  useEffect(() => {
    // Auto-calculate metrics from past data on component mount
    const metrics = calculateMetricsFromHistory();
    setSpendingData(metrics);
    assessRisk(metrics);
    setLoading(false);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Hero Section */}
      <div className="card card-gradient">
        <h1
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
          }}
        >
          PayForward Credit
        </h1>
        <div
          style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}
        >
          RM {creditLimit.toFixed(2)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
              Next Payment
            </p>
            <p className="font-semibold mt-1">RM 25.00 due in 3 days</p>
          </div>
          <div
            className="badge"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ShieldCheck size={14} style={{ marginRight: "4px" }} />
            {riskLevel
              ? `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk`
              : "New User"}
          </div>
        </div>
      </div>

      {/* Auto Savings Link */}
      <div
        className="card flex items-center justify-between"
        style={{ cursor: "pointer", padding: "16px" }}
        onClick={() => navigate("/savings")}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              background: "var(--success-light)",
              padding: "10px",
              borderRadius: "12px",
              color: "var(--success)",
            }}
          >
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
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <button
          className="btn btn-primary"
          onClick={() => navigate("scan")}
          style={{ padding: "16px", flexDirection: "column", gap: "8px" }}
        >
          <QrCode size={24} />
          <span style={{ fontSize: "14px" }}>Scan & PayLater</span>
        </button>
        <button
          className="btn"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            color: "var(--text-main)",
            padding: "16px",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Wallet size={24} color="var(--primary)" />
          <span style={{ fontSize: "14px" }}>Pay Bills</span>
        </button>
      </div>

      {/* Auto Risk Assessment */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={20} color="var(--warning)" />
          <h3 className="font-semibold">Risk Assessment</h3>
        </div>
        <p className="text-sm mb-4">Based on your past spending behavior:</p>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "16px",
            }}
          >
            <Loader
              size={18}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span>Analyzing your spending patterns...</span>
          </div>
        ) : spendingData ? (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                style={{
                  background: "var(--primary-light)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <p className="text-xs text-muted mb-1">Monthly Spending</p>
                <p className="font-semibold">
                  RM {spendingData.monthly_spending.toFixed(2)}
                </p>
              </div>
              <div
                style={{
                  background: "var(--primary-light)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <p className="text-xs text-muted mb-1">Transactions</p>
                <p className="font-semibold">{spendingData.num_transactions}</p>
              </div>
              <div
                style={{
                  background: "var(--primary-light)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <p className="text-xs text-muted mb-1">Avg Amount</p>
                <p className="font-semibold">
                  RM {spendingData.avg_transaction_amount.toFixed(2)}
                </p>
              </div>
              <div
                style={{
                  background: "var(--primary-light)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <p className="text-xs text-muted mb-1">Top Category</p>
                <p className="font-semibold capitalize">
                  {spendingData.spending_categories}
                </p>
              </div>
            </div>
            {riskLevel && (
              <p
                className="text-sm mt-3 p-3 text-center"
                style={{
                  background: "var(--success-light)",
                  borderRadius: "8px",
                  color: "var(--success)",
                }}
              >
                Risk Level: <strong>{riskLevel.toUpperCase()}</strong> • Credit
                Limit: RM {creditLimit}
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "8px",
        }}
      >
        <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
          Why use PayForward?
        </h3>
        <p className="text-sm">
          Borrow for today. Save for tomorrow. With every repayment, we
          automatically put a little into your emergency fund.
        </p>
      </div>
    </div>
  );
}