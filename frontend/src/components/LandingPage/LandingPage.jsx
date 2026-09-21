import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Clock, 
  Repeat, 
  DollarSign, 
  Download, 
  PlayCircle, 
  CheckCircle2, 
  Sliders, 
  ShoppingBag,
  Building2,
  FileSpreadsheet,
  Lightbulb
} from 'lucide-react';

const SEGMENTS_DATABASE = [
  {
    name: "Champions",
    tag: "VIP / Elite",
    category: "high_value",
    r_range: "Score 4–5 (Recent: 1–25 days)",
    f_range: "Score 4–5 (8+ orders)",
    m_range: "Score 4–5 (Highest spend)",
    churn_risk: "Low",
    headline: "Your most valuable customers who buy frequently and spend the most.",
    tactics: ["VIP early-access product drops", "Dedicated concierge support", "Referral ambassador incentives"],
    channels: ["Direct VIP SMS", "Personal Executive Email"],
    offer: "Exclusive Early Access + Complimentary VIP Gift"
  },
  {
    name: "Loyal Customers",
    tag: "Revenue Bedrock",
    category: "high_value",
    r_range: "Score 3–5 (Recent: 15–60 days)",
    f_range: "Score 3–5 (4–10 orders)",
    m_range: "Score 3–5 (Above-average spend)",
    churn_risk: "Low",
    headline: "Steady buyers who trust your brand and respond well to promotions.",
    tactics: ["Loyalty points multipliers", "Cross-category upsells", "Milestone anniversary rewards"],
    channels: ["Personalized Email", "Targeted Push Alerts"],
    offer: "20% Bonus Loyalty Points on Complementary Categories"
  },
  {
    name: "Potential Loyalists",
    tag: "High Velocity",
    category: "growth",
    r_range: "Score 4–5 (Recent: 5–35 days)",
    f_range: "Score 1–3 (2–4 orders)",
    m_range: "Score 2–5 (Good spend)",
    churn_risk: "Medium-Low",
    headline: "Recent high-potential shoppers who are primed to become Champions.",
    tactics: ["Time-sensitive 14-day repeat voucher", "Membership onboarding flow", "Product rating prompts"],
    channels: ["Email Automation Flow", "WhatsApp / SMS Drops"],
    offer: "15% Off Your Next Order within 14 Days"
  },
  {
    name: "Recent Customers",
    tag: "Fresh Acquisitions",
    category: "growth",
    r_range: "Score 4–5 (Recent: 1–15 days)",
    f_range: "Score 1 (1 order)",
    m_range: "Score 1–3 (Entry spend)",
    churn_risk: "Medium",
    headline: "First-time buyers in the critical initial 30-day onboarding window.",
    tactics: ["Post-purchase unboxing guide", "Second-order bridge coupon", "Satisfaction check-in survey"],
    channels: ["Welcome Email Drip", "SMS Order Confirmation"],
    offer: "$15 Credit Towards Your Second Order"
  },
  {
    name: "Promising",
    tag: "Value Growth",
    category: "growth",
    r_range: "Score 3–4 (Recent: 20–60 days)",
    f_range: "Score 1–2 (1–2 orders)",
    m_range: "Score 3–5 (High basket size)",
    churn_risk: "Medium",
    headline: "High-spend buyers with low order frequency. Strong revenue upside.",
    tactics: ["Bundle & volume discounts", "Seasonal catalog showcase", "Brand social proof"],
    channels: ["Curated Newsletters", "Social Retargeting"],
    offer: "Tiered Spend-and-Save: $25 Off Orders Over $100"
  },
  {
    name: "Customers Needing Attention",
    tag: "Early Warning",
    category: "risk",
    r_range: "Score 2–3 (Dormancy: 45–90 days)",
    f_range: "Score 2–3 (2–4 orders)",
    m_range: "Score 2–3 (Moderate spend)",
    churn_risk: "Medium-High",
    headline: "Above-average buyers slipping away due to stretched purchase intervals.",
    tactics: ["'We Miss You' personalized email", "Limited 7-day comeback voucher", "Preference inquiry quiz"],
    channels: ["Dynamic Re-engagement Email", "Meta / Google Audiences"],
    offer: "Special 20% 'Welcome Back' Savings Code (Valid 7 Days)"
  },
  {
    name: "About to Sleep",
    tag: "Cooling Off",
    category: "risk",
    r_range: "Score 2–3 (Dormancy: 60–120 days)",
    f_range: "Score 1–2 (1–2 orders)",
    m_range: "Score 1–2 (Low spend)",
    churn_risk: "High",
    headline: "Low recency and low frequency buyers at high risk of full churn.",
    tactics: ["Aggressive clearance discount", "Best-sellers highlight showcase", "Channel preference check"],
    channels: ["Reactivation Series", "Paid Display Retargeting"],
    offer: "25% Off Everything + Free Shipping"
  },
  {
    name: "At Risk",
    tag: "Urgent Defense",
    category: "risk",
    r_range: "Score 1–2 (Dormancy: 90–240 days)",
    f_range: "Score 3–5 (3–8 orders)",
    m_range: "Score 3–5 (High historical spend)",
    churn_risk: "Critical",
    headline: "Former heavy spenders on the verge of churn. Represents severe revenue loss.",
    tactics: ["High-stakes win-back sequence", "Direct phone / concierge outreach", "Major new catalog announcement"],
    channels: ["VIP Win-Back Email", "Outbound Executive Call"],
    offer: "Exclusive $50 Comeback Credit on Orders Over $150"
  },
  {
    name: "Can't Lose Them",
    tag: "Whale Churn",
    category: "risk",
    r_range: "Score 1 (Dormancy: 120+ days)",
    f_range: "Score 4–5 (7+ orders)",
    m_range: "Score 4–5 (Top 5% lifetime spend)",
    churn_risk: "Critical",
    headline: "Historical whales currently dormant. Immediate executive intervention mandatory.",
    tactics: ["Executive direct outreach from VP/Founder", "Free premium gift package", "Exit interview to resolve friction"],
    channels: ["Founder Direct Email", "Physical Executive Mailer"],
    offer: "Complimentary Executive Gift + Personal Concierge Booking"
  },
  {
    name: "Hibernating",
    tag: "Low Touch",
    category: "dormant",
    r_range: "Score 1–2 (Dormancy: 120–300 days)",
    f_range: "Score 1–2 (1–2 orders)",
    m_range: "Score 1–2 (Low spend)",
    churn_risk: "High",
    headline: "Long-dormant, low-frequency buyers best suited for automated batch campaigns.",
    tactics: ["Automated warehouse clearance drops", "List hygiene & sunset check", "Low-cost programmatic retargeting"],
    channels: ["Automated Batch Email", "Display Network"],
    offer: "Warehouse Liquidation: Extra 30% Off Clearance Items"
  },
  {
    name: "Lost",
    tag: "Full Churn",
    category: "dormant",
    r_range: "Score 1 (Dormancy: 200+ days)",
    f_range: "Score 1 (1 order)",
    m_range: "Score 1 (Lowest spend)",
    churn_risk: "Critical",
    headline: "Fully churned contacts with lowest historical engagement.",
    tactics: ["Final 'Farewell' opt-in email", "End-of-year extreme incentive drop", "Database archive to reduce SaaS costs"],
    channels: ["Final Sunset Automated Email"],
    offer: "Last Call: Take $25 Off Any Order Today Only"
  }
];

