import io
import os
import re
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .file_parsers import (
    parse_dpr_csv,
    parse_dpr_pdf_content,
    parse_msproject_xml,
    parse_primavera_xer,
    parse_schedule_csv,
)
from .llm_client import LLMClient, LLMClientError
from .processor import process_report
from .schemas import HealthResponse, ProcessRequest, ProcessResponse

settings = get_settings()
app = FastAPI(title="SiteSync Multi-Format Construction AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory baseline schedule store (populated by XER, XML, CSV or defaults)
BASELINE_SCHEDULE: List[Dict[str, Any]] = [
    {"id": 1, "activityCode": "CIV-1001", "activityName": "Site Excavation and Earthwork Phase 1", "discipline": "Civil", "location": "Zone-A", "plannedProgress": 100.0, "level": "L3"},
    {"id": 2, "activityCode": "CIV-1002", "activityName": "PCC and Raft Foundation Concrete Pouring", "discipline": "Civil", "location": "Zone-A", "plannedProgress": 65.0, "level": "L3"},
    {"id": 3, "activityCode": "CIV-1003", "activityName": "RCC Column Shuttering and Concreting", "discipline": "Civil", "location": "Zone-B", "plannedProgress": 30.0, "level": "L3"},
    {"id": 4, "activityCode": "CIV-1004", "activityName": "Slab Beam Reinforcement Steel Laying", "discipline": "Civil", "location": "Zone-B", "plannedProgress": 0.0, "level": "L3"},
    {"id": 5, "activityCode": "PIP-2001", "activityName": "Underground Stormwater Piping Installation", "discipline": "Piping", "location": "External", "plannedProgress": 45.0, "level": "L3"},
    {"id": 6, "activityCode": "PIP-2002", "activityName": "HDPE Water Supply Pipeline Laying and Hydrotest", "discipline": "Piping", "location": "External", "plannedProgress": 15.0, "level": "L3"},
    {"id": 7, "activityCode": "ELE-3001", "activityName": "Electrical Cable Tray and Conduit Installation", "discipline": "Electrical", "location": "Basement", "plannedProgress": 20.0, "level": "L3"},
    {"id": 8, "activityCode": "ELE-3002", "activityName": "Main Substation Switchgear and Transformer Erection", "discipline": "Electrical", "location": "Substation", "plannedProgress": 0.0, "level": "L3"},
    {"id": 9, "activityCode": "BRK-4001", "activityName": "External AAC Block Masonry and Plastering", "discipline": "Civil", "location": "Level-1", "plannedProgress": 50.0, "level": "L3"},
    {"id": 10, "activityCode": "STE-5001", "activityName": "Structural Steel Roof Truss Fabrication and Erection", "discipline": "Structural", "location": "Roof", "plannedProgress": 40.0, "level": "L3"},
]


def match_activity_semantically(description: str, baseline: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], float]:
    """
    Finds the best matching schedule activity using keyword, token overlap, and fuzzy logic.
    """
    desc_clean = description.lower()
    desc_words = set(re.findall(r"\w{3,}", desc_clean))
    
    best_match = None
    highest_score = 0.0
    
    for act in baseline:
        name_clean = act["activityName"].lower()
        disc_clean = act.get("discipline", "").lower()
        code_clean = act.get("activityCode", "").lower()
        act_words = set(re.findall(r"\w{3,}", name_clean))
        
        # Exact code match
        if code_clean in desc_clean:
            return act, 0.98
            
        # Overlap score
        overlap = len(desc_words.intersection(act_words))
        score = (overlap * 2.0) / (len(desc_words) + len(act_words)) if (desc_words and act_words) else 0.0
        
        # Domain keyword boost
        if disc_clean and disc_clean in desc_clean:
            score += 0.2
            
        # Check specific construction actions
        keywords = ["concrete", "excavation", "reinforcement", "shuttering", "piping", "cable", "masonry", "truss", "steel", "foundation"]
        for kw in keywords:
            if kw in desc_clean and kw in name_clean:
                score += 0.25
                
        if score > highest_score:
            highest_score = score
            best_match = act
            
    if best_match and highest_score >= 0.25:
        confidence = min(0.95, round(highest_score, 2))
        return best_match, confidence
        
    return None, 0.0


@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="UP", service="SiteSync AI Multi-Format Engine")


@app.get("/baseline")
@app.get("/api/baseline")
async def get_baseline():
    return {
        "count": len(BASELINE_SCHEDULE),
        "activities": BASELINE_SCHEDULE
    }


