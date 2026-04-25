import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store,
  Calendar,
  PiggyBank,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";

export default function PaymentApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("review"); // review or success
  const [extraSaving, setExtraSaving] = useState(false);
  const [showAiAlert, setShowAiAlert] = useState(false);

  const getStoredAvailableCredit = () => {
    const storedAvailable = parseFloat(
      sessionStorage.getItem("payforward_available_credit")
    );
    const storedLimit = parseFloat(
      sessionStorage.getItem("payforward_credit_limit")
    );
    if (!Number.isNaN(storedAvailable)) return storedAvailable;
    if (!Number.isNaN(storedLimit)) return storedLimit;
    return 500;
  };

  // Get scanned data from location state
  const scannedData = location.state || {};
  const merchant = scannedData.merchant || "Jaya Grocer";
  const amount = scannedData.amount || 80.0;
  const creditLimit = scannedData.creditLimit ?? getStoredAvailableCredit();
  const remainingCredit = Math.max(creditLimit - amount, 0);
  const usedCredit = Math.min(amount, creditLimit);

  useEffect(() => {
    if (status === "success") {
      sessionStorage.setItem("payforward_credit_limit", creditLimit.toString());
      sessionStorage.setItem(
        "payforward_available_credit",
        remainingCredit.toString()
      );
    }
  }, [status, creditLimit, remainingCredit]);

  const proceedWithPayment = (withExtra) => {
    setExtraSaving(withExtra);
    setShowAiAlert(false);
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ height: "100%", textAlign: "center", paddingTop: "40px" }}
      >
        <div style={{ color: "var(--success)", marginBottom: "16px" }}>
          <CheckCircle2 size={80} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Payment Approved
        </h2>
        <p className="mt-2 text-muted">RM {amount.toFixed(2)} to {merchant}</p>

        <div className="card mt-4" style={{ width: "100%", padding: "18px" }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-muted">Credit used</p>
              <p className="font-semibold">RM {usedCredit.toFixed(2)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="text-sm text-muted">Remaining limit</p>
              <p className="font-semibold">RM {remainingCredit.toFixed(2)}</p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            This payment will be deducted from your PayForward credit line.
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "0",
          }}
        >
          <div
            className="flex items-center justify-center gap-2"
            style={{ color: "var(--success)" }}
          >
            <PiggyBank size={20} />
            <span className="font-semibold">
              {extraSaving
                ? "Supercharged Auto-Savings"
                : "Auto-Savings Activated"}
            </span>
          </div>
          <p
            style={{
              color: "var(--success)",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            {extraSaving
              ? "You will save RM 12.00 totally across your repayments! (+ RM 2.00/wk AI Boost)"
              : "You will save RM 4.00 totally across your repayments!"}
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: "auto" }}
          onClick={() => navigate("/")}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div
          style={{
            background: "#f0f0f0",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Store size={32} color="var(--text-main)" />
        </div>
        <h2>{merchant}</h2>
        <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "8px" }}>
          RM {amount.toFixed(2)}
        </div>
      </div>

      <div className="card" style={{ padding: "18px", marginBottom: "16px" }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted">Credit limit</p>
            <p className="font-semibold">RM {creditLimit.toFixed(2)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-sm text-muted">After payment</p>
            <p className="font-semibold">RM {remainingCredit.toFixed(2)}</p>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          This amount will be deducted from your available PayForward credit.
        </div>
      </div>

      <div className="card" style={{ padding: "0" }}>
        <div
          style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ fontSize: "14px" }}>Repayment Plan</h3>
            <span className="badge badge-primary">4 Weeks</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Weekly Installment</span>
            <span className="font-semibold">RM {(amount / 4).toFixed(2)}</span>
          </div>
          <div
            className="flex justify-between items-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span>First payment</span>
            <span>Today</span>
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--success-light)",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <div className="flex items-start gap-3">
            <PiggyBank
              size={24}
              color="var(--success)"
              style={{ flexShrink: 0 }}
            />
            <div>
              <h3 style={{ fontSize: "14px", color: "var(--success)" }}>
                Auto Savings Included
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--success)",
                  marginTop: "4px",
                }}
              >
                RM 1.00 from each repayment will be automatically moved to your
                emergency fund.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", gap: "12px" }}>
        <Calendar size={24} color="var(--primary)" />
        <div>
          <h3 style={{ fontSize: "14px" }}>Flexible Terms</h3>
          <p className="text-sm mt-1">
            Need a break? You can pause savings temp if wallet runs low.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowAiAlert(true)}
        >
          Confirm & Pay RM {amount.toFixed(2)}
        </button>
      </div>

      {/* AI Pop out Alert (Modal Overlay) */}
      {showAiAlert && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            borderRadius: "inherit",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              position: "relative",
              border: "2px solid var(--primary)",
              padding: "24px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <button
              onClick={() => setShowAiAlert(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>

            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Sparkles size={32} />
              </div>
              <h2
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                AI Smart Suggestion
              </h2>
            </div>

            <p
              className="text-center text-sm mb-8"
              style={{ color: "var(--text-main)", lineHeight: "1.6" }}
            >
              Our AI noticed you've spent <strong>15% less</strong> on groceries
              this month!
              <br />
              <br />
              Would you like to boost your emergency fund by locking in an extra{" "}
              <strong>RM 2.00/week</strong> savings for this repayment?
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="btn btn-primary"
                onClick={() => proceedWithPayment(true)}
                style={{
                  background: "var(--primary-gradient)",
                  border: "none",
                }}
              >
                <Sparkles size={16} /> Yes, save RM 2.00 extra!
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => proceedWithPayment(false)}
              >
                No thanks, keep it standard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
