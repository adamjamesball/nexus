'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/upload/FileUploader';
import { useNexusStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Download, Play, Clock, AlertCircle, List, FileSpreadsheet, RefreshCcw, Settings, CheckCircle2, ChevronRight, ChevronLeft, PlusCircle, RefreshCcw as RotateCcw, Search, Package } from 'lucide-react';

export default function OrgBoundaryPage() {
  const {
    currentSession,
    uploadedFiles,
    isProcessing,
    createSession,
    startProcessing,
    completeProcessing,
    setProcessingError,
  } = useNexusStore();

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [exportsList, setExportsList] = useState<string[]>([]);
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [taskObjective, setTaskObjective] = useState<'create_new' | 'update_existing' | 'review_assess'>('create_new');
  const [desiredOutputs, setDesiredOutputs] = useState<Array<'excel' | 'excel_template' | 'system_package'>>(['excel']);
  const [targetSystem, setTargetSystem] = useState<'none' | 'salesforce_nzc' | 'microsoft_ssm' | 'workiva'>('none');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [usePreviousHierarchy, setUsePreviousHierarchy] = useState<boolean>(false);
  const [previousHierarchyFile, setPreviousHierarchyFile] = useState<File | null>(null);
  const [objectiveCompleted, setObjectiveCompleted] = useState<boolean>(false);
  const sessionId = currentSession?.id;

  // Initialize server-side session on mount
  useEffect(() => {
    (async () => {
      if (!currentSession) {
        createSession();
      }
      try {
        const session = await apiClient.createSession();
        // Note: keeping local store session as UI state; backend session is used for processing
        if (typeof window !== 'undefined') {
          (window as any).__nexus_backend_session = session.session_id || (session as any).sessionId || sessionId;
        }
      } catch (e) {
        // Fallback: continue with local-only session
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backendSessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return (window as any).__nexus_backend_session || sessionId;
    }
    return sessionId;
  }, [sessionId]);

  // Open WebSocket for live status
  useEffect(() => {
    if (!backendSessionId) return;
    const socket = apiClient.connectWebSocket(backendSessionId, (message) => {
      if (message && (message as any).progress !== undefined || (message as any).steps || (message as any).errors || (message as any).status) {
        setStatus(message);
      }
      setWsMessages((prev) => [message, ...prev].slice(0, 200));
    });
    setWs(socket);
    return () => {
      try { socket.close(); } catch {}
      setWs(null);
    };
  }, [backendSessionId]);

  const canStart = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'uploaded') && !isProcessing;

  const performUploads = useCallback(async () => {
    if (!backendSessionId) return;
    // Upload all files to backend
    for (const f of uploadedFiles) {
      if (!f.file) continue;
      try {
        await apiClient.uploadFile(backendSessionId, f.file);
      } catch (e) {
        toast.error(`Failed to upload ${f.name}`);
      }
    }
  }, [uploadedFiles, backendSessionId]);

  const handleStart = async () => {
    if (!canStart || !backendSessionId) return;
    try {
      startProcessing();
      setActiveStep(3);
      await performUploads();
      await apiClient.startProcessing(backendSessionId);
      toast.success('Org boundary consolidation started');
      // Poll for results to mark completion
      const poll = async () => {
        try {
          const results = await apiClient.getResults(backendSessionId);
          completeProcessing(results as any);
          try {
            const listing = await apiClient.listExports(backendSessionId);
            setExportsList(listing.files || []);
          } catch {}
        } catch {
          setTimeout(poll, 2000);
        }
      };
      setTimeout(poll, 2000);
    } catch (e) {
      setProcessingError('Processing failed. Please retry.');
      toast.error('Processing failed. Please retry.');
    }
  };

  const refreshExports = async () => {
    if (!backendSessionId) return;
    try {
      const listing = await apiClient.listExports(backendSessionId);
      setExportsList(listing.files || []);
      toast.success('Exports refreshed');
    } catch (e) {
      toast.error('No exports available yet');
    }
  };

  const progress = status?.progress ?? (isProcessing ? 10 : 0);
  const steps: Array<{ name: string; status: string; entities?: number; issues?: number; files?: string[] }> = status?.steps || [];
  const agentPreview = useMemo(() => {
    const agents = currentSession?.agents || [];
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return [...agents].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 9) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 9));
  }, [currentSession?.agents]);

  // Derive structured agent thinking logs from WebSocket messages
  type AgentLogEntry = {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    step?: string;
    task?: string;
    status?: string;
    progress?: number;
  };
  type AgentThinking = {
    agentId: string;
    agentName: string;
    entries: AgentLogEntry[];
    status?: string;
    progress?: number;
    issues: string[];
  };

  const agentIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    (currentSession?.agents || []).forEach(a => { map[a.id] = a.name; });
    return map;
  }, [currentSession?.agents]);

  const thinkingByAgent = useMemo<Record<string, AgentThinking>>(() => {
    const grouped: Record<string, AgentThinking> = {};
    wsMessages.forEach((m: any) => {
      const data = m?.data || {};
      const agentId = data.agentId || data.agent_id || data.agent?.id || data.id || 'session';
      const agentName = data.agentName || data.agent_name || data.agent?.name || agentIdToName[agentId] || (agentId === 'session' ? 'Session' : String(agentId));
      const levelRaw = (m?.type || data?.level || '').toString().toLowerCase();
      const level: 'info' | 'warning' | 'error' = levelRaw.includes('error') ? 'error' : levelRaw.includes('warn') ? 'warning' : 'info';
      const message = data.message || data.event || data.text || data.summary || (typeof data === 'string' ? data : JSON.stringify(data));
      const statusStr = data.status || undefined;
      const entry: AgentLogEntry = {
        timestamp: m?.timestamp || new Date().toISOString(),
        level,
        message: String(message),
        step: data.step || data.stage,
        task: data.task || data.action,
        status: statusStr,
        progress: typeof data.progress === 'number' ? data.progress : undefined,
      };
      if (!grouped[agentId]) {
        grouped[agentId] = {
          agentId,
          agentName,
          entries: [],
          status: statusStr,
          progress: entry.progress,
          issues: [],
        };
      }
      grouped[agentId].entries.unshift(entry);
      if (statusStr) grouped[agentId].status = statusStr;
      if (typeof entry.progress === 'number') grouped[agentId].progress = entry.progress;
      // Capture issues
      const issue = data.issue || data.error || undefined;
      const issuesArr = (Array.isArray(data.issues) ? data.issues : []).filter(Boolean);
      if (issue) grouped[agentId].issues.push(String(issue));
      if (issuesArr.length) grouped[agentId].issues.push(...issuesArr.map((i: any) => String(i)));
    });
    return grouped;
  }, [wsMessages, agentIdToName]);

  const runSummary = useMemo(() => {
    const allAgents = Object.values(thinkingByAgent);
    const totalEntries = allAgents.reduce((acc, a) => acc + a.entries.length, 0);
    const totalIssues = allAgents.reduce((acc, a) => acc + a.issues.length + a.entries.filter(e => e.level === 'error' || e.level === 'warning').length, 0);
    const completedAgents = allAgents.filter(a => (a.status || '').toLowerCase().includes('complete')).length;
    const runningAgents = allAgents.filter(a => (a.status || '').toLowerCase().includes('run')).length;
    const overallProgress = typeof progress === 'number' ? progress : Math.min(100, Math.round((completedAgents / Math.max(1, allAgents.length)) * 100));
    return { totalEntries, totalIssues, completedAgents, runningAgents, overallProgress };
  }, [thinkingByAgent, progress]);

  const hasResults = useMemo(() => {
    return Boolean((currentSession?.results as any)?.org_boundary);
  }, [currentSession?.results]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Org Boundary & Structure</h1>
          {backendSessionId && (
            <Badge variant="secondary">Session: {String(backendSessionId).slice(-8)}</Badge>
          )}
        </div>

        {/* Summary / capabilities */}
        <Card>
          <CardContent className="p-4">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h3 className="font-medium">What this agent does</h3>
                <p className="text-sm text-muted-foreground mt-1">Consolidates entity/site lists, proposes a reporting boundary, flags data quality issues, and produces exportable outputs.</p>
              </div>
              <div className="mt-3 md:mt-0 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Typical activities:</span>
                <ul className="list-disc pl-4 mt-1">
                  <li>Create a new org boundary & structure</li>
                  <li>Update an existing hierarchy and boundary</li>
                  <li>Review and assess an existing boundary for issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stepper header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((n) => {
                const labels = ['Choose objective', 'Load data & instructions', 'Processing & results'];
                return (
                  <div key={n} className="flex-1 flex items-center">
                    <div className={`flex items-center ${n < 3 ? 'w-full' : ''}`}>
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${activeStep >= n ? 'bg-blue-600 text-white border-blue-600' : 'bg-background text-foreground'}`}>
                          {activeStep > n ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-medium">{n}</span>}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground text-center whitespace-nowrap">{labels[n - 1]}</div>
                      </div>
                      {n < 3 && (
                        <div className={`mx-2 h-0.5 flex-1 ${activeStep > n ? 'bg-blue-600' : 'bg-muted'}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Objective & Desired Outputs (no upload here) */}
        {activeStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Settings className="h-5 w-5" /><span>Objective & Outcomes</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className={`p-4 rounded border bg-card text-left hover:border-blue-400 transition ${taskObjective === 'create_new' ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                  onClick={() => setTaskObjective('create_new')}
                >
                  <div className="flex items-center space-x-3">
                    <PlusCircle className="h-5 w-5 text-blue-600" />
                    <div className="font-medium">Create new</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Create a brand new organizational structure and reporting boundary.</p>
                </button>
                <button
                  className={`p-4 rounded border bg-card text-left hover:border-blue-400 transition ${taskObjective === 'update_existing' ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                  onClick={() => setTaskObjective('update_existing')}
                >
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                    <div className="font-medium">Update existing</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Update and improve an existing hierarchy and boundary.</p>
                </button>
                <button
                  className={`p-4 rounded border bg-card text-left hover:border-blue-400 transition ${taskObjective === 'review_assess' ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                  onClick={() => setTaskObjective('review_assess')}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-blue-600" />
                    <div className="font-medium">Review & assess</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Analyze existing boundary for quality issues and improvements.</p>
                </button>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Desired outputs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`p-4 rounded border bg-card text-left hover:border-blue-400 transition ${desiredOutputs.includes('excel') ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                    onClick={() => setDesiredOutputs((prev) => prev.includes('excel') ? prev.filter(v => v !== 'excel') : [...prev, 'excel'])}
                  >
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      <div className="font-medium">Excel outputs</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Entity list, boundary, issues, and narrative in Excel.</p>
                  </button>
                  <button
                    className={`p-4 rounded border bg-card text-left hover:border-blue-400 transition ${desiredOutputs.includes('excel_template') ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                    onClick={() => setDesiredOutputs((prev) => prev.includes('excel_template') ? prev.filter(v => v !== 'excel_template') : [...prev, 'excel_template'])}
                  >
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      <div className="font-medium">Excel template</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Use or supply a template (upload in next step).</p>
                  </button>
                  <div>
                    <button
                      className={`w-full p-4 rounded border bg-card text-left hover:border-blue-400 transition ${desiredOutputs.includes('system_package') ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}
                      onClick={() => setDesiredOutputs((prev) => prev.includes('system_package') ? prev.filter(v => v !== 'system_package') : [...prev, 'system_package'])}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div className="font-medium">System package</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Package compatible with Salesforce/Microsoft/Workiva.</p>
                    </button>
                    {desiredOutputs.includes('system_package') && (
                      <select
                        value={targetSystem}
                        onChange={(e) => setTargetSystem(e.target.value as any)}
                        className="mt-2 w-full border rounded px-3 py-2 bg-background text-sm"
                      >
                        <option value="none">Select target system</option>
                        <option value="salesforce_nzc">Salesforce Net Zero Cloud</option>
                        <option value="microsoft_ssm">Microsoft Sustainability Manager</option>
                        <option value="workiva">Workiva</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end">
                <Button onClick={() => setActiveStep(2)} size="lg" className="bg-blue-600 hover:bg-blue-700">Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload Site/Entity Lists (Excel/CSV)</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader disabled={isProcessing} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Settings className="h-5 w-5" /><span>Processing Instructions</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Previous hierarchy (optional)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="use-prev-hierarchy"
                        checked={usePreviousHierarchy}
                        onChange={(e) => setUsePreviousHierarchy(e.target.checked)}
                      />
                      <label htmlFor="use-prev-hierarchy" className="text-sm">Use previous org hierarchy to guide consolidation</label>
                    </div>
                    {usePreviousHierarchy && (
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setPreviousHierarchyFile(e.target.files?.[0] || null)}
                        className="block text-sm"
                      />
                    )}
                  </div>
                  {desiredOutputs.includes('excel_template') && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Template file (optional)</label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                        className="block text-sm"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium">Custom processing instructions</label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={5}
                    className="w-full border rounded px-3 py-2 bg-background text-sm"
                    placeholder="Anything specific to emphasize, definitions, in/out of scope, etc."
                  />
                </div>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <Button onClick={async () => {
                    if (!backendSessionId) return;
                    try {
                      await apiClient.updateSessionConfig(backendSessionId as string, {
                        taskObjective,
                        desiredOutputs,
                        targetSystem,
                        customInstructions,
                        providedTemplateFilename: templateFile?.name,
                      });
                      if (usePreviousHierarchy && previousHierarchyFile) {
                        await apiClient.uploadFile(backendSessionId as string, previousHierarchyFile);
                      }
                      if (templateFile) {
                        await apiClient.uploadFile(backendSessionId as string, templateFile);
                      }
                      toast.success('Settings saved');
                    } catch (e) {
                      toast.error('Failed to save settings');
                    }
                  }} className="bg-blue-600 hover:bg-blue-700">Save settings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Standardized Workflow</h3>
                    <p className="text-sm text-muted-foreground mt-1">Excel in → Consolidate → Propose boundary → Exports + Insights</p>
                  </div>
                  <Button onClick={handleStart} disabled={!canStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    {isProcessing ? (<><Clock className="h-4 w-4 mr-2 animate-spin" /> Processing...</>) : (<><Play className="h-4 w-4 mr-2" /> Start</>)}
                  </Button>
                </div>

                <div className="mt-6">
                  <Progress value={progress} className="h-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {steps.map((s: any, idx: number) => (
                      <div key={idx} className="p-3 rounded border bg-card">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{s.name.replaceAll('_', ' ')}</span>
                          <Badge variant={s.status === 'complete' ? 'secondary' : s.status === 'running' ? 'default' : 'outline'}>
                            {s.status}
                          </Badge>
                        </div>
                        {typeof s.entities === 'number' && (
                          <p className="text-xs text-muted-foreground mt-1">entities: {s.entities}</p>
                        )}
                        {typeof s.issues === 'number' && (
                          <p className="text-xs text-muted-foreground">issues: {s.issues}</p>
                        )}
                        {Array.isArray(s.files) && s.files.length > 0 && (
                          <p className="text-xs text-muted-foreground">files: {s.files.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Step 2: Preview panel and start controls */}
        {activeStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview of processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-3 rounded border bg-card">
                    <h4 className="font-medium mb-2">Uploaded files</h4>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No files yet. Upload on Step 1.</p>
                    ) : (
                      <ul className="text-sm list-disc pl-5">
                        {uploadedFiles.map((f) => (
                          <li key={f.id}>{f.name} <span className="text-muted-foreground">({Math.round(f.size/1024)} KB)</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-3 rounded border bg-card">
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="text-sm text-muted-foreground">Objective: <span className="font-medium text-foreground">{taskObjective.replace('_', ' ')}</span></div>
                    <div className="text-sm text-muted-foreground">Desired outputs: <span className="font-medium text-foreground">{desiredOutputs.join(', ') || 'none'}</span></div>
                    {desiredOutputs.includes('system_package') && (
                      <div className="text-sm text-muted-foreground">Target system: <span className="font-medium text-foreground">{targetSystem}</span></div>
                    )}
                    {desiredOutputs.includes('excel_template') && (
                      <div className="text-sm text-muted-foreground">Template: <span className="font-medium text-foreground">{templateFile?.name || 'not provided'}</span></div>
                    )}
                    <div className="text-sm text-muted-foreground">Previous hierarchy: <span className="font-medium text-foreground">{usePreviousHierarchy && previousHierarchyFile ? previousHierarchyFile.name : 'not provided'}</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Agents about to be called</h4>
                  <div className="max-h-60 overflow-auto space-y-2">
                    {agentPreview.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Agent preview will appear after a session is created.</p>
                    ) : (
                      agentPreview.map((a) => (
                        <div key={a.id} className="p-2 rounded border bg-card flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{a.name}</div>
                            <div className="text-xs text-muted-foreground">{a.type}{a.domain ? ` • ${a.domain}` : ''}</div>
                          </div>
                          <Badge variant="outline">{a.priority}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={() => setActiveStep(1)} className="flex items-center"><ChevronLeft className="h-4 w-4 mr-2" />Back</Button>
                <Button onClick={handleStart} disabled={!canStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {isProcessing ? (<><Clock className="h-4 w-4 mr-2 animate-spin" /> Processing...</>) : (<><Play className="h-4 w-4 mr-2" /> Start</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing live view */}
        {activeStep === 3 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Standardized Workflow</h3>
                  <p className="text-sm text-muted-foreground mt-1">Excel in → Consolidate → Propose boundary → Exports + Insights</p>
                </div>
                <Button onClick={handleStart} disabled={!canStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {isProcessing ? (<><Clock className="h-4 w-4 mr-2 animate-spin" /> Processing...</>) : (<><Play className="h-4 w-4 mr-2" /> Start</>)}
                </Button>
              </div>

              <div className="mt-6">
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {steps.map((s: any, idx: number) => (
                    <div key={idx} className="p-3 rounded border bg-card">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{(s.name || '').replaceAll('_', ' ')}</span>
                        <Badge variant={s.status === 'complete' ? 'secondary' : s.status === 'running' ? 'default' : 'outline'}>
                          {s.status}
                        </Badge>
                      </div>
                      {typeof s.entities === 'number' && (
                        <p className="text-xs text-muted-foreground mt-1">entities: {s.entities}</p>
                      )}
                      {typeof s.issues === 'number' && (
                        <p className="text-xs text-muted-foreground">issues: {s.issues}</p>
                      )}
                      {Array.isArray(s.files) && s.files.length > 0 && (
                        <p className="text-xs text-muted-foreground">files: {s.files.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded border bg-card md:col-span-2">
                  <h4 className="font-medium mb-2">Agent thinking</h4>
                  {Object.keys(thinkingByAgent).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Live activity will appear here during processing.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.values(thinkingByAgent).map((agent) => (
                        <div key={agent.agentId} className="border rounded p-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{agent.agentName}</div>
                            <div className="flex items-center space-x-2">
                              {typeof agent.progress === 'number' && (
                                <Badge variant="outline">{Math.round(agent.progress)}%</Badge>
                              )}
                              {agent.status && (
                                <Badge variant="secondary">{agent.status}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 max-h-40 overflow-auto text-xs">
                            <ul className="space-y-1">
                              {agent.entries.slice(0, 50).map((e, idx) => (
                                <li key={idx} className={e.level === 'error' ? 'text-red-600' : e.level === 'warning' ? 'text-yellow-700' : 'text-muted-foreground'}>
                                  <span className="text-[10px] mr-1">{new Date(e.timestamp).toLocaleTimeString()}</span>
                                  {e.step ? `[${e.step}] ` : ''}
                                  {e.task ? `${e.task}: ` : ''}
                                  <span className="text-foreground">{e.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {agent.issues.length > 0 && (
                            <div className="mt-2 p-2 rounded bg-yellow-50 text-yellow-800 text-xs">
                              <div className="font-medium mb-1">Issues</div>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {agent.issues.slice(0, 5).map((i, idx) => (<li key={idx}>{i}</li>))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 rounded border bg-card">
                  <h4 className="font-medium mb-2">Run summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between"><span>Progress</span><span className="font-medium">{runSummary.overallProgress}%</span></div>
                    <div className="flex items-center justify-between"><span>Completed agents</span><span className="font-medium">{runSummary.completedAgents}</span></div>
                    <div className="flex items-center justify-between"><span>Running agents</span><span className="font-medium">{runSummary.runningAgents}</span></div>
                    <div className="flex items-center justify-between"><span>Log entries</span><span className="font-medium">{runSummary.totalEntries}</span></div>
                    <div className="flex items-center justify-between"><span>Issues so far</span><span className="font-medium">{runSummary.totalIssues}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5" />
                <span>Insights & Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const orgBoundary = (currentSession?.results as any)?.org_boundary;
                if (!orgBoundary) {
                  return (<p className="text-sm text-muted-foreground">Insights will appear after processing completes.</p>);
                }
                return (
                  <div className="space-y-4">
                    {orgBoundary.narrative && (
                      <div>
                        <h4 className="font-medium mb-1">Narrative</h4>
                        <p className="text-sm text-muted-foreground">{orgBoundary.narrative}</p>
                      </div>
                    )}
                    {Array.isArray(orgBoundary.recommendations) && orgBoundary.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1">Recommendations</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {orgBoundary.recommendations.map((r: string, idx: number) => (<li key={idx}>{r}</li>))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(orgBoundary.issues) && orgBoundary.issues.length > 0 && (
                      <div className="mt-2 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
                        <h4 className="font-medium mb-1">Data Quality Issues</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {orgBoundary.issues.map((e: string, idx: number) => (<li key={idx}>{e}</li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
              {(status?.errors?.length > 0 || status?.status === 'error' || currentSession?.status === 'error') && (
                <div className="mt-4 p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">We hit some issues</p>
                      {status?.errors?.length > 0 && (
                        <ul className="list-disc pl-5">
                          {status.errors.map((e: string, idx: number) => (<li key={idx}>{e}</li>))}
                        </ul>
                      )}
                      <div className="mt-3">
                        <p className="font-medium">What to try</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Re-check file formats (.xlsx/.csv) and ensure headers are consistent.</li>
                          <li>Provide a previous hierarchy file to guide consolidation.</li>
                          <li>Start with a smaller subset to isolate problematic rows.</li>
                        </ul>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <Button variant="outline" onClick={handleStart}>Retry</Button>
                        <Button variant="ghost" onClick={async () => {
                          try {
                            const session = await apiClient.createSession();
                            (window as any).__nexus_backend_session = session.session_id;
                            setStatus(null);
                            setExportsList([]);
                            setWsMessages([]);
                            setActiveStep(1);
                            toast.success('Session reset. Please re-upload and try again.');
                          } catch {
                            setStatus(null);
                            setExportsList([]);
                            setWsMessages([]);
                            setActiveStep(1);
                          }
                        }}>Reset session</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2"><FileSpreadsheet className="h-5 w-5" /> <span>Exports</span></span>
                <Button size="sm" variant="outline" onClick={refreshExports}><RefreshCcw className="h-4 w-4 mr-2" /> Refresh</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exportsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exports yet. Run processing to generate Excel outputs.</p>
              ) : (
                <div className="space-y-2">
                  {exportsList.map((f) => (
                    <div key={f} className="flex items-center justify-between p-2 rounded border bg-card">
                      <span className="text-sm">{f}</span>
                      <a href={apiClient.getExportUrl(String(backendSessionId), f)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm"><Download className="h-4 w-4 mr-2" /> Download</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}


