// Mock Service Worker handlers for API simulation
// This simulates the FastAPI backend for development and testing

import { http, HttpResponse, delay } from 'msw';
import { ProcessingSession, UploadedFile, ProcessingResults, AgentStatus, OrganizationEntity } from '@/types';
import { 
  allSyntheticData, 
  syntheticOrganizations,
  syntheticDocuments 
} from '@/data/syntheticTestData';
import { 
  allMockAgentResponses,
  mockOverallInsights 
} from '@/data/mockApiResponses';

// Mock data storage
const mockSessions = new Map<string, ProcessingSession>();
const mockFiles = new Map<string, UploadedFile[]>();
const mockResults = new Map<string, ProcessingResults>();

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createInitialAgents = (): AgentStatus[] => [
  {
    id: 'document-processor',
    name: 'Smart Document Processor',
    description: 'Intelligently parses and understands multi-modal documents',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'entity-intelligence',
    name: 'Entity Intelligence Agent',
    description: 'Extracts and maps organizational relationships',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'carbon-expert',
    name: 'Carbon Expert Agent',
    description: 'Analyzes carbon emissions and climate impacts',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'nature-agent',
    name: 'Biodiversity Agent',
    description: 'Assesses nature and biodiversity impacts',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'social-impact',
    name: 'Social Impact Agent',
    description: 'Evaluates social and community impacts',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'compliance-agent',
    name: 'Compliance Agent',
    description: 'Ensures regulatory and framework compliance',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'strategic-insight',
    name: 'Strategic Insight Agent',
    description: 'Generates strategic insights and recommendations',
    type: 'cross_domain',
    priority: 'high',
    status: 'idle',
    progress: 0
  },
  {
    id: 'report-generator',
    name: 'Report Generation Agent',
    description: 'Creates professional reports and visualizations',
    type: 'cross_domain',
    priority: 'medium',
    status: 'idle',
    progress: 0
  }
];

const generateMockEntities = (): OrganizationEntity[] => 
  syntheticOrganizations.map(org => ({
    id: generateId(),
    name: org.name,
    type: org.type === 'parent' ? 'Parent Company' : 
          org.type === 'subsidiary' ? 'Subsidiary' :
          org.type === 'joint_venture' ? 'Joint Venture' : 'Business Unit',
    jurisdiction: org.jurisdiction,
    ownershipPercentage: org.ownershipPercentage || 100,
    confidenceScore: 85 + Math.random() * 15, // 85-100%
    isUserVerified: false,
    metadata: {
      sector: org.sites[0]?.type || 'General',
      employees: org.employees,
      revenue: org.revenue,
      sites: org.sites.length
    }
  }));

