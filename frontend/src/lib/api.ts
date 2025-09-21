// API client for Nexus 360-degree sustainability intelligence backend
// This provides the contract interface for the FastAPI backend

import { ProcessingSession, UploadedFile, ProcessingResults, WebSocketMessage, SustainabilityDomain, DomainResult } from '@/types';

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
  
  // Domain-specific operations
  getDomains(): Promise<Array<{id: SustainabilityDomain; name: string; description: string}>>;
  getDomainResult(sessionId: string, domain: SustainabilityDomain): Promise<DomainResult>;
  getDomainAgents(domain: SustainabilityDomain): Promise<Array<{id: string; name: string; type: string}>>;
  
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

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '/api', apiKey?: string) {
    this.baseUrl = baseUrl;
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

      xhr.open('POST', `${this.baseUrl}/sessions/${sessionId}/files`);
      xhr.send(formData);
    });
  }

  async deleteFile(sessionId: string, fileId: string): Promise<void> {
    await this.request(`/sessions/${sessionId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async startProcessing(sessionId: string): Promise<void> {
    await this.request(`/v2/sessions/${sessionId}/analyze`, {
      method: 'POST',
    });
  }

  async startDomainAnalysis(sessionId: string, domain: SustainabilityDomain): Promise<void> {
    await this.request(`/v2/domains/${domain}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getResults(sessionId: string): Promise<ProcessingResults> {
    return this.request<ProcessingResults>(`/v2/sessions/${sessionId}/results`);
  }

  async listExports(sessionId: string): Promise<{ files: string[] }> {
    return this.request<{ files: string[] }>(`/v2/sessions/${sessionId}/exports`);
  }

  getExportUrl(sessionId: string, filename: string): string {
    return `${this.baseUrl}/v2/sessions/${sessionId}/exports/${encodeURIComponent(filename)}`;
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