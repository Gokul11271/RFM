import json
import httpx
import os
from typing import Dict, Any, List, Optional
from .schemas import SegmentInsight

DEFAULT_SEGMENT_KNOWLEDGE = {
    "Champions": {
        "churn_risk": "Low",
        "risk_score": 8,
        "priority": "P4 - Advocacy & VIP Loyalty",
        "headline": "Elite VIP Core: High LTV Spenders & Brand Ambassadors",
        "business_impact": "These top-tier Indian consumers drive disproportionate revenue with highest repeat orders and negligible churn risk.",
        "actions": [
            {"title": "Exclusive Festive & Early Access Drops", "description": "Provide 48-hour early access to festive collections (Diwali, New Year) and limited editions.", "tag": "Reward"},
            {"title": "High-Incentive WhatsApp Referral Loop", "description": "Enable 1-click WhatsApp referral passes with instant ₹500 UPI cashback for every successful friend onboarded.", "tag": "Upsell"},
            {"title": "No-Discount Luxury Add-ons", "description": "Avoid cheap price cuts; offer complimentary premium gifts and dedicated account concierge service instead.", "tag": "Nurture"}
        ],
        "channels": ["Dedicated WhatsApp VIP Channel", "Direct Executive Calling", "VIP In-App Lounge"],
        "offer": "Exclusive Early Access + Complimentary Silver/Gold Coin Gift Box on orders above ₹4,999"
    },
    "Loyal Customers": {
        "churn_risk": "Low",
        "risk_score": 18,
        "priority": "P3 - Account Expansion",
        "headline": "Consistent High-Value Buyers with Steady Purchasing Frequency",
        "business_impact": "Your brand's revenue foundation in India. Highly responsive to WhatsApp alerts and seasonal campaign messaging.",
        "actions": [
            {"title": "Tiered Club Loyalty Multiplier", "description": "Reward with 2x loyalty points on weekend drops to accelerate basket sizes beyond ₹2,500.", "tag": "Upsell"},
            {"title": "Cross-Category Product Recommendations", "description": "Introduce complementary Indian D2C product ranges based on past purchase affinity.", "tag": "Nurture"},
            {"title": "Festival Milestone Gifting", "description": "Send personalized festive greeting vouchers and exclusive loyalty perks.", "tag": "Retain"}
        ],
        "channels": ["WhatsApp Verified Broadcast", "Personalized Email", "Targeted Instagram Retargeting"],
        "offer": "20% Bonus Loyalty Points + Free Priority Delivery across all Indian Pin Codes"
    },
    "Potential Loyalists": {
        "churn_risk": "Medium-Low",
        "risk_score": 32,
        "priority": "P2 - Conversion Acceleration",
        "headline": "Recent High-Potential Shoppers Ready for Habit Formation",
        "business_impact": "High-velocity Indian buyers who can easily migrate to Champions with targeted second/third purchase nudges within 14 days.",
        "actions": [
            {"title": "Time-Sensitive 14-Day Repeat Voucher", "description": "Deliver a fast-expiring ₹300 coupon to establish a regular ordering cadence.", "tag": "Nurture"},
            {"title": "VIP Membership Onboarding", "description": "Educate on subscription benefits, free express delivery, and members-only flash sales.", "tag": "Upsell"},
            {"title": "Post-Delivery Feedback Prompt", "description": "Trigger automated WhatsApp survey right after parcel delivery confirmation.", "tag": "Retain"}
        ],
        "channels": ["WhatsApp Flow Automation", "SMS Alert", "Meta / Instagram Ads"],
        "offer": "Flat ₹300 Off Your Next Order within 14 Days (Code: SPEED300)"
    },
    "Recent Customers": {
        "churn_risk": "Medium",
        "risk_score": 45,
        "priority": "P2 - Onboarding Experience",
        "headline": "First-Time Indian Shoppers in Critical Onboarding Phase",
        "business_impact": "Fresh acquisition cohort whose lifetime retention depends heavily on satisfaction with delivery speed and product unboxing.",
        "actions": [
            {"title": "Unboxing & Styling WhatsApp Guide", "description": "Share helpful usage guides, styling videos, or recipe ideas right after delivery.", "tag": "Nurture"},
            {"title": "Second-Purchase Incentive Bridge", "description": "Provide a compelling follow-up offer before their recency slips beyond 30 days.", "tag": "Retain"},
            {"title": "Delivery & COD Feedback Check-in", "description": "Proactively resolve any logistics or product friction before silent churn occurs.", "tag": "Retain"}
        ],
        "channels": ["WhatsApp Welcome Flow", "SMS Verification", "In-App Notification"],
        "offer": "Flat ₹250 Instant Cashback Voucher on Your Second Order"
    },
    "Promising": {
        "churn_risk": "Medium",
        "risk_score": 48,
        "priority": "P3 - Basket Size & Frequency",
        "headline": "High Spend Potential with Room for Cadence Growth",
        "business_impact": "Indian shoppers who have placed high-value orders but purchase infrequently. High potential to increase monthly cadence.",
        "actions": [
            {"title": "Limited-Time Payday & Festive Drops", "description": "Target during 1st-week salary cycles and major Indian festive calendar sales.", "tag": "Upsell"},
            {"title": "Bundle & Combo Value Savings", "description": "Encourage multi-item baskets with 'Buy 2 Get 1' or tiered value packs.", "tag": "Upsell"},
            {"title": "Customer Reviews & Social Proof", "description": "Showcase verified Indian creator reviews and influencer styling reels.", "tag": "Nurture"}
        ],
        "channels": ["Curated WhatsApp Newsletters", "Instagram Retargeting", "SMS Flash Drops"],
        "offer": "Tiered Spend & Save: ₹500 Off on ₹2,499+ | ₹1,200 Off on ₹4,999+"
    },
    "Customers Needing Attention": {
        "churn_risk": "Medium-High",
        "risk_score": 62,
        "priority": "P2 - Re-engagement Window",
        "headline": "Waning Activity Window: Above-Average Spenders Slipping Away",
        "business_impact": "Previously active customers whose re-order gap is stretching beyond standard Indian e-commerce repurchase cycles.",
        "actions": [
            {"title": "Personalized 'We Miss You' WhatsApp Note", "description": "Acknowledge their hiatus with customized product recommendations based on past orders.", "tag": "Win-Back"},
            {"title": "7-Day Countdown Comeback Coupon", "description": "Provide a high-perceived-value discount coupon with a strict 7-day expiry.", "tag": "Win-Back"},
            {"title": "Product Preference Survey", "description": "Inquire which new categories or price points they want to see next.", "tag": "Retain"}
        ],
        "channels": ["Dynamic WhatsApp Triggers", "SMS Reconnect", "Custom Meta Audiences"],
        "offer": "Special 20% 'Welcome Back' Savings Code (Valid for 7 Days)"
    },
    "About to Sleep": {
        "churn_risk": "High",
        "risk_score": 75,
        "priority": "P2 - Urgent Reactivation",
        "headline": "Cooling Down: Declining Purchase Interval at High Churn Risk",
        "business_impact": "At high risk of permanent churn if not reactivated with aggressive value incentives in the next 15-30 days.",
        "actions": [
            {"title": "Aggressive Margin-Positive Reactivation Drop", "description": "Deploy clearance pricing or bundled discounts to trigger a repeat purchase.", "tag": "Win-Back"},
            {"title": "Showcase Best-Sellers & New Arrivals", "description": "Highlight top trending items launched in India since their last visit.", "tag": "Nurture"},
            {"title": "Notification Preference Check", "description": "Allow adjusting WhatsApp/SMS frequency before opting out.", "tag": "Retain"}
        ],
        "channels": ["Reactivation WhatsApp Series", "Display Retargeting", "SMS Alert"],
        "offer": "Flat 25% Off Everything + Free Shipping across India"
    },
    "At Risk": {
        "churn_risk": "Critical",
        "risk_score": 88,
        "priority": "P1 - Urgent Revenue Defense",
        "headline": "High-Value Former Loyalists on the Verge of Full Churn",
        "business_impact": "These were heavy spenders and regular shoppers who haven't ordered in a long time. Losing them represents severe revenue loss.",
        "actions": [
            {"title": "High-Stakes Win-Back Message from Founder", "description": "Send a direct personal note offering a steep recovery credit.", "tag": "Win-Back"},
            {"title": "Personal Concierge Tele-Call", "description": "For highest monetary accounts, assign a customer relationship manager to diagnose friction.", "tag": "Retain"},
            {"title": "Major Catalog Overhaul Announcement", "description": "Showcase new product lines and improved delivery speeds.", "tag": "Nurture"}
        ],
        "channels": ["VIP WhatsApp Direct", "Outbound Concierge Call", "High-Bid Retargeting"],
        "offer": "Exclusive ₹1,000 Comeback Credit on Orders Above ₹2,999"
    },
    "Can't Lose Them": {
        "churn_risk": "Critical",
        "risk_score": 92,
        "priority": "P1 - Executive Intervention",
        "headline": "Historic Whales & Major Spenders in Critical Dormancy",
        "business_impact": "Highest lifetime value accounts in India currently dormant. Immediate executive intervention is mandatory.",
        "actions": [
            {"title": "Direct Executive Outreach", "description": "Personal WhatsApp/Email note from Founder offering personalized renewal terms.", "tag": "Win-Back"},
            {"title": "Complimentary Physical Festive Gift Box", "description": "Send a premium physical gift box with zero purchase required to restore brand goodwill.", "tag": "Reward"},
            {"title": "Friction Diagnosis Interview", "description": "Determine if poor logistics or customer support caused the departure and resolve it immediately.", "tag": "Retain"}
        ],
        "channels": ["Founder Direct Outreach", "Physical Luxury Gift Box", "VIP Support Desk"],
        "offer": "Complimentary Executive Gift Hamper + Personal Concierge Booking"
    },
    "Hibernating": {
        "churn_risk": "High",
        "risk_score": 82,
        "priority": "P4 - Low-Cost Automated Batch",
        "headline": "Long-Dormant Low-Frequency Buyers with Minimal Activity",
        "business_impact": "Low historical spend and long inactivity. Low ROI for expensive manual outreach; best suited for automated batch campaigns.",
        "actions": [
            {"title": "Automated Clearance WhatsApp Blast", "description": "Include in semi-annual Indian warehouse clearance and festive liquidation drops.", "tag": "Win-Back"},
            {"title": "Database List Hygiene", "description": "Filter non-responsive contacts to maintain high WhatsApp template quality score.", "tag": "Retain"},
            {"title": "Low-Cost Programmatic Retargeting", "description": "Include in broad social audience campaigns with low CPA targets.", "tag": "Nurture"}
        ],
        "channels": ["Automated Batch SMS / WhatsApp", "Programmatic Display Ads"],
        "offer": "Warehouse Clearance: Extra 30% Off Clearance Categories"
    },
    "Lost": {
        "churn_risk": "Critical",
        "risk_score": 98,
        "priority": "P4 - Final Sunset Window",
        "headline": "Fully Churned Inactive Cohort with Lowest Historical Engagement",
        "business_impact": "Exhausted lifecycle. Focus marketing capital on higher-yield Indian cohorts; run only zero-cost automated tests.",
        "actions": [
            {"title": "Final 'Farewell' Opt-in SMS", "description": "Give a last chance to stay subscribed before pruning from active CRM database.", "tag": "Win-Back"},
            {"title": "Extreme Annual Festive Incentive Drop", "description": "One-time extreme incentive during Diwali / Great Indian Sale.", "tag": "Win-Back"},
            {"title": "CRM Database Scrub", "description": "Archive inactive contacts to reduce marketing SaaS subscription costs.", "tag": "Retain"}
        ],
        "channels": ["Final Automated Scrub SMS"],
        "offer": "Last Call: Take Flat ₹500 Off Any Order Today Only"
    }
}


