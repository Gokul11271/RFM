import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os
from typing import Dict, Any, Tuple

def generate_sample_ecommerce_data(num_customers: int = 750) -> pd.DataFrame:
    """
    Generates a realistic transaction dataset modeled for the Indian E-Commerce / D2C market.
    Prices in Indian Rupees (INR ₹) across 12 months with representative distribution
    across all 11 RFM segments.
    """
    np.random.seed(42)
    random.seed(42)

    base_date = datetime(2025, 12, 1)
    
    categories = [
        ("Smart Electronics & Audio", 1499.0, 18999.0),
        ("Ethnic Wear & Designer Kurtas", 899.0, 7999.0),
        ("Home & Kitchen Appliances", 1299.0, 12499.0),
        ("Ayurvedic Wellness & Skincare", 499.0, 3499.0),
        ("Fitness & Activewear", 799.0, 5999.0),
        ("Gourmet Chai, Coffee & Spices", 399.0, 2499.0)
    ]

    # Segment profiles: (Weight, Name, (min_rec_days, max_rec_days), (min_orders, max_orders), (min_aov, max_aov))
    segment_profiles = [
        (0.12, "Champions", (1, 20), (8, 18), (4500, 15000)),
        (0.15, "Loyal Customers", (15, 60), (5, 10), (3000, 8500)),
        (0.12, "Potential Loyalists", (5, 35), (2, 4), (2200, 6500)),
        (0.10, "Recent Customers", (1, 15), (1, 1), (999, 3200)),
        (0.08, "Promising", (25, 60), (1, 2), (2800, 7500)),
        (0.10, "Customers Needing Attention", (50, 95), (2, 4), (1500, 4500)),
        (0.08, "About to Sleep", (70, 130), (1, 2), (800, 2500)),
        (0.09, "At Risk", (100, 240), (4, 9), (3500, 11000)),
        (0.04, "Can't Lose Them", (140, 320), (7, 15), (6500, 19000)),
        (0.07, "Hibernating", (150, 300), (1, 2), (699, 2200)),
        (0.05, "Lost", (240, 360), (1, 1), (499, 1800))
    ]

    records = []
    invoice_seq = 600000
    cust_idx = 1000

    for weight, seg_name, rec_range, ord_range, aov_range in segment_profiles:
        n_cust_in_seg = int(num_customers * weight)
        for _ in range(n_cust_in_seg):
            cust_idx += 1
            cust_id = f"IND-C{cust_idx}"
            
            latest_recency = random.randint(rec_range[0], rec_range[1])
            num_orders = random.randint(ord_range[0], ord_range[1])
            latest_date = base_date - timedelta(days=latest_recency)
            
            current_date = latest_date
            for _ in range(num_orders):
                invoice_id = f"INV-IN-{invoice_seq}"
                invoice_seq += 1
                
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
    Generates an Indian B2B SaaS dataset in INR (₹) with monthly recurring revenue (MRR),
    GST billing invoices, and subscription tiers.
    """
    np.random.seed(99)
    random.seed(99)

    base_date = datetime(2025, 12, 1)
    
    tiers = [
        ("Starter Startup Plan", 2999.0),
        ("Growth Suite Pro", 9999.0),
        ("Scale Business Platform", 24999.0),
        ("Enterprise Custom Tier", 74999.0)
    ]

    records = []
    inv_seq = 800000

    for i in range(num_accounts):
        account_id = f"IND-ACC-{2000 + i}"
        tier_name, base_price = random.choices(
            tiers, 
            weights=[0.35, 0.40, 0.18, 0.07], 
            k=1
        )[0]

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
            seat_addon = round(random.choice([0, 1000, 2500, 7500, 18000]), 2)
            total_invoice = round(base_price + seat_addon, 2)
            
            records.append({
                "AccountID": account_id,
                "BillingID": f"GST-INV-{inv_seq}",
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
    
    # Always generate fresh Indian market samples
    df_retail = generate_sample_ecommerce_data()
    df_retail.to_csv(retail_path, index=False)
    
    df_saas = generate_sample_saas_data()
    df_saas.to_csv(saas_path, index=False)
        
    return retail_path

if __name__ == "__main__":
    r_path = ensure_sample_file_exists()
    print(f"Sample Indian datasets verified at {r_path}")