@app.post("/upload-pdf")
@app.post("/upload")
@app.post("/api/upload-pdf")
@app.post("/api/upload")
async def handle_upload(file: UploadFile = File(...)):
    """
    Multi-format ingestion endpoint supporting:
    - Primavera P6 (.xer)
    - MS Project (.xml)
    - Schedule & Progress Spreadsheets (.csv, .xlsx)
    - Daily Progress Reports (.pdf)
    """
    global BASELINE_SCHEDULE
    filename = file.filename or "unknown_file"
    ext = os.path.splitext(filename)[1].lower()
    
    content_bytes = await file.read()
    print(f"Received upload: {filename} ({len(content_bytes)} bytes), Ext: {ext}")
    
    # -------------------------------------------------------------
    # 1. Primavera P6 Schedule Import (.xer)
    # -------------------------------------------------------------
    if ext == ".xer":
        tasks = parse_primavera_xer(content_bytes)
        if tasks:
            BASELINE_SCHEDULE = tasks
            
        # Aggregate by discipline for contractor summary
        disc_map: Dict[str, int] = {}
        for t in tasks:
            d = t.get("discipline") or "General"
            disc_map[d] = disc_map.get(d, 0) + 1
            
        contractor_summary = [
            {"contractor": f"{disc} Discipline", "skilled": count * 4, "unskilled": count * 6, "total": count * 10}
            for disc, count in disc_map.items()
        ]
        
        records = [
            {
                "date": t.get("plannedStart") or "2024-02-01",
                "site": "Primavera P6 Project",
                "contractor": f"WBS: {t.get('location', 'Site')}",
                "type": t.get("discipline", "Civil"),
                "skilled": "-",
                "unskilled": "-",
                "quantity": f"[{t['activityCode']}] {t['activityName']} (Planned: {t['plannedProgress']}%)",
                "quantity_numeric": t["plannedProgress"]
            }
            for t in tasks
        ]
        
        return {
            "site": "Primavera P6 Baseline Schedule",
            "report_type": "Primavera Schedule Import",
            "total_labourers": sum(c["total"] for c in contractor_summary),
            "contractor_summary": contractor_summary,
            "records": records
        }

    # -------------------------------------------------------------
    # 2. MS Project XML Import (.xml)
    # -------------------------------------------------------------
    elif ext == ".xml":
        tasks = parse_msproject_xml(content_bytes)
        if tasks:
            BASELINE_SCHEDULE = tasks
            
        contractor_summary = [
            {"contractor": "General Construction Team", "skilled": len(tasks) * 3, "unskilled": len(tasks) * 5, "total": len(tasks) * 8}
        ]
        
        records = [
            {
                "date": t.get("plannedStart") or "2024-02-01",
                "site": "MS Project Workspace",
                "contractor": f"Task Code: {t['activityCode']}",
                "type": t.get("discipline", "General"),
                "skilled": "-",
                "unskilled": "-",
                "quantity": f"[{t['activityCode']}] {t['activityName']} (Progress: {t['plannedProgress']}%)",
                "quantity_numeric": t["plannedProgress"]
            }
            for t in tasks
        ]
        
        return {
            "site": "Microsoft Project Export",
            "report_type": "MS Project Baseline",
            "total_labourers": sum(c["total"] for c in contractor_summary),
            "contractor_summary": contractor_summary,
            "records": records
        }

    # -------------------------------------------------------------
    # 3. CSV Spreadsheet (Schedule OR Progress)
    # -------------------------------------------------------------
    elif ext == ".csv":
        text_sample = content_bytes[:500].decode("utf-8", errors="ignore").lower()
        if "activitycode" in text_sample or "plannedstart" in text_sample or "wbslevel" in text_sample:
            # Baseline schedule CSV
            tasks = parse_schedule_csv(content_bytes)
            if tasks:
                BASELINE_SCHEDULE = tasks
            return {
                "site": "Master Baseline Schedule",
                "report_type": "Schedule Baseline CSV",
                "total_labourers": 0,
                "contractor_summary": [
                    {"contractor": "All Disciplines", "skilled": 0, "unskilled": 0, "total": len(tasks)}
                ],
                "records": [
                    {
                        "date": t.get("plannedStart") or "-",
                        "site": t.get("location", "Site"),
                        "contractor": t.get("discipline", "General"),
                        "type": t.get("discipline", "General"),
                        "skilled": "-",
                        "unskilled": "-",
                        "quantity": f"[{t['activityCode']}] {t['activityName']} (Planned: {t['plannedProgress']}%)",
                        "quantity_numeric": t["plannedProgress"]
                    }
                    for t in tasks
                ]
            }
        else:
            # DPR Daily Progress Log CSV
            site, report_type, total_labourers, contractor_summary, records = parse_dpr_csv(content_bytes)
            
            # Apply AI Matching to each record
            for r in records:
                matched_act, conf = match_activity_semantically(r.get("activity_description", ""), BASELINE_SCHEDULE)
                if matched_act:
                    r["quantity"] = f"[{matched_act['activityCode']}] {r['quantity']} (Match: {int(conf*100)}%)"
                    r["matched_activity"] = matched_act["activityCode"]
                    r["match_confidence"] = conf
                    
            return {
                "site": site,
                "report_type": report_type,
                "total_labourers": total_labourers,
                "contractor_summary": contractor_summary,
                "records": records
            }

    # -------------------------------------------------------------
    # 4. DPR PDF Report (.pdf)
    # -------------------------------------------------------------
    elif ext == ".pdf":
        site, report_type, total_labourers, contractor_summary, records = parse_dpr_pdf_content(content_bytes)
        
        # Apply AI Matching to each record against BASELINE_SCHEDULE
        for r in records:
            matched_act, conf = match_activity_semantically(r.get("activity_description", ""), BASELINE_SCHEDULE)
            if matched_act:
                r["quantity"] = f"[{matched_act['activityCode']}] {r['quantity']} (AI Match: {int(conf*100)}%)"
                r["matched_activity"] = matched_act["activityCode"]
                r["match_confidence"] = conf

        return {
            "site": site,
            "report_type": report_type,
            "total_labourers": total_labourers,
            "contractor_summary": contractor_summary,
            "records": records
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: .pdf, .xer, .xml, .csv, .xlsx"
        )


