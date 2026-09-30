# ⚡ SheetForge Pro - 10L+ Rows Excel & CSV Cleaner & Extractor

An enterprise-grade, ultra-high-speed web application engineered to clean, profile, deduplicate, filter, and extract massive spreadsheets and CSV files with **more than 10 Lakhs+ (1,000,000+) rows** without freezing or crashing your browser.

Powered by **Polars** (written in Rust) and **FastAPI**, with a modern interactive UI.

---

## 🚀 Key Capabilities

1. **Massive Scale Support (10 Lakhs+ / 1,000,000+ Rows)**:
   - Built on Rust-backed columnar engines (**Polars & DuckDB**).
   - Zero browser memory bloat: Large files stream directly to disk and process in-memory in fractions of a second (<1 second for 1M records).

2. **Multi-Format Ingestion**:
   - Supports `.csv`, `.xlsx` (Excel), `.xls`, `.tsv`, `.parquet`, `.json`, and `.txt`.

3. **Blank Columns & Rows Cleansing**:
   - **Auto-Detect & Remove 100% Blank Columns**: Automatically finds columns that contain only nulls or empty whitespace.
   - **Custom Blank Threshold**: Eliminate columns with >= X% blanks (e.g. 90% empty).
   - **Remove 100% Blank Rows**: Discards empty lines.
   - **Drop Rows with Nulls in Essential Fields**: Require specific columns to be populated.

4. **Bulk Match & Extractor (Match Long List of IDs/Keys)**:
   - Provide a long list of 500, 5,000, or 50,000 IDs, Order Numbers, Emails, or Codes (paste directly or upload a `.txt`/`.csv`).
   - Extract **only** the matching records from the 10 Lakh+ dataset in milliseconds.
   - Modes: "Extract & Keep Matches" or "Exclude Matches".
   - Sensitivity: Exact match, case-insensitive, or substring contains.

5. **Column Selector & Renaming**:
   - Pick only the specific required columns to include in your output.
   - Rename headers on the fly.
   - Searchable column checklist with "Select All", "Deselect All", and "Invert".

6. **Text & Whitespace Scrubbing**:
   - Trim leading and trailing spaces (`"  John  "` ➔ `"John"`).
   - Collapse excessive internal whitespace.
   - Case transformation: UPPERCASE, lowercase, Title Case.
   - Currency & Number cleaner: Strips `$`, `₹`, `€`, `£`, commas, and `%` into clean numbers.
   - Missing value imputation: Fill blanks with custom text, zero, forward-fill, mean, or median.

7. **Multi-Column Sorting**:
   - Multi-level sort (Sort by Column A, then Column B, then Column C).
   - Natural numeric ordering (not string order).
   - Option to place nulls at the end.

8. **Live Before vs After Diff & Interactive Preview**:
   - Live before/after stats pill showing row/col reduction and execution speed.
   - Virtualized, searchable preview table displaying top rows.

9. **Fast Multi-Format Export**:
   - Download results in **CSV**, **Excel (.xlsx)**, **Parquet**, **TSV**, or **JSON**.
   - Handles Excel's 1,048,576 row hard limit by automatically segmenting into multiple sheets if necessary.

---

## 🏃 Quick Start

### 1. One-Click Launch (Windows)
Double-click:
```bat
run.bat
```
This automatically launches the server at `http://127.0.0.1:8000` and opens your default browser.

### 2. Manual Start
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## 🧪 Instant 1,000,000 Rows Test
Click the **"⚡ Try 10 Lakh (1M) Rows Sample"** button on the top right of the web interface. It will generate a 1,000,000-row synthetic dataset with realistic messy data (blank columns, messy whitespace, duplicate IDs, mixed casing, currencies) and profile it in under 1 second!
