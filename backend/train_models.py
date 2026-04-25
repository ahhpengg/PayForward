import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib

# Generate synthetic data for risk assessment
np.random.seed(42)
n_samples = 100

# Features for risk assessment
monthly_spending = np.random.normal(2000, 500, n_samples)
num_transactions = np.random.poisson(50, n_samples)
avg_transaction_amount = monthly_spending / num_transactions
spending_categories = np.random.choice(['essentials', 'luxury', 'entertainment'], n_samples)
age = np.random.normal(35, 10, n_samples)
income = np.random.normal(5000, 1000, n_samples)

# Risk levels based on spending behavior
def assign_risk(row):
    if row['monthly_spending'] > 2500 or row['avg_transaction_amount'] > 60:
        return 'high'
    elif row['monthly_spending'] < 1500 and row['avg_transaction_amount'] < 40:
        return 'low'
    else:
        return 'normal'

df_risk = pd.DataFrame({
    'monthly_spending': monthly_spending,
    'num_transactions': num_transactions,
    'avg_transaction_amount': avg_transaction_amount,
    'spending_categories': spending_categories,
    'age': age,
    'income': income
})

df_risk['risk'] = df_risk.apply(assign_risk, axis=1)

# Encode categorical
le_category = LabelEncoder()
df_risk['spending_categories_encoded'] = le_category.fit_transform(df_risk['spending_categories'])
le_risk = LabelEncoder()
df_risk['risk_encoded'] = le_risk.fit_transform(df_risk['risk'])

# Features and target
X_risk = df_risk[['monthly_spending', 'num_transactions', 'avg_transaction_amount', 'spending_categories_encoded', 'age', 'income']]
y_risk = df_risk['risk_encoded']

X_train_risk, X_test_risk, y_train_risk, y_test_risk = train_test_split(X_risk, y_risk, test_size=0.2, random_state=42)

# Train XGBoost for risk
model_risk = xgb.XGBClassifier(objective='multi:softmax', num_class=3, n_estimators=100)
model_risk.fit(X_train_risk, y_train_risk)

# Save model and encoders
joblib.dump(model_risk, 'risk_model.pkl')
joblib.dump(le_category, 'category_encoder.pkl')
joblib.dump(le_risk, 'risk_encoder.pkl')

print("Risk model trained and saved.")

# Generate synthetic data for saving suggestion
n_samples_save = 100
income_save = np.random.normal(5000, 1000, n_samples_save)
monthly_expenses = np.random.normal(3000, 500, n_samples_save)
savings_goal = np.random.normal(1000, 200, n_samples_save)
age_save = np.random.normal(35, 10, n_samples_save)
dependents = np.random.poisson(2, n_samples_save)

# Suggested saving amount (simplified)
suggested_saving = (income_save - monthly_expenses) * 0.2 + savings_goal * 0.1
suggested_saving = np.clip(suggested_saving, 100, 2000)  # reasonable range

df_save = pd.DataFrame({
    'income': income_save,
    'monthly_expenses': monthly_expenses,
    'savings_goal': savings_goal,
    'age': age_save,
    'dependents': dependents,
    'suggested_saving': suggested_saving
})

X_save = df_save[['income', 'monthly_expenses', 'savings_goal', 'age', 'dependents']]
y_save = df_save['suggested_saving']

X_train_save, X_test_save, y_train_save, y_test_save = train_test_split(X_save, y_save, test_size=0.2, random_state=42)

# Train XGBoost regressor for saving suggestion
model_save = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
model_save.fit(X_train_save, y_train_save)

# Save model
joblib.dump(model_save, 'saving_model.pkl')

print("Saving suggestion model trained and saved.")