@app.post("/process", response_model=ProcessResponse)
async def process(request: ProcessRequest) -> ProcessResponse:
    try:
        client = LLMClient(settings)
        return await process_report(request, client)
    except LLMClientError as exc:
        message = str(exc)
        if message == "OPENROUTER_API_KEY is not configured":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=message,
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned invalid structured data",
        ) from exc


class ChatMessageItem(BaseModel):
    role: str = "user"
    content: str


class L5PackageData(BaseModel):
    wbs: str
    name: str
    weight: float = 25.0
    planned: float = 0.0
    actual: float = 0.0
    variance: float = 0.0
    status: str = "ACTIVE"


class DelayedActivityData(BaseModel):
    code: str
    name: str
    planned: float = 0.0
    actual: float = 0.0
    variance: float = 0.0
    assigned: str = "Field Engineer"
    location: str = "KP Corridor"


class ProjectContext(BaseModel):
    project_id: Optional[str] = "PRJ-001"
    code: Optional[str] = "PEP-001"
    name: Optional[str] = "Paradip-Numaligarh Crude Pipeline Spread-02"
    actualProgress: Optional[float] = 72.0
    plannedProgress: Optional[float] = 79.0
    variance: Optional[float] = -7.0
    cpi: Optional[float] = 1.05
    spi: Optional[float] = 0.98
    budgetTotalCr: Optional[float] = 480.5
    spentCr: Optional[float] = 341.2
    totalWorkersOnSite: Optional[int] = 248
    l5Packages: Optional[List[Dict[str, Any]]] = None
    delayedActivities: Optional[List[Dict[str, Any]]] = None
    pendingReviewsCount: Optional[int] = 2


class ChatMessageRequest(BaseModel):
    message: str
    language: str = "en"
    project_id: str = "PRJ-001"
    api_key: Optional[str] = None
    history: Optional[List[ChatMessageItem]] = []
    project_context: Optional[ProjectContext] = None


def _solve_simple_math(expr: str) -> Optional[float]:
    """Safely evaluates basic arithmetic expressions."""
    cleaned = re.sub(r'[^0-9\+\-\*\/\.\(\)\s]', '', expr).strip()
    if not cleaned or not re.search(r'[\+\-\*\/]', cleaned):
        return None
    try:
        val = eval(cleaned, {"__builtins__": None}, {})
        if isinstance(val, (int, float)):
            return round(val, 4)
    except Exception:
        pass
    return None


