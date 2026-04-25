import React, { useState, useEffect } from "react";
import { Target, TrendingUp, ChevronUp, Sparkles, Loader } from "lucide-react";
import { calculateSavingsMetricsFromHistory } from "../utils/userDataCalculator";

export default function SavingsTracker() {
  const [savingSuggestion, setSavingSuggestion] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSavingSuggestion = async (data) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/saving-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSavingSuggestion(result.suggested_saving_amount);
      } else {
        console.error("Failed to get saving suggestion");
      }
    } catch (error) {
      console.error("Error fetching saving suggestion:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-calculate metrics from past data on component mount
    const metrics = calculateSavingsMetricsFromHistory();
    setUserData(metrics);
    getSavingSuggestion(metrics);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero Balance */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p className="text-muted">Total Emergency Fund</p>
        <div
          style={{
            fontSize: "40px",
            fontWeight: "bold",
            color: "var(--success)",
            margin: "8px 0",
          }}
        >
          RM 23.50
        </div>
        <div className="badge badge-success" style={{ gap: "4px" }}>
          <TrendingUp size={14} />
          +RM 3.00 this month
        </div>
      </div>

      {/* AI Savings Calculation Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} color="var(--primary)" />
          <h3 className="font-semibold">Financial Summary</h3>
        </div>
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
            <span>Calculating based on your history...</span>
          </div>
        ) : userData ? (
          <div className="grid grid-cols-2 gap-3">
            <div
              style={{
                background: "var(--primary-light)",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <p className="text-xs text-muted mb-1">Monthly Income</p>
              <p className="font-semibold">RM {userData.income.toFixed(2)}</p>
            </div>
            <div
              style={{
                background: "var(--primary-light)",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <p className="text-xs text-muted mb-1">Monthly Expenses</p>
              <p className="font-semibold">
                RM {userData.monthly_expenses.toFixed(2)}
              </p>
            </div>
            <div
              style={{
                background: "var(--success-light)",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <p className="text-xs text-muted mb-1">Discretionary Cash</p>
              <p className="font-semibold">
                RM {userData.discretionaryCash.toFixed(2)}
              </p>
            </div>
            <div
              style={{
                background: "var(--primary-light)",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <p className="text-xs text-muted mb-1">Savings Goal</p>
              <p className="font-semibold">
                RM {userData.savings_goal.toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* User Data Form */}
      <div className="card">
        <h3 className="font-semibold mb-3">Enter Your Financial Details</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm font-medium">Monthly Income (RM)</label>
            <input
              type="number"
              name="income"
              value={userData?.income || 5000}
              onChange={(e) => {}}
              className="input"
              disabled
              placeholder="5000"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Monthly Expenses (RM)</label>
            <input
              type="number"
              name="monthly_expenses"
              value={userData?.monthly_expenses || 3000}
              onChange={(e) => {}}
              className="input"
              disabled
              placeholder="3000"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Savings Goal (RM)</label>
            <input
              type="number"
              name="savings_goal"
              value={userData?.savings_goal || 1000}
              onChange={(e) => {}}
              className="input"
              disabled
              placeholder="1000"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={userData?.age || 30}
              onChange={(e) => {}}
              className="input"
              disabled
              placeholder="30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Number of Dependents</label>
            <input
              type="number"
              name="dependents"
              value={userData?.dependents || 1}
              onChange={(e) => {}}
              className="input"
              disabled
              placeholder="1"
            />
          </div>
        </div>
        <p className="text-xs text-muted text-center">
          Auto-calculated from your transaction history
        </p>
      </div>

      {/* AI Saving Suggestion */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} color="var(--primary)" />
          <h3 className="font-semibold">AI Smart Saving Suggestion</h3>
        </div>
        {loading ? (
          <p>Loading suggestion...</p>
        ) : savingSuggestion ? (
          <div>
            <p className="text-sm mb-2">
              Based on your spending patterns, we recommend saving:
            </p>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              RM {savingSuggestion.toFixed(2)} per month
            </div>
            <p className="text-xs text-muted mt-2">
              This helps you reach your goals faster while maintaining your
              lifestyle.
            </p>
          </div>
        ) : (
          <p className="text-sm">
            Unable to load suggestion. Please check your connection.
          </p>
        )}
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

        <div
          style={{
            width: "100%",
            height: "8px",
            background: "var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "15%",
              height: "100%",
              background: "var(--primary)",
            }}
          ></div>
        </div>

        <p className="text-sm mt-3 text-center">
          You're doing great! Keep repaying on time to reach your goal faster.
        </p>
      </div>

      {/* Savings Chart */}
      <div className="card">
        <h3 className="mb-4 font-semibold" style={{ fontSize: "14px" }}>
          Savings Growth
        </h3>
        <div
          className="flex items-end justify-between"
          style={{
            height: "150px",
            paddingBottom: "8px",
            borderBottom: "1px solid var(--border)",
            gap: "12px",
          }}
        >
          {[
            { label: "W1", value: "2.00", percent: 10 },
            { label: "W2", value: "5.00", percent: 25 },
            { label: "W3", value: "10.00", percent: 45 },
            { label: "W4", value: "15.00", percent: 65 },
            { label: "W5", value: "18.50", percent: 80 },
            { label: "Now", value: "23.50", percent: 100 },
          ].map((bar, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{
                flex: 1,
                gap: "4px",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: i === 5 ? "var(--primary)" : "var(--text-main)",
                  fontWeight: i === 5 ? "bold" : "normal",
                  marginBottom: "4px",
                }}
              >
                {bar.value}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: "24px",
                  height: `${bar.percent}%`,
                  background:
                    i === 5 ? "var(--primary)" : "var(--primary-light)",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.5s ease-out",
                }}
              ></div>
              <span
                style={{
                  fontSize: "11px",
                  color: i === 5 ? "var(--text-main)" : "var(--text-muted)",
                  fontWeight: i === 5 ? "bold" : "normal",
                }}
              >
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="mt-4 mb-2">Savings History</h3>
      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {[
          {
            date: "Today",
            note: "From Groceries Repayment",
            amount: "+RM 1.00",
          },
          {
            date: "Oct 12",
            note: "From Bike Repair Repayment",
            amount: "+RM 1.00",
          },
          {
            date: "Oct 05",
            note: "From Bike Repair Repayment",
            amount: "+RM 1.00",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center"
            style={{
              borderBottom: idx !== 2 ? "1px solid var(--border)" : "none",
              paddingBottom: idx !== 2 ? "16px" : "0",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--success-light)",
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
