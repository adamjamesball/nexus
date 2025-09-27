// API client for Nexus 360-degree sustainability intelligence backend
// This provides the contract interface for the FastAPI backend

import {
  ProcessingSession,
  UploadedFile,
  ProcessingResults,
  WebSocketMessage,
  SustainabilityDomain,
  DomainResult,
  OrganizationEntity,
  OrgBoundaryIssue,
  CarbonSummary,
  PCFSummary,
  NatureSummary,
  ReportContent,
  Recommendation,
  FailureRecord,
} from '@/types';

export interface AgentProcessingStage {
  name: string;
  description: string;
  agents: string[];
}

export interface AgentInternalAgent {
  name: string;
  description: string;
  methods?: string[];
  role?: string;
}

export interface AgentOrchestrationDetails {
  workflowType?: string;
  parallelProcessing?: boolean;
  retryLogic?: boolean;
  errorHandling?: string;
}

export interface AgentToolDefinition {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface AgentMetricsSummary {
  totalRuns?: number;
  successRate?: number;
  avgProcessingTime?: number;
  lastRun?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  domain?: string;
  status?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  capabilities?: string[];
  dependencies?: string[];
  processingStages?: AgentProcessingStage[];
  internalAgents?: AgentInternalAgent[];
  configuration?: Record<string, any>;
  prompts?: Record<string, string | string[]>;
  tools?: Array<string | AgentToolDefinition>;
  orchestration?: AgentOrchestrationDetails;
  metrics?: AgentMetricsSummary;
}

export interface AgentExecutionLog {
  agent_id: string;
  session_id: string;
  timestamp: string;
  step_name: string;
  status: string; // "started", "completed", "failed"
  details: Record<string, any>;
}

export class ApiError extends Error {
  status: number;
  detail?: string;
  body?: unknown;