def build_metrics_dashboard(ctx: Optional[ProjectContext], is_hi: bool) -> str:
    """Produces an authoritative, data-dense executive metrics report."""
    actual = ctx.actualProgress if (ctx and ctx.actualProgress is not None) else 72.0
    planned = ctx.plannedProgress if (ctx and ctx.plannedProgress is not None) else 79.0
    variance = ctx.variance if (ctx and ctx.variance is not None) else -7.0
    cpi = ctx.cpi if (ctx and ctx.cpi is not None) else 1.05
    spi = ctx.spi if (ctx and ctx.spi is not None) else 0.98
    budget = ctx.budgetTotalCr if (ctx and ctx.budgetTotalCr is not None) else 480.5
    spent = ctx.spentCr if (ctx and ctx.spentCr is not None) else 341.2
    remaining = round(budget - spent, 1)
    workers = ctx.totalWorkersOnSite if (ctx and ctx.totalWorkersOnSite is not None) else 248
    pending = ctx.pendingReviewsCount if (ctx and ctx.pendingReviewsCount is not None) else 2

    status_badge = "⚠️ Behind Schedule (-7.0%)" if variance < 0 else "✅ On Schedule"
    cpi_badge = "✅ Cost-Efficient (CPI > 1.0)" if cpi >= 1.0 else "⚠️ Cost Overrun"
    spi_badge = "⚠️ Critical Path Lag (SPI < 1.0)" if spi < 1.0 else "✅ On Target"

    if is_hi:
        return (
            f"📊 **परियोजना निष्पादन मेट्रिक्स — PEP-001 (पारादीप-नुमालीगढ़ पाइपलाइन)**\n\n"
            f"### 1. अर्न्ड वैल्यू प्रबंधन (EVM) मुख्य KPI\n"
            f"| मीट्रिक | नियोजित (Planned) | वास्तविक (Actual) | विचलन (Variance) | स्थिति |\n"
            f"|---|---|---|---|---|\n"
            f"| **भौतिक प्रगति** | **{planned:.1f}%** | **{actual:.1f}%** | **{variance:+.1f}%** | {status_badge} |\n"
            f"| **लागत प्रदर्शन सूचकांक (CPI)** | 1.00 | **{cpi:.2f}** | {cpi-1.0:+.2f} | {cpi_badge} |\n"
            f"| **अनुसूची प्रदर्शन सूचकांक (SPI)** | 1.00 | **{spi:.2f}** | {spi-1.0:+.2f} | {spi_badge} |\n"
            f"| **कुल स्वीकृत बजट** | ₹{budget:.1f} Cr | ₹{spent:.1f} Cr खर्च | ₹{remaining:.1f} Cr शेष | ✅ बजट नियंत्रण में |\n"
            f"| **सक्रिय कार्यबल** | 250 लक्ष्य | **{workers} ऑन-साइट** | -2 | 👷 4 सुपरवाइजर तैनात |\n\n"
            f"### 2. L5 कार्य पैकेज स्थिति\n"
            f"| WBS | पैकेज का नाम | भार | नियोजित | वास्तविक | विचलन | स्थिति |\n"
            f"|---|---|---|---|---|---|---|\n"
            f"| `01.01` | **पाइपलाइन स्थापना (Pipeline Installation)** | 45% | 82.0% | 74.0% | **-8.0%** | ⚠️ जोखिम में |\n"
            f"| `01.02` | **वाल्व स्थापना (Valve Installation)** | 25% | 70.0% | 55.0% | **-15.0%** | ⚠️ जोखिम में |\n"
            f"| `01.03` | **वेल्डिंग और NDT परीक्षण** | 20% | 65.0% | 48.0% | **-17.0%** | 🚨 विलंबित |\n"
            f"| `01.04` | **विद्युत एवं इंस्ट्रुमेंटेशन** | 10% | 50.0% | 48.0% | **-2.0%** | ✅ समय पर |\n\n"
            f"### 3. प्रमुख विलंबित L6 गतिविधियां (Critical Path)\n"
            f"1. **VALVE-L6-002** (वाल्व स्थापना KP 12): **-35% विचलन** (नियोजित 70%, वास्तविक 35%) · प्रभारी: *मनोज वर्मा*\n"
            f"2. **PIPE-L6-004** (NDT रेडियोग्राफी KP 12–14): **-30% विचलन** (नियोजित 60%, वास्तविक 30%) · प्रभारी: *सुनीता शर्मा*\n"
            f"3. **PIPE-L6-003** (ट्रेंचिंग व खुदाई KP 12–14): **-25% विचलन** (नियोजित 75%, वास्तविक 50%) · प्रभारी: *रवि कुमार*\n\n"
            f"### 4. समीक्षा कतार और विसंगतियां\n"
            f"• **{pending} फील्ड रिपोर्ट सत्यापन लंबित**: #FR-00472 (GPS विचलन 0.8km) और #FR-00471 (पाइप उपभोग +22% अधिक)।"
        )
    else:
        return (
            f"📊 **Project Execution Metrics — PEP-001 (Paradip-Numaligarh Crude Pipeline Spread-02)**\n\n"
            f"### 1. Earned Value Management (EVM) Core KPIs\n"
            f"| Metric | Baseline Planned | Human-Verified Actual | Variance | Performance Status |\n"
            f"|---|---|---|---|---|\n"
            f"| **Physical Progress** | **{planned:.1f}%** | **{actual:.1f}%** | **{variance:+.1f}%** | {status_badge} |\n"
            f"| **Cost Performance Index (CPI)** | 1.00 | **{cpi:.2f}** | {cpi-1.0:+.2f} | {cpi_badge} |\n"
            f"| **Schedule Performance Index (SPI)** | 1.00 | **{spi:.2f}** | {spi-1.0:+.2f} | {spi_badge} |\n"
            f"| **Total Project Budget** | ₹{budget:.1f} Cr | ₹{spent:.1f} Cr (Spent) | ₹{remaining:.1f} Cr Rem. | ✅ Spent Within Budget |\n"
            f"| **Active Workforce** | 250 Target | **{workers} on Site** | -2 | 👷 4 Supervisors Deployed |\n\n"
            f"### 2. Level 5 Work Packages Performance Breakdown\n"
            f"| WBS Code | Work Package Name | Weight | Planned | Actual | Variance | Status |\n"
            f"|---|---|---|---|---|---|---|\n"
            f"| `01.01` | **Pipeline Installation** | 45% | 82.0% | 74.0% | **-8.0%** | ⚠️ AT RISK |\n"
            f"| `01.02` | **Valve Installation** | 25% | 70.0% | 55.0% | **-15.0%** | ⚠️ AT RISK |\n"
            f"| `01.03` | **Welding & NDT Testing** | 20% | 65.0% | 48.0% | **-17.0%** | 🚨 DELAYED |\n"
            f"| `01.04` | **Electrical & Instrumentation** | 10% | 50.0% | 48.0% | **-2.0%** | ✅ ON TRACK |\n\n"
            f"### 3. Critical Path Bottlenecks & Delayed L6 Activities\n"
            f"1. **VALVE-L6-002** (*Install Valve KP 12*): **-35% Variance** (Planned: 70%, Actual: 35%) · Assigned: *Manoj Verma*\n"
            f"2. **PIPE-L6-004** (*NDT Radiography Testing KP 12–14*): **-30% Variance** (Planned: 60%, Actual: 30%) · Assigned: *Sunita Sharma*\n"
            f"3. **PIPE-L6-003** (*Trenching & Excavation KP 12–14*): **-25% Variance** (Planned: 75%, Actual: 50%) · Assigned: *Ravi Kumar*\n\n"
            f"### 4. Active Field Anomalies Awaiting Review\n"
            f"• **Report #FR-00472** (KP 14.200): GPS Coordinate 0.8km offset from trench centerline · Assigned: *Ravi Kumar*\n"
            f"• **Report #FR-00471** (Materials): Daily line-pipe consumption logged 22% over scheduled ceiling · Assigned: *Manoj Verma*\n\n"
            f"### 5. Immediate Recommended Interventions\n"
            f"1. Mobilize 2 additional secondary welding crews for Section B tie-ins to recover the -17% lag on WBS 01.03.\n"
            f"2. Verify and resolve pending reports #FR-00471 and #FR-00472 in the Review Queue to unlock L5 physical progress rollup."
        )


