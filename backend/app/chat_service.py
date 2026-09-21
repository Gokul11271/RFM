import json
import httpx
import os
from typing import Dict, Any, List, Optional
from .schemas import ChatQueryResponse

def answer_rfm_query(
    question: str,
    rfm_context: Optional[Dict[str, Any]] = None,
    api_key: Optional[str] = None,
    llm_provider: str = "gemini"
) -> ChatQueryResponse:
    """
    Answers business and strategy questions using the computed RFM context tailored for the Indian Market.
    """
    q_lower = question.lower()
    
    # Extract context safely
    kpis = rfm_context.get("kpis", {}) if rfm_context else {}
    segments = rfm_context.get("segments", []) if rfm_context else []
    
    total_rev = kpis.get("total_revenue", 0)
    total_cust = kpis.get("total_customers", 0)
    at_risk_pct = kpis.get("at_risk_revenue_pct", 0)
    at_risk_cnt = kpis.get("at_risk_count", 0)
    champ_pct = kpis.get("champions_revenue_pct", 0)
    champ_cnt = kpis.get("champions_count", 0)
    aov = kpis.get("avg_order_value", 0)

    # Find key segment objects
    seg_map = {s.get("segment"): s for s in segments}
    
    # Intelligent Contextual Engine
    answer = ""
    suggested_followups = [
        "How can we win back At-Risk customers via WhatsApp before they churn?",
        "Which segment has the highest revenue upside in India?",
        "What festive campaign works best for Potential Loyalists?"
    ]

    if "prioritize" in q_lower or "priority" in q_lower or "focus" in q_lower or "quarter" in q_lower:
        answer = (
            f"### 🎯 Strategic Priority Recommendation (Indian Market)\n\n"
            f"Based on your current RFM distribution, your immediate focus should be a **dual-track retention & expansion strategy**:\n\n"
            f"1. **P1 — Urgent Revenue Defense (At Risk & Can't Lose Them)**:\n"
            f"   - You have **{at_risk_cnt} At-Risk customers** representing **{at_risk_pct}% (₹{(total_rev * at_risk_pct / 100):,.2f})** of your entire revenue base in India.\n"
            f"   - *Action*: Launch an automated WhatsApp 3-tier re-engagement workflow with a high-value comeback credit (e.g. Flat ₹1,000 off on ₹2,999+).\n\n"
            f"2. **P2 — Value Expansion (Potential Loyalists)**:\n"
            f"   - Potential Loyalists represent high-recency Indian buyers who haven't established repeat frequency yet.\n"
            f"   - *Action*: Deliver a time-sensitive second-purchase incentive (e.g. Flat ₹300 off within 14 days) via WhatsApp / SMS.\n\n"
            f"3. **P3 — VIP Retention (Champions)**:\n"
            f"   - Your {champ_cnt} Champions drive **{champ_pct}%** of total sales. Provide priority courier dispatch and festive early access without eroding margins through cheap discounts."
        )
        suggested_followups = [
            "What specific WhatsApp offer works best for At Risk customers?",
            "What is our Champions' average order frequency?",
            "How do we migrate Potential Loyalists into Champions?"
        ]

    elif "risk" in q_lower or "churn" in q_lower or "lost" in q_lower:
        at_risk_rev = total_rev * (at_risk_pct / 100) if total_rev > 0 else 0
        answer = (
            f"### ⚠️ Churn Risk & Revenue Exposure Analysis (India)\n\n"
            f"- **At-Risk Capital Exposure**: **{at_risk_pct}%** of your total revenue (₹{at_risk_rev:,.2f}) is concentrated in {at_risk_cnt} customer accounts slipping into dormancy.\n"
            f"- **Root Cause**: High historical monetary spend and frequency, but their recency has stretched beyond standard repurchase cadence ({kpis.get('avg_recency_days', 60)} days).\n\n"
            f"#### 🛠 Recommended 3-Step Indian Market Win-Back Protocol:\n"
            f"1. **Direct Personal Concierge Outreach**: For top spenders, trigger a personalized note or call from leadership.\n"
            f"2. **Time-Sensitive WhatsApp Comeback Offer**: Deliver a verified WhatsApp coupon (₹500 to ₹1,000 off) valid for 7 days.\n"
            f"3. **Festive Catalog Reintroduction**: Highlight top products and seasonal trending collections launched since their last visit."
        )
        suggested_followups = [
            "Show me the top spenders at risk of churn",
            "What channels are best for reaching dormant buyers in India?",
            "How does our churn rate compare across segments?"
        ]

    elif "champion" in q_lower or "vip" in q_lower or "best" in q_lower or "loyal" in q_lower:
        champ_seg = seg_map.get("Champions", {})
        answer = (
            f"### 👑 Champions & VIP Cohort Profile (India)\n\n"
            f"- **Account Volume**: {champ_seg.get('customer_count', champ_cnt):,} VIPs ({champ_seg.get('pct_of_customers', 0)}% of customer base)\n"
            f"- **Revenue Contribution**: ₹{champ_seg.get('total_revenue', 0):,.2f} (**{champ_pct}%** of total business revenue)\n"
            f"- **Average Customer Spend**: ₹{champ_seg.get('avg_monetary', 0):,.2f} across an average of {champ_seg.get('avg_frequency', 0)} orders\n\n"
            f"#### 🚀 Optimization Playbook:\n"
            f"- **Do Not Discount Heavily**: Protect margins on buyers already willing to pay full price.\n"
            f"- **Festive & Product Early Access**: Give 48-hour early access to new inventory drops and festive sales (Diwali, New Year).\n"
            f"- **WhatsApp VIP Referral Program**: Introduce ₹500 instant UPI cashback loops for peer recommendations."
        )
        suggested_followups = [
            "What is the average order value of Champions vs others?",
            "How do we build an effective VIP referral loop in India?",
            "Which segments are closest to becoming Champions?"
        ]

    elif "potential" in q_lower or "new" in q_lower or "recent" in q_lower or "promising" in q_lower:
        pot_seg = seg_map.get("Potential Loyalists", {})
        answer = (
            f"### 🌱 Growth Engine: Potential Loyalists & Recent Shoppers\n\n"
            f"- **Cohort Size**: {pot_seg.get('customer_count', 0):,} customers generating ₹{pot_seg.get('total_revenue', 0):,.2f}\n"
            f"- **Profile**: High recency (fresh brand trust), but moderate frequency (1-3 orders).\n\n"
            f"#### 📈 Habit Formation Strategy for Indian Consumers:\n"
            f"1. **The Critical 14-Day Window**: Repeat purchase probability drops significantly after day 21 in Indian e-commerce.\n"
            f"2. **Cross-Sell Triggers**: Suggest complementary replenishment items or festive accessories via WhatsApp.\n"
            f"3. **Loyalty Enrollment**: Automatically credit ₹200 bonus loyalty coins to incentivize their second order."
        )
        suggested_followups = [
            "What is the optimal cadence for welcome WhatsApp drips?",
            "What product categories drive the highest repeat purchases?",
            "How do we measure migration between segments over time?"
        ]

    else:
        answer = (
            f"### 📊 RFM Executive Analysis & Insights (Indian Market)\n\n"
            f"Based on your active dataset ({total_cust:,} customer accounts, ₹{total_rev:,.2f} total revenue):\n\n"
            f"- **Revenue Concentration**: **{champ_pct}%** of all revenue is driven by your Champions cohort ({champ_cnt} customers).\n"
            f"- **At-Risk Capital**: **{at_risk_pct}%** of revenue is currently sitting in At-Risk or slipping segments.\n"
            f"- **Average Order Value (AOV)**: ₹{aov:,.2f}\n\n"
            f"**Recommended Strategic Next Step**: Focus retention resources on the **At-Risk** segment with a verified WhatsApp comeback flow while creating an automated onboarding bridge for **Potential Loyalists** to maximize customer lifetime value (LTV)."
        )
        suggested_followups = [
            "Which segment should we prioritize this quarter?",
            "How much revenue is at risk of churn?",
            "What strategy works best for Champions?"
        ]

    return ChatQueryResponse(
        answer=answer,
        suggested_followups=suggested_followups
    )
