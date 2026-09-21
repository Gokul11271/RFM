import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, List, Optional
import io
import json

SEGMENT_RULES = [
    # (Name, Description, Target R scores, Target F scores, Target M scores)
    ("Champions", "Bought recently, buy often and spend the most!", [5, 4], [5, 4], [5, 4]),
    ("Loyal Customers", "Buy on a regular basis. Responsive to promotions.", [3, 4, 5], [3, 4, 5], [3, 4, 5]),
    ("Potential Loyalists", "Recent customers with average frequency and good spend.", [4, 5], [1, 2, 3], [2, 3, 4, 5]),
    ("Recent Customers", "Bought most recently, but not frequently yet.", [4, 5], [1], [1, 2, 3]),
    ("Promising", "Recent shoppers, have spent good amounts, but haven't bought often.", [3, 4], [1, 2], [3, 4, 5]),
    ("Customers Needing Attention", "Above average recency, frequency & monetary values. May slip if not re-engaged.", [2, 3], [2, 3], [2, 3]),
    ("About to Sleep", "Below average recency and frequency. Will be lost if not reactivated.", [2, 3], [1, 2], [1, 2]),
    ("At Risk", "Spent big money and purchased often, but long time ago. Need to bring them back!", [1, 2], [3, 4, 5], [3, 4, 5]),
    ("Can't Lose Them", "Made largest purchases, and often, but haven't returned for a long time.", [1], [4, 5], [4, 5]),
    ("Hibernating", "Last purchase was long ago, low spenders, and low number of orders.", [1, 2], [1, 2], [1, 2]),
    ("Lost", "Lowest recency, frequency and monetary scores.", [1], [1], [1])
]