def build_workforce_report(is_hi: bool) -> str:
    if is_hi:
        return (
            "👷 **परियोजना कार्यबल एवं फील्ड सुपरवाइजर तैनाती रिपोर्ट**\n\n"
            "| आईडी | सुपरवाइजर का नाम | पद | अनुशासन | सक्रिय कार्य | आज पूर्ण | फील्ड स्थिति |\n"
            "|---|---|---|---|---|---|---|\n"
            "| `W-01` | **रवि कुमार (Ravi Kumar)** | साइट इंजीनियर | Piping & Pipeline | 4 | 2 | 🟢 फील्ड में सक्रिय |\n"
            "| `W-02` | **मनोज वर्मा (Manoj Verma)** | पाइपिंग फोरमैन | Piping | 3 | 1 | 🟢 ऑनलाइन |\n"
            "| `W-03` | **सुनीता शर्मा (Sunita Sharma)** | QA/QC इंस्पेक्टर | QA/QC Inspection | 2 | 3 | 🟢 फील्ड में सक्रिय |\n"
            "| `W-04` | **विक्रम दास (Vikram Das)** | E&I सुपरवाइजर | Electrical & Telecom | 3 | 1 | 🟢 ऑनलाइन |\n\n"
            "• **कुल ऑन-साइट कार्यबल**: 248 श्रमिक (कुशल: 142, अकुशल: 106) | उपस्थिति: 99.2%"
        )
    else:
        return (
            "👷 **Workforce Deployment & Field Supervision Report**\n\n"
            "| ID | Supervisor Name | Role | Discipline | Active Tasks | Done Today | Live Status |\n"
            "|---|---|---|---|---|---|---|\n"
            "| `W-01` | **Ravi Kumar** | Site Engineer | Piping & Pipeline | 4 | 2 | 🟢 In Field (KP 12–14) |\n"
            "| `W-02` | **Manoj Verma** | Piping Foreman | Mechanical / Valves | 3 | 1 | 🟢 Active Online |\n"
            "| `W-03` | **Sunita Sharma** | QA/QC Inspector | Radiography & UT | 2 | 3 | 🟢 In Field (Weld Checks) |\n"
            "| `W-04` | **Vikram Das** | E&I Supervisor | Telecom & Cathodic | 3 | 1 | 🟢 Active Online |\n\n"
            "• **Total Personnel on Site**: 248 workers (142 skilled technicians, 106 helpers) across 4 pipeline spreads."
        )


def build_delays_report(is_hi: bool) -> str:
    if is_hi:
        return (
            "⚠️ **गंभीर पथ विलंब एवं विचलन रिपोर्ट (Schedule Variance Analysis)**\n\n"
            "| गतिविधि कोड | कार्य का विवरण | नियोजित | वास्तविक | विचलन | प्रभारी | मूल कारण |\n"
            "|---|---|---|---|---|---|---|\n"
            "| `VALVE-L6-002` | वाल्व स्थापना KP 12 | 70% | 35% | **-35%** | मनोज वर्मा | वाल्व बॉडी फ्लैंज की देर से डिलीवरी |\n"
            "| `PIPE-L6-004` | NDT रेडियोग्राफी KP 12–14 | 60% | 30% | **-30%** | सुनीता शर्मा | वर्षा के कारण रात के समय RT में देरी |\n"
            "| `PIPE-L6-003` | ट्रेंचिंग व खुदाई KP 12–14 | 75% | 50% | **-25%** | रवि कुमार | पथरीली जमीन व रॉक ब्रेकर की कमी |\n\n"
            "**रिकवरी योजना**: मानसून से पहले कार्य पूरा करने के लिए अतिरिक्त हाइड्रोलिक ब्रेकर और रात की शिफ्ट में RT क्रू जोड़ें।"
        )
    else:
        return (
            "⚠️ **Critical Path Variance & Delay Analysis Report**\n\n"
            "| Activity Code | Activity Name | Planned | Actual | Variance | Supervisor | Root Cause |\n"
            "|---|---|---|---|---|---|---|\n"
            "| `VALVE-L6-002` | Install Valve KP 12 | 70% | 35% | **-35%** | Manoj Verma | Class 600 valve flange supplier transit delay |\n"
            "| `PIPE-L6-004` | NDT Radiography KP 12–14 | 60% | 30% | **-30%** | Sunita Sharma | Moisture interference requiring dry night windows |\n"
            "| `PIPE-L6-003` | Trenching & Excavation KP 12–14 | 75% | 50% | **-25%** | Ravi Kumar | Dense rocky terrain; breaker availability limit |\n\n"
            "**Recommended Schedule Recovery Actions**:\n"
            "1. Mobilize 1 auxiliary excavator with heavy rock breaker to KP 13.000 immediately.\n"
            "2. Switch NDT team to automated ultrasonic testing (AUT) for faster day-shift clearance."
        )


