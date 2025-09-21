from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import os
import shutil
import asyncio
import time

from .orchestrator import AgentOrchestrator
from .failure_logger import FailureLogger
from .config import get_settings
from .llm import client
from .learning import learning_engine

app = FastAPI(title="Nexus Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "sessions")
DATA_DIR = os.path.abspath(DATA_DIR)
os.makedirs(DATA_DIR, exist_ok=True)

orchestrator = AgentOrchestrator()
failure_logger = FailureLogger()
settings = get_settings()


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize LLM client
        print("🔄 Initializing LLM client...")
        await client.initialize()
        print("✅ LLM client initialized")

        # Test LLM availability with better error handling
        print("🔄 Running LLM health check...")
        health = await client.health_check()
        providers = health.get('providers', {})
        print(f"✅ LLM health check: {len(providers)} providers available")
        for provider, status in providers.items():
            if 'error' in status:
                print(f"⚠️  Provider {provider}: {status['error']}")
            else:
                print(f"✅ Provider {provider}: {status.get('status', 'unknown')}")

    except Exception as e:
        print(f"⚠️  Startup warning: {e}")
        print(f"⚠️  Error type: {type(e).__name__}")
        if hasattr(e, '__traceback__'):
            import traceback
            print(f"⚠️  Traceback: {traceback.format_exc()}")
        print("🔧 System will run with limited functionality")

class CreateSessionResponse(BaseModel):
    session_id: str

class ProcessRequest(BaseModel):
    use_ai: bool = True

class SessionConfig(BaseModel):
    selectedDomains: Optional[List[str]] = None
    industryContext: Optional[str] = None
    complianceFrameworks: Optional[List[str]] = None
    analysisDepth: Optional[str] = None
    priorityDomains: Optional[List[str]] = None

@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}

