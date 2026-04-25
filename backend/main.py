from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import xgboost as xgb

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and encoders
import os
model_dir = os.path.dirname(__file__)
try:
    risk_model = joblib.load(os.path.join(model_dir, 'risk_model.pkl'))
    category_encoder = joblib.load(os.path.join(model_dir, 'category_encoder.pkl'))
    risk_encoder = joblib.load(os.path.join(model_dir, 'risk_encoder.pkl'))
    saving_model = joblib.load(os.path.join(model_dir, 'saving_model.pkl'))
except FileNotFoundError:
    print("Models not found. Please run train_models.py first.")
    risk_model = None
    saving_model = None

class RiskAssessmentRequest(BaseModel):
    monthly_spending: float
    num_transactions: int
    avg_transaction_amount: float
    spending_categories: str  # 'essentials', 'luxury', 'entertainment'
    age: float
    income: float

class SavingSuggestionRequest(BaseModel):
    income: float
    monthly_expenses: float
    savings_goal: float
    age: float
    dependents: int

@app.post("/risk-assessment")
def assess_risk(request: RiskAssessmentRequest):
    if risk_model is None:
        return {"error": "Model not loaded"}

    # Encode category
    try:
        category_encoded = category_encoder.transform([request.spending_categories])[0]
    except ValueError:
        return {"error": "Invalid spending category"}

    # Prepare features
    features = np.array([[request.monthly_spending, request.num_transactions, request.avg_transaction_amount, category_encoded, request.age, request.income]])

    # Predict
    prediction = risk_model.predict(features)[0]
    risk_level = risk_encoder.inverse_transform([prediction])[0]

    # Determine credit based on risk
    if risk_level == 'high':
        credit = 200  # lower credit
    elif risk_level == 'low':
        credit = 1000  # higher credit
    else:  # normal
        credit = 500

    return {
        "risk_level": risk_level,
        "credit_limit": credit
    }

@app.post("/saving-suggestion")
def suggest_saving(request: SavingSuggestionRequest):
    if saving_model is None:
        return {"error": "Model not loaded"}

    # Prepare features
    features = np.array([[request.income, request.monthly_expenses, request.savings_goal, request.age, request.dependents]])

    # Predict
    suggestion = saving_model.predict(features)[0]

    return {
        "suggested_saving_amount": round(float(suggestion), 2)
    }

@app.get("/new-user-credit")
def new_user_credit():
    return {"credit_limit": 500}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)