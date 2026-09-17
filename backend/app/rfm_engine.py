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
    Customer IDs are section headers in the first column rather than a column (e.g., Kaggle raw RFM transactions).
    """
    if df.empty or len(df.columns) < 2:
        return df

    df = df.copy()
    first_col = df.columns[0]
    
    # Check if a dedicated customer column already exists
    norm_cols = [c.lower().replace("_", "").replace(" ", "").replace("-", "") for c in df.columns]
    if "customerid" in norm_cols or "clientid" in norm_cols or "accountid" in norm_cols:
        return df

    # Check if first column contains customer ID patterns like 'Customer-001', 'Cust_101', etc.
    first_col_str = df[first_col].astype(str).str.strip()
    is_cust_pattern = first_col_str.str.match(r'^(Customer|Client|Cust|User)[-_ ]?\w+', case=False)
    
    # Check if other columns (like Amount or Product ID) are null on these rows
    null_indicator = pd.Series(False, index=df.index)
    for col in df.columns[1:]:
        col_lower = col.lower()
        if any(k in col_lower for k in ["amount", "price", "product", "ppu", "qty", "quantity", "sales"]):
            null_indicator = null_indicator | df[col].isna()
            break
            
    is_header = is_cust_pattern & (null_indicator if null_indicator.any() else True)
    
    if is_header.sum() >= 1:
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
    
    col_norm = {c.lower().replace("_", "").replace(" ", "").replace("-", ""): c for c in columns}
    
    # Customer ID patterns
    for pattern in ["customerid", "clientid", "userid", "accountid", "custid", "customer", "client", "user"]:
        if pattern in col_norm:
            mapping["customer_id"] = col_norm[pattern]
            break
            
    # Date patterns
    for pattern in ["invoicedate", "orderdate", "date", "createdat", "transactiondate", "timestamp", "datetime"]:
        if pattern in col_norm:
            mapping["order_date"] = col_norm[pattern]
            break
            
    # Order ID patterns
    for pattern in ["invoiceno", "invoiceid", "orderid", "orderno", "transactionid", "transid", "id"]:
        if pattern in col_norm:
            mapping["order_id"] = col_norm[pattern]
            break
            
    # Amount patterns
    for pattern in ["amount", "totalamount", "sales", "totalsales", "price", "total", "revenue", "ordervalue", "grandtotal"]:
        if pattern in col_norm:
            mapping["amount"] = col_norm[pattern]
            break
            
    # Category patterns
    for pattern in ["category", "productcategory", "description", "itemname", "department", "categoryname"]:
        if pattern in col_norm:
            mapping["category"] = col_norm[pattern]
            break

    # Fallbacks if not detected by strict pattern
    if not mapping["customer_id"]:
        for c in columns:
            cl = c.lower()
            if "cust" in cl or "user" in cl or "client" in cl:
                mapping["customer_id"] = c
                break

    if not mapping["order_date"]:
        for c in columns:
            cl = c.lower()
            if "date" in cl or "time" in cl:
                mapping["order_date"] = c
                break

    if not mapping["amount"]:
        for c in columns:
            cl = c.lower()
            if any(w in cl for w in ["amount", "price", "sales", "total", "spend", "revenue"]):
                mapping["amount"] = c
                break

    return mapping


def assign_rfm_segment(r: int, f: int, m: int) -> str:
    """Classifies a customer into one of 11 distinct RFM segments based on R, F, M quintiles."""
    # Special high-value / critical edge checks first
    if r == 1 and f >= 4 and m >= 4:
        return "Can't Lose Them"
    if r in [1, 2] and f >= 3 and m >= 3:
        return "At Risk"
    if r in [4, 5] and f in [4, 5] and m in [4, 5]:
        return "Champions"
    if r in [3, 4, 5] and f in [3, 4, 5] and m in [3, 4, 5]:
        return "Loyal Customers"
    if r in [4, 5] and f in [1, 2, 3] and m in [2, 3, 4, 5]:
        return "Potential Loyalists"
    if r in [4, 5] and f == 1:
        return "Recent Customers"
    if r in [3, 4] and f in [1, 2] and m in [3, 4, 5]:
        return "Promising"
    if r in [2, 3] and f in [2, 3] and m in [2, 3]:
        return "Customers Needing Attention"
    if r in [2, 3] and f in [1, 2] and m in [1, 2]:
        return "About to Sleep"
    if r in [1, 2] and f in [1, 2] and m in [1, 2]:
        if r == 1 and f == 1 and m == 1:
            return "Lost"
        return "Hibernating"
    if r == 1:
        return "Lost"
    
    # Fallback to general segment logic if not caught
    rfm_avg = (r + f + m) / 3.0
    if rfm_avg >= 4.0:
        return "Loyal Customers"
    elif rfm_avg >= 3.0:
        return "Potential Loyalists"
    elif rfm_avg >= 2.0:
        return "Customers Needing Attention"
    else:
        return "Hibernating"


def compute_quantiles(series: pd.Series, reverse: bool = False) -> pd.Series:
    """
    Computes 1-5 score quintiles robustly using rank percentile to avoid duplicate bin edge issues.
    reverse=True means lower raw value gets higher score (used for Recency).
    """
    if series.empty:
        return pd.Series([], dtype=int)
    
    # Rank with average method
    ranks = series.rank(method="first", ascending=not reverse)
    # Bin into 5 equal quantiles
    scores = pd.qcut(ranks, q=5, labels=[1, 2, 3, 4, 5], duplicates="drop")
    return scores.astype(int)


def process_rfm_data(df: pd.DataFrame, mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Main pipeline:
    1. Validates and maps columns
    2. Cleans data
    3. Computes RFM per customer
    4. Computes Scores 1-5
    5. Maps segments
    6. Produces KPIs, distributions, and top customer records
    """
    # Preprocess raw dataframe if it contains hierarchical customer headers
    df = preprocess_raw_dataframe(df)

    cust_col = mapping.get("customer_id")
    date_col = mapping.get("order_date")
    ord_col = mapping.get("order_id")
    amt_col = mapping.get("amount")

    # If customer_id wasn't in original columns but preprocess created 'Customer ID'
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

    # Convert amounts to numeric (stripping commas and currency symbols)
    if clean_df[amt_col].dtype == object or clean_df[amt_col].dtype == str:
        clean_df[amt_col] = (
            clean_df[amt_col]
            .astype(str)
            .str.replace(",", "", regex=False)
            .str.replace("$", "", regex=False)
            .str.strip()
        )
    clean_df[amt_col] = pd.to_numeric(clean_df[amt_col], errors="coerce")
    # Filter out null or negative/refund rows if desired (keep > 0)
    clean_df = clean_df[clean_df[amt_col] > 0]

    # Convert dates (support dayfirst formats like 01.01.2025)
    clean_df[date_col] = pd.to_datetime(clean_df[date_col], dayfirst=True, errors="coerce")
    clean_df = clean_df.dropna(subset=[date_col])

    if clean_df.empty:
        raise ValueError("No valid transaction rows found after cleaning (nulls/negative amounts).")

    # Clean customer ID to string
    clean_df[cust_col] = clean_df[cust_col].astype(str).str.replace(".0", "", regex=False).str.strip()
    clean_df = clean_df[clean_df[cust_col] != "nan"]
    clean_df = clean_df[clean_df[cust_col] != ""]

    # Analysis Snapshot Date = dataset max date + 1 day
    max_date = clean_df[date_col].max()
    min_date = clean_df[date_col].min()
    snapshot_date = max_date + timedelta(days=1)

    # Group by customer
    if ord_col and ord_col in clean_df.columns:
        rfm_table = clean_df.groupby(cust_col).agg(
            recency=(date_col, lambda dates: (snapshot_date - dates.max()).days),
            frequency=(ord_col, "nunique"),
            monetary=(amt_col, "sum")
        ).reset_index()
    else:
        # Fallback to count of transactions as frequency
        rfm_table = clean_df.groupby(cust_col).agg(
            recency=(date_col, lambda dates: (snapshot_date - dates.max()).days),
            frequency=(date_col, "count"),
            monetary=(amt_col, "sum")
        ).reset_index()

    rfm_table.rename(columns={cust_col: "customer_id"}, inplace=True)
    rfm_table["monetary"] = rfm_table["monetary"].round(2)
    rfm_table["avg_order_value"] = (rfm_table["monetary"] / rfm_table["frequency"].replace(0, 1)).round(2)

    # Compute Quintile Scores
    rfm_table["r_score"] = compute_quantiles(rfm_table["recency"], reverse=True)
    rfm_table["f_score"] = compute_quantiles(rfm_table["frequency"], reverse=False)
    rfm_table["m_score"] = compute_quantiles(rfm_table["monetary"], reverse=False)
    
    rfm_table["rfm_score"] = (
        rfm_table["r_score"].astype(str) + 
        rfm_table["f_score"].astype(str) + 
        rfm_table["m_score"].astype(str)
    )

    # Assign Segments
    rfm_table["segment"] = [
        assign_rfm_segment(r, f, m) 
        for r, f, m in zip(rfm_table["r_score"], rfm_table["f_score"], rfm_table["m_score"])
    ]

    total_customers = len(rfm_table)
    total_revenue = float(rfm_table["monetary"].sum())

    # Segment Summaries
    seg_groups = rfm_table.groupby("segment")
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
            # Segment with 0 customers
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

    # Sort segments by total revenue descending
    segment_summaries.sort(key=lambda x: x["total_revenue"], reverse=True)

    # Calculate overall KPIs
    champ_grp = rfm_table[rfm_table["segment"] == "Champions"]
    risk_grp = rfm_table[rfm_table["segment"].isin(["At Risk", "Can't Lose Them", "About to Sleep"])]
    lost_grp = rfm_table[rfm_table["segment"] == "Lost"]

    kpis = {
        "total_customers": total_customers,
        "total_revenue": round(total_revenue, 2),
        "avg_order_value": round(float(rfm_table["avg_order_value"].mean()), 2) if total_customers > 0 else 0,
        "avg_recency_days": round(float(rfm_table["recency"].mean()), 1) if total_customers > 0 else 0,
        "avg_frequency": round(float(rfm_table["frequency"].mean()), 1) if total_customers > 0 else 0,
        "champions_count": len(champ_grp),
        "champions_revenue_pct": round((champ_grp["monetary"].sum() / total_revenue * 100), 2) if total_revenue > 0 else 0,
        "at_risk_count": len(risk_grp),
        "at_risk_revenue_pct": round((risk_grp["monetary"].sum() / total_revenue * 100), 2) if total_revenue > 0 else 0,
        "lost_count": len(lost_grp),
        "date_range_start": min_date.strftime("%Y-%m-%d"),
        "date_range_end": max_date.strftime("%Y-%m-%d"),
        "snapshot_date": snapshot_date.strftime("%Y-%m-%d"),
        "total_transactions": len(clean_df)
    }

    # Generate Histogram distributions
    recency_bins = [0, 30, 60, 90, 180, 365, 730, 9999]
    recency_labels = ["0-30d (Fresh)", "31-60d", "61-90d", "91-180d", "181-365d", "1-2 Yrs", ">2 Yrs"]
    rfm_table["recency_bucket"] = pd.cut(rfm_table["recency"], bins=recency_bins, labels=recency_labels, right=False)
    recency_hist = rfm_table["recency_bucket"].value_counts().sort_index().reset_index()
    recency_hist.columns = ["range", "count"]
    recency_histogram = recency_hist.to_dict(orient="records")

    # Frequency Histogram
    freq_bins = [0, 2, 4, 7, 12, 9999]
    freq_labels = ["1 Order", "2-3 Orders", "4-6 Orders", "7-11 Orders", "12+ Orders"]
    rfm_table["freq_bucket"] = pd.cut(rfm_table["frequency"], bins=freq_bins, labels=freq_labels, right=False)
    freq_hist = rfm_table["freq_bucket"].value_counts().sort_index().reset_index()
    freq_hist.columns = ["range", "count"]
    frequency_histogram = freq_hist.to_dict(orient="records")

    # Monetary Histogram
    mon_q = np.percentile(rfm_table["monetary"], [0, 25, 50, 75, 90, 100])
    mon_labels = [f"${int(mon_q[i])}-${int(mon_q[i+1])}" for i in range(len(mon_q)-1)]
    # Ensure monotonic bins
    unique_mon_bins = sorted(list(set(mon_q)))
    if len(unique_mon_bins) > 1:
        rfm_table["mon_bucket"] = pd.cut(rfm_table["monetary"], bins=unique_mon_bins, duplicates="drop")
        mon_hist = rfm_table["mon_bucket"].value_counts().sort_index().reset_index()
        monetary_histogram = [{"range": str(row[rfm_table["mon_bucket"].name]), "count": int(row["count"])} for _, row in mon_hist.iterrows()]
    else:
        monetary_histogram = [{"range": f"${round(mon_q[0], 2)}", "count": total_customers}]

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

    # Scatter sample (sample up to 800 customers for fast client rendering)
    sample_size = min(800, len(rfm_table))
    scatter_df = rfm_table.sample(n=sample_size, random_state=42) if len(rfm_table) > sample_size else rfm_table
    scatter_sample = [
        {
            "customer_id": row["customer_id"],
            "recency": int(row["recency"]),
            "frequency": int(row["frequency"]),
            "monetary": round(float(row["monetary"]), 2),
            "segment": row["segment"],
            "rfm_score": row["rfm_score"]
        }
        for _, row in scatter_df.iterrows()
    ]

    # Top 100 customer rows for table
    top_customers_df = rfm_table.sort_values(by="monetary", ascending=False).head(100)
    top_customers = [
        {
            "customer_id": str(row["customer_id"]),
            "recency_days": int(row["recency"]),
            "frequency": int(row["frequency"]),
            "monetary": round(float(row["monetary"]), 2),
            "avg_order_value": round(float(row["avg_order_value"]), 2),
            "r_score": int(row["r_score"]),
            "f_score": int(row["f_score"]),
            "m_score": int(row["m_score"]),
            "rfm_score": str(row["rfm_score"]),
            "segment": str(row["segment"])
        }
        for _, row in top_customers_df.iterrows()
    ]

    return {
        "kpis": kpis,
        "segments": segment_summaries,
        "top_customers": top_customers,
        "raw_rfm_df": rfm_table,
        "distributions": {
            "recency_histogram": recency_histogram,
            "frequency_histogram": frequency_histogram,
            "monetary_histogram": monetary_histogram,
            "treemap_data": treemap_data,
            "scatter_sample": scatter_sample
        }
    }
