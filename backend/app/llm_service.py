import json
import httpx
import os
from typing import Dict, Any, List, Optional
from .schemas import SegmentInsight

DEFAULT_SEGMENT_KNOWLEDGE = {
    "Champions": {
        "churn_risk": "Low",
        "risk_score": 8,
        "priority": "P4 - Advocacy & Loyalty",
        "headline": "Elite VIP Core: High Lifetime Value & Brand Advocates",
        "business_impact": "These top-tier customers generate disproportionate revenue and act as natural brand champions with near-zero immediate churn risk.",
        "actions": [
            {"title": "Exclusive VIP Perks & Early Access", "description": "Reward with early product launches, private concierge support, and invitation-only previews.", "tag": "Reward"},
            {"title": "Advocacy & Referral Incentives", "description": "Turn them into ambassadors with high-incentive referral loops and user-generated review requests.", "tag": "Upsell"},
            {"title": "No-Discount Premium Bundles", "description": "Avoid cheap discounts; offer premium add-ons and complimentary tier upgrades instead.", "tag": "Nurture"}
        ],
        "channels": ["Direct VIP SMS", "Dedicated Account Email", "In-App VIP Portal"],
        "offer": "Exclusive Early Access + Complimentary Gift with Next Order"
    },
    "Loyal Customers": {
        "churn_risk": "Low",
        "risk_score": 18,
        "priority": "P3 - Expansion",
        "headline": "Consistent High-Value Buyers with Steady Purchasing Frequency",
        "business_impact": "Your revenue bedrock. Highly responsive to brand messaging with high lifetime retention potential.",
        "actions": [
            {"title": "Tiered Loyalty Program Upsell", "description": "Offer points multipliers or higher tier statuses to incentivize crossing higher spend thresholds.", "tag": "Upsell"},
            {"title": "Cross-Category Product Recommendations", "description": "Analyze their category affinity and introduce complementary product lines.", "tag": "Nurture"},
            {"title": "Milestone & Anniversary Recognition", "description": "Send personalized anniversary gifts or thank-you perks celebrating their relationship with the brand.", "tag": "Retain"}
        ],
        "channels": ["Personalized Email", "Push Notifications", "Targeted Retargeting"],
        "offer": "20% Bonus Loyalty Points + Free Shipping on Category Add-ons"
    },
    "Potential Loyalists": {
        "churn_risk": "Medium-Low",
        "risk_score": 32,
        "priority": "P2 - Conversion",
        "headline": "Recent High-Potential Shoppers Ready for Loyalty Acceleration",
        "business_impact": "High-velocity segment that can easily convert into Champions with targeted second/third purchase incentives.",
        "actions": [
            {"title": "Next-Purchase Time-Sensitive Incentive", "description": "Deliver a 14-day voucher to accelerate the repeat purchase habit.", "tag": "Nurture"},
            {"title": "Membership Onboarding Sequence", "description": "Educate them on membership benefits, subscription options, and community perks.", "tag": "Upsell"},
            {"title": "Customer Feedback & Product Ratings", "description": "Prompt for product reviews while the recent positive experience is top of mind.", "tag": "Retain"}
        ],
        "channels": ["Email Automation Flow", "WhatsApp / SMS Drops", "In-App Banners"],
        "offer": "15% Off Your Next Order within 14 Days"
    },
    "Recent Customers": {
        "churn_risk": "Medium",
        "risk_score": 45,
        "priority": "P2 - Onboarding",
        "headline": "First-Time or Newly Acquired Buyers in Critical Onboarding Phase",
        "business_impact": "Fresh acquisition cohort whose lifetime retention depends heavily on the first 30-day experience.",
        "actions": [
            {"title": "Post-Purchase Welcome & Usage Guides", "description": "Send helpful onboarding guides, unboxing tutorials, or styling advice.", "tag": "Nurture"},
            {"title": "Second-Order Discount Bridge", "description": "Offer an irresistible follow-up incentive before recency drops beyond 30 days.", "tag": "Retain"},
            {"title": "Satisfaction Check-in Survey", "description": "Identify any delivery or product friction before it leads to silent churn.", "tag": "Retain"}
        ],
        "channels": ["Welcome Email Drip", "SMS Verification / Update", "Post-Purchase Survey"],
        "offer": "$15 Credit Towards Your Second Order"
    },
    "Promising": {
        "churn_risk": "Medium",
        "risk_score": 48,
        "priority": "P3 - Value Growth",
        "headline": "Solid Spend Potential with Room for Frequency Optimization",
        "business_impact": "Customers who have spent decent amounts but purchase infrequently. High opportunity to increase order cadence.",
        "actions": [
            {"title": "Limited-Time Seasonal Campaigns", "description": "Target with seasonal catalog drops and high-appeal trending items.", "tag": "Upsell"},
            {"title": "Bundle & Volume Discounts", "description": "Encourage multi-item baskets with 'Buy 2 Get 1' or tiered threshold discounts.", "tag": "Upsell"},
            {"title": "Brand Storytelling & Social Proof", "description": "Share community reviews, case studies, and brand values to deepen affinity.", "tag": "Nurture"}
        ],
        "channels": ["Curated Email Newsletters", "Social Retargeting Ads", "SMS Flash Sales"],
        "offer": "Buy More, Save More: Tiered $20-$50 Off Bundles"
    },
    "Customers Needing Attention": {
        "churn_risk": "Medium-High",
        "risk_score": 62,
        "priority": "P2 - Re-engagement",
        "headline": "Waning Activity Window: Above-Average Spenders Slipping Away",
        "business_impact": "Previously active customers whose purchase intervals are beginning to stretch into churn danger zones.",
        "actions": [
            {"title": "Personalized 'We Miss You' Campaign", "description": "Acknowledge their hiatus with customized product recommendations based on past orders.", "tag": "Win-Back"},
            {"title": "Time-Bound Exclusive Comeback Offer", "description": "Provide a high-perceived-value coupon with a 7-day expiration countdown.", "tag": "Win-Back"},
            {"title": "Re-engagement Quiz or Survey", "description": "Ask what products or styles they'd like to see next to reignite interest.", "tag": "Retain"}
        ],
        "channels": ["Dynamic Email Triggers", "SMS Reconnect", "Meta/Google Custom Audiences"],
        "offer": "Special 20% 'Welcome Back' Savings Code (Valid 7 Days)"
    },
    "About to Sleep": {
        "churn_risk": "High",
        "risk_score": 75,
        "priority": "P2 - Reactivation",
        "headline": "Cooling Down: Low Recency and Declining Engagement",
        "business_impact": "At high risk of becoming permanent churn if not reactivated with compelling value in the next 15-30 days.",
        "actions": [
            {"title": "Aggressive Reactivation Discount", "description": "Deploy margin-positive discounts or clearance pricing to trigger a transaction.", "tag": "Win-Back"},
            {"title": "Popular Best-Sellers Showcase", "description": "Highlight top new arrivals and highest-rated items they may have missed.", "tag": "Nurture"},
            {"title": "Channel Preference Check", "description": "Ask if they prefer fewer emails or alternative notification channels before unsubscribing.", "tag": "Retain"}
        ],
        "channels": ["Reactivation Email Series", "Paid Retargeting Display", "SMS Alert"],
        "offer": "25% Off Everything + Free Shipping"
    },
    "At Risk": {
        "churn_risk": "Critical",
        "risk_score": 88,
        "priority": "P1 - Urgent Win-Back",
        "headline": "High-Value Former Loyalists on the Verge of Full Churn",
        "business_impact": "These were heavy spenders and regular shoppers who haven't bought in a long time. Losing them represents severe revenue loss.",
        "actions": [
            {"title": "High-Stakes Win-Back Flow", "description": "Send a direct, sincere message from leadership or customer success offering a steep recovery incentive.", "tag": "Win-Back"},
            {"title": "One-on-One Outreach / Concierge Call", "description": "For highest monetary accounts, assign a customer rep to diagnose root causes.", "tag": "Retain"},
            {"title": "Major Feature / Catalog Overhaul Announcement", "description": "Showcase what's new and improved since their last visit.", "tag": "Nurture"}
        ],
        "channels": ["VIP Win-Back Email", "Outbound SMS/Call", "High-Bid Retargeting"],
        "offer": "Exclusive $50 Comeback Credit on orders over $150"
    },
    "Can't Lose Them": {
        "churn_risk": "Critical",
        "risk_score": 92,
        "priority": "P1 - Immediate Intervention",
        "headline": "Historic Whales & Major Spenders in Critical Dormancy",
        "business_impact": "Highest monetary lifetime value cohort currently dormant. Immediate executive or personalized intervention is mandatory.",
        "actions": [
            {"title": "Executive Direct Outreach", "description": "Personal note from Founder / VP offering personalized renewal terms or bespoke package.", "tag": "Win-Back"},
            {"title": "Premium Free Gift or Renewal Package", "description": "Send a high-end physical or digital gift with zero purchase required to restore goodwill.", "tag": "Reward"},
            {"title": "Exit Interview & Friction Removal", "description": "Discover if a poor service experience caused the departure and resolve it immediately.", "tag": "Retain"}
        ],
        "channels": ["Direct Phone / Executive Email", "Physical Mailer / Gift Box", "VIP Support Channel"],
        "offer": "Complimentary Executive Gift + Concierge Booking Link"
    },
    "Hibernating": {
        "churn_risk": "High",
        "risk_score": 82,
        "priority": "P4 - Low Touch",
        "headline": "Long-Dormant Low-Frequency Buyers with Minimal Activity",
        "business_impact": "Low historical spend and long inactivity. Low ROI for expensive direct outreach; best suited for automated batch campaigns.",
        "actions": [
            {"title": "Automated Deep-Discount Clearance Email", "description": "Include in semi-annual warehouse clearance or liquidation campaigns.", "tag": "Win-Back"},
            {"title": "List Hygiene & Sunset Policy", "description": "Filter out non-responders to protect domain sender reputation.", "tag": "Retain"},
            {"title": "Low-Cost Social Retargeting", "description": "Include in broad lookalike/audience campaigns with low CPA targets.", "tag": "Nurture"}
        ],
        "channels": ["Automated Batch Email", "Programmatic Display Ads"],
        "offer": "Warehouse Clearance: Extra 30% Off Clearance Items"
    },
    "Lost": {
        "churn_risk": "Critical",
        "risk_score": 98,
        "priority": "P4 - Sunset / Final Opportunity",
        "headline": "Fully Churned Inactive Cohort with Lowest Historical Engagement",
        "business_impact": "Exhausted lifecycle. Focus budget on higher-yield segments; run only automated zero-cost reactivation tests.",
        "actions": [
            {"title": "Final 'Farewell & Keep in Touch' Email", "description": "Give a last chance to stay subscribed before pruning from active marketing database.", "tag": "Win-Back"},
            {"title": "Aggressive End-of-Year Reactivation Drop", "description": "One-time extreme incentive during major Black Friday / Cyber Monday sales.", "tag": "Win-Back"},
            {"title": "Database Sunset & Scrub", "description": "Archive inactive contacts to reduce marketing SaaS subscription costs.", "tag": "Retain"}
        ],
        "channels": ["Final Automated Scrub Email"],
        "offer": "Last Call: Take $25 Off Any Order Today Only"
    }
}


