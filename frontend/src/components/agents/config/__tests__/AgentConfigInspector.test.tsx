import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentConfigInspector } from '../AgentConfigInspector';
import { apiClient } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return {
    ...actual,
    apiClient: {
      getAgentDetails: jest.fn(),
      connectDomainWebSocket: jest.fn(),
      createSession: jest.fn(),
      startDomainAnalysis: jest.fn(),
    },
  };
});

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AgentConfigInspector', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedApiClient.getAgentDetails.mockResolvedValue({
      config: {
        id: 'org-boundary',
        name: 'Organizational Boundary Agent',
        description: 'Analyzes organizational structures and consolidates entities.',
        type: 'multi-agent',
        domain: 'organizational_analysis',
        status: 'active',
        priority: 'high',
        capabilities: ['ingest_uploads', 'hierarchy_mapping'],
        dependencies: ['data-quality'],
        processingStages: [
          {
            name: 'Document Parsing',
            description: 'Parse uploaded documents and normalize columns.',
            agents: ['Document Parser Agent', 'Header Detection Agent'],
          },
          {
            name: 'Boundary Proposal',
            description: 'Recommend reporting boundary using consolidated hierarchy.',
            agents: ['Boundary Proposal Agent'],
          },
        ],
        internalAgents: [
          {
            name: 'Column Detection Agent',
            description: 'Identifies relevant columns in uploaded spreadsheets.',
            methods: ['_detect_column', '_detect_name_column'],
            role: 'parsing',
          },
        ],
        configuration: {
          max_entities: 5000,
          supported_formats: ['xlsx', 'csv'],
        },
        prompts: {
          system: 'Operate as a sustainability data analyst with focus on org boundaries.',
          boundary_proposal: 'Propose an organizational boundary aligned to GHG protocol.',
        },
        tools: ['pandas_data_processor'],
        orchestration: {
          workflowType: 'sequential',
          parallelProcessing: true,
          retryLogic: true,
          errorHandling: 'graceful_fallback',
        },
        metrics: {
          successRate: 92,
          avgProcessingTime: 18,
          totalRuns: 46,
        },
      },
      history: [
        {
          agent_id: 'org-boundary',
          session_id: 'session-123',
          timestamp: new Date('2025-02-24T10:00:00Z').toISOString(),
          step_name: 'document_parsing',
          status: 'completed',
          details: { processed_entities: 245 },
        },
      ],
    });

    mockedApiClient.connectDomainWebSocket.mockReturnValue({
      close: jest.fn(),
    } as unknown as WebSocket);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders agent metadata, workflow, prompts, and execution history', async () => {
    render(<AgentConfigInspector agentId="org-boundary" mode="info" />);

    await waitFor(() => {
      expect(screen.getByText('Organizational Boundary Agent')).toBeInTheDocument();
    });

    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('multi-agent')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('tab', { name: 'Workflow' }));
    expect(screen.getByText('Document Parsing')).toBeInTheDocument();
    expect(screen.getByText('Boundary Proposal')).toBeInTheDocument();
    expect(screen.getByText('Document Parser Agent')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Prompts & Instructions' }));
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(
      screen.getByText('Operate as a sustainability data analyst with focus on org boundaries.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Tools & Capabilities' }));
    expect(screen.getByText('Pandas Data Processor')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Execution History' }));
    expect(screen.getByText('Session session-123')).toBeInTheDocument();
    expect(screen.getByText(/processed_entities/)).toBeInTheDocument();
  });
});
