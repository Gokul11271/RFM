import io
import json
import os
import pandas as pd
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse

from .schemas import (
    ColumnMapping,
    RfmAnalysisResponse,
    ChatQueryRequest,
    ChatQueryResponse
)
from .rfm_engine import auto_detect_columns, process_rfm_data
from .llm_service import enrich_segments_with_insights
from .chat_service import answer_rfm_query
from .sample_generator import (
    ensure_sample_file_exists, 
    generate_sample_ecommerce_data,
    generate_sample_saas_data
)

app = FastAPI(
    title="RFM Analytics Platform API",
    description="Customer RFM Segmentation & AI Strategy Narrative Engine",
    version="1.1.0"
)

# In-memory cache for sample runs
_SAMPLE_CACHE: Dict[str, Any] = {}

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ensure_sample_file_exists()

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "RFM Analytics Platform API", "version": "1.1.0"}


@app.post("/api/rfm/upload-preview")
async def upload_preview(file: UploadFile = File(...)):
    """
    Parses an uploaded CSV or Excel file, returns detected column names,
    auto-detected mapping heuristics, and top 5 preview rows.
    """
    try:
        contents = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents), nrows=100)
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents), nrows=100)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a CSV or XLSX file.")

        columns = list(df.columns)
        detected = auto_detect_columns(columns)
        preview_rows = df.head(5).fillna("").to_dict(orient="records")

        return {
            "filename": file.filename,
            "total_sample_columns": len(columns),
            "columns": columns,
            "detected_mapping": detected,
            "preview_rows": preview_rows
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")


@app.post("/api/rfm/analyze", response_model=RfmAnalysisResponse)
async def analyze_file(
    file: Optional[UploadFile] = File(None),
    mapping_json: str = Form(...),
    api_key: Optional[str] = Form(None)
):
    """
    Computes RFM segmentation and LLM narrative insights for an uploaded file
    using the provided column mappings.
    """
    try:
        mapping_dict = json.loads(mapping_json)
        
        if file:
            contents = await file.read()
            filename = file.filename.lower()
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents))
            elif filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(io.BytesIO(contents))
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type.")
        else:
            sample_path = ensure_sample_file_exists()
            df = pd.read_csv(sample_path)

        result = process_rfm_data(df, mapping_dict)
        enriched_segments = enrich_segments_with_insights(result["segments"], api_key=api_key)
        
        return RfmAnalysisResponse(
            kpis=result["kpis"],
            segments=enriched_segments,
            top_customers=result["top_customers"],
            distributions=result["distributions"],
            detected_columns=mapping_dict
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")


@app.get("/api/rfm/sample", response_model=RfmAnalysisResponse)
async def analyze_sample(api_key: Optional[str] = None):
    """
    Instant 1-click endpoint: Loads and analyzes the built-in Retail sample dataset (with caching).
    """
    cache_key = f"sample_retail_{api_key or 'default'}"
    if cache_key in _SAMPLE_CACHE:
        return _SAMPLE_CACHE[cache_key]

    try:
        sample_path = ensure_sample_file_exists()
        df = pd.read_csv(sample_path)

        columns = list(df.columns)
        mapping = auto_detect_columns(columns)

        result = process_rfm_data(df, mapping)
        enriched_segments = enrich_segments_with_insights(result["segments"], api_key=api_key)
        preview_rows = df.head(5).fillna("").to_dict(orient="records")

        response = RfmAnalysisResponse(
            kpis=result["kpis"],
            segments=enriched_segments,
            top_customers=result["top_customers"],
            distributions=result["distributions"],
            detected_columns=mapping,
            column_preview=preview_rows
        )
        _SAMPLE_CACHE[cache_key] = response
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sample analysis error: {str(e)}")


@app.get("/api/rfm/sample-saas", response_model=RfmAnalysisResponse)
async def analyze_sample_saas(api_key: Optional[str] = None):
    """
    Instant 1-click endpoint: Loads and analyzes the B2B SaaS subscription dataset.
    """
    try:
        sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
        saas_path = os.path.join(sample_dir, "saas_subscription_sample.csv")
        ensure_sample_file_exists()
        df = pd.read_csv(saas_path)

        columns = list(df.columns)
        mapping = auto_detect_columns(columns)

        result = process_rfm_data(df, mapping)
        enriched_segments = enrich_segments_with_insights(result["segments"], api_key=api_key)
        preview_rows = df.head(5).fillna("").to_dict(orient="records")

        return RfmAnalysisResponse(
            kpis=result["kpis"],
            segments=enriched_segments,
            top_customers=result["top_customers"],
            distributions=result["distributions"],
            detected_columns=mapping,
            column_preview=preview_rows
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SaaS sample analysis error: {str(e)}")


@app.get("/api/rfm/datasets")
async def list_sample_datasets():
    """Returns available sample datasets for download or instant demonstration."""
    return [
        {
            "id": "ecommerce",
            "title": "Global E-Commerce Retail (B2C)",
            "description": "Multi-category shopping transactions covering all 11 customer loyalty and churn segments.",
            "records": 4200,
            "customers": 750,
            "columns": ["CustomerID", "InvoiceID", "InvoiceDate", "Amount", "ProductCategory", "Quantity", "UnitPrice"],
            "download_url": "/api/rfm/sample-csv"
        },
        {
            "id": "saas",
            "title": "B2B Cloud SaaS Subscriptions",
            "description": "Monthly recurring revenue (MRR) billing cycles, tier upgrades, and account usage across 400 accounts.",
            "records": 2800,
            "customers": 400,
            "columns": ["AccountID", "BillingID", "BillingDate", "MRR_Amount", "SubscriptionTier", "AddonUsageSpend"],
            "download_url": "/api/rfm/sample-saas-csv"
        }
    ]


@app.get("/api/rfm/sample-csv")
async def download_sample_csv():
    """Download the Retail E-Commerce CSV dataset."""
    ensure_sample_file_exists()
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
    sample_path = os.path.join(sample_dir, "online_retail_sample.csv")
    return FileResponse(
        sample_path,
        media_type="text/csv",
        filename="ecommerce_retail_rfm_sample.csv"
    )


@app.get("/api/rfm/sample-saas-csv")
async def download_saas_csv():
    """Download the B2B SaaS Subscription CSV dataset."""
    ensure_sample_file_exists()
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
    saas_path = os.path.join(sample_dir, "saas_subscription_sample.csv")
    return FileResponse(
        saas_path,
        media_type="text/csv",
        filename="saas_subscriptions_rfm_sample.csv"
    )


@app.post("/api/rfm/chat", response_model=ChatQueryResponse)
async def chat_rfm(request: ChatQueryRequest):
    """
    Answers business questions using computed RFM context and AI reasoning.
    """
    try:
        return answer_rfm_query(
            question=request.question,
            rfm_context=request.rfm_context,
            api_key=request.api_key,
            llm_provider=request.llm_provider or "gemini"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
