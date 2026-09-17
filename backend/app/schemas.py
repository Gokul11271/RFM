from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ColumnMapping(BaseModel):
    customer_id: str = "CustomerID"
    order_date: str = "InvoiceDate"
    order_id: Optional[str] = "InvoiceID"
    amount: str = "Amount"
    category: Optional[str] = None

class SegmentInsight(BaseModel):
    segment: str
    headline: str
    churn_risk: str  # Low, Medium, High, Critical
    risk_score: int  # 1-100
    business_impact: str
    recommended_actions: List[Dict[str, str]]  # [{"title": "...", "description": "...", "tag": "Retain/Upsell/..."}]
    retention_priority: str  # P1 - Urgent, P2 - High, P3 - Medium, P4 - Low
    best_channels: List[str]
    suggested_offer: str

class SegmentSummary(BaseModel):
    segment: str
    customer_count: int
    pct_of_customers: float
    total_revenue: float
    pct_of_revenue: float
    avg_recency_days: float
    avg_frequency: float
    avg_monetary: float
    avg_order_value: float
    r_score_avg: float
    f_score_avg: float
    m_score_avg: float
    insight: Optional[SegmentInsight] = None

class CustomerRfmRow(BaseModel):
    customer_id: str
    recency_days: int
    frequency: int
    monetary: float
    avg_order_value: float
    r_score: int
    f_score: int
    m_score: int
    rfm_score: str
    segment: str

class KpiMetrics(BaseModel):
    total_customers: int
    total_revenue: float
    avg_order_value: float
    avg_recency_days: float
    avg_frequency: float
    champions_count: int
    champions_revenue_pct: float
    at_risk_count: int
    at_risk_revenue_pct: float
    lost_count: int
    date_range_start: str
    date_range_end: str
    snapshot_date: str
    total_transactions: int

class DistributionData(BaseModel):
    recency_histogram: List[Dict[str, Any]]
    frequency_histogram: List[Dict[str, Any]]
    monetary_histogram: List[Dict[str, Any]]
    treemap_data: List[Dict[str, Any]]
    scatter_sample: List[Dict[str, Any]]

class RfmAnalysisResponse(BaseModel):
    kpis: KpiMetrics
    segments: List[SegmentSummary]
    top_customers: List[CustomerRfmRow]
    distributions: DistributionData
    detected_columns: Optional[Dict[str, str]] = None
    column_preview: Optional[List[Dict[str, Any]]] = None

class ChatQueryRequest(BaseModel):
    question: str
    rfm_context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None
    llm_provider: Optional[str] = "gemini"  # or claude, openai

class ChatQueryResponse(BaseModel):
    answer: str
    suggested_followups: List[str]