def preprocess_raw_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detects and normalizes hierarchical / sectioned raw datasets where
    Customer IDs are section headers in the first column rather than a column.
    """
    if df.empty or len(df.columns) < 2:
        return df

    first_col = df.columns[0]
    
    # Check if a dedicated customer column already exists
    norm_cols = [str(c).lower().replace("_", "").replace(" ", "").replace("-", "") for c in df.columns]
    if any(k in norm_cols for k in ["customerid", "clientid", "accountid", "userid"]):
        return df

    # Check if first column contains customer ID patterns
    first_col_str = df[first_col].astype(str).str.strip()
    is_cust_pattern = first_col_str.str.match(r'^(Customer|Client|Cust|User|Account)[-_ ]?\w+', case=False)
    
    null_indicator = pd.Series(False, index=df.index)
    for col in df.columns[1:]:
        col_lower = str(col).lower()
        if any(k in col_lower for k in ["amount", "price", "product", "ppu", "qty", "quantity", "sales"]):
            null_indicator = null_indicator | df[col].isna()
            break
            
    is_header = is_cust_pattern & (null_indicator if null_indicator.any() else True)
    
    if is_header.sum() >= 1:
        df = df.copy()
        cust_ids = df[first_col].where(is_header).ffill()
        df = df[~is_header].copy()
        df.insert(0, "Customer ID", cust_ids[~is_header])
        
    return df


def auto_detect_columns(columns: List[str]) -> Dict[str, Optional[str]]:
    """Heuristic to auto-detect RFM column mappings with punctuation/space normalization."""
    mapping = {
        "customer_id": None,
        "order_date": None,
        "order_id": None,
        "amount": None,
        "category": None
    }
    
    col_norm = {str(c).lower().replace("_", "").replace(" ", "").replace("-", ""): str(c) for c in columns}
    
    # Customer ID patterns
    for pattern in ["customerid", "accountid", "clientid", "userid", "custid", "customer", "client", "user", "account"]:
        if pattern in col_norm:
            mapping["customer_id"] = col_norm[pattern]
            break
            
    # Date patterns
    for pattern in ["invoicedate", "orderdate", "billingdate", "date", "createdat", "transactiondate", "timestamp", "datetime"]:
        if pattern in col_norm:
            mapping["order_date"] = col_norm[pattern]
            break
            
    # Order ID patterns
    for pattern in ["invoiceno", "invoiceid", "billingid", "orderid", "orderno", "transactionid", "transid", "id"]:
        if pattern in col_norm:
            mapping["order_id"] = col_norm[pattern]
            break
            
    # Amount patterns
    for pattern in ["amount", "mrramount", "totalamount", "sales", "totalsales", "price", "total", "revenue", "ordervalue", "grandtotal"]:
        if pattern in col_norm:
            mapping["amount"] = col_norm[pattern]
            break
            
    # Category patterns
    for pattern in ["category", "productcategory", "subscriptiontier", "description", "itemname", "department", "categoryname"]:
        if pattern in col_norm:
            mapping["category"] = col_norm[pattern]
            break

    # Fallbacks if not detected by strict pattern
    if not mapping["customer_id"]:
        for c in columns:
            cl = str(c).lower()
            if any(w in cl for w in ["cust", "user", "client", "acc"]):
                mapping["customer_id"] = str(c)
                break

    if not mapping["order_date"]:
        for c in columns:
            cl = str(c).lower()
            if "date" in cl or "time" in cl:
                mapping["order_date"] = str(c)
                break

    if not mapping["amount"]:
        for c in columns:
            cl = str(c).lower()
            if any(w in cl for w in ["amount", "price", "sales", "total", "spend", "revenue", "mrr"]):
                mapping["amount"] = str(c)
                break

    return mapping


def assign_rfm_segments_vectorized(r_scores: pd.Series, f_scores: pd.Series, m_scores: pd.Series) -> pd.Series:
    """
    Vectorized segment classifier using np.select for high performance over large datasets.
    """
    r = r_scores.to_numpy()
    f = f_scores.to_numpy()
    m = m_scores.to_numpy()

    conditions = [
        (r == 1) & (f >= 4) & (m >= 4),                                       # Can't Lose Them
        (np.isin(r, [1, 2])) & (f >= 3) & (m >= 3),                           # At Risk
        (np.isin(r, [4, 5])) & (np.isin(f, [4, 5])) & (np.isin(m, [4, 5])),    # Champions
        (np.isin(r, [3, 4, 5])) & (np.isin(f, [3, 4, 5])) & (np.isin(m, [3, 4, 5])), # Loyal Customers
        (np.isin(r, [4, 5])) & (np.isin(f, [1, 2, 3])) & (np.isin(m, [2, 3, 4, 5])), # Potential Loyalists
        (np.isin(r, [4, 5])) & (f == 1),                                       # Recent Customers
        (np.isin(r, [3, 4])) & (np.isin(f, [1, 2])) & (np.isin(m, [3, 4, 5])), # Promising
        (np.isin(r, [2, 3])) & (np.isin(f, [2, 3])) & (np.isin(m, [2, 3])),    # Customers Needing Attention
        (np.isin(r, [2, 3])) & (np.isin(f, [1, 2])) & (np.isin(m, [1, 2])),    # About to Sleep
        (np.isin(r, [1, 2])) & (np.isin(f, [1, 2])) & (np.isin(m, [1, 2])),    # Hibernating or Lost
        (r == 1)                                                              # Lost fallback
    ]

    # Handle Hibernating vs Lost in condition 9
    choices = [
        "Can't Lose Them",
        "At Risk",
        "Champions",
        "Loyal Customers",
        "Potential Loyalists",
        "Recent Customers",
        "Promising",
        "Customers Needing Attention",
        "About to Sleep",
        np.where((r == 1) & (f == 1) & (m == 1), "Lost", "Hibernating"),
        "Lost"
    ]

    # General fallback
    rfm_avg = (r + f + m) / 3.0
    fallback = np.where(rfm_avg >= 4.0, "Loyal Customers",
               np.where(rfm_avg >= 3.0, "Potential Loyalists",
               np.where(rfm_avg >= 2.0, "Customers Needing Attention", "Hibernating")))

    segments = np.select(conditions, choices, default=fallback)
    return pd.Series(segments, index=r_scores.index)


def compute_quantiles(series: pd.Series, reverse: bool = False) -> pd.Series:
    """
    Computes 1-5 score quintiles robustly using rank percentile.
    reverse=True means lower raw value gets higher score (used for Recency).
    """
    if series.empty:
        return pd.Series([], dtype=int)
    
    ranks = series.rank(method="first", ascending=not reverse)
    scores = pd.qcut(ranks, q=5, labels=[1, 2, 3, 4, 5], duplicates="drop")
    return scores.astype(int)


def process_rfm_data(df: pd.DataFrame, mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Main High-Performance Pipeline:
    1. Validates and maps columns
    2. Cleans & formats data
    3. Fully vectorized RFM computation per customer
    4. Computes Quintile Scores 1-5
    5. Vectorized Segment classification
    6. Produces KPIs, distributions, and customer records
    """
    df = preprocess_raw_dataframe(df)

    cust_col = mapping.get("customer_id")
    date_col = mapping.get("order_date")
    ord_col = mapping.get("order_id")
    amt_col = mapping.get("amount")

    if (not cust_col or cust_col not in df.columns) and "Customer ID" in df.columns:
        cust_col = "Customer ID"
        mapping["customer_id"] = "Customer ID"

    if not cust_col or cust_col not in df.columns:
        raise ValueError(f"Customer ID column '{cust_col}' not found in dataset.")
    if not date_col or date_col not in df.columns:
        raise ValueError(f"Order Date column '{date_col}' not found in dataset.")
    if not amt_col or amt_col not in df.columns:
        raise ValueError(f"Amount column '{amt_col}' not found in dataset.")

    # Drop nulls in primary columns
    clean_df = df.dropna(subset=[cust_col, date_col, amt_col]).copy()

    # Fast numeric parsing
    if clean_df[amt_col].dtype == object or clean_df[amt_col].dtype == str:
        clean_df[amt_col] = (
            clean_df[amt_col]
            .astype(str)
            .str.replace(",", "", regex=False)
            .str.replace("$", "", regex=False)
            .str.replace("€", "", regex=False)
            .str.replace("£", "", regex=False)
            .str.strip()
        )
    clean_df[amt_col] = pd.to_numeric(clean_df[amt_col], errors="coerce")
    clean_df = clean_df[clean_df[amt_col] > 0]

    # Fast datetime parsing
    clean_df[date_col] = pd.to_datetime(clean_df[date_col], dayfirst=True, errors="coerce")
    clean_df = clean_df.dropna(subset=[date_col])

    if clean_df.empty:
        raise ValueError("No valid transaction rows found after cleaning (nulls/negative amounts).")

    # Clean customer ID to string
    clean_df[cust_col] = clean_df[cust_col].astype(str).str.replace(".0", "", regex=False).str.strip()
    clean_df = clean_df[~clean_df[cust_col].isin(["nan", "", "None"])]

    # Analysis Snapshot Date = dataset max date + 1 day
    max_date = clean_df[date_col].max()
    min_date = clean_df[date_col].min()
    snapshot_date = max_date + timedelta(days=1)

    # Vectorized Grouping
    if ord_col and ord_col in clean_df.columns:
        grouped = clean_df.groupby(cust_col).agg(
            last_date=(date_col, "max"),
            frequency=(ord_col, "nunique"),
            monetary=(amt_col, "sum")
        ).reset_index()
    else:
        grouped = clean_df.groupby(cust_col).agg(
            last_date=(date_col, "max"),
            frequency=(date_col, "count"),
            monetary=(amt_col, "sum")
        ).reset_index()

    grouped["recency"] = (snapshot_date - grouped["last_date"]).dt.days
    grouped.rename(columns={cust_col: "customer_id"}, inplace=True)
    grouped["monetary"] = grouped["monetary"].round(2)
    grouped["avg_order_value"] = (grouped["monetary"] / grouped["frequency"].replace(0, 1)).round(2)

    # Compute Quintile Scores
    grouped["r_score"] = compute_quantiles(grouped["recency"], reverse=True)
    grouped["f_score"] = compute_quantiles(grouped["frequency"], reverse=False)
    grouped["m_score"] = compute_quantiles(grouped["monetary"], reverse=False)
    
    grouped["rfm_score"] = (
        grouped["r_score"].astype(str) + 
        grouped["f_score"].astype(str) + 
        grouped["m_score"].astype(str)
    )

    # Assign Segments Vectorized
    grouped["segment"] = assign_rfm_segments_vectorized(
        grouped["r_score"], grouped["f_score"], grouped["m_score"]
    )

    total_customers = len(grouped)
    total_revenue = float(grouped["monetary"].sum())

    # Segment Summaries
    seg_groups = grouped.groupby("segment")
    segment_summaries = []
    
    all_known_segments = [rule[0] for rule in SEGMENT_RULES]
    for seg_name in all_known_segments:
        if seg_name in seg_groups.groups:
            grp = seg_groups.get_group(seg_name)
            cnt = len(grp)
            rev = float(grp["monetary"].sum())
            segment_summaries.append({
                "segment": seg_name,
                "customer_count": cnt,
                "pct_of_customers": round((cnt / total_customers) * 100, 2) if total_customers > 0 else 0,
                "total_revenue": round(rev, 2),
                "pct_of_revenue": round((rev / total_revenue) * 100, 2) if total_revenue > 0 else 0,
                "avg_recency_days": round(float(grp["recency"].mean()), 1),
                "avg_frequency": round(float(grp["frequency"].mean()), 1),
                "avg_monetary": round(float(grp["monetary"].mean()), 2),
                "avg_order_value": round(float(grp["avg_order_value"].mean()), 2),
                "r_score_avg": round(float(grp["r_score"].mean()), 1),
                "f_score_avg": round(float(grp["f_score"].mean()), 1),
                "m_score_avg": round(float(grp["m_score"].mean()), 1),
            })
        else:
            segment_summaries.append({
                "segment": seg_name,
                "customer_count": 0,
                "pct_of_customers": 0.0,
                "total_revenue": 0.0,
                "pct_of_revenue": 0.0,
                "avg_recency_days": 0.0,
                "avg_frequency": 0.0,
                "avg_monetary": 0.0,
                "avg_order_value": 0.0,
                "r_score_avg": 0.0,
                "f_score_avg": 0.0,
                "m_score_avg": 0.0,
            })

    segment_summaries.sort(key=lambda x: x["total_revenue"], reverse=True)

    # Calculate overall KPIs
    champ_grp = grouped[grouped["segment"] == "Champions"]
    risk_grp = grouped[grouped["segment"].isin(["At Risk", "Can't Lose Them", "About to Sleep"])]
    lost_grp = grouped[grouped["segment"] == "Lost"]

    kpis = {
        "total_customers": total_customers,
        "total_revenue": round(total_revenue, 2),
        "avg_order_value": round(float(grouped["avg_order_value"].mean()), 2) if total_customers > 0 else 0,
        "avg_recency_days": round(float(grouped["recency"].mean()), 1) if total_customers > 0 else 0,
        "avg_frequency": round(float(grouped["frequency"].mean()), 1) if total_customers > 0 else 0,
        "champions_count": int(len(champ_grp)),
        "champions_revenue_pct": round(float(champ_grp["monetary"].sum() / total_revenue * 100), 2) if total_revenue > 0 else 0.0,
        "at_risk_count": int(len(risk_grp)),
        "at_risk_revenue_pct": round(float(risk_grp["monetary"].sum() / total_revenue * 100), 2) if total_revenue > 0 else 0.0,
        "lost_count": int(len(lost_grp)),
        "date_range_start": min_date.strftime("%Y-%m-%d"),
        "date_range_end": max_date.strftime("%Y-%m-%d"),
        "snapshot_date": snapshot_date.strftime("%Y-%m-%d"),
        "total_transactions": len(clean_df)
    }

    # Generate Histogram distributions
    recency_bins = [0, 30, 60, 90, 180, 365, 730, 9999]
    recency_labels = ["0-30d (Fresh)", "31-60d", "61-90d", "91-180d", "181-365d", "1-2 Yrs", ">2 Yrs"]
    grouped["recency_bucket"] = pd.cut(grouped["recency"], bins=recency_bins, labels=recency_labels, right=False)
    recency_hist = grouped["recency_bucket"].value_counts().sort_index().reset_index()
    recency_hist.columns = ["range", "count"]
    recency_histogram = recency_hist.to_dict(orient="records")

    # Frequency Histogram
    freq_bins = [0, 2, 4, 7, 12, 9999]
    freq_labels = ["1 Order", "2-3 Orders", "4-6 Orders", "7-11 Orders", "12+ Orders"]
    grouped["freq_bucket"] = pd.cut(grouped["frequency"], bins=freq_bins, labels=freq_labels, right=False)
    freq_hist = grouped["freq_bucket"].value_counts().sort_index().reset_index()
    freq_hist.columns = ["range", "count"]
    frequency_histogram = freq_hist.to_dict(orient="records")

    # Monetary Histogram
    mon_q = np.percentile(grouped["monetary"], [0, 25, 50, 75, 90, 100])
    unique_mon_bins = sorted(list(set(mon_q)))
    if len(unique_mon_bins) > 1:
        grouped["mon_bucket"] = pd.cut(grouped["monetary"], bins=unique_mon_bins, duplicates="drop")
        mon_hist = grouped["mon_bucket"].value_counts().sort_index().reset_index()
        monetary_histogram = [{"range": str(row[grouped["mon_bucket"].name]), "count": int(row["count"])} for _, row in mon_hist.iterrows()]
    else:
        monetary_histogram = [{"range": f"₹{round(mon_q[0], 2)}", "count": total_customers}]

    # Treemap data
    treemap_data = [
        {
            "name": seg["segment"],
            "size": seg["customer_count"],
            "revenue": seg["total_revenue"],
            "pct_rev": seg["pct_of_revenue"],
            "avg_spend": seg["avg_monetary"]
        }
        for seg in segment_summaries if seg["customer_count"] > 0
    ]

    # Scatter sample (fast sampling without iterrows)
    sample_size = min(800, len(grouped))
    scatter_df = grouped.sample(n=sample_size, random_state=42) if len(grouped) > sample_size else grouped
    scatter_sample = scatter_df[[
        "customer_id", "recency", "frequency", "monetary", "segment", "rfm_score"
    ]].to_dict(orient="records")

    # Top customers list (serialized instantly via to_dict)
    top_df = grouped.sort_values(by="monetary", ascending=False).head(100)
    top_customers = top_df[[
        "customer_id", "recency", "frequency", "monetary", 
        "avg_order_value", "r_score", "f_score", "m_score", "rfm_score", "segment"
    ]].rename(columns={"recency": "recency_days"}).to_dict(orient="records")

    return {
        "kpis": kpis,
        "segments": segment_summaries,
        "top_customers": top_customers,
        "raw_rfm_df": grouped,
        "distributions": {
            "recency_histogram": recency_histogram,
            "frequency_histogram": frequency_histogram,
            "monetary_histogram": monetary_histogram,
            "treemap_data": treemap_data,
            "scatter_sample": scatter_sample
        }
    }
