from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class CleaningOptions(BaseModel):
    # Blank Columns & Rows
    remove_all_blank_columns: bool = True
    drop_col_if_any_null: bool = False  # Strict: delete column if even 1 row is blank
    blank_column_threshold_pct: Optional[float] = None  # e.g. 90.0 means remove cols with >= 90% nulls
    
    remove_all_blank_rows: bool = True
    drop_row_if_any_null: bool = False  # Strict: delete row if even 1 column is blank
    drop_rows_with_null_in_cols: Optional[List[str]] = None  # Specific headers where nulls are forbidden
    drop_null_mode: str = "any"  # "any" (drop row if ANY selected head is blank) or "all" (drop row only if ALL selected heads are blank)

    # Deduplication
    remove_duplicates: bool = True  # Enabled by default so repeating names/people are eliminated on export
    dedupe_names_mode: str = "unique_person"  # "unique_person" (First+Last or Full Name), "unique_first_name" (no repeating first names), "all_columns", "custom"
    duplicate_columns: Optional[List[str]] = None  # None = smart auto-detect
    duplicate_keep: str = "first"  # "first" or "last"

    # Text & Whitespace Cleaning
    trim_whitespace: bool = True
    collapse_multiple_spaces: bool = False
    text_casing: Optional[str] = None  # "uppercase", "lowercase", "titlecase", "capitalize", or None
    casing_target_columns: Optional[List[str]] = None  # Specific headers to apply casing to (None = all text columns)
    clean_numeric_symbols: bool = False  # Strip $, ₹, €, commas, %
    numeric_target_columns: Optional[List[str]] = None

    # Missing Value / Null Handling
    fill_nulls_mode: Optional[str] = None  # "empty_str", "custom", "zero", "forward", "backward", "mean", "median"
    fill_nulls_custom_value: Optional[str] = None
    fill_nulls_columns: Optional[List[str]] = None

    # Bulk Extraction / Matching (Long List Filter)
    bulk_match_column: Optional[str] = None
    bulk_match_values: Optional[List[str]] = None
    bulk_match_mode: str = "keep"  # "keep" (extract only matching) or "exclude" (filter out matching)
    bulk_match_type: str = "exact"  # "exact", "case_insensitive", "contains"

    # Column Selection & Renaming
    selected_columns: Optional[List[str]] = None  # Columns to keep (order preserved)
    rename_columns: Optional[Dict[str, str]] = None  # {old_name: new_name}

    # Sorting
    sort_columns: Optional[List[str]] = None
    sort_descending: Optional[List[bool]] = None
    sort_nulls_last: bool = True

    # Conditional Filter Rules
    filter_rules: Optional[List[Dict[str, Any]]] = None  # [{"column": "age", "op": ">", "val": "25"}]

class ProcessPreviewRequest(BaseModel):
    file_id: str
    options: CleaningOptions
    preview_limit: int = 100

class ExportRequest(BaseModel):
    file_id: str
    options: CleaningOptions
    format: str = "csv"  # "csv", "xlsx", "parquet", "tsv", "json"
    delimiter: str = ","

class CategoryDistinctRequest(BaseModel):
    file_id: str
    column: str
    limit: int = 500

class CategoryExportRequest(BaseModel):
    file_id: str
    options: CleaningOptions
    split_column: str
    export_mode: str = "sheets"  # "sheets" (single Excel workbook with separate sheets per category), "zip" (ZIP archive with separate files), "sorted_unified" (single file sorted & grouped by category)
    file_format: str = "xlsx"  # "xlsx", "csv"
    selected_categories: Optional[List[str]] = None
    include_summary_sheet: bool = True
    secondary_sort_column: Optional[str] = None
    secondary_sort_descending: bool = False