export default function LandingPage({ onLaunchDashboard, onLoadSample, onLoadSaasSample }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive RFM Simulator State
  const [simRecency, setSimRecency] = useState(14);
  const [simFrequency, setSimFrequency] = useState(6);
  const [simMonetary, setSimMonetary] = useState(650);

  // Compute simulated RFM score
  const simScores = useMemo(() => {
    let r = 1;
    if (simRecency <= 20) r = 5;
    else if (simRecency <= 50) r = 4;
    else if (simRecency <= 90) r = 3;
    else if (simRecency <= 180) r = 2;
    else r = 1;

    let f = 1;
    if (simFrequency >= 8) f = 5;
    else if (simFrequency >= 5) f = 4;
    else if (simFrequency >= 3) f = 3;
    else if (simFrequency >= 2) f = 2;
    else f = 1;

    let m = 1;
    if (simMonetary >= 1000) m = 5;
    else if (simMonetary >= 450) m = 4;
    else if (simMonetary >= 200) m = 3;
    else if (simMonetary >= 80) m = 2;
    else m = 1;

    let segment = "Potential Loyalists";
    if (r === 1 && f >= 4 && m >= 4) segment = "Can't Lose Them";
    else if ((r === 1 || r === 2) && f >= 3 && m >= 3) segment = "At Risk";
    else if (r >= 4 && f >= 4 && m >= 4) segment = "Champions";
    else if (r >= 3 && f >= 3 && m >= 3) segment = "Loyal Customers";
    else if (r >= 4 && f <= 3 && m >= 2) segment = "Potential Loyalists";
    else if (r >= 4 && f === 1) segment = "Recent Customers";
    else if ((r === 3 || r === 4) && f <= 2 && m >= 3) segment = "Promising";
    else if ((r === 2 || r === 3) && (f === 2 || f === 3) && (m === 2 || m === 3)) segment = "Customers Needing Attention";
    else if ((r === 2 || r === 3) && f <= 2 && m <= 2) segment = "About to Sleep";
    else if ((r === 1 || r === 2) && f <= 2 && m <= 2) {
      segment = (r === 1 && f === 1 && m === 1) ? "Lost" : "Hibernating";
    } else if (r === 1) segment = "Lost";

    const segObj = SEGMENTS_DATABASE.find(s => s.name === segment) || SEGMENTS_DATABASE[0];

    return {
      r,
      f,
      m,
      rfmCode: `${r}${f}${m}`,
      segment: segObj
    };
  }, [simRecency, simFrequency, simMonetary]);

  const filteredSegments = useMemo(() => {
    return SEGMENTS_DATABASE.filter(s => {
      const matchCat = activeTab === 'all' || s.category === activeTab;
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-20">
      
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[25%] w-[550px] h-[550px] bg-amber-500/[0.08] rounded-full blur-[140px]" />
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full blur-[150px]" />
        <div className="absolute top-[30%] left-[45%] w-[400px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 space-y-24">
        
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Behavioral Science & AI Retention Architecture</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Transform Customer Transactions into <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              11 Precision Behavioral Segments
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Quantile-based **Recency, Frequency & Monetary (RFM)** analytics combined with plain-English AI playbooks to identify VIP spenders, defend against churn, and maximize customer lifetime value.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchDashboard}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/15 flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Launch Analytics Studio</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('simulator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-slate-200 font-semibold text-xs sm:text-sm transition-all hover:text-white flex items-center space-x-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Try Live RFM Simulator</span>
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Standard Segments</p>
              <p className="text-xl font-bold text-white mt-1">11 Cohorts</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Champions to Lost</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Scoring Method</p>
              <p className="text-xl font-bold text-white mt-1">1–5 Quintiles</p>
              <p className="text-[11px] text-amber-400 mt-0.5">Ranked percentile bins</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Intelligence</p>
              <p className="text-xl font-bold text-white mt-1">Offline + LLM</p>
              <p className="text-[11px] text-cyan-400 mt-0.5">Gemini, Claude & GPT-4</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Portability</p>
              <p className="text-xl font-bold text-white mt-1">Universal</p>
              <p className="text-[11px] text-indigo-400 mt-0.5">Works on any CSV / XLSX</p>
            </div>
          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION: WHAT IS RFM? THE 3 PILLARS */}
        {/* ============================================================ */}
        <section className="space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              What is RFM Customer Segmentation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              RFM is an established mathematical model used by leading global retailers, SaaS companies, and consumer brands to quantify loyalty and exposure across 3 core behavioral metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Pillar 1: Recency */}
            <div className="material-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-mono font-bold mb-2">
                  DIMENSION: R
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Recency (Days Inactive)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Elapsed days between the customer's most recent order and the analysis date. Lower days signify high brand affinity and active retention.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 5:</span>
                  <span className="text-emerald-400 font-semibold">0–30 days ago</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 1:</span>
                  <span className="text-rose-400 font-semibold">&gt;180–365 days ago</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Frequency */}
            <div className="material-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                  <Repeat className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[10px] font-mono font-bold mb-2">
                  DIMENSION: F
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Frequency (Order Count)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Total unique orders or billing cycles completed. Highlights recurring habitual buyers vs. one-time exploratory acquisitions.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 5:</span>
                  <span className="text-emerald-400 font-semibold">8+ lifetime orders</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 1:</span>
                  <span className="text-rose-400 font-semibold">1 single order only</span>
                </div>
              </div>
            </div>

            {/* Pillar 3: Monetary */}
            <div className="material-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold mb-2">
                  DIMENSION: M
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Monetary (Total Spend)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cumulative lifetime spend generated by the customer. Identifies top-percentile whale accounts driving the 80/20 revenue rule.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 5:</span>
                  <span className="text-emerald-400 font-semibold">Top 20% spenders</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Score 1:</span>
                  <span className="text-rose-400 font-semibold">Bottom 20% spenders</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION: LIVE RFM SCORE SIMULATOR (INTERACTIVE) */}
        {/* ============================================================ */}
        <section id="simulator" className="space-y-8 scroll-mt-20">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Model Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Test the Live RFM Calculation Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Adjust the customer behavioral metrics below to compute quintile ranks and reveal the assigned cohort and AI retention playbook in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 material-card p-6 sm:p-8">
            
            {/* Sliders Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Recency Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Recency (Days Since Last Order)</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/25">
                    {simRecency} days ago
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={simRecency}
                  onChange={(e) => setSimRecency(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1d (Fresh)</span>
                  <span>180d (Cooling)</span>
                  <span>365d (Dormant)</span>
                </div>
              </div>

              {/* Frequency Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Repeat className="w-4 h-4 text-violet-400" />
                    <span>Frequency (Lifetime Orders)</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 font-mono font-bold text-xs border border-violet-500/25">
                    {simFrequency} orders
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simFrequency}
                  onChange={(e) => setSimFrequency(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 order</span>
                  <span>5 orders</span>
                  <span>20 orders (VIP)</span>
                </div>
              </div>

              {/* Monetary Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Monetary (Cumulative Spend)</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/25">
                    ${simMonetary.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="3000"
                  step="20"
                  value={simMonetary}
                  onChange={(e) => setSimMonetary(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$20</span>
                  <span>$1,000</span>
                  <span>$3,000+</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Archetype Presets:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSimRecency(5); setSimFrequency(12); setSimMonetary(1800); }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-medium text-slate-200 cursor-pointer border border-white/[0.06]"
                  >
                    👑 VIP Champion
                  </button>
                  <button
                    onClick={() => { setSimRecency(160); setSimFrequency(9); setSimMonetary(1400); }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-medium text-slate-200 cursor-pointer border border-white/[0.06]"
                  >
                    ⚠️ High Spender At-Risk
                  </button>
                  <button
                    onClick={() => { setSimRecency(8); setSimFrequency(1); setSimMonetary(65); }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-medium text-slate-200 cursor-pointer border border-white/[0.06]"
                  >
                    🌱 New Acquisition
                  </button>
                  <button
                    onClick={() => { setSimRecency(280); setSimFrequency(1); setSimMonetary(30); }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-medium text-slate-200 cursor-pointer border border-white/[0.06]"
                  >
                    💤 Churned / Lost
                  </button>
                </div>
              </div>

            </div>

            {/* Live Result Output Box */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-black/40 border border-white/[0.08] rounded-2xl p-6 shadow-inner">
              
              <div>
                
                {/* Score Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[11px] text-slate-400">Quintile Scores (1–5)</span>
                    <div className="flex items-center space-x-1.5 mt-1 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                        R: {simScores.r}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-bold text-xs border border-violet-500/30">
                        F: {simScores.f}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        M: {simScores.m}
                      </span>
                      <span className="text-xs font-bold text-amber-400 ml-1">
                        (= {simScores.rfmCode})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Churn Risk Tier</span>
                    <p className={`text-xs font-extrabold mt-0.5 ${
                      simScores.segment.churn_risk === 'Low' ? 'text-emerald-400' :
                      simScores.segment.churn_risk.includes('Medium') ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {simScores.segment.churn_risk} Risk
                    </p>
                  </div>
                </div>

                {/* Assigned Segment Card */}
                <div className="pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-white">
                      {simScores.segment.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {simScores.segment.tag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {simScores.segment.headline}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <p className="text-[10px] font-bold text-amber-300 flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Recommended Action Tactics:</span>
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {simScores.segment.tactics.map((t, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500">Best Strategy Offer:</span>{' '}
                    <strong className="text-slate-200 font-medium">{simScores.segment.offer}</strong>
                  </div>

                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-white/[0.08] mt-6">
                <button
                  onClick={onLaunchDashboard}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Explore Full Dashboard with This Cohort</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

            </div>

          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION: 11-SEGMENT MATRIX EXPLORER */}
        {/* ============================================================ */}
        <section className="space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-amber-400 text-xs font-semibold mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Segment Matrix</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                The 11 Standard Customer Cohorts
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore every cohort, their behavioral definitions, churn triggers, and proven retention playbooks.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
              >
                All (11)
              </button>
              <button
                onClick={() => setActiveTab('high_value')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  activeTab === 'high_value'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
              >
                VIP & Loyal
              </button>
              <button
                onClick={() => setActiveTab('growth')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  activeTab === 'growth'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
              >
                Growth & New
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  activeTab === 'risk'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
              >
                At-Risk & Churn
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSegments.map((seg) => (
              <div
                key={seg.name}
                className="material-card p-5.5 flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      {seg.tag}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      seg.churn_risk === 'Low' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      seg.churn_risk.includes('Medium') ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {seg.churn_risk} Risk
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {seg.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {seg.headline}
                  </p>

                  {/* Tactics */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Strategic Actions:
                    </p>
                    {seg.tactics.map((tac, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{tac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Offer: <strong className="text-slate-200">{seg.offer}</strong></span>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION: SAMPLE DATASETS & TEMPLATE HUB */}
        {/* ============================================================ */}
        <section className="space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Synthetic Datasets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated Datasets for Instant Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Test drive the platform immediately with our realistic synthetic datasets or download clean CSV templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            
            {/* Dataset 1: E-Commerce Retail */}
            <div className="material-card p-6 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Global E-Commerce Retail (B2C)</h3>
                    <p className="text-xs text-slate-400">Modeled after UCI Online Retail transactions</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Contains **4,200 transactions** across 750 customer accounts with realistic spend curves in Electronics, Fashion, Home, and Beauty.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">CustomerID</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">InvoiceDate</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">Amount</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">ProductCategory</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={onLoadSample}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-slate-950" />
                  <span>Analyze in Studio</span>
                </button>
                <a
                  href="/api/rfm/sample-csv"
                  download="ecommerce_retail_rfm_sample.csv"
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 transition-colors border border-white/[0.08]"
                  title="Download CSV"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Dataset 2: B2B SaaS */}
            <div className="material-card p-6 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">B2B Cloud SaaS Subscriptions</h3>
                    <p className="text-xs text-slate-400">Recurring MRR, seat add-ons & subscription tiers</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Contains **2,800 billing cycles** across 400 B2B accounts spanning Starter, Growth, Professional, and Enterprise subscription tiers.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">AccountID</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">BillingDate</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">MRR_Amount</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">SubscriptionTier</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={onLoadSaasSample}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-slate-950" />
                  <span>Analyze in Studio</span>
                </button>
                <a
                  href="/api/rfm/sample-saas-csv"
                  download="saas_subscription_rfm_sample.csv"
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 transition-colors border border-white/[0.08]"
                  title="Download CSV"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION: CTA BANNER */}
        {/* ============================================================ */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-500/[0.08] via-white/[0.02] to-indigo-500/[0.08] border border-white/[0.12] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Segment Your Customer Base?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Upload your transaction logs or explore our live studio with instant interactive visualizations and AI strategy copilot.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchDashboard}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              Open Analytics Studio Now
            </button>
          </div>
        </section>

      </div>

    </div>
  );
}
