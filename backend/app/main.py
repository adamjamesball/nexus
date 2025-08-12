from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import os
import shutil
import asyncio

from .orchestrator import AgentOrchestrator

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

class FeedbackBody(BaseModel):
    agent: Optional[str] = None
    type: str  # e.g., 'correction', 'comment', 'rating'
    content: Dict[str, Any]

@app.post("/v2/sessions/{session_id}/feedback")
async def v2_feedback(session_id: str, body: FeedbackBody):
    orchestrator.add_feedback(session_id, body.model_dump())
    return {"ok": True}

@app.get("/v2/sessions/{session_id}/feedback")
async def v2_list_feedback(session_id: str):
    return orchestrator.get_feedback(session_id)

@app.get("/v2/sessions/{session_id}/learning-signals")
async def v2_learning_signals(session_id: str):
    return orchestrator.get_learning_signals(session_id)

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