  constructor(status: number, message: string, detail?: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

export interface SustainabilityAnalysisConfig {
  selectedDomains?: SustainabilityDomain[];
  industryContext?: string;
  complianceFrameworks?: string[];
  analysisDepth?: 'basic' | 'comprehensive' | 'expert';
  priorityDomains?: SustainabilityDomain[];
  // Org boundary specific (optional)
  taskObjective?: 'create_new' | 'update_existing' | 'review_assess';
  desiredOutputs?: Array<'excel' | 'excel_template' | 'system_package'>;
  targetSystem?: 'none' | 'salesforce_nzc' | 'microsoft_ssm' | 'workiva';
  customInstructions?: string;
  providedTemplateFilename?: string;
}

export interface ApiClient {
  // Session management
  createSession(config?: SustainabilityAnalysisConfig): Promise<{ session_id: string }>;
  getSession(sessionId: string): Promise<ProcessingSession>;
  updateSessionConfig(sessionId: string, config: SustainabilityAnalysisConfig): Promise<void>;
  
  // File operations
  uploadFile(sessionId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadedFile>;
  deleteFile(sessionId: string, fileId: string): Promise<void>;
  
  // Processing operations
  startProcessing(sessionId: string): Promise<void>;
  startDomainAnalysis(sessionId: string, domain: SustainabilityDomain): Promise<void>;
  getResults(sessionId: string): Promise<ProcessingResults>;
  listExports(sessionId: string): Promise<{ files: string[] }>;
  getExportUrl(sessionId: string, filename: string): string;
  getSessionStatus(sessionId: string): Promise<{ sessionId: string; status: any; config?: Record<string, unknown> }>;
  
  // Domain-specific operations
  getDomains(): Promise<Array<{id: SustainabilityDomain; name: string; description: string}>>;
  getDomainResult(sessionId: string, domain: SustainabilityDomain): Promise<DomainResult>;
  getDomainAgents(domain: SustainabilityDomain): Promise<Array<{id: string; name: string; type: string}>>;
  getAgentDetails(agentId: string): Promise<{ config: AgentConfig; history: AgentExecutionLog[] }>;
  
  // Cross-domain analysis
  getSynthesisInsights(sessionId: string): Promise<Array<{
    title: string;
    description: string;
    involvedDomains: SustainabilityDomain[];
    impact: string;
    confidence: number;
  }>>;
  getMaturityAssessment(sessionId: string): Promise<{
    overallLevel: string;
    domainLevels: Record<SustainabilityDomain, string>;
    recommendations: string[];
  }>;
  
  // WebSocket connections
  connectWebSocket(sessionId: string, onMessage: (message: WebSocketMessage) => void): WebSocket;
  connectDomainWebSocket(sessionId: string, domain: SustainabilityDomain, onMessage: (message: WebSocketMessage) => void): WebSocket;
}

export class NexusApiClient implements ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const responseText = await response.text();

    if (!response.ok) {
      let body: unknown = undefined;
      let detail: string | undefined;
      if (responseText) {
        if (isJson) {
          try {
            body = JSON.parse(responseText);
            const detailCandidate =
              (body as Record<string, unknown>)?.detail ??
              (body as Record<string, unknown>)?.message ??
              (body as Record<string, unknown>)?.error;
            if (typeof detailCandidate === 'string') {
              detail = detailCandidate;
            } else if (Array.isArray(detailCandidate)) {
              detail = detailCandidate.filter(Boolean).join(', ');
            }
            const hintCandidate = (body as Record<string, unknown>)?.hint;
            if (!detail && typeof hintCandidate === 'string') {
              detail = hintCandidate;
            }
          } catch {
            body = responseText;
          }
        } else {
          body = responseText;
        }
      }

      const message = detail || `API request failed: ${response.status} ${response.statusText}`;
      throw new ApiError(response.status, message, detail, body);
    }

    if (!responseText) {
      return undefined as T;
    }

    if (isJson) {
      try {
        return JSON.parse(responseText) as T;
      } catch {
        throw new ApiError(response.status, 'Failed to parse JSON response', undefined, responseText);
      }
    }

    return responseText as unknown as T;
  }

  async createSession(config?: SustainabilityAnalysisConfig): Promise<{ session_id: string }> {
    return this.request<{ session_id: string }>('/v2/sessions', {
      method: 'POST',
      body: config ? JSON.stringify(config) : undefined,
    });
  }

  async updateSessionConfig(sessionId: string, config: SustainabilityAnalysisConfig): Promise<void> {
    await this.request(`/v2/sessions/${sessionId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getSession(sessionId: string): Promise<ProcessingSession> {
    return this.request<ProcessingSession>(`/v2/sessions/${sessionId}`);
  }

  async uploadFile(
    sessionId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      if (this.apiKey) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.apiKey}`);
      }

      xhr.open('POST', `${this.baseUrl}/v2/sessions/${sessionId}/files`);
      xhr.send(formData);
    });
  }

  async deleteFile(sessionId: string, fileId: string): Promise<void> {
    await this.request(`/v2/sessions/${sessionId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async startProcessing(sessionId: string): Promise<void> {
    await this.request(`/v2/sessions/${sessionId}/process`, {
      method: 'POST',
      body: JSON.stringify({ use_ai: true }),
    });
  }

  async startDomainAnalysis(sessionId: string, domain: SustainabilityDomain): Promise<void> {
    await this.request(`/v2/domains/${domain}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getResults(sessionId: string): Promise<ProcessingResults> {
    const raw = await this.request<any>(`/v2/sessions/${sessionId}/results`);

    const rawEntities: any[] = Array.isArray(raw?.entities)
      ? raw.entities
      : Array.isArray(raw?.org_boundary?.entities)
        ? raw.org_boundary.entities
        : [];

    const entities: OrganizationEntity[] = rawEntities.map((entity, index) => {
      const confidenceRaw = entity?.confidence ?? entity?.confidenceScore ?? 0.85;
      const confidenceScore = confidenceRaw > 1 ? confidenceRaw : Math.round(confidenceRaw * 100);
      return {
        id: entity?.entity_id || entity?.entityId || entity?.id || `entity-${index}`,
        name: entity?.name || entity?.display_name || `Entity ${index + 1}`,
        type: entity?.type || 'Unknown',
        facilityType: entity?.facility_type || entity?.type,
        parentId: entity?.parent_id ?? entity?.parentId ?? null,
        parentName: entity?.parent_name ?? entity?.parent ?? null,
        ownershipPercentage: entity?.ownership_percentage ?? entity?.ownershipPercentage,
        jurisdiction: entity?.jurisdiction || entity?.country_code || entity?.country,
        region: entity?.region ?? null,
        country: entity?.country_raw ?? entity?.country ?? null,
        countryCode: entity?.country_code ?? null,
        businessUnit: entity?.business_unit ?? null,
        division: entity?.division ?? null,
        confidenceScore,
        isUserVerified: Boolean(entity?.is_user_verified ?? entity?.isUserVerified ?? false),
        metadata: {
          sourceFile: entity?.source_file,
          sourceSheet: entity?.source_sheet,
          sourceRow: entity?.source_row,
          entityIdentifier: entity?.entity_identifier,
          displayName: entity?.display_name,
        },
      };
    });

    const averageConfidence = entities.length
      ? Math.round(
          entities.reduce((acc, entity) => acc + (entity.confidenceScore || 0), 0) /
            entities.length
        )
      : undefined;

    const orgBoundaryRaw = raw?.org_boundary || {};
    const summaryRaw = orgBoundaryRaw?.summary || {};

    const orgBoundary = orgBoundaryRaw
      ? {
          summary: {
            numEntities: summaryRaw?.num_entities ?? summaryRaw?.numEntities ?? entities.length,
            numIssues: summaryRaw?.num_issues ?? summaryRaw?.numIssues ?? (orgBoundaryRaw?.issues?.length ?? 0),
            numHierarchyLinks:
              summaryRaw?.num_hierarchy_links ?? summaryRaw?.numHierarchyLinks ?? (orgBoundaryRaw?.hierarchy?.length ?? 0),
            regions: summaryRaw?.regions ?? [],
            countries: summaryRaw?.countries ?? [],
          },
          narrative: orgBoundaryRaw?.narrative ?? '',
          recommendations: Array.isArray(orgBoundaryRaw?.recommendations)
            ? orgBoundaryRaw.recommendations
            : [],
          issues: Array.isArray(orgBoundaryRaw?.issues)
            ? orgBoundaryRaw.issues.map((issue: any) => {
                if (typeof issue === 'string') {
                  return {
                    code: 'note',
                    message: issue,
                    severity: 'info',
                  } as OrgBoundaryIssue;
                }
                return {
                  code: issue?.code || 'issue',
                  message: issue?.message || issue?.detail || issue?.hint || 'Issue detected',
                  severity: issue?.severity || 'warning',
                  entity: issue?.entity,
                  field: issue?.field,
                  sourceFile: issue?.source_file,
                  sourceSheet: issue?.source_sheet,
                  sourceRow: issue?.source_row,
                  recommendation: issue?.recommendation,
                  details: Array.isArray(issue?.details) ? issue.details : undefined,
                } as OrgBoundaryIssue;
              })
            : [],
          hierarchy: Array.isArray(orgBoundaryRaw?.hierarchy)
            ? orgBoundaryRaw.hierarchy.map((edge: any) => ({
                entityId: edge?.entity_id || edge?.entityId,
                parentId: edge?.parent_id ?? edge?.parentId ?? null,
                parentName: edge?.parent_name ?? edge?.parentName ?? null,
                relationship: edge?.relationship || 'reports_to',
              }))
            : [],
          exports: Array.isArray(orgBoundaryRaw?.exports) ? orgBoundaryRaw.exports : [],
        }
      : undefined;

    const carbon: CarbonSummary | undefined = raw?.carbon
      ? {
          summary: raw.carbon.summary,
          ghg_protocol_alignment: raw.carbon.ghg_protocol_alignment,
          entities_analyzed: raw.carbon.entities_analyzed ?? raw.carbon.entitiesAnalyzed,
          geographies: raw.carbon.geographies,
          recommendations: raw.carbon.recommendations,
        }
      : undefined;

    const pcf: PCFSummary | undefined = raw?.pcf
      ? {
          summary: raw.pcf.summary,
          standards: raw.pcf.standards,
          next_steps: raw.pcf.next_steps ?? raw.pcf.nextSteps,
        }
      : undefined;

    const nature: NatureSummary | undefined = raw?.nature
      ? {
          summary: raw.nature.summary,
          frameworks: raw.nature.frameworks,
          sites_considered: raw.nature.sites_considered ?? raw.nature.sitesConsidered,
          recommendations: raw.nature.recommendations,
        }
      : undefined;

    const report: ReportContent | undefined = raw?.report
      ? {
          executiveSummary: {
            overview: raw.report?.executive_summary?.overview ?? '',
            highlights: raw.report?.executive_summary?.highlights ?? [],
          },
          sections: raw.report?.sections ?? {},
        }
      : undefined;

    const keyInsights: string[] = [
      ...(report?.executiveSummary?.highlights ?? []),
      ...(orgBoundary?.recommendations?.slice(0, 2) ?? []),
    ].filter(Boolean);

    const recommendations: Recommendation[] = (orgBoundary?.recommendations ?? []).map((rec: string, index: number) => ({
      id: `org-boundary-rec-${index}`,
      title: rec,
      description: rec,
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      timeline: 'Next quarter',
      domains: ['carbon'],
    }));

    return {
      sessionId,
      entities,
      orgBoundary,
      carbon,
      pcf,
      nature,
      report,
      exports: orgBoundary?.exports,
      processingTimeMs: raw?.processing_time_ms ?? raw?.processing_time ?? undefined,
      confidenceScore: averageConfidence,
      keyInsights,
      recommendations,
    } as ProcessingResults;
  }

  async listExports(sessionId: string): Promise<{ files: string[] }> {
    return this.request<{ files: string[] }>(`/v2/sessions/${sessionId}/exports`);
  }

  getExportUrl(sessionId: string, filename: string): string {
    return `${this.baseUrl}/v2/sessions/${sessionId}/exports/${encodeURIComponent(filename)}`;
  }

  async getSessionStatus(sessionId: string): Promise<{ sessionId: string; status: any; config?: Record<string, unknown> }> {
    return this.request<{ sessionId: string; status: any; config?: Record<string, unknown> }>(`/v2/sessions/${sessionId}`);
  }

  async getSessionFailures(sessionId: string, limit = 50): Promise<FailureRecord[]> {
    type RawFailure = {
      timestamp: string;
      session_id?: string | null;
      step?: string | null;
      file_path?: string | null;
      error_code: string;
      message: string;
      hint?: string | null;
      details?: Record<string, unknown> | null;
    };

    const data = await this.request<{ failures: RawFailure[] }>(`/v2/sessions/${sessionId}/failures?limit=${limit}`);
    return (data.failures ?? []).map((failure) => ({
      timestamp: failure.timestamp,
      sessionId: failure.session_id ?? undefined,
      step: failure.step ?? undefined,
      filePath: failure.file_path ?? undefined,
      errorCode: failure.error_code,
      message: failure.message,
      hint: failure.hint ?? undefined,
      details: failure.details ?? undefined,
    }));
  }

  // Domain-specific operations
  async getDomains() {
    return this.request<Array<{id: SustainabilityDomain; name: string; description: string}>>('/v2/domains');
  }

  async getDomainResult(sessionId: string, domain: SustainabilityDomain): Promise<DomainResult> {
    return this.request<DomainResult>(`/v2/domains/${domain}/results?sessionId=${sessionId}`);
  }

  async getDomainAgents(domain: SustainabilityDomain) {
    return this.request<Array<{id: string; name: string; type: string}>>(`/v2/domains/${domain}/agents`);
  }

  async getAgentDetails(agentId: string): Promise<{ config: AgentConfig; history: AgentExecutionLog[] }> {
    const data = await this.request<{ config: any; history?: unknown }>(`/v2/agents/${agentId}/details`);

    const config = transformAgentConfig(data?.config ?? {});
    const history = Array.isArray(data?.history)
      ? (data?.history as any[]).map((entry) => ({
          agent_id: entry?.agent_id ?? entry?.agentId ?? agentId,
          session_id: entry?.session_id ?? entry?.sessionId ?? 'unknown-session',
          timestamp: typeof entry?.timestamp === 'string'
            ? entry.timestamp
            : entry?.timestamp?.toString?.() ?? new Date().toISOString(),
          step_name: entry?.step_name ?? entry?.stepName ?? 'execution',
          status: entry?.status ?? 'info',
          details: entry?.details ?? {},
        }))
      : [];

    return { config, history };
  }

  // Cross-domain analysis
  async getSynthesisInsights(sessionId: string) {
    return this.request<Array<{
      title: string;
      description: string;
      involvedDomains: SustainabilityDomain[];
      impact: string;
      confidence: number;
    }>>(`/v2/sessions/${sessionId}/synthesis`);
  }

  async getMaturityAssessment(sessionId: string) {
    return this.request<{
      overallLevel: string;
      domainLevels: Record<SustainabilityDomain, string>;
      recommendations: string[];
    }>(`/v2/sessions/${sessionId}/maturity`);
  }

  connectWebSocket(sessionId: string, onMessage: (message: WebSocketMessage) => void): WebSocket {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws') + `/v2/sessions/${sessionId}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  connectDomainWebSocket(sessionId: string, domain: SustainabilityDomain, onMessage: (message: WebSocketMessage) => void): WebSocket {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws') + `/v2/domains/${domain}/ws?sessionId=${sessionId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse domain WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Domain WebSocket error:', error);
    };

    return ws;
  }
}

// Default API client instance
export const apiClient = new NexusApiClient();

function transformAgentConfig(raw: any): AgentConfig {
  const processingStages = Array.isArray(raw?.processing_stages)
    ? raw.processing_stages.map((stage: any) => ({
        name: stage?.name ?? 'Stage',
        description: stage?.description ?? '',
        agents: Array.isArray(stage?.agents) ? stage.agents : [],
      }))
    : undefined;

  const internalAgents = Array.isArray(raw?.internal_agents)
    ? raw.internal_agents.map((agent: any) => ({
        name: agent?.name ?? 'Internal Agent',
        description: agent?.description ?? '',
        methods: Array.isArray(agent?.methods) ? agent.methods : undefined,
        role: agent?.role,
      }))
    : undefined;

  const orchestration = raw?.orchestration
    ? {
        workflowType: raw.orchestration.workflow_type ?? raw.orchestration.workflowType,
        parallelProcessing: raw.orchestration.parallel_processing ?? raw.orchestration.parallelProcessing,
        retryLogic: raw.orchestration.retry_logic ?? raw.orchestration.retryLogic,
        errorHandling: raw.orchestration.error_handling ?? raw.orchestration.errorHandling,
      }
    : undefined;

  const tools = Array.isArray(raw?.tools)
    ? raw.tools.map((tool: any) => {
        if (typeof tool === 'string') {
          return tool;
        }
        return {
          name: tool?.name ?? 'Unnamed tool',
          description: tool?.description,
          parameters: tool?.parameters,
        } as AgentToolDefinition;
      })
    : undefined;

  return {
    id: raw?.id ?? 'unknown-agent',
    name: raw?.name ?? 'Unknown Agent',
    description: raw?.description ?? '',
    type: raw?.type ?? 'utility',
    domain: raw?.domain ?? raw?.domain_id,
    status: raw?.status,
    priority: raw?.priority,
    capabilities: Array.isArray(raw?.capabilities) ? raw.capabilities : undefined,
    dependencies: Array.isArray(raw?.dependencies) ? raw.dependencies : undefined,
    processingStages,
    internalAgents,
    configuration: raw?.configuration ?? undefined,
    prompts: raw?.prompts ?? undefined,
    tools,
    orchestration,
    metrics: raw?.metrics ?? undefined,
  };
}