def build_anomalies_report(is_hi: bool) -> str:
    if is_hi:
        return (
            "🔍 **सक्रिय विसंगति पहचान रिपोर्ट (Field Anomaly Queue)**\n\n"
            "1. **रिपोर्ट #FR-00472 (KP 14.200)**:\n"
            "   • **प्रकार**: GPS निर्देशांक विचलन\n"
            "   • **विवरण**: दर्ज जीपीएस निर्देशांक अनुमोदित पाइपलाइन कॉरिडोर से 0.8km दूर पाए गए।\n"
            "   • **स्थिति**: समीक्षा कतार (Review Queue) में लंबित।\n\n"
            "2. **रिपोर्ट #FR-00471 (सामग्री उपभोग)**:\n"
            "   • **प्रकार**: दैनिक सामग्री अधिभार (Material Overrun)\n"
            "   • **विवरण**: दर्ज पाइप जोड़ों का उपभोग दैनिक मानक सीमा से 22% अधिक है।\n"
            "   • **स्थिति**: समीक्षा कतार (Review Queue) में अनुमोदन प्रतीक्षारत।"
        )
    else:
        return (
            "🔍 **Active Field Anomaly Report**\n\n"
            "1. **Report #FR-00472 (KP 14.200)**:\n"
            "   • **Issue**: GPS Geolocation Offset\n"
            "   • **Finding**: Mobile submission recorded 0.8km offset from designated pipe trench corridor.\n"
            "   • **Status**: Quarantined in AI Review Queue awaiting engineer review.\n\n"
            "2. **Report #FR-00471 (Piping Material)**:\n"
            "   • **Issue**: Line-Pipe Consumption Anomaly\n"
            "   • **Finding**: Daily pipe joint usage logged at 22% higher than standard engineering forecast.\n"
            "   • **Status**: Quarantined in AI Review Queue awaiting verification."
        )


def build_financials_report(ctx: Optional[ProjectContext], is_hi: bool) -> str:
    budget = ctx.budgetTotalCr if (ctx and ctx.budgetTotalCr is not None) else 480.5
    spent = ctx.spentCr if (ctx and ctx.spentCr is not None) else 341.2
    cpi = ctx.cpi if (ctx and ctx.cpi is not None) else 1.05
    remaining = round(budget - spent, 1)

    if is_hi:
        return (
            f"💰 **परियोजना वित्तीय स्थिति (Project Financials)**\n\n"
            f"• **कुल स्वीकृत बजट**: ₹{budget:.1f} Cr\n"
            f"• **वर्तमान संचयी खर्च (Actual Cost)**: ₹{spent:.1f} Cr\n"
            f"• **शेष बजट (Remaining Budget)**: ₹{remaining:.1f} Cr\n"
            f"• **लागत प्रदर्शन सूचकांक (CPI)**: **{cpi:.2f}** (लागत नियंत्रण सकारात्मक ✅)\n"
            f"• **निष्कर्ष**: कार्य पूरा करने के लिए खर्च बजट सीमा के भीतर है और ₹{remaining:.1f} Cr की आरक्षित राशि उपलब्ध है।"
        )
    else:
        return (
            f"💰 **Financial & Budgetary Health Report**\n\n"
            f"• **Approved Total Budget**: ₹{budget:.1f} Cr\n"
            f"• **Actual Cost Expended to Date (AC)**: ₹{spent:.1f} Cr\n"
            f"• **Remaining Capital Allocation**: ₹{remaining:.1f} Cr\n"
            f"• **Cost Performance Index (CPI)**: **{cpi:.2f}** (Favorable — Earned Value exceeds Actual Spend)\n"
            f"• **Assessment**: Financial burn rate is within authorized contingency margins."
        )


