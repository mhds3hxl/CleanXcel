// CleanXcel - Client Application Logic

document.addEventListener("DOMContentLoaded", () => {
    // State Store
    const state = {
        fileId: null,
        filename: null,
        profile: null,
        columns: [],
        columnsStats: [],
        sortRules: [],
        filterRules: [],
        lookupValues: [],
        selectedFormat: "xlsx",
        previewData: [],
        distinctCategories: [],
        activeCountryCol: null
    };

    // Intro Page & Tool Navigation Elements
    const introLandingPage = document.getElementById("intro-landing-page");
    const mainToolPage = document.getElementById("main-tool-page");
    const navBtnHome = document.getElementById("nav-btn-home");
    const navBtnTool = document.getElementById("nav-btn-tool");
    const navBtnLogo = document.getElementById("nav-btn-logo");
    const btnIntroLetsGo = document.getElementById("btn-intro-lets-go");
    const btnIntroLetsGo2 = document.getElementById("btn-intro-lets-go-2");
    const btnIntroDemo = document.getElementById("btn-intro-demo");

    function showIntroPage() {
        if (introLandingPage && mainToolPage) {
            mainToolPage.classList.add("page-hidden");
            mainToolPage.classList.remove("page-visible");
            introLandingPage.classList.remove("page-hidden");
            introLandingPage.classList.add("page-visible");
            if (navBtnHome) {
                navBtnHome.classList.add("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnHome.classList.remove("text-[#828282]");
            }
            if (navBtnTool) {
                navBtnTool.classList.remove("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnTool.classList.add("text-[#828282]");
            }
            refreshIcons();
        }
    }

    function showUploadPage() {
        if (introLandingPage && mainToolPage) {
            introLandingPage.classList.add("page-hidden");
            introLandingPage.classList.remove("page-visible");
            mainToolPage.classList.remove("page-hidden");
            mainToolPage.classList.add("page-visible");

            if (uploadSection) uploadSection.classList.remove("hidden");
            if (workspaceContainer) workspaceContainer.classList.add("hidden");
            if (btnResetSession) {
                btnResetSession.classList.add("hidden");
            }

            if (navBtnTool) {
                navBtnTool.classList.add("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnTool.classList.remove("text-[#828282]");
            }
            if (navBtnHome) {
                navBtnHome.classList.remove("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnHome.classList.add("text-[#828282]");
            }
            refreshIcons();
        }
    }

    function showToolPage() {
        if (introLandingPage && mainToolPage) {
            introLandingPage.classList.add("page-hidden");
            introLandingPage.classList.remove("page-visible");
            mainToolPage.classList.remove("page-hidden");
            mainToolPage.classList.add("page-visible");

            if (state && state.fileId && state.columns && state.columns.length > 0) {
                if (uploadSection) uploadSection.classList.add("hidden");
                if (workspaceContainer) workspaceContainer.classList.remove("hidden");
                if (btnResetSession) {
                    btnResetSession.classList.remove("hidden");
                    btnResetSession.classList.add("flex");
                }
            } else {
                if (uploadSection) uploadSection.classList.remove("hidden");
                if (workspaceContainer) workspaceContainer.classList.add("hidden");
                if (btnResetSession) {
                    btnResetSession.classList.add("hidden");
                }
            }

            if (navBtnTool) {
                navBtnTool.classList.add("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnTool.classList.remove("text-[#828282]");
            }
            if (navBtnHome) {
                navBtnHome.classList.remove("bg-[#0c0d12]", "border-[#019FFD]/40", "text-white");
                navBtnHome.classList.add("text-[#828282]");
            }
            refreshIcons();
        }
    }

    if (navBtnHome) navBtnHome.addEventListener("click", showIntroPage);
    if (navBtnLogo) navBtnLogo.addEventListener("click", showIntroPage);
    if (navBtnTool) {
        navBtnTool.addEventListener("click", () => {
            if (state && state.fileId && state.columns && state.columns.length > 0) {
                showToolPage();
            } else {
                showUploadPage();
            }
        });
    }
    if (btnIntroLetsGo) btnIntroLetsGo.addEventListener("click", showUploadPage);
    if (btnIntroLetsGo2) btnIntroLetsGo2.addEventListener("click", showUploadPage);
    if (btnIntroDemo) {
        btnIntroDemo.addEventListener("click", () => {
            showToolPage();
            if (btnLoadDemo) btnLoadDemo.click();
        });
    }

    // DOM Elements
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const uploadProgressContainer = document.getElementById("upload-progress-container");
    const uploadProgressBar = document.getElementById("upload-progress-bar");
    const uploadPctText = document.getElementById("upload-pct-text");
    const uploadStatusText = document.getElementById("upload-status-text");

    const btnLoadDemo = document.getElementById("btn-load-demo");
    const btnResetSession = document.getElementById("btn-reset-session");
    const processingSpinner = document.getElementById("processing-spinner");
    const spinnerText = document.getElementById("spinner-text");
    const workspaceContainer = document.getElementById("workspace-container");
    const uploadSection = document.getElementById("upload-section");

    // Quick Sort Elements
    const quickSortCol = document.getElementById("quick-sort-col");
    const quickSortOrder = document.getElementById("quick-sort-order");
    const btnApplyQuickSort = document.getElementById("btn-apply-quick-sort");
    const btnQuickSortCountry = document.getElementById("btn-quick-sort-country");

    // Country / Category Basis Export Elements
    const badgeCountryDetected = document.getElementById("badge-country-detected");
    const badgeCountryCountText = document.getElementById("badge-country-count-text");
    const countryColTypeTag = document.getElementById("country-col-type-tag");
    const selCountryBasisCol = document.getElementById("sel-country-basis-col");
    const selCountrySecondarySort = document.getElementById("sel-country-secondary-sort");
    const selCountrySecondaryOrder = document.getElementById("sel-country-secondary-order");
    const chkCountrySummarySheet = document.getElementById("chk-country-summary-sheet");
    const countryModeCards = document.querySelectorAll(".country-mode-card");
    const countryFileFormatPicker = document.getElementById("country-file-format-picker");
    const countryFilterSearch = document.getElementById("country-filter-search");
    const btnCountrySelectAll = document.getElementById("btn-country-select-all");
    const btnCountrySelectNone = document.getElementById("btn-country-select-none");
    const countryFilterCountBadge = document.getElementById("country-filter-count-badge");
    const countryChecklistContainer = document.getElementById("country-checklist-container");
    const btnDownloadCountryExport = document.getElementById("btn-download-country-export");
    const btnCountryExportText = document.getElementById("btn-country-export-text");
    const countryExportResultBox = document.getElementById("country-export-result-box");
    const countryExportResultTitle = document.getElementById("country-export-result-title");
    const countryExportResultMeta = document.getElementById("country-export-result-meta");
    const countryExportDownloadLink = document.getElementById("country-export-download-link");

    // Profile Stat Elements
    const activeFilename = document.getElementById("active-filename");
    const profileTimeBadge = document.getElementById("profile-time-badge");
    const statTotalRows = document.getElementById("stat-total-rows");
    const statTotalCols = document.getElementById("stat-total-cols");
    const statBlankCols = document.getElementById("stat-blank-cols");
    const statDuplicateRows = document.getElementById("stat-duplicate-rows");
    const statMemorySize = document.getElementById("stat-memory-size");
    const statFileSize = document.getElementById("stat-file-size");
    const blankColsAlert = document.getElementById("blank-cols-alert");
    const blankColsCountText = document.getElementById("blank-cols-count-text");
    const blankColsTags = document.getElementById("blank-cols-tags");
    const columnStatsContainer = document.getElementById("column-stats-container");
    const toggleColStatsBtn = document.getElementById("toggle-col-stats-btn");

    // Form / Configuration Controls
    const chkRemoveBlankCols = document.getElementById("chk-remove-blank-cols");
    const chkDropColAnyNull = document.getElementById("chk-drop-col-any-null");
    const chkThresholdCols = document.getElementById("chk-threshold-cols");
    const thresholdSlider = document.getElementById("threshold-slider");
    const thresholdValText = document.getElementById("threshold-val-text");

    const chkRemoveBlankRows = document.getElementById("chk-remove-blank-rows");
    const chkDropRowAnyNull = document.getElementById("chk-drop-row-any-null");
    const btnSelectAllNullHeads = document.getElementById("btn-select-all-null-heads");
    const btnDeselectAllNullHeads = document.getElementById("btn-deselect-all-null-heads");
    const nullHeadsSelectedCount = document.getElementById("null-heads-selected-count");
    const searchNullHeads = document.getElementById("search-null-heads");
    const nullHeadsChecklist = document.getElementById("null-heads-checklist");
    const chkReplaceNullsClean = document.getElementById("chk-replace-nulls-clean");

    const chkRemoveDuplicates = document.getElementById("chk-remove-duplicates");
    const dedupeOptions = document.getElementById("dedupe-options");
    const dedupeKeyCols = document.getElementById("dedupe-key-cols");
    const btnSelectAllDedupeHeads = document.getElementById("btn-select-all-dedupe-heads");
    const btnPresetDedupePeople = document.getElementById("btn-preset-dedupe-people");
    const btnPresetDedupeFirst = document.getElementById("btn-preset-dedupe-first");
    const btnPresetDedupeAll = document.getElementById("btn-preset-dedupe-all");
    const btnQuickDedupeNames = document.getElementById("btn-quick-dedupe-names");

    // Text & Scrubbing
    const chkTrimSpaces = document.getElementById("chk-trim-spaces");
    const chkCollapseSpaces = document.getElementById("chk-collapse-spaces");
    const selTextCasing = document.getElementById("sel-text-casing");
    const chkCleanNumeric = document.getElementById("chk-clean-numeric");
    const selFillNulls = document.getElementById("sel-fill-nulls");
    const inputFillCustom = document.getElementById("input-fill-custom");

    // Bulk Extractor (Crucial)
    const selExtractorCol = document.getElementById("sel-extractor-col");
    const selExtractorType = document.getElementById("sel-extractor-type");
    const lookupValuesText = document.getElementById("lookup-values-text");
    const lookupCountBadge = document.getElementById("lookup-count-badge");
    const btnClearLookup = document.getElementById("btn-clear-lookup");
    const lookupFileInput = document.getElementById("lookup-file-input");
    const lookupFileStatus = document.getElementById("lookup-file-status");
    const lookupFileStatusText = document.getElementById("lookup-file-status-text");

    // Columns Selector
    const filterColsSearch = document.getElementById("filter-cols-search");
    const columnsSelectionTbody = document.getElementById("columns-selection-tbody");
    const btnSelectAllCols = document.getElementById("btn-select-all-cols");
    const btnDeselectAllCols = document.getElementById("btn-deselect-all-cols");
    const btnInvertCols = document.getElementById("btn-invert-cols");

    // Sorting & Rules
    const sortingRulesContainer = document.getElementById("sorting-rules-container");
    const btnAddSortCol = document.getElementById("btn-add-sort-col");
    const chkSortNullsLast = document.getElementById("chk-sort-nulls-last");
    const customFiltersContainer = document.getElementById("custom-filters-container");
    const btnAddFilterRule = document.getElementById("btn-add-filter-rule");

    // Actions & Preview
    const btnApplyPreview = document.getElementById("btn-apply-preview");
    const previewSpeedBadge = document.getElementById("preview-speed-badge");
    const diffRowsBefore = document.getElementById("diff-rows-before");
    const diffRowsAfter = document.getElementById("diff-rows-after");
    const diffRowsPct = document.getElementById("diff-rows-pct");
    const diffColsBefore = document.getElementById("diff-cols-before");
    const diffColsAfter = document.getElementById("diff-cols-after");
    const previewTableHead = document.getElementById("preview-table-head");
    const previewTableBody = document.getElementById("preview-table-body");
    const previewTableSearch = document.getElementById("preview-table-search");
    const previewRowCountText = document.getElementById("preview-row-count-text");

    // Export
    const btnExportDownload = document.getElementById("btn-export-download");
    const exportBtnText = document.getElementById("export-btn-text");
    const exportSuccessBox = document.getElementById("export-success-box");
    const exportSuccessMsg = document.getElementById("export-success-msg");
    const exportDirectLink = document.getElementById("export-direct-link");
    const formatLabels = document.querySelectorAll(".export-format-label");

    // Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Initialize Lucide Icons
    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    refreshIcons();

    // Session State Persistence (Resume where you left off on refresh)
    const SESSION_KEY = "cleanxcel_session_v2";

    function saveSessionState() {
        if (!state.fileId) return;
        try {
            const activeTabBtn = document.querySelector(".tab-btn.active");
            const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "tab-columns";
            
            const sessionData = {
                fileId: state.fileId,
                filename: state.filename || "data.csv",
                columns: state.columns,
                columnsStats: state.columnsStats,
                profile: state.profile,
                previewData: state.previewData,
                activeTab: activeTab,
                sortRules: state.sortRules,
                filterRules: state.filterRules,
                options: collectCleaningOptions("preview"),
                timestamp: Date.now()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        } catch (e) {
            console.warn("Failed to save session state:", e);
        }
    }

    function restoreSessionState() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return false;
            const session = JSON.parse(raw);
            if (!session || !session.fileId || !session.columns || session.columns.length === 0) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }

            // Session expires after 24 hours
            if (Date.now() - (session.timestamp || 0) > 24 * 3600 * 1000) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }

            state.fileId = session.fileId;
            state.filename = session.filename || "data.csv";
            state.columns = session.columns || [];
            state.columnsStats = session.columnsStats || [];
            state.profile = session.profile || {};
            state.previewData = session.previewData || [];
            if (session.sortRules) state.sortRules = session.sortRules;
            if (session.filterRules) state.filterRules = session.filterRules;

            // Show tool page and workspace
            showToolPage();
            uploadSection.classList.add("hidden");
            workspaceContainer.classList.remove("hidden");
            btnResetSession.classList.remove("hidden");
            btnResetSession.classList.add("flex");

            // Populate UI with stored profile
            updateProfileUI({
                filename: state.filename,
                profile_duration_ms: session.profile.profile_duration_ms || 120,
                profile: session.profile
            });

            // Restore saved options UI
            if (session.options) {
                if (session.options.selected_columns) {
                    const selSet = new Set(session.options.selected_columns);
                    document.querySelectorAll(".col-include-chk").forEach(chk => {
                        chk.checked = selSet.has(chk.getAttribute("data-col"));
                    });
                }
                if (session.options.rename_columns) {
                    document.querySelectorAll(".col-rename-input").forEach(inp => {
                        const orig = inp.getAttribute("data-original");
                        if (session.options.rename_columns[orig]) {
                            inp.value = session.options.rename_columns[orig];
                        }
                    });
                }
                populateDropdowns();

                if (session.options.text_casing) {
                    selTextCasing.value = session.options.text_casing;
                }
                if (session.options.casing_target_columns) {
                    const casingSet = new Set(session.options.casing_target_columns);
                    document.querySelectorAll(".casing-head-chk").forEach(chk => {
                        chk.checked = casingSet.has(chk.value);
                    });
                    updateCasingHeadsCount();
                }
            }

            // Restore preview table
            if (session.previewData && session.previewData.length > 0) {
                renderPreviewTable(session.previewData, getSelectedColumns());
            }

            // Restore active tab
            if (session.activeTab) {
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${session.activeTab}"]`);
                if (tabBtn) tabBtn.click();
            }

            return true;
        } catch (e) {
            console.warn("Failed to restore session state:", e);
            return false;
        }
    }

    // Setup Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.add("hidden"));

            btn.classList.add("active");
            const targetEl = document.getElementById(targetTab);
            if (targetEl) targetEl.classList.remove("hidden");
            refreshIcons();
            saveSessionState();
        });
    });

    // Format selection pills with white subheadings on active pill
    function updateFormatLabels() {
        formatLabels.forEach(label => {
            const fmt = label.getAttribute("data-fmt");
            const subSpan = label.querySelector("span.text-\\[10px\\]");
            if (fmt === state.selectedFormat) {
                label.classList.add("btn-primary-gradient", "text-white", "border-transparent", "shadow-lg");
                label.classList.remove("bg-[#040404]", "border-[#1a1b26]", "text-gray-400");
                if (subSpan) {
                    subSpan.classList.add("text-white/90");
                    subSpan.classList.remove("text-[#828282]");
                }
            } else {
                label.classList.remove("btn-primary-gradient", "text-white", "border-transparent", "shadow-lg");
                label.classList.add("bg-[#040404]", "border-[#1a1b26]", "text-gray-400");
                if (subSpan) {
                    subSpan.classList.add("text-[#828282]");
                    subSpan.classList.remove("text-white/90");
                }
            }
        });
    }

    updateFormatLabels();

    formatLabels.forEach(label => {
        label.addEventListener("click", () => {
            const fmt = label.getAttribute("data-fmt");
            state.selectedFormat = fmt;
            updateFormatLabels();

            if (exportBtnText) {
                if (fmt === "xlsx") {
                    exportBtnText.textContent = "Download Single Excel File (.xlsx)";
                } else if (fmt === "csv") {
                    exportBtnText.textContent = "Download CSV File";
                } else if (fmt === "parquet") {
                    exportBtnText.textContent = "Download Parquet File";
                } else if (fmt === "html") {
                    exportBtnText.textContent = "Download HTML Report (.html)";
                } else {
                    exportBtnText.textContent = `Download ${fmt.toUpperCase()} File`;
                }
            }
        });
    });

    // Slider listener
    thresholdSlider.addEventListener("input", (e) => {
        thresholdValText.textContent = `${e.target.value}%`;
    });

    // Dedupe checkbox toggle
    chkRemoveDuplicates.addEventListener("change", (e) => {
        if (e.target.checked) {
            dedupeOptions.classList.remove("hidden");
        } else {
            dedupeOptions.classList.add("hidden");
        }
    });

    // Fill nulls dropdown
    selFillNulls.addEventListener("change", (e) => {
        if (e.target.value === "custom") {
            inputFillCustom.classList.remove("hidden");
        } else {
            inputFillCustom.classList.add("hidden");
        }
    });

    // Toggle Column Stats
    toggleColStatsBtn.addEventListener("click", () => {
        columnStatsContainer.classList.toggle("hidden");
        refreshIcons();
    });

    // Clear Lookup values
    btnClearLookup.addEventListener("click", () => {
        lookupValuesText.value = "";
        state.lookupValues = [];
        lookupCountBadge.textContent = "0 items detected";
        lookupFileStatus.classList.add("hidden");
    });

    // Lookup Textarea parsing on input
    lookupValuesText.addEventListener("input", () => {
        const lines = lookupValuesText.value.split(/[\r\n,;\t]+/).map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        state.lookupValues = Array.from(new Set(lines));
        lookupCountBadge.textContent = `${state.lookupValues.length.toLocaleString()} items detected`;
    });

    // Lookup File Upload
    lookupFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            lookupFileStatus.classList.remove("hidden");
            lookupFileStatusText.textContent = "Parsing lookup list...";

            const res = await fetch("/api/upload-lookup-list", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                state.lookupValues = data.values;
                lookupValuesText.value = data.values.slice(0, 1000).join("\n") + (data.values.length > 1000 ? `\n... (+${data.values.length - 1000} more items)` : "");
                lookupCountBadge.textContent = `${data.values.length.toLocaleString()} items loaded`;
                lookupFileStatusText.textContent = `Loaded ${data.values.length.toLocaleString()} unique items from ${file.name}`;
            } else {
                alert("Error: " + (data.detail || "Failed to parse lookup file"));
            }
        } catch (err) {
            alert("Upload failed: " + err.message);
        }
    });

    // Drag and Drop
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-indigo-500", "bg-indigo-500/5");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("border-indigo-500", "bg-indigo-500/5");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-indigo-500", "bg-indigo-500/5");
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Upload Options Handlers (Computer vs Google Drive)
    const btnUploadComputer = document.getElementById("btn-upload-computer");
    const btnUploadDrive = document.getElementById("btn-upload-drive");
    const driveModal = document.getElementById("drive-modal");
    const btnCloseDriveModal = document.getElementById("btn-close-drive-modal");
    const btnCancelDrive = document.getElementById("btn-cancel-drive");
    const btnSubmitDrive = document.getElementById("btn-submit-drive");
    const driveUrlInput = document.getElementById("drive-url-input");

    if (btnUploadComputer) {
        btnUploadComputer.addEventListener("click", (e) => {
            e.stopPropagation();
            if (fileInput) fileInput.click();
        });
    }

    if (btnUploadDrive) {
        btnUploadDrive.addEventListener("click", (e) => {
            e.stopPropagation();
            if (driveModal) {
                driveModal.classList.remove("hidden");
                refreshIcons();
            }
        });
    }

    function closeDriveModal() {
        if (driveModal) driveModal.classList.add("hidden");
    }

    if (btnCloseDriveModal) btnCloseDriveModal.addEventListener("click", closeDriveModal);
    if (btnCancelDrive) btnCancelDrive.addEventListener("click", closeDriveModal);

    if (btnSubmitDrive) {
        btnSubmitDrive.addEventListener("click", async () => {
            const url = driveUrlInput ? driveUrlInput.value.trim() : "";
            if (!url) {
                alert("Please enter a valid Google Drive URL or share link.");
                return;
            }

            closeDriveModal();
            showSpinner("☁️ Fetching and streaming file from Google Drive to CleanXcel engine...");

            try {
                const formData = new FormData();
                formData.append("url", url);

                const res = await fetch("/api/upload-drive-url", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                hideSpinner();

                if (data.success) {
                    initWorkspace(data);
                } else {
                    alert("Google Drive import error: " + (data.detail || "Failed to download file"));
                }
            } catch (err) {
                hideSpinner();
                alert("Failed to import from Google Drive: " + err.message);
            }
        });
    }

    // File Upload Handler (XHR with Progress)
    function handleFileUpload(file) {
        const formData = new FormData();
        formData.append("file", file);

        uploadProgressContainer.classList.remove("hidden");
        uploadProgressBar.style.width = "0%";
        uploadPctText.textContent = "0%";
        uploadStatusText.textContent = `Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                uploadProgressBar.style.width = `${pct}%`;
                uploadPctText.textContent = `${pct}%`;
                if (pct >= 100) {
                    uploadStatusText.textContent = "Streaming complete. Analyzing with Polars engine...";
                }
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.success) {
                        initWorkspace(res);
                    } else {
                        alert("Upload error: " + (res.detail || "Processing failed"));
                    }
                } catch(e) {
                    alert("Error parsing server response: " + e.message);
                }
            } else {
                let msg = "Upload failed (Status " + xhr.status + ")";
                try {
                    const err = JSON.parse(xhr.responseText);
                    if (err.detail) msg += ": " + err.detail;
                } catch(e) {
                    if (xhr.responseText) msg += ": " + xhr.responseText.substring(0, 150);
                }
                alert(msg);
            }
            uploadProgressContainer.classList.add("hidden");
        };

        xhr.onerror = () => {
            alert("Network error during upload.");
            uploadProgressContainer.classList.add("hidden");
        };

        xhr.send(formData);
    }

    // Try 10 Lakh (1M) Rows Sample Dataset
    btnLoadDemo.addEventListener("click", async () => {
        try {
            showSpinner("⚡ Generating 10 Lakh (1,000,000) Rows test dataset with realistic messy data...");
            const formData = new FormData();
            formData.append("rows", "1000000");

            const res = await fetch("/api/generate-demo-data", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            hideSpinner();

            if (data.success) {
                initWorkspace(data);
            } else {
                alert("Error: " + (data.detail || "Demo generation failed"));
            }
        } catch (err) {
            hideSpinner();
            alert("Failed to load demo: " + err.message);
        }
    });

    // Reset Session & Upload New File Handlers
    const btnWorkspaceUploadNew = document.getElementById("btn-workspace-upload-new");

    function resetAndShowUpload(triggerFileInput = false) {
        localStorage.removeItem(SESSION_KEY);
        workspaceContainer.classList.add("hidden");
        uploadSection.classList.remove("hidden");
        btnResetSession.classList.add("hidden");
        if (fileInput) fileInput.value = "";
        state.fileId = null;
        state.lookupValues = [];
        if (lookupValuesText) lookupValuesText.value = "";
        if (triggerFileInput && fileInput) {
            fileInput.click();
        }
    }

    if (btnWorkspaceUploadNew) {
        btnWorkspaceUploadNew.addEventListener("click", () => {
            resetAndShowUpload(true);
        });
    }

    btnResetSession.addEventListener("click", () => {
        if (confirm("Clear current session and load a new file?")) {
            resetAndShowUpload(true);
        }
    });

    function showSpinner(text) {
        spinnerText.textContent = text || "Processing...";
        processingSpinner.classList.remove("hidden");
    }

    function hideSpinner() {
        processingSpinner.classList.add("hidden");
    }

    // Initialize Workspace with Profiling Data
    function initWorkspace(data) {
        showToolPage();
        state.fileId = data.file_id;
        state.filename = data.filename;
        state.profile = data.profile;
        state.columns = data.profile.columns || [];
        state.columnsStats = data.profile.columns_stats || [];

        // UI transitions
        uploadSection.classList.add("hidden");
        workspaceContainer.classList.remove("hidden");
        btnResetSession.classList.remove("hidden");
        btnResetSession.classList.add("flex");

        // Set active tab to 1st header (Columns & Renaming)
        const firstTabBtn = document.querySelector('.tab-btn[data-tab="tab-columns"]');
        if (firstTabBtn) {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.add("hidden"));
            firstTabBtn.classList.add("active");
            const targetEl = document.getElementById("tab-columns");
            if (targetEl) targetEl.classList.remove("hidden");
        }

        // Set Headers & Stats
        if (activeFilename) activeFilename.textContent = data.filename;
        if (profileTimeBadge) profileTimeBadge.textContent = `Profiled in ${data.profile_duration_ms} ms with Rust-Speed`;
        if (statTotalRows) statTotalRows.textContent = (data.profile.total_rows || 0).toLocaleString();
        if (statTotalCols) statTotalCols.textContent = (data.profile.total_cols || 0).toLocaleString();
        if (statBlankCols) statBlankCols.textContent = (data.profile.empty_cols ? data.profile.empty_cols.length : 0).toLocaleString();
        if (statDuplicateRows) statDuplicateRows.textContent = (data.profile.duplicate_rows || 0).toLocaleString();
        if (statMemorySize) statMemorySize.textContent = data.profile.memory_size || "0 MB";
        if (statFileSize) statFileSize.textContent = data.profile.file_size || "0 MB";

        // Blank Columns Alert & Tags
        const emptyCols = data.profile.empty_cols || [];
        if (blankColsAlert) {
            if (emptyCols.length > 0) {
                blankColsAlert.classList.remove("hidden");
                if (blankColsCountText) blankColsCountText.textContent = `${emptyCols.length} 100% Blank Column${emptyCols.length > 1 ? 's' : ''} Found`;
                if (blankColsTags) {
                    blankColsTags.innerHTML = emptyCols.map(col => `
                        <span class="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                            ${col} (Empty)
                        </span>
                    `).join("");
                }
            } else {
                if (blankColsCountText) blankColsCountText.textContent = "0 Blank Columns Detected";
                if (blankColsTags) blankColsTags.innerHTML = `<span class="text-gray-500 italic">No 100% blank columns detected</span>`;
            }
        }

        // Populate Column Stats Breakdown
        renderColumnStats(state.columnsStats);

        // Populate Selectors
        populateDropdowns();

        // Ensure name deduplication is enabled by default to prevent repeating names/people
        if (chkRemoveDuplicates) chkRemoveDuplicates.checked = true;
        const quickDedupeMode = document.getElementById("quick-dedupe-mode");
        if (quickDedupeMode) quickDedupeMode.value = "unique_person";
        const chkCountryDedupe = document.getElementById("chk-country-dedupe-names");
        if (chkCountryDedupe) chkCountryDedupe.checked = true;
        const chkStandardDedupe = document.getElementById("chk-standard-dedupe-names");
        if (chkStandardDedupe) chkStandardDedupe.checked = true;

        // Populate Column Selection Table
        renderColumnsTable();

        // Set Initial Preview
        renderInitialPreview(data.profile.preview_rows, state.columns);

        // Pre-configure initial diff pill
        if (diffRowsBefore) diffRowsBefore.textContent = (data.profile.total_rows || 0).toLocaleString();
        if (diffRowsAfter) diffRowsAfter.textContent = (data.profile.total_rows || 0).toLocaleString();
        if (diffColsBefore) diffColsBefore.textContent = (data.profile.total_cols || 0).toLocaleString();
        if (diffColsAfter) diffColsAfter.textContent = (data.profile.total_cols || 0).toLocaleString();

        refreshIcons();
    }

    // Render Column Stats Cards
    function renderColumnStats(stats) {
        columnStatsContainer.innerHTML = stats.map(s => `
            <div class="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800 text-xs">
                <div class="flex items-center justify-between">
                    <span class="font-medium text-white truncate max-w-[140px] font-mono" title="${s.name}">${s.name}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">${s.dtype}</span>
                </div>
                <div class="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Nulls / Blanks:</span>
                    <span class="${s.null_pct > 0 ? (s.null_pct > 50 ? 'text-rose-400 font-bold' : 'text-amber-400') : 'text-emerald-400'}">
                        ${s.null_pct}% (${s.null_count.toLocaleString()})
                    </span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div class="${s.null_pct > 50 ? 'bg-rose-500' : 'bg-indigo-500'} h-1" style="width: ${Math.min(s.null_pct, 100)}%"></div>
                </div>
            </div>
        `).join("");
    }

    // Helper: Get currently checked columns from Tab 1 (Columns & Renaming)
    function getSelectedColumns() {
        const selected = [];
        const chks = document.querySelectorAll(".col-include-chk");
        if (chks.length === 0) return state.columns;
        chks.forEach(chk => {
            if (chk.checked) {
                selected.push(chk.getAttribute("data-col"));
            }
        });
        return selected.length > 0 ? selected : state.columns;
    }

    // Populate dropdowns and checklists across all tabs using ONLY selected headers
    function populateDropdowns() {
        const cols = getSelectedColumns();
        const optionsHtml = cols.map(c => `<option value="${c}">${c}</option>`).join("");

        dedupeKeyCols.innerHTML = optionsHtml;
        selExtractorCol.innerHTML = optionsHtml;
        if (quickSortCol) {
            quickSortCol.innerHTML = `<option value="">Default / Original File Order (No Sorting)</option>` + optionsHtml;
        }

        // Auto-select smart extractor column if customer_id, id, email exists
        const smartCol = cols.find(c => /id|email|code|sku|phone/i.test(c));
        if (smartCol) selExtractorCol.value = smartCol;

        // Populate Null Heads Checklist (with Select All Heads Together)
        populateNullHeadsChecklist();
        populateCasingHeadsChecklist();
        setupDedupePresets();
        setupCountryBasisSection();
    }

    const btnSelectAllCasingHeads = document.getElementById("btn-select-all-casing-heads");
    const btnDeselectAllCasingHeads = document.getElementById("btn-deselect-all-casing-heads");
    const casingHeadsSelectedCount = document.getElementById("casing-heads-selected-count");
    const casingHeadsChecklist = document.getElementById("casing-heads-checklist");

    function updateCasingHeadsCount() {
        if (!casingHeadsSelectedCount) return;
        const total = getSelectedColumns().length;
        const selected = document.querySelectorAll(".casing-head-chk:checked").length;
        casingHeadsSelectedCount.textContent = `${selected} of ${total} selected`;
    }

    function populateCasingHeadsChecklist() {
        if (!casingHeadsChecklist) return;
        const cols = getSelectedColumns();

        const existingCheckboxes = Array.from(document.querySelectorAll(".casing-head-chk"));
        const existingMap = new Map(existingCheckboxes.map(cb => [cb.value, cb.checked]));
        const hasExisting = existingCheckboxes.length > 0;

        casingHeadsChecklist.innerHTML = cols.map(col => {
            const isChecked = hasExisting && existingMap.has(col) ? existingMap.get(col) : true;
            return `
                <label class="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-[#1a1b26]/50 transition-colors border border-transparent hover:border-[#1a1b26]">
                    <input type="checkbox" class="casing-head-chk w-3.5 h-3.5 rounded text-[#019FFD] bg-[#040404] border-[#1a1b26]" value="${col}" ${isChecked ? 'checked' : ''}>
                    <span class="truncate text-white" title="${col}">${col}</span>
                </label>
            `;
        }).join("");

        document.querySelectorAll(".casing-head-chk").forEach(chk => {
            chk.addEventListener("change", updateCasingHeadsCount);
        });

        updateCasingHeadsCount();
    }

    if (btnSelectAllCasingHeads) {
        btnSelectAllCasingHeads.addEventListener("click", () => {
            document.querySelectorAll(".casing-head-chk").forEach(chk => chk.checked = true);
            updateCasingHeadsCount();
        });
    }

    if (btnDeselectAllCasingHeads) {
        btnDeselectAllCasingHeads.addEventListener("click", () => {
            document.querySelectorAll(".casing-head-chk").forEach(chk => chk.checked = false);
            updateCasingHeadsCount();
        });
    }

    if (btnApplyQuickSort) {
        btnApplyQuickSort.addEventListener("click", () => {
            const col = (quickSortCol && quickSortCol.value) ? quickSortCol.value : "";
            if (!col) {
                state.sortRules = [];
            } else {
                const isDesc = (quickSortOrder && quickSortOrder.value === "desc");
                const rules = [{ column: col, descending: isDesc }];
                // If sorting by First Name and Last Name exists, add Last Name as secondary sort
                const lastNameCol = state.columns.find(c => /last\s*name/i.test(c));
                if (/first\s*name/i.test(col) && lastNameCol && lastNameCol !== col) {
                    rules.push({ column: lastNameCol, descending: isDesc });
                }
                state.sortRules = rules;
            }
            renderSortRules();
            btnApplyPreview.click();
        });
    }

    function setupDedupePresets() {
        function triggerDedupe(matcher) {
            chkRemoveDuplicates.checked = true;
            dedupeOptions.classList.remove("hidden");
            let found = false;
            Array.from(dedupeKeyCols.options).forEach(opt => {
                const isMatch = matcher(opt.value.toLowerCase());
                opt.selected = isMatch;
                if (isMatch) found = true;
            });
            if (!found && dedupeKeyCols.options.length > 0) {
                dedupeKeyCols.options[0].selected = true;
            }
            btnApplyPreview.click();
        }

        if (btnPresetDedupePeople) {
            btnPresetDedupePeople.onclick = () => {
                triggerDedupe(val => val.includes("first name") || val.includes("last name") || val === "full name" || val === "name");
            };
        }

        if (btnPresetDedupeFirst) {
            btnPresetDedupeFirst.onclick = () => {
                triggerDedupe(val => val.includes("first name") || val === "first" || val === "name");
            };
        }

        if (btnPresetDedupeAll) {
            btnPresetDedupeAll.onclick = () => {
                chkRemoveDuplicates.checked = true;
                dedupeOptions.classList.remove("hidden");
                Array.from(dedupeKeyCols.options).forEach(opt => opt.selected = false);
                btnApplyPreview.click();
            };
        }

        if (btnQuickDedupeNames) {
            btnQuickDedupeNames.onclick = () => {
                const quickDedupeMode = document.getElementById("quick-dedupe-mode");
                const mode = quickDedupeMode ? quickDedupeMode.value : "unique_person";

                const chkCountryDedupe = document.getElementById("chk-country-dedupe-names");
                const chkStandardDedupe = document.getElementById("chk-standard-dedupe-names");
                if (chkCountryDedupe) chkCountryDedupe.checked = (mode !== "none");
                if (chkStandardDedupe) chkStandardDedupe.checked = (mode !== "none");

                if (mode !== "none") {
                    const countryRadios = document.querySelectorAll('input[name="country_dedupe_type"]');
                    countryRadios.forEach(r => { if (r.value === mode) r.checked = true; });
                    const standardRadios = document.querySelectorAll('input[name="standard_dedupe_type"]');
                    standardRadios.forEach(r => { if (r.value === mode) r.checked = true; });
                    chkRemoveDuplicates.checked = true;
                } else {
                    chkRemoveDuplicates.checked = false;
                }
                btnApplyPreview.click();
            };
        }

        const quickDedupeMode = document.getElementById("quick-dedupe-mode");
        if (quickDedupeMode) {
            quickDedupeMode.addEventListener("change", () => {
                if (btnQuickDedupeNames) btnQuickDedupeNames.click();
            });
        }
    }

    function populateNullHeadsChecklist() {
        if (!nullHeadsChecklist) return;

        const cols = getSelectedColumns();

        nullHeadsChecklist.innerHTML = cols.map(col => `
            <label class="null-head-item flex items-center space-x-1.5 p-1 rounded hover:bg-gray-800 cursor-pointer" data-col="${col}">
                <input type="checkbox" class="null-head-chk w-3.5 h-3.5 rounded text-indigo-600 bg-gray-800 border-gray-700" value="${col}">
                <span class="truncate text-[11px] text-gray-300 font-mono" title="${col}">${col}</span>
            </label>
        `).join("");

        updateNullHeadsCount();

        document.querySelectorAll(".null-head-chk").forEach(chk => {
            chk.addEventListener("change", updateNullHeadsCount);
        });
    }

    function updateNullHeadsCount() {
        if (!nullHeadsSelectedCount) return;
        const total = getSelectedColumns().length;
        const selected = document.querySelectorAll(".null-head-chk:checked").length;
        nullHeadsSelectedCount.textContent = `${selected} of ${total} heads selected`;
    }

    // Select All Heads Together button handler
    if (btnSelectAllNullHeads) {
        btnSelectAllNullHeads.addEventListener("click", () => {
            document.querySelectorAll(".null-head-chk").forEach(chk => {
                const item = chk.closest(".null-head-item");
                if (item && item.style.display !== "none") {
                    chk.checked = true;
                }
            });
            updateNullHeadsCount();
        });
    }

    // Deselect All Heads button handler
    if (btnDeselectAllNullHeads) {
        btnDeselectAllNullHeads.addEventListener("click", () => {
            document.querySelectorAll(".null-head-chk").forEach(chk => chk.checked = false);
            updateNullHeadsCount();
        });
    }

    // Search null heads filter input
    if (searchNullHeads) {
        searchNullHeads.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll(".null-head-item").forEach(item => {
                const col = item.getAttribute("data-col").toLowerCase();
                item.style.display = col.includes(term) ? "flex" : "none";
            });
        });
    }

    // Select all dedupe heads
    if (btnSelectAllDedupeHeads) {
        btnSelectAllDedupeHeads.addEventListener("click", () => {
            Array.from(dedupeKeyCols.options).forEach(opt => opt.selected = true);
        });
    }

    // Render Column Selection Table
    function renderColumnsTable() {
        const emptyColsSet = new Set(state.profile.empty_cols || []);

        columnsSelectionTbody.innerHTML = state.columns.map((col, idx) => {
            const isBlank = emptyColsSet.has(col);
            const stat = state.columnsStats.find(s => s.name === col);
            const dtype = stat ? stat.dtype : "String";

            return `
                <tr class="hover:bg-gray-800/40 col-row transition-colors" data-col="${col}">
                    <td class="p-3 text-center">
                        <input type="checkbox" class="col-include-chk w-4 h-4 rounded text-indigo-600 bg-gray-800 border-gray-700" 
                            data-col="${col}" ${isBlank ? '' : 'checked'}>
                    </td>
                    <td class="p-3 font-mono font-medium text-white flex items-center space-x-2">
                        <span>${col}</span>
                        ${isBlank ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">Blank</span>' : ''}
                    </td>
                    <td class="p-3 text-gray-400 font-mono">${dtype}</td>
                    <td class="p-3">
                        <input type="text" class="col-rename-input w-full max-w-xs bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600" 
                            data-original="${col}" placeholder="${col}">
                    </td>
                </tr>
            `;
        }).join("");

        // Attach listener to update dynamic dropdowns whenever header checkboxes change
        document.querySelectorAll(".col-include-chk").forEach(chk => {
            chk.addEventListener("change", () => {
                populateDropdowns();
            });
        });
    }

    // Column Filter Search
    filterColsSearch.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll(".col-row").forEach(row => {
            const colName = row.getAttribute("data-col").toLowerCase();
            row.style.display = colName.includes(term) ? "" : "none";
        });
    });

    // Column Buttons
    btnSelectAllCols.addEventListener("click", () => {
        document.querySelectorAll(".col-include-chk").forEach(chk => chk.checked = true);
        populateDropdowns();
    });
    btnDeselectAllCols.addEventListener("click", () => {
        document.querySelectorAll(".col-include-chk").forEach(chk => chk.checked = false);
        populateDropdowns();
    });
    btnInvertCols.addEventListener("click", () => {
        document.querySelectorAll(".col-include-chk").forEach(chk => chk.checked = !chk.checked);
        populateDropdowns();
    });

    // Sorting Rules Builder
    function renderSortRules() {
        const cols = getSelectedColumns();
        if (state.sortRules.length === 0) {
            sortingRulesContainer.innerHTML = `<p class="text-xs text-gray-500 italic p-3 rounded-lg bg-gray-900/60 border border-gray-800">No sorting applied. Output will maintain original file sequence.</p>`;
            return;
        }

        sortingRulesContainer.innerHTML = state.sortRules.map((rule, idx) => `
            <div class="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                <span class="text-xs font-mono text-gray-400 w-16">Level ${idx + 1}:</span>
                <select class="sort-col-sel bg-gray-800 border border-gray-700 rounded-lg p-1.5 text-xs text-white flex-1" data-idx="${idx}">
                    ${cols.map(c => `<option value="${c}" ${c === rule.column ? 'selected' : ''}>${c}</option>`).join("")}
                </select>
                <select class="sort-order-sel bg-gray-800 border border-gray-700 rounded-lg p-1.5 text-xs text-white" data-idx="${idx}">
                    <option value="asc" ${!rule.descending ? 'selected' : ''}>Ascending (A ➔ Z / 0 ➔ 9)</option>
                    <option value="desc" ${rule.descending ? 'selected' : ''}>Descending (Z ➔ A / 9 ➔ 0)</option>
                </select>
                <button class="btn-remove-sort p-1.5 text-rose-400 hover:text-rose-300" data-idx="${idx}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join("");

        // Attach listeners
        document.querySelectorAll(".sort-col-sel").forEach(sel => {
            sel.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-idx"));
                state.sortRules[idx].column = e.target.value;
                saveSessionState();
            });
        });
        document.querySelectorAll(".sort-order-sel").forEach(sel => {
            sel.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-idx"));
                state.sortRules[idx].descending = (e.target.value === "desc");
                saveSessionState();
            });
        });
        document.querySelectorAll(".btn-remove-sort").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(btn.getAttribute("data-idx"));
                state.sortRules.splice(idx, 1);
                renderSortRules();
                saveSessionState();
            });
        });

        refreshIcons();
    }

    btnAddSortCol.addEventListener("click", () => {
        const cols = getSelectedColumns();
        if (cols.length === 0) return;
        state.sortRules.push({
            column: cols[0],
            descending: false
        });
        renderSortRules();
        saveSessionState();
    });

    // Custom Filters Builder
    function renderCustomFilters() {
        const cols = getSelectedColumns();
        if (state.filterRules.length === 0) {
            customFiltersContainer.innerHTML = `<p class="text-xs text-gray-500 italic p-3 rounded-lg bg-gray-900/60 border border-gray-800">No conditional rules added. All non-blank rows will pass through.</p>`;
            return;
        }

        customFiltersContainer.innerHTML = state.filterRules.map((rule, idx) => `
            <div class="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
                <span class="font-mono text-gray-400 w-12">Rule ${idx + 1}:</span>
                <select class="filter-col-sel bg-gray-800 border border-gray-700 rounded-lg p-1.5 text-white" data-idx="${idx}">
                    ${cols.map(c => `<option value="${c}" ${c === rule.column ? 'selected' : ''}>${c}</option>`).join("")}
                </select>
                <select class="filter-op-sel bg-gray-800 border border-gray-700 rounded-lg p-1.5 text-white" data-idx="${idx}">
                    <option value="=" ${rule.op === '=' ? 'selected' : ''}>Equals (=)</option>
                    <option value="!=" ${rule.op === '!=' ? 'selected' : ''}>Not Equals (!=)</option>
                    <option value=">" ${rule.op === '>' ? 'selected' : ''}>Greater Than (&gt;)</option>
                    <option value=">=" ${rule.op === '>=' ? 'selected' : ''}>Greater or Equal (&ge;)</option>
                    <option value="<" ${rule.op === '<' ? 'selected' : ''}>Less Than (&lt;)</option>
                    <option value="<=" ${rule.op === '<=' ? 'selected' : ''}>Less or Equal (&le;)</option>
                    <option value="contains" ${rule.op === 'contains' ? 'selected' : ''}>Contains Text</option>
                    <option value="starts_with" ${rule.op === 'starts_with' ? 'selected' : ''}>Starts With</option>
                    <option value="ends_with" ${rule.op === 'ends_with' ? 'selected' : ''}>Ends With</option>
                    <option value="is_null" ${rule.op === 'is_null' ? 'selected' : ''}>Is Blank / Null</option>
                    <option value="is_not_null" ${rule.op === 'is_not_null' ? 'selected' : ''}>Is Not Blank</option>
                </select>
                <input type="text" class="filter-val-input bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-white flex-1 min-w-[120px]" 
                    data-idx="${idx}" placeholder="Value..." value="${rule.val || ''}">
                <button class="btn-remove-filter p-1.5 text-rose-400 hover:text-rose-300" data-idx="${idx}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join("");

        // Listeners
        document.querySelectorAll(".filter-col-sel").forEach(sel => {
            sel.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-idx"));
                state.filterRules[idx].column = e.target.value;
                saveSessionState();
            });
        });
        document.querySelectorAll(".filter-op-sel").forEach(sel => {
            sel.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-idx"));
                state.filterRules[idx].op = e.target.value;
                saveSessionState();
            });
        });
        document.querySelectorAll(".filter-val-input").forEach(inp => {
            inp.addEventListener("input", (e) => {
                const idx = parseInt(e.target.getAttribute("data-idx"));
                state.filterRules[idx].val = e.target.value;
                saveSessionState();
            });
        });
        document.querySelectorAll(".btn-remove-filter").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(btn.getAttribute("data-idx"));
                state.filterRules.splice(idx, 1);
                renderCustomFilters();
                saveSessionState();
            });
        });

        refreshIcons();
    }

    btnAddFilterRule.addEventListener("click", () => {
        const cols = getSelectedColumns();
        if (cols.length === 0) return;
        state.filterRules.push({
            column: cols[0],
            op: "=",
            val: ""
        });
        renderCustomFilters();
        saveSessionState();
    });

    // Helper: Collect Current Cleaning Options
    function collectCleaningOptions(source = "preview") {
        // Selected columns & renames
        const selectedCols = [];
        const renameMap = {};

        document.querySelectorAll(".col-include-chk").forEach(chk => {
            if (chk.checked) {
                const colName = chk.getAttribute("data-col");
                selectedCols.push(colName);
            }
        });

        document.querySelectorAll(".col-rename-input").forEach(inp => {
            const original = inp.getAttribute("data-original");
            const newName = inp.value.trim();
            if (newName && newName !== original) {
                renameMap[original] = newName;
            }
        });

        // Dedupe key columns
        const dedupeCols = Array.from(dedupeKeyCols.selectedOptions).map(o => o.value);

        // Deduplication & Name Deduplication settings (Context-Aware & Protected)
        let removeDuplicates = chkRemoveDuplicates ? chkRemoveDuplicates.checked : false;
        let dedupeNamesMode = "unique_person";

        if (source === "country") {
            const chkCountryDedupe = document.getElementById("chk-country-dedupe-names");
            const countryDedupeRadio = document.querySelector('input[name="country_dedupe_type"]:checked');
            if (chkCountryDedupe) {
                removeDuplicates = chkCountryDedupe.checked;
            }
            if (countryDedupeRadio) {
                dedupeNamesMode = countryDedupeRadio.value;
            }
        } else if (source === "standard") {
            const chkStandardDedupe = document.getElementById("chk-standard-dedupe-names");
            const standardDedupeRadio = document.querySelector('input[name="standard_dedupe_type"]:checked');
            if (chkStandardDedupe) {
                removeDuplicates = chkStandardDedupe.checked;
            } else if (chkRemoveDuplicates) {
                removeDuplicates = chkRemoveDuplicates.checked;
            }
            if (standardDedupeRadio) {
                dedupeNamesMode = standardDedupeRadio.value;
            }
        } else {
            // Preview / general
            const quickDedupeMode = document.getElementById("quick-dedupe-mode");
            if (quickDedupeMode) {
                if (quickDedupeMode.value === "none") {
                    removeDuplicates = false;
                } else {
                    removeDuplicates = true;
                    dedupeNamesMode = quickDedupeMode.value;
                }
            } else if (chkRemoveDuplicates) {
                removeDuplicates = chkRemoveDuplicates.checked;
            }
        }
        
        // Null Heads selection (from checklist with Select All Heads Together)
        const checkedNullHeads = Array.from(document.querySelectorAll(".null-head-chk:checked")).map(chk => chk.value);
        const dropNullModeRadio = document.querySelector('input[name="drop_null_mode"]:checked');
        const dropNullMode = dropNullModeRadio ? dropNullModeRadio.value : "any";

        // Sorting
        const sortCols = state.sortRules.map(r => r.column);
        const sortDesc = state.sortRules.map(r => r.descending);

        // Bulk mode
        const bulkModeRadio = document.querySelector('input[name="bulk_mode"]:checked');
        const bulkMode = bulkModeRadio ? bulkModeRadio.value : "keep";

        // Fill nulls mode
        let fillNullsMode = selFillNulls.value || null;
        if (!fillNullsMode && chkReplaceNullsClean && chkReplaceNullsClean.checked) {
            fillNullsMode = "empty_str";
        }

        // Casing target heads
        const checkedCasingHeads = Array.from(document.querySelectorAll(".casing-head-chk:checked")).map(cb => cb.value);

        return {
            remove_all_blank_columns: chkRemoveBlankCols.checked,
            drop_col_if_any_null: chkDropColAnyNull ? chkDropColAnyNull.checked : false,
            blank_column_threshold_pct: chkThresholdCols.checked ? parseFloat(thresholdSlider.value) : null,

            remove_all_blank_rows: chkRemoveBlankRows.checked,
            drop_row_if_any_null: chkDropRowAnyNull ? chkDropRowAnyNull.checked : false,
            drop_rows_with_null_in_cols: checkedNullHeads.length ? checkedNullHeads : null,
            drop_null_mode: dropNullMode,

            remove_duplicates: removeDuplicates,
            dedupe_names_mode: dedupeNamesMode,
            duplicate_columns: dedupeCols.length ? dedupeCols : null,
            duplicate_keep: document.querySelector('input[name="dedupe_keep"]:checked')?.value || "first",

            trim_whitespace: chkTrimSpaces.checked,
            collapse_multiple_spaces: chkCollapseSpaces.checked,
            text_casing: selTextCasing.value || null,
            casing_target_columns: checkedCasingHeads.length ? checkedCasingHeads : null,
            clean_numeric_symbols: chkCleanNumeric.checked,

            fill_nulls_mode: fillNullsMode,
            fill_nulls_custom_value: inputFillCustom.value || null,

            bulk_match_column: selExtractorCol.value || null,
            bulk_match_values: state.lookupValues.length ? state.lookupValues : null,
            bulk_match_mode: bulkMode,
            bulk_match_type: selExtractorType.value || "exact",

            selected_columns: selectedCols.length ? selectedCols : null,
            rename_columns: Object.keys(renameMap).length ? renameMap : null,

            sort_columns: sortCols.length ? sortCols : null,
            sort_descending: sortDesc.length ? sortDesc : null,
            sort_nulls_last: chkSortNullsLast.checked,

            filter_rules: state.filterRules.filter(r => r.column && r.op)
        };
    }

    // Run Cleaning & Preview Handler
    btnApplyPreview.addEventListener("click", async () => {
        if (!state.fileId) return;

        try {
            showSpinner("⚡ Executing cleaning pipeline with Rust-speed...");
            const options = collectCleaningOptions("preview");

            const res = await fetch("/api/preview-clean", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: state.fileId,
                    options: options,
                    preview_limit: 100
                })
            });

            const data = await res.json();
            hideSpinner();

            if (data.success) {
                // Update Diff metrics
                if (previewSpeedBadge) previewSpeedBadge.textContent = `Executed in ${data.execution_ms} ms`;
                if (diffRowsBefore) diffRowsBefore.textContent = data.before.rows.toLocaleString();
                if (diffRowsAfter) diffRowsAfter.textContent = data.after.rows.toLocaleString();
                if (diffColsBefore) diffColsBefore.textContent = data.before.cols.toLocaleString();
                if (diffColsAfter) diffColsAfter.textContent = data.after.cols.toLocaleString();

                const rowDiff = data.after.rows - data.before.rows;
                const rowPct = data.before.rows > 0 ? ((rowDiff / data.before.rows) * 100).toFixed(1) : 0;
                if (diffRowsPct) diffRowsPct.textContent = `(${rowDiff >= 0 ? '+' : ''}${rowDiff.toLocaleString()} / ${rowPct}%)`;

                // Render Preview Table
                state.previewData = data.preview_rows;
                renderPreviewTable(data.preview_rows, data.after.columns);

                // Smooth scroll to preview section
                document.getElementById("preview-section")?.scrollIntoView({ behavior: "smooth" });
            } else {
                alert("Cleaning error: " + (data.detail || "Unknown error"));
            }
        } catch (err) {
            hideSpinner();
            alert("Preview failed: " + err.message);
        }
    });

    // Render Preview Table
    function renderInitialPreview(rows, cols) {
        state.previewData = rows || [];
        renderPreviewTable(state.previewData, cols);
    }

    function renderPreviewTable(rows, cols) {
        if (!rows || rows.length === 0) {
            previewTableHead.innerHTML = `<tr><th class="p-3 text-gray-500">No records to display</th></tr>`;
            previewTableBody.innerHTML = `<tr><td class="p-4 text-center text-gray-400 italic">No matching rows found based on your filters.</td></tr>`;
            previewRowCountText.textContent = "0 rows";
            return;
        }

        const activeCols = cols || Object.keys(rows[0]);
        previewRowCountText.textContent = `Showing top ${rows.length} rows (${activeCols.length} columns)`;

        // Headers (Clickable for instant column sorting)
        previewTableHead.innerHTML = `
            <tr>
                <th class="p-2.5 text-center w-10 text-gray-500">#</th>
                ${activeCols.map(col => `
                    <th class="p-2.5 font-semibold text-white whitespace-nowrap cursor-pointer hover:text-indigo-400 select-none header-sort-th" data-col="${col}" title="Click to sort by ${col}">
                        <div class="flex items-center space-x-1">
                            <span>${col}</span>
                            <span class="text-[10px] text-gray-400 font-normal">⇅</span>
                        </div>
                    </th>
                `).join("")}
            </tr>
        `;

        // Attach click listeners to sort by column
        document.querySelectorAll(".header-sort-th").forEach(th => {
            th.addEventListener("click", () => {
                const col = th.getAttribute("data-col");
                const existing = state.sortRules.find(r => r.column === col);
                const isDesc = existing ? !existing.descending : false;
                state.sortRules = [{ column: col, descending: isDesc }];
                if (quickSortCol) quickSortCol.value = col;
                if (quickSortOrder) quickSortOrder.value = isDesc ? "desc" : "asc";
                renderSortRules();
                btnApplyPreview.click();
            });
        });

        // Body
        renderTableRows(rows, activeCols);
    }

    function renderTableRows(rows, cols) {
        previewTableBody.innerHTML = rows.map((row, idx) => `
            <tr class="hover:bg-gray-800/60 font-mono text-xs transition-colors">
                <td class="p-2.5 text-center text-gray-500 select-none">${idx + 1}</td>
                ${cols.map(c => {
                    const val = row[c];
                    let formatted = val;
                    let cls = "text-gray-300";
                    if (val === null || val === undefined || val === "") {
                        formatted = "<span class='text-gray-700 font-mono select-none'>—</span>";
                    } else if (typeof val === "number") {
                        cls = "text-emerald-400";
                    }
                    return `<td class="p-2.5 whitespace-nowrap max-w-xs truncate ${cls}" title="${val !== null ? val : ''}">${formatted}</td>`;
                }).join("")}
            </tr>
        `).join("");
    }

    // Preview Quick Filter Search
    previewTableSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        if (!state.previewData || state.previewData.length === 0) return;

        const filtered = state.previewData.filter(row => {
            return Object.values(row).some(v => String(v).toLowerCase().includes(query));
        });

        const activeCols = Object.keys(state.previewData[0]);
        renderTableRows(filtered, activeCols);
        previewRowCountText.textContent = `Filtered ${filtered.length} of ${state.previewData.length} preview rows`;
    });

    // Export & Download Handler
    btnExportDownload.addEventListener("click", async () => {
        if (!state.fileId) return;

        try {
            exportBtnText.textContent = "Exporting with Polars...";
            btnExportDownload.disabled = true;

            const options = collectCleaningOptions("preview");

            const res = await fetch("/api/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: state.fileId,
                    options: options,
                    format: state.selectedFormat,
                    delimiter: ","
                })
            });

            const data = await res.json();
            exportBtnText.textContent = "Download Cleaned File";
            btnExportDownload.disabled = false;

            if (data.success) {
                if (window.exportSuccessTimer) clearTimeout(window.exportSuccessTimer);
                exportSuccessBox.classList.remove("hidden");

                const datasetName = state.filename ? state.filename.replace(/\.[^/.]+$/, "") : "uploaded";
                exportSuccessMsg.textContent = `Cleaned ${datasetName} dataset to ${data.rows.toLocaleString()} rows and ${data.cols} cols`;

                exportDirectLink.href = data.download_url;
                exportDirectLink.target = "_blank";

                // Auto-trigger browser download/open
                const tempLink = document.createElement("a");
                tempLink.href = data.download_url;
                tempLink.target = "_blank";
                tempLink.download = data.filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);

                refreshIcons();

                // Auto-hide notification after 5.5 seconds
                window.exportSuccessTimer = setTimeout(() => {
                    exportSuccessBox.classList.add("hidden");
                }, 5500);
            } else {
                alert("Export failed: " + (data.detail || "Unknown error"));
            }
        } catch (err) {
            exportBtnText.textContent = "Download Cleaned File";
            btnExportDownload.disabled = false;
            alert("Export request failed: " + err.message);
        }
    });

    // ==========================================
    // Country & Category Basis Logic
    // ==========================================

    function detectDefaultCountryColumn(columns) {
        if (!columns || columns.length === 0) return null;
        // Priority 1: Exact or composite country columns
        const exactCountry = columns.find(c => /^(location[_\s]?country|company[_\s]?location[_\s]?country|country|countries)$/i.test(c));
        if (exactCountry) return exactCountry;

        const anyCountry = columns.find(c => /country/i.test(c));
        if (anyCountry) return anyCountry;

        const nation = columns.find(c => /nation/i.test(c));
        if (nation) return nation;

        const region = columns.find(c => /region|state|province/i.test(c));
        if (region) return region;

        const locality = columns.find(c => /city|locality/i.test(c));
        if (locality) return locality;

        const category = columns.find(c => /industry|department|category|status/i.test(c));
        if (category) return category;

        return columns[0];
    }

    function setupCountryBasisSection() {
        const cols = getSelectedColumns();
        if (!selCountryBasisCol || cols.length === 0) return;

        // Populate basis dropdown
        selCountryBasisCol.innerHTML = cols.map(c => {
            const isGeo = /country|nation|region|state|city|locality/i.test(c);
            const isCat = /industry|department|status|category|sector/i.test(c);
            const badge = isGeo ? " 🌍 (Geographic)" : (isCat ? " 🏷️ (Category)" : "");
            return `<option value="${c}">${c}${badge}</option>`;
        }).join("");

        // Populate secondary sort dropdown
        if (selCountrySecondarySort) {
            selCountrySecondarySort.innerHTML = `<option value="">(None - Keep original order)</option>` +
                cols.map(c => `<option value="${c}">${c}</option>`).join("");
            // Default secondary sort to Name or Date if available
            const nameCol = cols.find(c => /full\s*name|first\s*name|name|company/i.test(c));
            if (nameCol) selCountrySecondarySort.value = nameCol;
        }

        // Auto-select best country column
        const defaultCol = detectDefaultCountryColumn(cols);
        if (defaultCol) {
            selCountryBasisCol.value = defaultCol;
            state.activeCountryCol = defaultCol;
        } else {
            state.activeCountryCol = cols[0];
        }

        // Update tag
        updateCountryColTypeTag();

        // Load distinct categories for the initial column
        loadDistinctCategories(selCountryBasisCol.value);
    }

    function updateCountryColTypeTag() {
        if (!countryColTypeTag || !selCountryBasisCol) return;
        const col = selCountryBasisCol.value;
        const stat = state.columnsStats.find(s => s.name === col);
        const dtype = stat ? stat.dtype : "String";
        countryColTypeTag.textContent = `Type: ${dtype}`;
    }

    async function loadDistinctCategories(colName) {
        if (!state.fileId || !colName) return;

        try {
            countryChecklistContainer.innerHTML = `
                <div class="flex items-center space-x-2 p-3 text-gray-400">
                    <div class="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs">Analyzing distinct categories in "${colName}"...</span>
                </div>
            `;

            const res = await fetch("/api/column-distinct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: state.fileId,
                    column: colName,
                    limit: 500
                })
            });

            const data = await res.json();
            if (data.success) {
                state.distinctCategories = data.values || [];
                state.activeCountryCol = colName;

                // Update badge
                if (badgeCountryCountText) {
                    badgeCountryCountText.textContent = `${data.total_unique.toLocaleString()} Unique Categories`;
                }

                renderCountryChecklist(state.distinctCategories);
            } else {
                countryChecklistContainer.innerHTML = `<p class="text-xs text-rose-400 p-2">Failed to load categories: ${data.detail || 'Error'}</p>`;
            }
        } catch (err) {
            countryChecklistContainer.innerHTML = `<p class="text-xs text-rose-400 p-2">Request error: ${err.message}</p>`;
        }
    }

    function renderCountryChecklist(categories) {
        if (!countryChecklistContainer) return;

        if (!categories || categories.length === 0) {
            countryChecklistContainer.innerHTML = `<p class="text-xs text-gray-500 italic p-2">No unique categories found in this column.</p>`;
            if (countryFilterCountBadge) countryFilterCountBadge.textContent = "0 Selected";
            return;
        }

        countryChecklistContainer.innerHTML = categories.map((cat, idx) => {
            const rawVal = cat.value;
            const displayVal = cat.display;
            const count = cat.count.toLocaleString();
            return `
                <label class="country-check-item flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-800/60 cursor-pointer transition-colors" data-label="${displayVal.toLowerCase()}">
                    <div class="flex items-center space-x-2 truncate">
                        <input type="checkbox" class="country-item-chk w-3.5 h-3.5 rounded text-emerald-600 bg-gray-800 border-gray-700" value="${rawVal}" checked>
                        <span class="text-white text-xs truncate" title="${displayVal}">${displayVal}</span>
                    </div>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-emerald-400 font-mono border border-gray-700/60 flex-shrink-0 ml-2">
                        ${count}
                    </span>
                </label>
            `;
        }).join("");

        updateCountrySelectedCount();

        // Listeners for checkbox changes
        countryChecklistContainer.querySelectorAll(".country-item-chk").forEach(chk => {
            chk.addEventListener("change", updateCountrySelectedCount);
        });
    }

    function updateCountrySelectedCount() {
        const allChks = countryChecklistContainer.querySelectorAll(".country-item-chk");
        const checkedChks = countryChecklistContainer.querySelectorAll(".country-item-chk:checked");
        if (countryFilterCountBadge) {
            if (checkedChks.length === allChks.length) {
                countryFilterCountBadge.textContent = `All Selected (${allChks.length})`;
                countryFilterCountBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
            } else if (checkedChks.length === 0) {
                countryFilterCountBadge.textContent = "0 Selected (None)";
                countryFilterCountBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30";
            } else {
                countryFilterCountBadge.textContent = `${checkedChks.length} of ${allChks.length} Selected`;
                countryFilterCountBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30";
            }
        }
    }

    // Filter Search Input in Country Checklist
    if (countryFilterSearch) {
        countryFilterSearch.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase().trim();
            const items = countryChecklistContainer.querySelectorAll(".country-check-item");
            items.forEach(item => {
                const label = item.getAttribute("data-label") || "";
                item.style.display = label.includes(term) ? "flex" : "none";
            });
        });
    }

    if (btnCountrySelectAll) {
        btnCountrySelectAll.addEventListener("click", () => {
            countryChecklistContainer.querySelectorAll(".country-item-chk").forEach(chk => chk.checked = true);
            updateCountrySelectedCount();
        });
    }

    if (btnCountrySelectNone) {
        btnCountrySelectNone.addEventListener("click", () => {
            countryChecklistContainer.querySelectorAll(".country-item-chk").forEach(chk => chk.checked = false);
            updateCountrySelectedCount();
        });
    }

    // Basis Column Selector Change
    if (selCountryBasisCol) {
        selCountryBasisCol.addEventListener("change", (e) => {
            updateCountryColTypeTag();
            loadDistinctCategories(e.target.value);
        });
    }

    // Mode Selector Cards
    countryModeCards.forEach(card => {
        card.addEventListener("click", () => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                updateCountryModeUI(radio.value);
            }
        });
    });

    function updateCountryModeUI(mode) {
        countryModeCards.forEach(c => {
            const r = c.querySelector('input[type="radio"]');
            if (r && r.checked) {
                c.classList.remove("border-gray-800", "bg-gray-900/60");
                c.classList.add("border-emerald-500/50", "bg-emerald-500/10");
            } else {
                c.classList.remove("border-emerald-500/50", "bg-emerald-500/10");
                c.classList.add("border-gray-800", "bg-gray-900/60");
            }
        });

        if (countryFileFormatPicker) {
            if (mode === "sheets") {
                countryFileFormatPicker.classList.add("hidden");
                btnCountryExportText.textContent = "Download Country-Wise Excel File (.xlsx)";
            } else if (mode === "zip") {
                countryFileFormatPicker.classList.remove("hidden");
                btnCountryExportText.textContent = "Download Country-Wise ZIP Archive (.zip)";
            } else {
                countryFileFormatPicker.classList.remove("hidden");
                btnCountryExportText.textContent = "Download Country-Sorted Master File";
            }
        }
    }

    // Quick Sort by Country Button in Preview Toolbar
    if (btnQuickSortCountry) {
        btnQuickSortCountry.addEventListener("click", () => {
            const col = (selCountryBasisCol && selCountryBasisCol.value) ? selCountryBasisCol.value : detectDefaultCountryColumn(state.columns);
            if (!col) return;
            if (quickSortCol) quickSortCol.value = col;
            if (quickSortOrder) quickSortOrder.value = "asc";
            state.sortRules = [{ column: col, descending: false }];
            // If secondary sort is chosen, add it
            if (selCountrySecondarySort && selCountrySecondarySort.value && selCountrySecondarySort.value !== col) {
                const secDesc = selCountrySecondaryOrder ? (selCountrySecondaryOrder.value === "desc") : false;
                state.sortRules.push({ column: selCountrySecondarySort.value, descending: secDesc });
            }
            renderSortRules();
            btnApplyPreview.click();
        });
    }

    // Country Export Execution Handler
    if (btnDownloadCountryExport) {
        btnDownloadCountryExport.addEventListener("click", async () => {
            if (!state.fileId) return;

            const splitCol = selCountryBasisCol.value;
            if (!splitCol) {
                alert("Please select a country/category column.");
                return;
            }

            // Collect selected categories
            const allChks = countryChecklistContainer.querySelectorAll(".country-item-chk");
            const checkedChks = countryChecklistContainer.querySelectorAll(".country-item-chk:checked");
            
            if (checkedChks.length === 0) {
                alert("Please select at least one country/category from the checklist to export.");
                return;
            }

            let selectedList = null;
            if (checkedChks.length < allChks.length) {
                selectedList = Array.from(checkedChks).map(c => c.value);
            }

            const modeRadio = document.querySelector('input[name="country_export_mode"]:checked');
            const exportMode = modeRadio ? modeRadio.value : "sheets";

            const subFormatRadio = document.querySelector('input[name="country_sub_format"]:checked');
            const fileFormat = (exportMode === "sheets") ? "xlsx" : (subFormatRadio ? subFormatRadio.value : "xlsx");

            const originalBtnText = btnCountryExportText.textContent;
            try {
                btnCountryExportText.textContent = "Partitioning & Exporting with Polars Engine...";
                btnDownloadCountryExport.disabled = true;

                const options = collectCleaningOptions("country");

                const payload = {
                    file_id: state.fileId,
                    options: options,
                    split_column: splitCol,
                    export_mode: exportMode,
                    file_format: fileFormat,
                    selected_categories: selectedList,
                    include_summary_sheet: chkCountrySummarySheet ? chkCountrySummarySheet.checked : true,
                    secondary_sort_column: (selCountrySecondarySort && selCountrySecondarySort.value) ? selCountrySecondarySort.value : null,
                    secondary_sort_descending: (selCountrySecondaryOrder && selCountrySecondaryOrder.value === "desc")
                };

                const res = await fetch("/api/export-by-country", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                btnCountryExportText.textContent = originalBtnText;
                btnDownloadCountryExport.disabled = false;

                if (data.success) {
                    countryExportResultBox.classList.remove("hidden");
                    const modeDesc = exportMode === 'sheets' ? 'Multi-Sheet Excel Workbook' : (exportMode === 'zip' ? 'Country ZIP Archive' : 'Country-Sorted Master File');
                    countryExportResultTitle.textContent = `${modeDesc} Ready!`;
                    countryExportResultMeta.textContent = `Partitioned ${data.rows.toLocaleString()} rows into ${data.categories} ${exportMode === 'sheets' ? 'country sheets' : 'country files'} in ${data.duration_ms} ms (${data.size}).`;
                    countryExportDownloadLink.href = data.download_url;
                    countryExportDownloadLink.setAttribute("download", data.filename);

                    // Auto-trigger browser download
                    const tempLink = document.createElement("a");
                    tempLink.href = data.download_url;
                    tempLink.download = data.filename;
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);

                    refreshIcons();
                    countryExportResultBox.scrollIntoView({ behavior: "smooth" });
                } else {
                    alert("Export error: " + (data.detail || "Unknown error"));
                }
            } catch (err) {
                btnCountryExportText.textContent = originalBtnText;
                btnDownloadCountryExport.disabled = false;
                alert("Country export failed: " + err.message);
            }
        });
    }

    // Initialize Sort & Filter containers
    renderSortRules();
    renderCustomFilters();

    // Restore session if user refreshed browser page
    restoreSessionState();

    /* ========================================================================== */
    /* FULL-SCREEN BACKGROUND PARTICLES SYSTEM (NO MOUSE LIGHT SPOTLIGHT)         */
    /* ========================================================================== */
    const bgCanvas = document.getElementById("bg-particle-canvas");
    if (bgCanvas) {
        const ctx = bgCanvas.getContext("2d");
        let width = (bgCanvas.width = window.innerWidth);
        let height = (bgCanvas.height = window.innerHeight);

        window.addEventListener("resize", () => {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        });

        // Particle configuration
        const numParticles = Math.min(Math.floor((width * height) / 18000), 85);
        const particles = [];
        const colors = ["#019FFD", "#0350FE", "#60A5FA", "#FFFFFF"];

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2.5 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        function animateBackground() {
            ctx.clearRect(0, 0, width, height);

            // 2. Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off screen edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw constellation connecting lines between nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxConnectDist = 130;

                    if (dist < maxConnectDist) {
                        const lineAlpha = (1 - dist / maxConnectDist) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = "#019FFD";
                        ctx.globalAlpha = lineAlpha;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            ctx.globalAlpha = 1.0;
            requestAnimationFrame(animateBackground);
        }

        animateBackground();
    }
});