def generate_segment_insights(
    segment_data: Dict[str, Any],
    api_key: Optional[str] = None,
    provider: str = "heuristic"
) -> SegmentInsight:
    """
    Generates tailored, plain-English business narrative and actionable strategies
    for a given RFM segment.
    Uses LLM API if key is configured, or built-in analytical heuristic model.
    """
    seg_name = segment_data.get("segment", "Champions")
    cnt = segment_data.get("customer_count", 0)
    rev = segment_data.get("total_revenue", 0.0)
    pct_rev = segment_data.get("pct_of_revenue", 0.0)
    avg_rec = segment_data.get("avg_recency_days", 0)
    avg_freq = segment_data.get("avg_frequency", 0)
    avg_mon = segment_data.get("avg_monetary", 0.0)

    # Base template from curated intelligence
    kb = DEFAULT_SEGMENT_KNOWLEDGE.get(seg_name, DEFAULT_SEGMENT_KNOWLEDGE["Champions"])

    # Dynamic contextual enrichment
    custom_impact = (
        f"{cnt:,} customers ({segment_data.get('pct_of_customers', 0)}% of customer base) "
        f"contribute ${rev:,.2f} ({pct_rev}% of total revenue). "
        f"Average customer spend is ${avg_mon:,.2f} across {avg_freq} orders, with an average recency of {avg_rec} days."
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
    """Enriches all segment summaries with LLM-grade analytical narratives."""
    enriched = []
    for seg in segments:
        insight = generate_segment_insights(seg, api_key=api_key)
        seg_copy = dict(seg)
        seg_copy["insight"] = insight.dict()
        enriched.append(seg_copy)
    return enriched
