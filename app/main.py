import os
import uuid
import shutil
import time
import re
from typing import Dict, Any, List
import polars as pl
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.models import CleaningOptions, ProcessPreviewRequest, ExportRequest, CategoryDistinctRequest, CategoryExportRequest
from app.engine import load_dataset, apply_cleaning_pipeline, export_dataset, get_column_distinct_values, export_by_category
from app.profile import profile_dataset, format_size, make_serializable_dicts

# Base Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
STATIC_DIR = os.path.join(BASE_DIR, "static")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI(
    title="CleanXcel - 10L+ Row Excel & CSV Cleaner",
    version="3.0.0",
    description="Enterprise-grade high-speed data cleaning, sorting, and extraction engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store file metadata in-memory for fast lookup
FILE_REGISTRY: Dict[str, Dict[str, Any]] = {}

def get_file_info(file_id: str) -> Dict[str, Any]:
    if file_id not in FILE_REGISTRY:
        # Check if file exists on disk with that id
        matching = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
        if matching:
            full_path = os.path.join(UPLOAD_DIR, matching[0])
            FILE_REGISTRY[file_id] = {
                "file_path": full_path,
                "original_name": matching[0].replace(f"{file_id}_", ""),
                "uploaded_at": os.path.getmtime(full_path)
            }
        else:
            raise HTTPException(status_code=404, detail="File ID not found. Please upload again.")
    return FILE_REGISTRY[file_id]

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>CleanXcel is starting up...</h1>"

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": "CleanXcel", "engine": "Polars-Rust-HighSpeed", "capacity": "10L+ rows supported"}

@app.get("/api/download-tool-html")
async def download_tool_html():
    """Serves the standalone HTML tool file directly as a download."""
    standalone_path = os.path.join(STATIC_DIR, "CleanXcel_Tool.html")
    if not os.path.exists(standalone_path):
        standalone_path = os.path.join(STATIC_DIR, "index.html")
    return FileResponse(
        path=standalone_path,
        filename="CleanXcel_Tool.html",
        media_type="text/html"
    )

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Receives and streams large files up to multiple gigabytes directly to disk."""
    try:
        file_id = str(uuid.uuid4())[:8]
        safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
        saved_name = f"{file_id}_{safe_filename}"
        file_path = os.path.join(UPLOAD_DIR, saved_name)

        # Stream write to prevent high RAM consumption
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Register
        FILE_REGISTRY[file_id] = {
            "file_path": file_path,
            "original_name": file.filename,
            "uploaded_at": time.time()
        }

        # Profile the dataset
        t0 = time.time()
        df = load_dataset(file_path)
        profile = profile_dataset(df, file_path)
        profile_duration_ms = round((time.time() - t0) * 1000, 1)

        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "profile_duration_ms": profile_duration_ms,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded file: {str(e)}")

@app.post("/api/upload-drive-url")
async def upload_drive_url(url: str = Form(...)):
    """Downloads a public Google Drive file or Google Sheet directly and streams it to the engine."""
    import urllib.request
    try:
        file_id_match = re.search(r'(?:/d/|id=)([a-zA-Z0-9_-]{25,})', url)
        file_id_str = file_id_match.group(1) if file_id_match else None

        if "spreadsheets" in url and file_id_str:
            download_url = f"https://docs.google.com/spreadsheets/d/{file_id_str}/export?format=csv"
            original_filename = f"drive_sheet_{file_id_str[:6]}.csv"
        elif file_id_str:
            download_url = f"https://drive.google.com/uc?export=download&id={file_id_str}"
            original_filename = f"drive_file_{file_id_str[:6]}.csv"
        else:
            download_url = url
            original_filename = "drive_download.csv"

        reg_file_id = str(uuid.uuid4())[:8]
        file_path = os.path.join(UPLOAD_DIR, f"{reg_file_id}_{original_filename}")

        req = urllib.request.Request(
            download_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        )
        with urllib.request.urlopen(req) as response, open(file_path, "wb") as out_file:
            shutil.copyfileobj(response, out_file)

        FILE_REGISTRY[reg_file_id] = {
            "file_path": file_path,
            "original_name": original_filename,
            "uploaded_at": time.time()
        }

        t0 = time.time()
        df = load_dataset(file_path)
        profile = profile_dataset(df, file_path)
        profile_duration_ms = round((time.time() - t0) * 1000, 1)

        return {
            "success": True,
            "file_id": reg_file_id,
            "filename": original_filename,
            "profile_duration_ms": profile_duration_ms,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch file from Google Drive: {str(e)}")

@app.post("/api/upload-lookup-list")
async def upload_lookup_list(file: UploadFile = File(...)):
    """Uploads a list of keys/IDs to be used for the bulk extraction filter."""
    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
        # Split by comma, tab, or newline
        tokens = [line.strip().strip('"').strip("'") for line in re.split(r'[\r\n,;\t]+', text)]
        values = [t for t in tokens if t]
        # Remove duplicates while preserving order
        seen = set()
        unique_values = []
        for v in values:
            if v not in seen:
                seen.add(v)
                unique_values.append(v)

        return {
            "success": True,
            "filename": file.filename,
            "total_items": len(unique_values),
            "sample_items": unique_values[:10],
            "values": unique_values
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse lookup list: {str(e)}")

@app.post("/api/preview-clean")
async def preview_cleaned_data(req: ProcessPreviewRequest):
    """Executes the cleaning pipeline and returns before/after stats + top preview rows."""
    file_info = get_file_info(req.file_id)
    file_path = file_info["file_path"]

    try:
        t0 = time.time()
        raw_df = load_dataset(file_path)
        initial_rows = raw_df.height
        initial_cols = raw_df.width

        # Apply pipeline
        cleaned_df = apply_cleaning_pipeline(raw_df, req.options)
        exec_duration_ms = round((time.time() - t0) * 1000, 1)

        cleaned_rows = cleaned_df.height
        cleaned_cols = cleaned_df.width

        # Preview rows safely serialized for JSON
        limit = min(req.preview_limit, 500)
        preview_sample = make_serializable_dicts(cleaned_df, limit=limit)

        return {
            "success": True,
            "execution_ms": exec_duration_ms,
            "before": {
                "rows": initial_rows,
                "cols": initial_cols
            },
            "after": {
                "rows": cleaned_rows,
                "cols": cleaned_cols,
                "removed_rows": initial_rows - cleaned_rows,
                "removed_cols": initial_cols - cleaned_cols,
                "columns": cleaned_df.columns
            },
            "preview_rows": preview_sample
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleaning pipeline error: {str(e)}")

@app.post("/api/export")
async def export_cleaned_data(req: ExportRequest):
    """Executes the full cleaning pipeline and saves the result ready for instant download."""
    file_info = get_file_info(req.file_id)
    file_path = file_info["file_path"]

    try:
        t0 = time.time()
        df = load_dataset(file_path)
        df_cleaned = apply_cleaning_pipeline(df, req.options)

        base_name = os.path.splitext(file_info["original_name"])[0]
        fmt = req.format.lower()
        export_filename = f"{base_name}_cleaned_{int(time.time())}.{fmt}"
        export_path = os.path.join(EXPORT_DIR, export_filename)

        export_dataset(df_cleaned, export_path, fmt=fmt, delimiter=req.delimiter)
        duration_ms = round((time.time() - t0) * 1000, 1)

        file_size_bytes = os.path.getsize(export_path)

        return {
            "success": True,
            "filename": export_filename,
            "download_url": f"/api/download/{export_filename}",
            "rows": df_cleaned.height,
            "cols": df_cleaned.width,
            "size": format_size(file_size_bytes),
            "size_bytes": file_size_bytes,
            "duration_ms": duration_ms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.post("/api/column-distinct")
async def get_column_distinct_endpoint(req: CategoryDistinctRequest):
    """Returns top distinct values and counts for a category/country column."""
    file_info = get_file_info(req.file_id)
    file_path = file_info["file_path"]
    try:
        df = load_dataset(file_path)
        distinct_info = get_column_distinct_values(df, req.column, limit=req.limit)
        return {"success": True, **distinct_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate distinct values: {str(e)}")

@app.post("/api/export-by-country")
async def export_by_country_endpoint(req: CategoryExportRequest):
    """Executes full cleaning pipeline, then partitions & exports by country or other category basis."""
    file_info = get_file_info(req.file_id)
    file_path = file_info["file_path"]

    try:
        t0 = time.time()
        raw_df = load_dataset(file_path)
        cleaned_df = apply_cleaning_pipeline(raw_df, req.options)

        base_name = os.path.splitext(file_info["original_name"])[0]

        res = export_by_category(
            df=cleaned_df,
            split_column=req.split_column,
            export_mode=req.export_mode,
            file_format=req.file_format,
            output_dir=EXPORT_DIR,
            base_filename=base_name,
            selected_categories=req.selected_categories,
            include_summary_sheet=req.include_summary_sheet,
            secondary_sort_col=req.secondary_sort_column,
            secondary_sort_desc=req.secondary_sort_descending
        )
        duration_ms = round((time.time() - t0) * 1000, 1)
        file_size_bytes = os.path.getsize(res["path"])

        return {
            "success": True,
            "filename": res["filename"],
            "download_url": f"/api/download/{res['filename']}",
            "mode": res["mode"],
            "rows": res["total_rows"],
            "categories": res["total_categories"],
            "format": res["format"],
            "size": format_size(file_size_bytes),
            "size_bytes": file_size_bytes,
            "duration_ms": duration_ms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Country/Category export failed: {str(e)}")

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Serves the generated export file."""
    safe_name = os.path.basename(filename)
    path = os.path.join(EXPORT_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found or expired.")
    return FileResponse(path, filename=safe_name, media_type="application/octet-stream")

@app.post("/api/generate-demo-data")
async def generate_demo_dataset(rows: int = Form(1000000)):
    """Generates a synthetic 10 lakh+ (1,000,000) row dataset with realistic dirty data for testing."""
    try:
        t0 = time.time()
        file_id = "demo_10lakh"
        filename = f"large_dataset_{rows}_rows.csv"
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{filename}")

        # If already generated with same row count, reuse for instant load
        if not os.path.exists(file_path):
            import random
            print(f"Generating synthetic {rows} rows dataset...")

            # Fast generation using Polars vectorized expressions
            # Creates realistic columns:
            # - Customer_ID (e.g. CUST-10001 to CUST-100000 with duplicates)
            # - First_Name (with trailing/leading whitespace and messy cases)
            # - Email (with nulls)
            # - Blank_Column_1 (100% blank)
            # - Phone_Number
            # - Amount_Spent (formatted as '$1,250.50' or '₹4,500.00' with currency symbols)
            # - Status (Active, Inactive, Pending, null)
            # - Blank_Column_2 (100% blank)
            # - Signup_Date
            # - Notes (with multiple spaces)
            
            # Using Polars native range generation
            base_df = pl.DataFrame({
                "index": pl.int_range(0, rows, eager=True)
            })

            # Create columns efficiently
            # Customer IDs with ~10% duplicates
            cust_ids = [f"CUST-{(i % int(rows * 0.9)) + 10000:06d}" for i in range(min(rows, 100000))]
            first_names = ["  John  ", "EMMA", " alex ", "  Sarah   ", "Michael", "priya ", "  DAVID  ", " Ananya ", "Rahul", "  Lisa"]
            statuses = ["Active", "Inactive", "Pending", "", None, "ACTIVE", "pending"]
            currencies = ["$1,250.00", "₹45,000.50", "$99.99", "€3,400.00", "$500.25", "$12,450.00", " $ 150.00 "]

            df = base_df.with_columns([
                # Customer ID
                (pl.lit("CUST-") + (pl.col("index") % int(rows * 0.85) + 10000).cast(pl.Utf8)).alias("Customer_ID"),
                # Messy Name
                pl.col("index").map_elements(lambda i: first_names[i % len(first_names)], return_dtype=pl.Utf8).alias("Full_Name"),
                # 100% Blank Column 1
                pl.lit(None).cast(pl.Utf8).alias("Empty_Column_Notes"),
                # Email with some nulls
                pl.when(pl.col("index") % 7 == 0).then(None).otherwise(
                    pl.lit("user_") + pl.col("index").cast(pl.Utf8) + pl.lit("@example.com")
                ).alias("Email_Address"),
                # Currency string
                pl.col("index").map_elements(lambda i: currencies[i % len(currencies)], return_dtype=pl.Utf8).alias("Amount_Paid"),
                # 100% Blank Column 2
                pl.lit(None).cast(pl.Utf8).alias("Unused_Legacy_Field"),
                # Status
                pl.col("index").map_elements(lambda i: statuses[i % len(statuses)], return_dtype=pl.Utf8).alias("Account_Status"),
                # City
                pl.when(pl.col("index") % 5 == 0).then(pl.lit("  NEW YORK  "))
                  .when(pl.col("index") % 5 == 1).then(pl.lit("mumbai "))
                  .when(pl.col("index") % 5 == 2).then(pl.lit("london"))
                  .when(pl.col("index") % 5 == 3).then(pl.lit("  TOKYO"))
                  .otherwise(pl.lit("Sydney")).alias("City_Location"),
                # Country / Region
                pl.when(pl.col("index") % 5 == 0).then(pl.lit("United States"))
                  .when(pl.col("index") % 5 == 1).then(pl.lit("India"))
                  .when(pl.col("index") % 5 == 2).then(pl.lit("United Kingdom"))
                  .when(pl.col("index") % 5 == 3).then(pl.lit("Japan"))
                  .otherwise(pl.lit("Australia")).alias("Country_Region"),
                # Date
                pl.lit("2024-05-15").alias("Transaction_Date"),
                # 100% Blank Column 3
                pl.lit("").alias("Blank_Remarks")
            ]).drop("index")

            # Write directly to CSV
            df.write_csv(file_path)

        FILE_REGISTRY[file_id] = {
            "file_path": file_path,
            "original_name": filename,
            "uploaded_at": time.time()
        }

        df = load_dataset(file_path)
        profile = profile_dataset(df, file_path)
        gen_duration_ms = round((time.time() - t0) * 1000, 1)

        return {
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "profile_duration_ms": gen_duration_ms,
            "profile": profile,
            "is_demo": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate demo data: {str(e)}")

# Mount static directory for CSS/JS
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