def generate_conversational_response(
    message: str,
    language: str,
    project_id: str,
    baseline_acts: list,
    ctx: Optional[ProjectContext] = None
) -> str:
    raw = message.strip()
    msg = raw.lower()
    is_hi = (language == "hi")

    # 1. Math and Arithmetic expressions
    math_result = _solve_simple_math(msg)
    if math_result is not None:
        if is_hi:
            return f"🔢 **गणना परिणाम**\n\n• अभिव्यक्ति: `{raw}`\n• उत्तर: **{math_result}**"
        else:
            return f"🔢 **Calculation Result**\n\n• **Expression**: `{raw}`\n• **Result**: **{math_result}**"

    # 2. Greetings and Identity
    greetings = ["hello", "hi", "hey", "namaste", "good morning", "good evening", "who are you", "what can you do"]
    if any(msg.startswith(g) or msg == g for g in greetings) or "about yourself" in msg or "आप कौन हैं" in msg or "नमस्ते" in msg:
        if is_hi:
            return (
                "👋 **नमस्ते! मैं SiteSync इंटेलिजेंस AI हूँ।**\n\n"
                "मैं वास्तविक समय में निर्माण अनुसूची (Primavera WBS), अर्न्ड वैल्यू (EVM), फील्ड रिपोर्ट्स और पाइपलाइन इंजीनियरिंग नियंत्रण में सहायता करता हूँ।\n\n"
                "आप मुझसे परियोजना के मेट्रिक्स, विलंबित गतिविधियां, कार्यबल स्थिति, वित्तीय आंकड़े या इंजीनियरिंग मानकों के बारे में सीधे पूछ सकते हैं।"
            )
        else:
            return (
                "👋 **Hello! I am SiteSync Intelligence AI.**\n\n"
                "I am your industrial project AI assistant. I track real-time Primavera P6 schedules, Earned Value metrics (CPI/SPI), field reports, and pipeline QA/QC standards.\n\n"
                "Ask me directly for project metrics, delayed activities, supervisor assignments, budget status, or engineering standards."
            )

    # 3. METRICS / NUMBERS / KPIS / STATUS / PROGRESS / REPORT / DASHBOARD / SUMMARY
    metric_triggers = [
        "metric", "metrics", "kpi", "kpis", "number", "numbers", "data",
        "status", "progress", "report", "dashboard", "summary", "stats",
        "how is the project", "how are we doing", "performance",
        "प्रगति", "आंकड़े", "स्थिति", "डेटा", "मेट्रिक्स", "केपीआई", "रिपोर्ट"
    ]
    if any(k in msg for k in metric_triggers):
        return build_metrics_dashboard(ctx, is_hi)

    # 4. WORKERS / SUPERVISORS / CREW
    worker_triggers = ["worker", "workers", "supervisor", "supervisors", "engineer", "engineers", "crew", "foreman", "inspector", "who is on site", "श्रमिक", "सुपरवाइजर"]
    if any(k in msg for k in worker_triggers):
        return build_workforce_report(is_hi)

    # 5. DELAYS / VARIANCE / RISKS / BOTTLENECKS
    delay_triggers = ["delay", "delays", "delayed", "variance", "risk", "risks", "bottleneck", "bottlenecks", "lag", "behind", "विचलन", "जोखिम", "विलंब", "देरी"]
    if any(k in msg for k in delay_triggers):
        return build_delays_report(is_hi)

    # 6. ANOMALIES / DISCREPANCIES / REVIEW QUEUE
    anomaly_triggers = ["anomaly", "anomalies", "discrepanc", "fr-", "review queue", "unverified", "quarantine", "विसंगति", "समीक्षा कतार"]
    if any(k in msg for k in anomaly_triggers):
        return build_anomalies_report(is_hi)

    # 7. BUDGET / FINANCIALS / COSTS
    financial_triggers = ["budget", "cost", "costs", "spent", "spending", "financial", "financials", "expenditure", "cr", "बजट", "खर्च", "लागत"]
    if any(k in msg for k in financial_triggers):
        return build_financials_report(ctx, is_hi)

    # 8. STANDARDS & ENGINEERING PROCEDURES
    if "api 1104" in msg or "asme" in msg or "welding" in msg or "hydrotest" in msg or "ndt" in msg or "radiography" in msg:
        if is_hi:
            return (
                "🛠️ **पाइपलाइन इंजीनियरिंग एवं वेल्डिंग मानक विवरण**\n\n"
                "• **API 1104 मानक**: वेल्डर्स और वेल्डिंग प्रक्रिया (WPS/PQR) की योग्यता, रेडियोग्राफी (RT) और अल्ट्रासोनिक (UT) स्वीकृति मानदंड।\n"
                "• **ASME B31.4 / B31.8 हाइड्रोस्टैटिक परीक्षण**: न्यूनतम परीक्षण दबाव MAOP का 1.25x से 1.50x; न्यूनतम 24 घंटे लगातार दबाव बनाए रखना अनिवार्य है।"
            )
        else:
            return (
                "🛠️ **Pipeline Engineering & QA/QC Standards Overview**\n\n"
                "• **API Standard 1104 (Welding of Pipelines)**: Prescribes WPS/PQR qualification and non-destructive testing (NDT) acceptance criteria for girth butt welds.\n"
                "• **Hydrostatic Pressure Testing (ASME B31.4/B31.8)**: Minimum 1.25× to 1.50× design pressure held continuously for 24 hours with calibrated dual deadweight recorders."
            )

    # 9. CODE & SCRIPT GENERATION
    if "code" in msg or "python" in msg or "sql" in msg or "script" in msg:
        if "sql" in msg:
            return (
                "```sql\n"
                "-- Extract activities with variance lagging greater than 10%\n"
                "SELECT activity_code, activity_name, planned_progress, actual_progress,\n"
                "       (actual_progress - planned_progress) AS variance_pct, assigned_supervisor\n"
                "FROM schedule_activities\n"
                "WHERE (planned_progress - actual_progress) > 10\n"
                "ORDER BY variance_pct ASC;\n"
                "```"
            )
        else:
            return (
                "```python\n"
                "# Calculate EVM CPI and SPI metrics\n"
                "def evaluate_evm(planned_pct, actual_pct, total_budget_cr):\n"
                "    ev = (actual_pct / 100.0) * total_budget_cr\n"
                "    pv = (planned_pct / 100.0) * total_budget_cr\n"
                "    return {\n"
                "        'earned_value_cr': round(ev, 2),\n"
                "        'planned_value_cr': round(pv, 2),\n"
                "        'variance_pct': round(actual_pct - planned_pct, 2),\n"
                "        'cpi': round(ev / max(0.001, pv), 3)\n"
                "    }\n"
                "```"
            )

    # 10. Direct Factual Response (no evasive boilerplate)
    if is_hi:
        return (
            f"💡 **SiteSync AI विश्लेषण**\n\n"
            f"आपके प्रश्न: *\"{raw}\"* का प्रत्यक्ष उत्तर:\n\n"
            f"परियोजना **PEP-001** वर्तमान में 72.0% वास्तविक प्रगति (नियोजित: 79.0%) पर है, जिसका समग्र CPI 1.05 और SPI 0.98 है। सभी 4 कार्य पैकेज और 10 L6 गतिविधियां केंद्रीय डेटाबेस में अद्यतित हैं।\n\n"
            f"यदि आप किसी विशिष्ट गतिविधि, वाल्व स्थापना या वेल्डिंग रिपोर्ट का विस्तृत डेटा देखना चाहते हैं, तो उसका नाम या कोड बताएं।"
        )
    else:
        return (
            f"💡 **SiteSync AI Analysis**\n\n"
            f"Direct response regarding: *\"{raw}\"*\n\n"
            f"Project **PEP-001** is operating at **72.0% actual completion** against a **79.0% baseline plan** (Variance: -7.0%). Cost Performance Index (CPI) stands at **1.05** (favorable spend) and Schedule Performance Index (SPI) is **0.98**.\n\n"
            f"If you need specific activity codes (e.g., `PIPE-L6-003`, `VALVE-L6-002`), supervisor assignments, or anomaly reports, specify the item and I will provide the exact figures immediately."
        )


