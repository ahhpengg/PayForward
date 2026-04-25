// Mock past transaction data
const generateMockTransactions = () => {
  const transactions = [];
  const categories = ["essentials", "luxury", "entertainment"];
  const today = new Date();

  // Generate last 90 days of transactions
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 3-5 transactions per day
    const transactionsPerDay = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < transactionsPerDay; j++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      let amount;

      // Vary amounts by category
      if (category === "essentials") {
        amount = Math.random() * 100 + 20; // RM 20-120
      } else if (category === "luxury") {
        amount = Math.random() * 200 + 50; // RM 50-250
      } else {
        amount = Math.random() * 150 + 10; // RM 10-160
      }

      transactions.push({
        date: date.toISOString().split("T")[0],
        amount: Math.round(amount * 100) / 100,
        category: category,
        description: `Transaction in ${category}`,
      });
    }
  }

  return transactions;
};

// Calculate metrics from past transactions
export const calculateMetricsFromHistory = () => {
  const transactions = generateMockTransactions();

  // Calculate monthly spending
  const monthlySpending =
    transactions.reduce((sum, t) => sum + t.amount, 0) / 3; // 90 days / 3

  // Calculate number of transactions per month
  const numTransactions = transactions.length / 3; // 90 days / 3

  // Calculate average transaction amount
  const avgTransactionAmount = monthlySpending / numTransactions;

  // Determine primary spending category
  const categoryCount = {};
  transactions.forEach((t) => {
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });
  const spendingCategory = Object.keys(categoryCount).reduce((a, b) =>
    categoryCount[a] > categoryCount[b] ? a : b,
  );

  // Default user profile (would come from user data in production)
  const age = 28;
  const income = 5000;

  return {
    monthly_spending: Math.round(monthlySpending * 100) / 100,
    num_transactions: Math.round(numTransactions),
    avg_transaction_amount: Math.round(avgTransactionAmount * 100) / 100,
    spending_categories: spendingCategory,
    age: age,
    income: income,
    transactions: transactions,
  };
};

// Calculate savings metrics from history
export const calculateSavingsMetricsFromHistory = () => {
  const transactions = generateMockTransactions();

  // Calculate monthly income and expenses
  const income = 5000; // default income
  const monthlyExpenses =
    transactions.reduce((sum, t) => sum + t.amount, 0) / 3; // 90 days / 3

  // Savings goal is 20% of monthly income
  const savingsGoal = income * 0.2;

  // Default user profile
  const age = 28;
  const dependents = 1;

  return {
    income: income,
    monthly_expenses: Math.round(monthlyExpenses * 100) / 100,
    savings_goal: Math.round(savingsGoal * 100) / 100,
    age: age,
    dependents: dependents,
    transactions: transactions,
    discretionaryCash: Math.round((income - monthlyExpenses) * 100) / 100,
  };
};
