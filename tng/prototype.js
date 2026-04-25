const personas = {
  gigRider: {
    label: "Gig Worker (Food Rider)",
    baseScore: 72,
    walletBalance: 55,
    topupRegularity: 78,
    repaymentBehavior: 74,
    monthlyFlow: "Irregular daily inflow",
    suggestedGoal: 120,
  },
  singleParent: {
    label: "Low-income Single Parent",
    baseScore: 67,
    walletBalance: 42,
    topupRegularity: 71,
    repaymentBehavior: 69,
    monthlyFlow: "Weekly family support + cash top-up",
    suggestedGoal: 150,
  },
  unbankedVendor: {
    label: "Unbanked Night Market Vendor",
    baseScore: 64,
    walletBalance: 38,
    topupRegularity: 66,
    repaymentBehavior: 70,
    monthlyFlow: "Cash-based sales converted to wallet",
    suggestedGoal: 100,
  },
};

const essentialCaps = {
  groceries: 180,
  medicine: 200,
  transport: 130,
  school: 220,
};

const state = {
  availableCredit: 150,
  savingsBalance: 23.5,
  score: 72,
  nextPaymentAmount: 25,
  nextPaymentDays: 3,
  currentPlan: null,
  lowBalanceMode: false,
};

const formatRm = (amount) => `RM${amount.toFixed(2)}`;

function calculateTrustScore(persona, amount, savingsRate) {
  const amountPressure = Math.max(0, (amount - 80) * 0.2);
  const savingsResilienceBoost = savingsRate * 120;
  return Math.max(
    45,
    Math.min(
      92,
      Math.round(
        persona.baseScore +
          persona.topupRegularity * 0.12 +
          persona.repaymentBehavior * 0.16 -
          amountPressure +
          savingsResilienceBoost -
          18
      )
    )
  );
}

function calculatePlan({ amount, frequency, savingsRate, score }) {
  const terms = score >= 75 ? 6 : score >= 65 ? 4 : 3;
  const creditFeeRate = score >= 75 ? 0.01 : score >= 65 ? 0.015 : 0.02;
  const fee = amount * creditFeeRate;
  const totalRepayment = amount + fee;
  const repaymentPerTerm = totalRepayment / terms;
  const savingsPerRepayment = repaymentPerTerm * savingsRate;
  const schedule = [];

  let remaining = totalRepayment;
  for (let i = 1; i <= terms; i += 1) {
    remaining = Math.max(0, remaining - repaymentPerTerm);
    schedule.push({
      period: `${frequency === "weekly" ? "Week" : "Biweek"} ${i}`,
      repayment: repaymentPerTerm,
      saved: state.lowBalanceMode ? 0 : savingsPerRepayment,
      remaining,
    });
  }

  return {
    amount,
    fee,
    totalRepayment,
    terms,
    frequency,
    savingsRate,
    repaymentPerTerm,
    savingsPerRepayment: state.lowBalanceMode ? 0 : savingsPerRepayment,
    totalSaved: state.lowBalanceMode ? 0 : savingsPerRepayment * terms,
    schedule,
  };
}

function renderSignals(persona, score, amount) {
  const signals = [
    ["Wallet Txn Consistency", `${persona.topupRegularity}%`],
    ["Repayment Reliability", `${persona.repaymentBehavior}%`],
    ["Current Wallet Balance", formatRm(persona.walletBalance)],
    ["Cash Flow Pattern", persona.monthlyFlow],
    ["Requested Essential Amount", formatRm(amount)],
    ["Wallet Trust Score", `${score} / 100`],
  ];

  const list = document.getElementById("signalList");
  list.innerHTML = signals
    .map(
      ([name, value]) =>
        `<div class="signal-item"><span>${name}</span><span class="signal-value">${value}</span></div>`
    )
    .join("");
}

