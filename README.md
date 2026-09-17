# 📊 RFM Analytics Platform

An enterprise-grade **Customer RFM Segmentation & AI Strategy Engine** that combines quantile-based behavioral science with plain-English LLM business narrative — built with FastAPI + React (Vite) + Tailwind CSS v4.

---

## 🚀 Quick Start

### 1. Start the Backend (FastAPI)

Open a PowerShell terminal:
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the Frontend (React + Vite)

Open a **second** PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```

### 3. Open in Browser
Visit: **http://localhost:5173**

The app loads the built-in UCI Online Retail sample dataset automatically on startup — no file upload needed to start exploring.

---

## 📂 Project Structure

```
d:/Internship2.0/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app & API endpoints
│   │   ├── rfm_engine.py     # RFM computation & quantile scoring engine
│   │   ├── llm_service.py    # Segment narrative & churn strategy intelligence
│   │   ├── chat_service.py   # AI chat copilot grounded on RFM context
│   │   ├── sample_generator.py # Synthetic UCI e-commerce dataset generator
│   │   └── schemas.py        # Pydantic request/response models
│   ├── sample_data/
│   │   └── online_retail_sample.csv
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx           # Navigation & action buttons
    │   │   ├── UploadModal.jsx      # Drag-and-drop CSV/XLSX uploader
    │   │   ├── ColumnMapper.jsx     # Smart column mapping with live preview
    │   │   ├── KpiCards.jsx         # Executive KPI summary strip
    │   │   ├── Charts/
    │   │   │   ├── SegmentDonut.jsx # Interactive Donut distribution chart
    │   │   │   ├── RfmScatter.jsx   # RFM 3D bubble scatter plot
    │   │   │   ├── RevenueBar.jsx   # Revenue per segment horizontal bar
    │   │   │   └── RecencyDist.jsx  # Recency decay + frequency histogram
    │   │   ├── SegmentTable.jsx     # Full searchable, sortable customer table
    │   │   ├── SegmentDrawer.jsx    # AI strategy slide-over drawer
    │   │   ├── AskAiChat.jsx        # Interactive AI Strategy Copilot modal
    │   │   ├── ExportModal.jsx      # CSV / JSON / PDF export engine
    │   │   └── ApiKeyModal.jsx      # LLM API key configuration
    │   ├── services/api.js          # Frontend API client
    │   └── App.jsx                  # Root application state orchestrator
    └── vite.config.js               # Vite + Tailwind + API proxy
```

---

## 🧠 How RFM Works

RFM segments customers across three behavioral dimensions, each scored **1–5** (quintiles):

| Dimension | Metric | Higher is Better? |
|-----------|--------|------------------|
| **R** – Recency | Days since last purchase | ✅ Lower days = Score 5 |
| **F** – Frequency | Number of unique orders | ✅ More orders = Score 5 |
| **M** – Monetary | Total revenue spend | ✅ More spend = Score 5 |

The concatenated score (e.g. `545`) maps to one of **11 standard industry segments**.

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/rfm/upload-preview` | Parse file, detect columns, return preview |
| `POST` | `/api/rfm/analyze` | Full RFM computation on uploaded file |
| `GET` | `/api/rfm/sample` | Run analysis on built-in sample dataset |
| `GET` | `/api/rfm/sample-csv` | Download the sample CSV template |
| `POST` | `/api/rfm/chat` | AI Strategy Copilot Q&A endpoint |

---

## 📤 Uploading Custom Data

Your CSV/XLSX must include:
- **CustomerID** – unique buyer identifier (e.g. `C1001`)
- **Order Date** – transaction timestamp (e.g. `2024-05-01`)
- **Amount** – transaction monetary value (e.g. `149.50`)

Optional:
- **Order ID** – for unique order deduplication
- **Category** – product/service category

The Column Mapper step auto-detects common column name variants and lets you verify/override before analysis.

---

## ✨ Key Features

- **11-Segment RFM Classification**: Champions, Loyal, Potential Loyalists, Recent, Promising, Needing Attention, About to Sleep, At Risk, Can't Lose Them, Hibernating, Lost
- **AI Strategy Insights**: Per-segment churn risk score, plain-English narrative, 3-action tactical playbooks, and best channel recommendations — works 100% offline with built-in intelligence engine
- **Interactive Visualizations**: Donut distribution, RFM bubble scatter, revenue contribution bars, recency decay histograms
- **AI Copilot Chat**: Ask any business strategy question, grounded on your actual computed segment data
- **Export Suite**: PDF executive reports, customer CSV roster, segment summary CSV, and raw JSON payload
- **Flexible Column Mapping**: Works on any customer transaction dataset — not locked to specific column names

---

## 🔑 Optional: LLM API Key

The app ships with a built-in offline analytics intelligence engine. To enable live frontier model responses, click the **Settings** gear icon and enter your API key for Google Gemini, Anthropic Claude, or OpenAI GPT-4.
