import polars as pl
import os
import math
import datetime
from typing import Dict, Any, List, Optional
from app.engine import get_empty_column_names

def format_size(bytes_size: int) -> str:
    """Format bytes into KB, MB, GB."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} PB"

def make_serializable_dicts(df: pl.DataFrame, limit: int = 100) -> List[Dict[str, Any]]:
    """Converts the top slice of a DataFrame into JSON-safe dictionaries."""
    sample = df.head(limit)
    raw_rows = sample.to_dicts()
    safe_rows = []

    for r in raw_rows:
        cleaned_r = {}
        for k, v in r.items():
            if isinstance(v, (datetime.date, datetime.datetime, datetime.time)):
                cleaned_r[k] = v.isoformat()
            elif isinstance(v, float):
                if math.isnan(v) or math.isinf(v):
                    cleaned_r[k] = None
                else:
                    cleaned_r[k] = v
            elif hasattr(v, "__str__") and type(v).__module__ not in ("builtins", "typing"):
                # Handle third party or numpy objects
                cleaned_r[k] = str(v)
            else:
                cleaned_r[k] = v
        safe_rows.append(cleaned_r)

    return safe_rows

def profile_dataset(df: pl.DataFrame, file_path: Optional[str] = None) -> Dict[str, Any]:
    """Generates ultra-fast profiling summary of the dataset."""
    total_rows = df.height
    total_cols = df.width
    columns = df.columns
    
    file_size_str = "N/A"
    file_size_bytes = 0
    if file_path and os.path.exists(file_path):
        file_size_bytes = os.path.getsize(file_path)
        file_size_str = format_size(file_size_bytes)
        
    estimated_memory = df.estimated_size()
    estimated_memory_str = format_size(estimated_memory)

    # Empty columns detection
    empty_cols = get_empty_column_names(df)

    # Duplicate rows count
    duplicate_rows_count = 0
    if total_rows > 0 and total_cols > 0:
        try:
            duplicate_rows_count = int(df.is_duplicated().sum())
        except Exception:
            duplicate_rows_count = 0

    # Column-level statistics
    columns_stats = []
    for col in columns:
        series = df[col]
        null_count = series.null_count()
        
        # If string, check for blanks
        if series.dtype in (pl.Utf8, pl.String):
            blank_mask = series.is_null() | (series.str.strip_chars() == "")
            blank_count = int(blank_mask.sum())
        else:
            blank_count = null_count
            
        null_pct = round((blank_count / total_rows * 100.0), 2) if total_rows > 0 else 0.0
        
        # Unique count (fast)
        try:
            n_unique = series.n_unique()
        except Exception:
            n_unique = -1
            
        # Sample non-null values
        samples = []
        try:
            valid_series = series.drop_nulls()
            if series.dtype in (pl.Utf8, pl.String):
                valid_series = valid_series.filter(valid_series.str.strip_chars() != "")
            samples = [str(v) for v in valid_series.head(4).to_list()]
        except Exception:
            samples = []

        columns_stats.append({
            "name": col,
            "dtype": str(series.dtype),
            "null_count": blank_count,
            "null_pct": null_pct,
            "unique_count": n_unique,
            "is_empty": col in empty_cols,
            "samples": samples
        })

    # Top preview rows (up to 100) converted safely for JSON
    preview_rows = make_serializable_dicts(df, limit=100)

    return {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "file_size": file_size_str,
        "file_size_bytes": file_size_bytes,
        "memory_size": estimated_memory_str,
        "empty_cols": empty_cols,
        "duplicate_rows": duplicate_rows_count,
        "columns": columns,
        "columns_stats": columns_stats,
        "preview_rows": preview_rows
    }
