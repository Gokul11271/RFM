import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

def generate_sample_ecommerce_data(num_records: int = 3500, num_customers: int = 650) -> pd.DataFrame:
    """
    Generates a realistic transaction dataset modeled after UCI Online Retail.
    Spans 12 months with realistic customer purchasing frequency, recency distribution,
    and monetary power-law skew.
    """
    np.random.seed(42)
    random.seed(42)

    base_date = datetime(2025, 12, 1)
    
    categories = [
        ("Electronics", 80, 650),
        ("Apparel & Fashion", 25, 180),
        ("Home & Kitchen", 30, 240),
        ("Beauty & Personal Care", 15, 95),
        ("Sports & Outdoors", 40, 320),
        ("Books & Stationery", 12, 60)
    ]

    # Assign customer loyalty archetypes
    customer_ids = [f"C{10000 + i}" for i in range(num_customers)]
    
    # Archetype weights: 
    # 15% VIP / Champions (high frequency, high spend, recent)
    # 25% Loyal (moderate-high frequency, good spend, regular)
    # 20% Occasional / Promising (low frequency, good spend)
    # 20% New / One-time recent
    # 20% At risk / Dormant (purchased long ago)
    
    records = []
    invoice_seq = 500000

    for cust_id in customer_ids:
        # Determine customer behavior profile
        archetype_roll = random.random()
        
        if archetype_roll < 0.15:
            # VIP Champion: 6 to 18 orders across the year, latest within last 25 days
            num_orders = random.randint(6, 18)
            latest_day_offset = random.randint(1, 25)
            avg_order_size = random.uniform(180, 600)
        elif archetype_roll < 0.40:
            # Loyal: 4 to 8 orders, latest within last 60 days
            num_orders = random.randint(4, 8)
            latest_day_offset = random.randint(5, 60)
            avg_order_size = random.uniform(80, 280)
        elif archetype_roll < 0.60:
            # Potential / Promising: 2 to 4 orders, latest within last 45 days
            num_orders = random.randint(2, 4)
            latest_day_offset = random.randint(10, 45)
            avg_order_size = random.uniform(70, 220)
        elif archetype_roll < 0.80:
            # Recent One-Timer: 1 to 2 orders, within last 30 days
            num_orders = random.randint(1, 2)
            latest_day_offset = random.randint(1, 30)
            avg_order_size = random.uniform(30, 150)
        else:
            # At Risk / Lost: 1 to 5 orders, but last purchase was 90 to 330 days ago
            num_orders = random.randint(1, 5)
            latest_day_offset = random.randint(90, 330)
            avg_order_size = random.uniform(50, 400)

        # Generate orders for this customer
        # Spread orders backwards from (base_date - latest_day_offset)
        latest_date = base_date - timedelta(days=latest_day_offset)
        
        current_date = latest_date
        for order_idx in range(num_orders):
            invoice_id = f"INV-{invoice_seq}"
            invoice_seq += 1
            
            # Each order has 1 to 4 line items
            num_items = random.randint(1, 3)
            for _ in range(num_items):
                cat_name, min_p, max_p = random.choice(categories)
                unit_price = round(random.uniform(min_p, max_p), 2)
                qty = random.randint(1, 4)
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

            # Next older order is 15-60 days prior
            interval = random.randint(15, 60)
            current_date = current_date - timedelta(days=interval)
            if current_date < base_date - timedelta(days=365):
                break

    df = pd.DataFrame(records)
    # Sort chronologically
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df = df.sort_values(by="InvoiceDate").reset_index(drop=True)
    df["InvoiceDate"] = df["InvoiceDate"].dt.strftime("%Y-%m-%d %H:%M:%S")
    return df


def ensure_sample_file_exists() -> str:
    """Generates and writes sample CSV if not present."""
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
    os.makedirs(sample_dir, exist_ok=True)
    sample_path = os.path.join(sample_dir, "online_retail_sample.csv")
    
    if not os.path.exists(sample_path) or os.path.getsize(sample_path) < 1000:
        df = generate_sample_ecommerce_data()
        df.to_csv(sample_path, index=False)
        
    return sample_path

if __name__ == "__main__":
    p = ensure_sample_file_exists()
    print(f"Sample generated at: {p}")