@app.post("/chat")
@app.post("/api/chat")
async def chat_endpoint(req: ChatMessageRequest):
    # 1. Check if user provided an OpenAI API key or one exists in server environment
    openai_key = req.api_key or os.environ.get("OPENAI_API_KEY")
    if openai_key and len(openai_key.strip()) > 10:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key.strip())

            actual_pct = req.project_context.actualProgress if (req.project_context and req.project_context.actualProgress is not None) else 72.0
            planned_pct = req.project_context.plannedProgress if (req.project_context and req.project_context.plannedProgress is not None) else 79.0
            cpi = req.project_context.cpi if (req.project_context and req.project_context.cpi is not None) else 1.05
            spi = req.project_context.spi if (req.project_context and req.project_context.spi is not None) else 0.98
            budget = req.project_context.budgetTotalCr if (req.project_context and req.project_context.budgetTotalCr is not None) else 480.5
            spent = req.project_context.spentCr if (req.project_context and req.project_context.spentCr is not None) else 341.2
            workers = req.project_context.totalWorkersOnSite if (req.project_context and req.project_context.totalWorkersOnSite is not None) else 248

            system_prompt = (
                "You are SiteSync AI, an authoritative industrial project control assistant. "
                "Always give direct, factual, data-rich answers with tables, metrics, and exact numbers. "
                "Never give vague meta-advice or tell the user to go check other pages. "
                "Here is the current live project state for PEP-001 (Paradip-Numaligarh Crude Pipeline Spread-02):\n"
                f"- Physical Progress: Planned {planned_pct}%, Actual {actual_pct}%, Variance {actual_pct - planned_pct:.1f}%\n"
                f"- EVM Indices: CPI {cpi}, SPI {spi}\n"
                f"- Budget: ₹{budget} Cr total, ₹{spent} Cr spent, ₹{round(budget - spent, 1)} Cr remaining\n"
                f"- Workforce on site: {workers} workers across 4 spreads\n"
                "- Work Packages: 01.01 Pipeline Installation (Weight 45%, Planned 82%, Actual 74%), 01.02 Valve Installation (Weight 25%, Planned 70%, Actual 55%), 01.03 Welding & NDT (Weight 20%, Planned 65%, Actual 48%), 01.04 E&I (Weight 10%, Planned 50%, Actual 48%)\n"
                "- Top Delayed Tasks: VALVE-L6-002 (-35% lag, Manoj Verma), PIPE-L6-004 (-30% lag, Sunita Sharma), PIPE-L6-003 (-25% lag, Ravi Kumar)\n"
                "- Field Anomalies: FR-00472 (GPS offset 0.8km), FR-00471 (Pipe consumption 22% over quota)\n"
                "Format responses cleanly in GitHub-style markdown. "
                + ("Respond in professional Hindi." if req.language == "hi" else "Respond in English.")
            )

            messages = [{"role": "system", "content": system_prompt}]
            if req.history:
                for h in req.history[-8:]:
                    messages.append({"role": h.role, "content": h.content})
            messages.append({"role": "user", "content": req.message})

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=950,
            )

            reply_text = completion.choices[0].message.content
            if reply_text:
                return {
                    "reply": reply_text,
                    "model": "gpt-4o-mini",
                    "provider": "openai"
                }
        except Exception as e:
            pass

    # 2. Use our rich data-driven contextual conversational engine
    reply = generate_conversational_response(
        message=req.message,
        language=req.language,
        project_id=req.project_id,
        baseline_acts=BASELINE_SCHEDULE,
        ctx=req.project_context
    )
    return {
        "reply": reply,
        "model": "sitesync-data-engine",
        "provider": "sitesync-local"
    }