@app.post("/sessions", response_model=CreateSessionResponse)
async def create_session() -> CreateSessionResponse:
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(DATA_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    return CreateSessionResponse(session_id=session_id)

@app.post("/sessions/{session_id}/files")
async def upload_files(
    session_id: str,
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
):
    session_dir = os.path.join(DATA_DIR, session_id)
    if not os.path.isdir(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    saved_files = []
    incoming: List[UploadFile] = []
    if files:
        incoming.extend(files)
    if file:
        incoming.append(file)
    if not incoming:
        raise HTTPException(status_code=400, detail="No files provided")

    for f in incoming:
        dest = os.path.join(session_dir, f.filename)
        with open(dest, "wb") as out:
            shutil.copyfileobj(f.file, out)
        saved_files.append(dest)
    return {"files": [os.path.basename(p) for p in saved_files]}

@app.post("/sessions/{session_id}/process")
async def process_session(session_id: str, body: ProcessRequest):
    session_dir = os.path.join(DATA_DIR, session_id)
    if not os.path.isdir(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    file_paths = [os.path.join(session_dir, name) for name in os.listdir(session_dir)]
    if not file_paths:
        raise HTTPException(status_code=400, detail="No files uploaded")

    asyncio.create_task(orchestrator.run_workflow(session_id, file_paths, use_ai=body.use_ai))
    return {"status": "started"}

@app.get("/sessions/{session_id}/status")
async def get_status(session_id: str):
    return orchestrator.get_status(session_id)

@app.get("/sessions/{session_id}/results")
async def get_results(session_id: str):
    results = orchestrator.get_results(session_id)
    if results is None:
        raise HTTPException(status_code=404, detail="Results not ready")
    return results

# v2 endpoints to match frontend contract
@app.post("/v2/sessions")
async def v2_create_session(config: Optional[SessionConfig] = None):
    resp = await create_session()
    if config is not None:
        orchestrator.set_config(resp.session_id, config.model_dump(exclude_none=True))
    return resp

@app.get("/v2/sessions/{session_id}")
async def v2_get_session(session_id: str):
    return {
        "sessionId": session_id,
        "status": orchestrator.get_status(session_id),
        "config": orchestrator.get_config(session_id),
    }

@app.put("/v2/sessions/{session_id}/config")
async def v2_update_config(session_id: str, config: SessionConfig):
    orchestrator.set_config(session_id, config.model_dump(exclude_none=True))
    return {"ok": True}

@app.post("/sessions/{session_id}/files/upload")
async def upload_single_file(session_id: str, file: UploadFile = File(...)):
    # Convenience endpoint if needed
    return await upload_files(session_id, [file])

@app.post("/v2/sessions/{session_id}/analyze")
async def v2_analyze(session_id: str):
    return await process_session(session_id, ProcessRequest())

@app.get("/v2/sessions/{session_id}/results")
async def v2_results(session_id: str):
    return await get_results(session_id)

@app.get("/v2/domains")
async def v2_domains():
    return [
        {"id": "carbon", "name": "Carbon Footprint", "description": "GHG Protocol-aligned inventory"},
        {"id": "pcf", "name": "Product Carbon Footprint", "description": "ISO 14067 PCF"},
        {"id": "nature", "name": "Nature Risk (TNFD/BNG)", "description": "Nature-related risks and BNG"},
    ]

@app.get("/v2/domains/{domain}/results")
async def v2_domain_results(domain: str, sessionId: str):
    res = orchestrator.get_domain_result(sessionId, domain)
    if res is None:
        raise HTTPException(status_code=404, detail="Domain results not ready")
    return res


@app.post("/v2/domains/{domain}/analyze")
async def v2_domain_analyze(domain: str, body: Dict[str, Any]):
    session_id = body.get("sessionId") if isinstance(body, dict) else None
    if not session_id:
        raise HTTPException(status_code=400, detail="sessionId is required")
    # For now, kick off the standard workflow; domain can be used for routing later
    return await process_session(session_id, ProcessRequest())

@app.get("/v2/domains/{domain}/agents")
async def v2_domain_agents(domain: str):
    domain = domain.lower()
    if domain == "carbon":
        return [{"id": "carbon-expert", "name": "Carbon Expert Agent", "type": "analysis"}]
    if domain == "pcf":
        return [{"id": "pcf-expert", "name": "PCF Expert Agent", "type": "analysis"}]
    if domain in {"nature", "tnfd", "bng"}:
        return [{"id": "nature-expert", "name": "Nature Expert Agent", "type": "analysis"}]
    return []

@app.get("/v2/sessions/{session_id}/synthesis")
async def v2_synthesis(session_id: str):
    results = orchestrator.get_results(session_id) or {}
    if not results:
        raise HTTPException(status_code=404, detail="Results not ready")
    return [
        {
            "title": "Foundational insights ready",
            "description": "Initial cross-domain baseline prepared.",
            "involvedDomains": ["carbon", "pcf", "nature"],
            "impact": "medium",
            "confidence": 0.8,
        }
    ]

@app.get("/v2/sessions/{session_id}/maturity")
async def v2_maturity(session_id: str):
    results = orchestrator.get_results(session_id) or {}
    if not results:
        raise HTTPException(status_code=404, detail="Results not ready")
    return {
        "overallLevel": "baseline",
        "domainLevels": {"carbon": "baseline", "pcf": "initiated", "nature": "baseline"},
        "recommendations": ["Collect activity data", "Define product system boundaries", "Screen sites against TNFD realms"],
    }


# Export listing and download endpoints (Org Boundary workflow)
@app.get("/v2/sessions/{session_id}/exports")
async def v2_list_exports(session_id: str):
    session_dir = os.path.join(DATA_DIR, session_id, "exports")
    if not os.path.isdir(session_dir):
        raise HTTPException(status_code=404, detail="No exports available")
    files = sorted([f for f in os.listdir(session_dir) if os.path.isfile(os.path.join(session_dir, f))])
    return {"files": files}


@app.get("/v2/sessions/{session_id}/exports/{filename}")
async def v2_download_export(session_id: str, filename: str):
    session_dir = os.path.join(DATA_DIR, session_id, "exports")
    path = os.path.join(session_dir, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=filename)

class FeedbackBody(BaseModel):
    agent: Optional[str] = None
    type: str  # e.g., 'correction', 'comment', 'rating'
    content: Dict[str, Any]

# Context & Connections / Onboarding Models
class CompanySearchRequest(BaseModel):
    company_name: str

class CompanyIntelligenceResponse(BaseModel):
    name: str
    industry: str
    size: str
    jurisdiction: str
    websites: List[str]
    employee_count: Optional[int] = None
    revenue: Optional[str] = None
    headquarters: Optional[str] = None
    confidence: float
    discovered_documents: List[Dict[str, Any]] = []
    sustainability_profile: Optional[Dict[str, Any]] = None

class MagicMomentRequest(BaseModel):
    company_name: str
    industry: Optional[str] = None
    size: Optional[str] = None

class MagicMomentResponse(BaseModel):
    insights: List[Dict[str, Any]]
    processing_time_ms: int

@app.post("/v2/sessions/{session_id}/feedback")
async def v2_feedback(session_id: str, body: FeedbackBody):
    # Add to orchestrator for backward compatibility
    orchestrator.add_feedback(session_id, body.model_dump())

    # Process with learning engine for AI improvement
    feedback_id = await learning_engine.process_feedback(
        session_id=session_id,
        agent=body.agent,
        feedback_type=body.type,
        content=body.content
    )

    return {"ok": True, "feedback_id": feedback_id}

@app.get("/v2/sessions/{session_id}/feedback")
async def v2_list_feedback(session_id: str):
    return orchestrator.get_feedback(session_id)

@app.get("/v2/sessions/{session_id}/learning-signals")
async def v2_learning_signals(session_id: str):
    # Get from orchestrator for backward compatibility
    orchestrator_signals = orchestrator.get_learning_signals(session_id)

    # Get from learning engine for enhanced data
    learning_signals = learning_engine.get_learning_signals(session_id)

    return {
        "orchestrator_signals": orchestrator_signals,
        "learning_engine_signals": learning_signals
    }


@app.get("/v2/learning/recommendations")
async def v2_learning_recommendations(agent: Optional[str] = None):
    """Get AI learning recommendations for system improvement"""
    recommendations = await learning_engine.get_learning_recommendations(agent)
    return {"recommendations": recommendations}


@app.get("/v2/learning/metrics")
async def v2_learning_metrics(agent: Optional[str] = None):
    """Get learning performance metrics"""
    metrics = learning_engine.get_performance_metrics(agent)
    return {"metrics": metrics}


@app.get("/v2/llm/health")
async def v2_llm_health():
    """Check LLM system health"""
    try:
        health = await client.health_check()
        return {"status": "healthy", "details": health}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


# Failure log endpoints
@app.get("/v2/failures")
async def v2_failures(limit: int = 200):
    return {"failures": failure_logger.list(limit=limit)}


@app.get("/v2/sessions/{session_id}/failures")
async def v2_session_failures(session_id: str, limit: int = 200):
    return {"failures": failure_logger.list(session_id=session_id, limit=limit)}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            status = orchestrator.get_status(session_id)
            await websocket.send_json(status)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass

@app.websocket("/v2/sessions/{session_id}/ws")
async def v2_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(orchestrator.get_status(session_id))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass

# Context & Connections / Company Intelligence Endpoints
@app.post("/v2/companies/search", response_model=CompanyIntelligenceResponse)
async def search_company(request: CompanySearchRequest):
    """
    Search for company information and discover sustainability documents
    """
    company_name = request.company_name

    # Use the Company Intelligence Agent for real intelligence gathering
    company_profile = await orchestrator.company_intelligence_agent.discover_company_profile(company_name)
    discovered_docs = await orchestrator.company_intelligence_agent.scout_sustainability_documents(company_profile)

    # Convert agent response to API response format
    response = CompanyIntelligenceResponse(
        name=company_profile.name,
        industry=company_profile.industry,
        size=company_profile.size,
        jurisdiction=company_profile.jurisdiction,
        websites=company_profile.websites,
        employee_count=company_profile.employee_count,
        revenue=company_profile.revenue,
        headquarters=company_profile.headquarters,
        confidence=company_profile.confidence,
        discovered_documents=[
            {
                "id": doc.id,
                "title": doc.title,
                "url": doc.url,
                "type": doc.document_type,
                "confidence": doc.confidence,
                "size": doc.size,
                "source": doc.source,
                "preview_text": doc.preview_text,
                "relevant_domains": doc.relevant_domains
            }
            for doc in discovered_docs
        ],
        sustainability_profile=company_profile.sustainability_profile
    )

    return response

@app.post("/v2/companies/magic-moment", response_model=MagicMomentResponse)
async def generate_magic_moment(request: MagicMomentRequest):
    """
    Generate AI-powered insights for the "magic moment" onboarding experience
    """
    start_time = time.time()

    # Get or create company profile
    company_profile = await orchestrator.company_intelligence_agent.discover_company_profile(request.company_name)
    if request.industry:
        company_profile.industry = request.industry
    if request.size:
        company_profile.size = request.size

    # Discover documents
    discovered_docs = await orchestrator.company_intelligence_agent.scout_sustainability_documents(company_profile)

    # Generate magic moment insights using the agent
    agent_insights = await orchestrator.company_intelligence_agent.generate_magic_moment_insights(
        company_profile, discovered_docs
    )

    # Convert agent insights to API format
    insights = [
        {
            "id": insight.id,
            "title": insight.title,
            "description": insight.description,
            "type": insight.insight_type,
            "confidence": insight.confidence,
            "source": insight.source,
            "impact": insight.impact,
            "createdAt": time.time(),
            "data": insight.data
        }
        for insight in agent_insights
    ]

    processing_time = int((time.time() - start_time) * 1000)

    return MagicMomentResponse(
        insights=insights,
        processing_time_ms=processing_time
    )

@app.get("/v2/companies/{company_name}/recommendations")
async def get_company_recommendations(company_name: str):
    """
    Get ongoing optimization recommendations for a company
    """
    # Mock recommendations that would be generated based on company analysis history
    recommendations = [
        {
            "id": "1",
            "title": "Connect SharePoint for Sustainability Reports",
            "description": f"Nexus found references to sustainability documents for {company_name} in SharePoint. Connecting this data source could improve analysis accuracy by 15%.",
            "impact": "high",
            "category": "data-enrichment",
            "estimatedTimeMinutes": 10,
            "isCompleted": False,
            "createdDate": time.time(),
            "potentialImprovement": "15% accuracy boost"
        },
        {
            "id": "2",
            "title": "Update Company Profile with Recent Acquisitions",
            "description": f"AI detected mentions of recent acquisitions for {company_name} that aren't in your current profile. Adding this context could enhance entity intelligence.",
            "impact": "medium",
            "category": "profile-update",
            "estimatedTimeMinutes": 5,
            "isCompleted": False,
            "createdDate": time.time(),
            "potentialImprovement": "Better entity mapping"
        }
    ]

    return {"recommendations": recommendations}

@app.get("/v2/companies/{company_name}/learning-metrics")
async def get_company_learning_metrics(company_name: str):
    """
    Get learning metrics and system improvement data for a company
    """
    import random

    # Mock learning metrics that would track system improvements
    metrics = {
        "totalAnalyses": random.randint(5, 50),
        "accuracyScore": round(random.uniform(0.75, 0.95), 2),
        "userSatisfactionScore": round(random.uniform(0.7, 0.9), 2),
        "dataQualityScore": round(random.uniform(0.6, 0.85), 2),
        "improvementTrend": random.choice(["improving", "stable", "declining"]),
        "lastUpdated": time.time(),
        "domainSpecificMetrics": {
            "carbon": {
                "analysisCount": random.randint(2, 15),
                "accuracyScore": round(random.uniform(0.8, 0.95), 2),
                "userFeedbackScore": round(random.uniform(0.7, 0.9), 2)
            },
            "nature": {
                "analysisCount": random.randint(1, 10),
                "accuracyScore": round(random.uniform(0.7, 0.9), 2),
                "userFeedbackScore": round(random.uniform(0.6, 0.85), 2)
            }
        }
    }

    return {"learningMetrics": metrics}