export const handlers = [
  // Create new session
  http.post('/api/sessions', async () => {
    await delay(300); // Simulate network delay
    
    const sessionId = generateId();
    const session: ProcessingSession = {
      id: sessionId,
      status: 'uploading',
      files: [],
      agents: createInitialAgents(),
      startTime: new Date().toISOString()
    };
    
    mockSessions.set(sessionId, session);
    mockFiles.set(sessionId, []);
    
    return HttpResponse.json(session);
  }),

  // Get session by ID
  http.get('/api/sessions/:sessionId', async ({ params }) => {
    await delay(200);
    
    const sessionId = params.sessionId as string;
    const session = mockSessions.get(sessionId);
    
    if (!session) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(session);
  }),

  // Upload file
  http.post('/api/sessions/:sessionId/files', async ({ params, request }) => {
    await delay(500); // Simulate upload time
    
    const sessionId = params.sessionId as string;
    const session = mockSessions.get(sessionId);
    const sessionFiles = mockFiles.get(sessionId);
    
    if (!session || !sessionFiles) {
      return new HttpResponse(null, { status: 404 });
    }

    // In a real implementation, this would process the FormData
    // For mock purposes, we'll create a mock file
    const mockFile: UploadedFile = {
      id: generateId(),
      name: 'mock-document.pdf',
      size: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
      type: 'application/pdf',
      status: 'uploaded',
      progress: 100
    };
    
    sessionFiles.push(mockFile);
    session.files = [...sessionFiles];
    
    return HttpResponse.json(mockFile);
  }),

  // Delete file
  http.delete('/api/sessions/:sessionId/files/:fileId', async ({ params }) => {
    await delay(200);
    
    const sessionId = params.sessionId as string;
    const fileId = params.fileId as string;
    
    const session = mockSessions.get(sessionId);
    const sessionFiles = mockFiles.get(sessionId);
    
    if (!session || !sessionFiles) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const fileIndex = sessionFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    sessionFiles.splice(fileIndex, 1);
    session.files = [...sessionFiles];
    
    return new HttpResponse(null, { status: 204 });
  }),

  // Start processing
  http.post('/api/sessions/:sessionId/process', async ({ params }) => {
    await delay(300);
    
    const sessionId = params.sessionId as string;
    const session = mockSessions.get(sessionId);
    
    if (!session) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Update session status
    session.status = 'processing';
    
    // Simulate processing completion after a delay
    setTimeout(() => {
      const entities = generateMockEntities();
      const results: ProcessingResults = {
        id: generateId(),
        sessionId: sessionId,
        entities: entities,
        overallScore: mockOverallInsights.overallScore,
        maturityLevel: mockOverallInsights.maturityLevel,
        domainResults: mockOverallInsights.domainScores as any,
        crossDomainInsights: [],
        executiveSummary: mockOverallInsights.executiveSummary,
        keyInsights: mockOverallInsights.keyAchievements,
        recommendations: mockOverallInsights.priorityActions.map(action => ({
          id: generateId(),
          title: action,
          description: action,
          priority: 'high' as const,
          effort: 'medium' as const,
          impact: 'high' as const,
          timeline: '6-12 months',
          domains: ['cross_domain']
        })),
        processingTime: Math.floor(Math.random() * 60000) + 30000,
        confidenceScore: 90 + Math.random() * 8,
        sustainabilityProfile: {
          strengths: ['Strong sustainability leadership', 'Above-average performance'],
          weaknesses: ['Scope 3 emissions visibility', 'Circular economy transition'],
          opportunities: ['Renewable energy', 'Nature-based solutions', 'Supplier engagement'],
          threats: ['Regulatory changes', 'Climate risks', 'Supply chain disruption'],
        },
      };
      
      session.status = 'completed';
      session.results = results;
      session.endTime = new Date().toISOString();
      
      // Mark all agents as completed
      session.agents = session.agents.map(agent => ({
        ...agent,
        status: 'completed' as const,
        progress: 100,
        endTime: new Date().toISOString()
      }));
      
      mockResults.set(sessionId, results);
    }, 45000); // Complete processing after 45 seconds
    
    return new HttpResponse(null, { status: 202 });
  }),

  // Get results
  http.get('/api/sessions/:sessionId/results', async ({ params }) => {
    await delay(200);
    
    const sessionId = params.sessionId as string;
    const results = mockResults.get(sessionId);
    
    if (!results) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(results);
  }),

  // Get agent-specific results
  http.get('/api/agents/:agentId/results', async ({ params }) => {
    await delay(300);
    
    const agentId = params.agentId as string;
    const agentResults = allMockAgentResponses[agentId as keyof typeof allMockAgentResponses];
    
    if (!agentResults) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(agentResults);
  }),

  // Get synthetic test data
  http.get('/api/test-data/:dataType', async ({ params }) => {
    await delay(200);
    
    const dataType = params.dataType as string;
    const data = allSyntheticData[dataType as keyof typeof allSyntheticData];
    
    if (!data) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(data);
  }),

  // Health check
  http.get('/api/health', async () => {
    await delay(100);
    return HttpResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0-mock'
    });
  })
];

// WebSocket simulation would be handled separately
// as MSW doesn't support WebSocket mocking out of the box
export class MockWebSocketManager {
  private connections = new Map<string, WebSocket>();
  