def generate_segment_insights(
    segment_data: Dict[str, Any],
    api_key: Optional[str] = None,
    provider: str = "heuristic"
) -> SegmentInsight:
    """
    Generates tailored, plain-English business narrative and actionable strategies
    for a given RFM segment tailored for the Indian Market.
    """
    seg_name = segment_data.get("segment", "Champions")
    cnt = segment_data.get("customer_count", 0)
    rev = segment_data.get("total_revenue", 0.0)
    pct_rev = segment_data.get("pct_of_revenue", 0.0)
    avg_rec = segment_data.get("avg_recency_days", 0)
    avg_freq = segment_data.get("avg_frequency", 0)
    avg_mon = segment_data.get("avg_monetary", 0.0)

    kb = DEFAULT_SEGMENT_KNOWLEDGE.get(seg_name, DEFAULT_SEGMENT_KNOWLEDGE["Champions"])

    custom_impact = (
        f"{cnt:,} accounts ({segment_data.get('pct_of_customers', 0)}% of customer base) "
        f"contribute ₹{rev:,.2f} ({pct_rev}% of total revenue). "
        f"Average customer spend is ₹{avg_mon:,.2f} across {avg_freq} orders, with an average recency of {avg_rec} days."
    )

    return SegmentInsight(
        segment=seg_name,
        headline=kb["headline"],
        churn_risk=kb["churn_risk"],
        risk_score=kb["risk_score"],
        business_impact=f"{kb['business_impact']} {custom_impact}",
        recommended_actions=kb["actions"],
        retention_priority=kb["priority"],
        best_channels=kb["channels"],
        suggested_offer=kb["offer"]
    )


def enrich_segments_with_insights(
    segments: List[Dict[str, Any]],
    api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Enriches all segment summaries with Indian-market tailored AI narratives."""
    enriched = []
    for seg in segments:
        insight = generate_segment_insights(seg, api_key=api_key)
        seg_copy = dict(seg)
        seg_copy["insight"] = insight.dict()
        enriched.append(seg_copy)
    return enriched