function renderPlan(plan, score, persona) {
  document.getElementById("approvalTitle").textContent =
    score >= 60 ? "Approved for PayForward" : "Conditional approval";

  document.getElementById("approvalSummary").textContent =
    score >= 60
      ? `Credit approved for ${formatRm(plan.amount)} with ${plan.terms} ${plan.frequency} repayments.`
      : "Lower trust score detected: reduced term count and tighter limit applied.";

  document.getElementById("planSummary").innerHTML = `
    <div class="stat-chip"><p>Credit Amount</p><h4>${formatRm(plan.amount)}</h4></div>
    <div class="stat-chip"><p>Service Fee</p><h4>${formatRm(plan.fee)}</h4></div>
    <div class="stat-chip"><p>Repayment Per Term</p><h4>${formatRm(plan.repaymentPerTerm)}</h4></div>
    <div class="stat-chip"><p>Auto-savings Per Term</p><h4>${formatRm(plan.savingsPerRepayment)}</h4></div>
    <div class="stat-chip"><p>Total Savings Created</p><h4>${formatRm(plan.totalSaved)}</h4></div>
    <div class="stat-chip"><p>Suggested Emergency Goal</p><h4>${formatRm(persona.suggestedGoal)}</h4></div>
  `;

  document.getElementById("scheduleBody").innerHTML = plan.schedule
    .map(
      (row) => `
      <tr>
        <td>${row.period}</td>
        <td>${formatRm(row.repayment)}</td>
        <td>${formatRm(row.saved)}</td>
        <td>${formatRm(row.remaining)}</td>
      </tr>
    `
    )
    .join("");

  const projectedFund = state.savingsBalance + plan.totalSaved;
  const goal = persona.suggestedGoal;
  const progress = Math.min(100, (projectedFund / goal) * 100);

  document.getElementById("fundNow").textContent = formatRm(state.savingsBalance);
  document.getElementById("fundProjected").textContent = formatRm(projectedFund);
  document.getElementById("goalTarget").textContent = formatRm(goal);
  document.getElementById("goalProgress").textContent = `${progress.toFixed(0)}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;
  document.getElementById("progressHint").textContent =
    plan.totalSaved > 0
      ? `This plan adds ${formatRm(plan.totalSaved)} to emergency savings automatically.`
      : "Low-balance protection is active, so savings are paused until wallet recovers.";

  const rewardBand = score >= 75 ? "Gold" : score >= 65 ? "Silver" : "Starter";
  const rewardNote =
    rewardBand === "Gold"
      ? "Higher limit unlocked (+RM40) and 0.5% fee reduction."
      : rewardBand === "Silver"
      ? "Maintain on-time payments to unlock bonus savings boosts."
      : "Complete this plan on time to move into Silver rewards.";

  document.getElementById("rewardsState").innerHTML = `
    <div class="stat-chip"><p>Reward Tier</p><h4>${rewardBand}</h4></div>
    <div class="stat-chip"><p>Next Unlock</p><h4>${rewardNote}</h4></div>
  `;
}

function refreshDashboard(plan, score) {
  state.currentPlan = plan;
  state.score = score;
  state.nextPaymentAmount = plan.repaymentPerTerm;
  state.nextPaymentDays = plan.frequency === "weekly" ? 7 : 14;

  document.getElementById("availableCredit").textContent = formatRm(
    Math.max(0, state.availableCredit - plan.amount * 0.4)
  );
  document.getElementById("savingsBalance").textContent = formatRm(state.savingsBalance);
  document.getElementById("trustScore").textContent = `${score} / 100`;
  document.getElementById("nextPayment").textContent = `${formatRm(
    plan.repaymentPerTerm
  )} in ${state.nextPaymentDays} days`;
}

function runSimulation(event) {
  event.preventDefault();

  const persona = personas[document.getElementById("personaSelect").value];
  const category = document.getElementById("categorySelect").value;
  const frequency = document.getElementById("frequencySelect").value;
  const amount = Number(document.getElementById("amountInput").value || 0);
  const savingsRate = Number(document.getElementById("savingsRateSelect").value || 0.03);
  const cappedAmount = Math.min(amount, essentialCaps[category]);

  const score = calculateTrustScore(persona, cappedAmount, savingsRate);
  const plan = calculatePlan({ amount: cappedAmount, frequency, savingsRate, score });

  renderSignals(persona, score, cappedAmount);
  renderPlan(plan, score, persona);
  refreshDashboard(plan, score);
}

function initNav() {
  const buttons = document.querySelectorAll(".nav-btn");
  const screens = document.querySelectorAll(".screen");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.screen;
      buttons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      screens.forEach((screen) =>
        screen.classList.toggle("active", screen.id === target)
      );
    });
  });
}

function initLowBalanceToggle() {
  const toggle = document.getElementById("lowBalanceToggle");
  const lowBalanceState = document.getElementById("lowBalanceState");

  toggle.addEventListener("change", () => {
    state.lowBalanceMode = toggle.checked;
    if (state.lowBalanceMode) {
      lowBalanceState.textContent = "Savings paused to protect low wallet balance";
      lowBalanceState.className = "state-warn";
    } else {
      lowBalanceState.textContent = "Savings active";
      lowBalanceState.className = "state-ok";
    }

    if (state.currentPlan) {
      document.getElementById("purchaseForm").dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  });
}

function init() {
  initNav();
  initLowBalanceToggle();
  document.getElementById("purchaseForm").addEventListener("submit", runSimulation);
  document.getElementById("purchaseForm").dispatchEvent(
    new Event("submit", { cancelable: true, bubbles: true })
  );
}

init();
