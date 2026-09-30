import time
import os
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
import polars as pl
from app.models import CleaningOptions
from app.engine import apply_cleaning_pipeline, get_empty_column_names, export_dataset
from app.profile import profile_dataset

def test_large_dataset_performance():
    print("==================================================")
    print("Testing SheetForge Pro with 1,000,000 (10 Lakh) Rows")
    print("==================================================")

    # 1. Generate 1,000,000 rows in memory
    print("\n1. Generating 1,000,000 synthetic rows...")
    t0 = time.time()
    n_rows = 1_000_000

    base_df = pl.DataFrame({
        "id": pl.int_range(0, n_rows, eager=True)
    })

    test_df = base_df.with_columns([
        (pl.lit("CUST-") + (pl.col("id") % 800_000).cast(pl.Utf8)).alias("Customer_ID"),
        (pl.lit("  User_") + pl.col("id").cast(pl.Utf8) + pl.lit("   ")).alias("User_Name"),
        pl.lit(None).cast(pl.Utf8).alias("Blank_Col_1"),
        (pl.lit("$") + ((pl.col("id") % 1000) * 1.5).cast(pl.Utf8)).alias("Transaction_Amt"),
        pl.lit(None).cast(pl.Utf8).alias("Blank_Col_2"),
        pl.when(pl.col("id") % 2 == 0).then(pl.lit("Active")).otherwise(pl.lit("Inactive")).alias("Status")
    ]).drop("id")

    gen_time = time.time() - t0
    print(f"Generated 1,000,000 rows x 6 columns in {gen_time:.2f}s")
    print(f"Initial shape: {test_df.shape}")

    # 2. Test profiling
    t0 = time.time()
    profile = profile_dataset(test_df)
    prof_time = time.time() - t0
    print(f"Profiled 1,000,000 rows in {prof_time*1000:.1f}ms")
    print(f"Detected blank columns: {profile['empty_cols']}")
    assert "Blank_Col_1" in profile['empty_cols']
    assert "Blank_Col_2" in profile['empty_cols']
    print(f"Detected duplicate rows: {profile['duplicate_rows']}")

    # 3. Test Bulk Match / Extractor with 5,000 target IDs
    print("\n3. Testing Bulk Extraction with 5,000 IDs...")
    sample_ids = [f"CUST-{i}" for i in range(100, 5100)]
    
    options = CleaningOptions(
        remove_all_blank_columns=True,
        remove_all_blank_rows=True,
        trim_whitespace=True,
        clean_numeric_symbols=True,
        numeric_target_columns=["Transaction_Amt"],
        bulk_match_column="Customer_ID",
        bulk_match_values=sample_ids,
        bulk_match_mode="keep",
        bulk_match_type="exact",
        selected_columns=["Customer_ID", "User_Name", "Transaction_Amt", "Status"],
        sort_columns=["Customer_ID"],
        sort_descending=[False]
    )

    t0 = time.time()
    cleaned = apply_cleaning_pipeline(test_df, options)
    clean_time = time.time() - t0
    print(f"Cleaning & Extraction finished in {clean_time*1000:.1f}ms!")
    print(f"Resulting shape: {cleaned.shape}")
    print("Blank columns successfully removed!")
    assert "Blank_Col_1" not in cleaned.columns
    assert "Blank_Col_2" not in cleaned.columns
    print(f"Top 5 rows:")
    print(cleaned.head(5))

    # 4. Test Export
    test_export_dir = os.path.join(os.path.dirname(__file__), "exports")
    os.makedirs(test_export_dir, exist_ok=True)
    test_export_csv = os.path.join(test_export_dir, "test_export.csv")
    t0 = time.time()
    export_dataset(cleaned, test_export_csv, fmt="csv")
    exp_time = time.time() - t0
    print(f"\nExported {cleaned.height} rows to CSV in {exp_time*1000:.1f}ms")
    assert os.path.exists(test_export_csv)
    print(f"Export file size: {os.path.getsize(test_export_csv) / (1024*1024):.2f} MB")

    print("\n==================================================")
    print("ALL TESTS PASSED! RUST-POWERED ENGINE IS LIGHTNING FAST!")
    print("==================================================")

if __name__ == "__main__":
    test_large_dataset_performance()