  simulateAgentUpdates(sessionId: string, callback: (data: any) => void) {
    const session = mockSessions.get(sessionId);
    if (!session) return;

    let currentAgentIndex = 0;
    const agents = session.agents;

    const processNextAgent = () => {
      if (currentAgentIndex >= agents.length) {
        callback({
          type: 'session_update',
          data: { status: 'completed' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const agent = agents[currentAgentIndex];
      
      // Start agent
      callback({
        type: 'agent_update',
        data: {
          agentId: agent.id,
          status: 'processing',
          progress: 0,
          startTime: new Date().toISOString(),
          currentTask: this.getAgentTask(agent.id)
        },
        timestamp: new Date().toISOString()
      });

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 95) {
          clearInterval(progressInterval);
          
          // Complete agent
          callback({
            type: 'agent_update',
            data: {
              agentId: agent.id,
              status: 'completed',
              progress: 100,
              endTime: new Date().toISOString(),
              insights: this.getAgentInsights(agent.id)
            },
            timestamp: new Date().toISOString()
          });

          currentAgentIndex++;
          setTimeout(processNextAgent, 1000);
        } else {
          callback({
            type: 'agent_update',
            data: {
              agentId: agent.id,
              progress: Math.min(progress, 95),
              currentTask: this.getRandomTask(agent.id)
            },
            timestamp: new Date().toISOString()
          });
        }
      }, 1000);
    };

    setTimeout(processNextAgent, 1000);
  }

  private getAgentTask(agentId: string): string {
    const tasks: Record<string, string> = {
      'document-processor': 'Parsing document structure and extracting content...',
      'entity-intelligence': 'Identifying organizational entities and relationships...',
      'carbon-expert': 'Calculating carbon footprint and emissions data...',
      'nature-agent': 'Assessing biodiversity and ecosystem impacts...',
      'social-impact': 'Analyzing social metrics and stakeholder effects...',
      'compliance-agent': 'Checking regulatory compliance and framework alignment...',
      'strategic-insight': 'Generating strategic insights and recommendations...',
      'report-generator': 'Creating visualizations and formatting reports...'
    };
    
    return tasks[agentId] || 'Processing data...';
  }

  private getRandomTask(agentId: string): string {
    const taskSets: Record<string, string[]> = {
      'document-processor': [
        'Parsing tables and extracting structured data...',
        'Analyzing document metadata and properties...',
        'Processing images and embedded charts...'
      ],
      'entity-intelligence': [
        'Cross-referencing entity databases...',
        'Validating organizational relationships...',
        'Mapping ownership structures...'
      ]
      // Add more task variations for other agents...
    };
    
    const tasks = taskSets[agentId] || ['Processing data...'];
    return tasks[Math.floor(Math.random() * tasks.length)];
  }

  private getAgentInsights(agentId: string): string[] {
    const insights: Record<string, string[]> = {
      'document-processor': [
        'Successfully parsed 15 data tables with 98% accuracy',
        'Extracted 247 organizational references from documents'
      ],
      'entity-intelligence': [
        'Identified 23 unique entities across 8 jurisdictions',
        'Mapped complex ownership structures with high confidence'
      ],
      'carbon-expert': [
        'Calculated comprehensive Scope 1, 2, and 3 emissions',
        'Identified 5 major emission reduction opportunities'
      ],
      'nature-agent': [
        'Assessed biodiversity risks in 12 operational locations',
        'Identified nature-positive investment opportunities'
      ],
      'social-impact': [
        'Analyzed social performance across 85% of operations',
        'Identified positive community engagement trends'
      ],
      'compliance-agent': [
        'Verified alignment with 7 major sustainability frameworks',
        'Confirmed regulatory compliance in key jurisdictions'
      ],
      'strategic-insight': [
        'Generated 6 strategic recommendations for improvement',
        'Identified $2.3M in potential cost-saving opportunities'
      ],
      'report-generator': [
        'Created comprehensive executive dashboard',
        'Generated detailed analysis report with visualizations'
      ]
    };
    
    return insights[agentId] || ['Analysis completed successfully'];
  }
}