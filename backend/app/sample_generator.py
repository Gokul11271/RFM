import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os
from typing import Dict, Any, Tuple

def generate_sample_ecommerce_data(num_customers: int = 750) -> pd.DataFrame:
    """
    Generates a realistic transaction dataset modeled after modern e-commerce retail.
    Spans 12 months with representative distribution across all 11 RFM segments:
    Champions, Loyal Customers, Potential Loyalists, Recent Customers, Promising,
    Customers Needing Attention, About to Sleep, At Risk, Can't Lose Them, Hibernating, Lost.
    """
    np.random.seed(42)
    random.seed(42)

    base_date = datetime(2025, 12, 1)
    
    categories = [
        ("Electronics & Gadgets", 65.0, 450.0),
        ("Apparel & Designer Wear", 28.0, 195.0),
        ("Home & Smart Living", 35.0, 280.0),
        ("Beauty & Wellness", 18.0, 110.0),
        ("Sports & Outdoors", 42.0, 320.0),
        ("Gourmet Foods & Coffee", 14.0, 75.0)
    ]

    # Define segment profiles with target (R_range_days, F_orders_range, avg_spend_per_order)
    segment_profiles = [
        (0.12, "Champions", (1, 20), (8, 18), (180, 480)),
        (0.15, "Loyal Customers", (15, 60), (5, 10), (120, 320)),
        (0.12, "Potential Loyalists", (5, 35), (2, 4), (90, 240)),
        (0.10, "Recent Customers", (1, 15), (1, 1), (35, 120)),
        (0.08, "Promising", (25, 60), (1, 2), (110, 290)),
        (0.10, "Customers Needing Attention", (50, 95), (2, 4), (60, 170)),
        (0.08, "About to Sleep", (70, 130), (1, 2), (30, 95)),
        (0.09, "At Risk", (100, 240), (4, 9), (140, 390)),
        (0.04, "Can't Lose Them", (140, 320), (7, 15), (250, 650)),
        (0.07, "Hibernating", (150, 300), (1, 2), (25, 80)),
        (0.05, "Lost", (240, 360), (1, 1), (15, 60))
    ]

    records = []
    invoice_seq = 600000
    cust_idx = 1000

    for weight, seg_name, rec_range, ord_range, aov_range in segment_profiles:
        n_cust_in_seg = int(num_customers * weight)
        for _ in range(n_cust_in_seg):
            cust_idx += 1
            cust_id = f"C{cust_idx}"
            
            latest_recency = random.randint(rec_range[0], rec_range[1])
            num_orders = random.randint(ord_range[0], ord_range[1])
            latest_date = base_date - timedelta(days=latest_recency)
            
            current_date = latest_date
            for _ in range(num_orders):
                invoice_id = f"INV-{invoice_seq}"
                invoice_seq += 1
                
                # Number of line items per invoice
                num_items = random.randint(1, 3)
                for _ in range(num_items):
                    cat_name, min_p, max_p = random.choice(categories)
                    target_aov = random.uniform(aov_range[0], aov_range[1]) / num_items
                    qty = max(1, int(round(target_aov / random.uniform(min_p, max_p))))
                    unit_price = round(max(min_p, target_aov / qty), 2)
                    line_amount = round(unit_price * qty, 2)
                    
                    records.append({
                        "CustomerID": cust_id,
                        "InvoiceID": invoice_id,
                        "InvoiceDate": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                        "Amount": line_amount,
                        "ProductCategory": cat_name,
                        "Quantity": qty,
                        "UnitPrice": unit_price
                    })

                # Spacing between historical orders
                spacing_days = random.randint(15, 55)
                current_date = current_date - timedelta(days=spacing_days)
                if current_date < base_date - timedelta(days=365):
                    break

    df = pd.DataFrame(records)
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df = df.sort_values(by="InvoiceDate").reset_index(drop=True)
    df["InvoiceDate"] = df["InvoiceDate"].dt.strftime("%Y-%m-%d %H:%M:%S")
    return df


def generate_sample_saas_data(num_accounts: int = 400) -> pd.DataFrame:
    """
    Generates a B2B SaaS / Subscription dataset with Account IDs, Billing Cycles,
    Subscription Tiers, and Monetary values.
    """
    np.random.seed(99)
    random.seed(99)

    base_date = datetime(2025, 12, 1)
    
    tiers = [
        ("Starter Cloud", 49.0),
        ("Growth Suite", 199.0),
        ("Professional Platform", 499.0),
        ("Enterprise Unlimited", 1490.0)
    ]

    records = []
    inv_seq = 800000

    for i in range(num_accounts):
        account_id = f"ACC-{2000 + i}"
        tier_name, base_price = random.choices(
            tiers, 
            weights=[0.35, 0.40, 0.18, 0.07], 
            k=1
        )[0]

        # Activity profile
        profile = random.choices(
            ["active_heavy", "active_steady", "slipping", "churned"],
            weights=[0.30, 0.40, 0.18, 0.12],
            k=1
        )[0]

        if profile == "active_heavy":
            cycles = random.randint(8, 12)
            last_active_days = random.randint(1, 20)
        elif profile == "active_steady":
            cycles = random.randint(4, 9)
            last_active_days = random.randint(15, 50)
        elif profile == "slipping":
            cycles = random.randint(3, 7)
            last_active_days = random.randint(65, 140)
        else:
            cycles = random.randint(1, 4)
            last_active_days = random.randint(150, 320)

        current_date = base_date - timedelta(days=last_active_days)
        for _ in range(cycles):
            inv_seq += 1
            seat_addon = round(random.choice([0, 25, 50, 150, 350]), 2)
            total_invoice = round(base_price + seat_addon, 2)
            
            records.append({
                "AccountID": account_id,
                "BillingID": f"INV-B2B-{inv_seq}",
                "BillingDate": current_date.strftime("%Y-%m-%d"),
                "MRR_Amount": total_invoice,
                "SubscriptionTier": tier_name,
                "AddonUsageSpend": seat_addon
            })

            current_date = current_date - timedelta(days=30)
            if current_date < base_date - timedelta(days=365):
                break

    df = pd.DataFrame(records)
    df["BillingDate"] = pd.to_datetime(df["BillingDate"])
    df = df.sort_values(by="BillingDate").reset_index(drop=True)
    df["BillingDate"] = df["BillingDate"].dt.strftime("%Y-%m-%d")
    return df


def ensure_sample_file_exists() -> str:
    """Generates both sample CSVs and returns default retail sample path."""
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
    os.makedirs(sample_dir, exist_ok=True)
    
    retail_path = os.path.join(sample_dir, "online_retail_sample.csv")
    saas_path = os.path.join(sample_dir, "saas_subscription_sample.csv")
    
    if not os.path.exists(retail_path) or os.path.getsize(retail_path) < 2000:
        df_retail = generate_sample_ecommerce_data()
        df_retail.to_csv(retail_path, index=False)
        
    if not os.path.exists(saas_path) or os.path.getsize(saas_path) < 2000:
        df_saas = generate_sample_saas_data()
        df_saas.to_csv(saas_path, index=False)
        
    return retail_path

if __name__ == "__main__":
    r_path = ensure_sample_file_exists()
    print(f"Sample datasets verified at {r_path}")
