'use client';

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  GitBranch,
  Info,
  ListTree,
  Play,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient, AgentConfig, AgentExecutionLog } from '@/lib/api';
import { SustainabilityDomain, SUSTAINABILITY_DOMAINS, WebSocketMessage } from '@/types';
import { toast } from 'sonner';

interface AgentConfigInspectorProps {
  agentId: string;
  context?: string | null;
  mode?: 'full' | 'info';
}

export function AgentConfigInspector({ agentId, context, mode = 'full' }: AgentConfigInspectorProps) {
  const router = useRouter();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [executionHistory, setExecutionHistory] = useState<AgentExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchAgentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAgentDetails(agentId);
      setConfig(data.config);
      setExecutionHistory(data.history);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent configuration');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const normaliseLog = useCallback(
    (entry: unknown): AgentExecutionLog => {
      const raw = entry as Record<string, any>;
      const timestampValue = raw?.timestamp;
      const timestamp = typeof timestampValue === 'string'
        ? timestampValue
        : timestampValue instanceof Date
          ? timestampValue.toISOString()
          : new Date().toISOString();

      return {
        agent_id: raw?.agent_id ?? raw?.agentId ?? agentId,
        session_id: raw?.session_id ?? raw?.sessionId ?? sessionId ?? 'unknown-session',
        timestamp,
        step_name: raw?.step_name ?? raw?.stepName ?? 'execution',
        status: raw?.status ?? 'info',
        details: raw?.details ?? {},
      };
    },
    [agentId, sessionId],
  );

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  useEffect(() => {
    const domainValue = config?.domain && isSustainabilityDomain(config.domain) ? config.domain : null;

    if (!sessionId || !domainValue) {
      return;
    }

    const ws = apiClient.connectDomainWebSocket(sessionId, domainValue, (message: WebSocketMessage) => {
      if (message.type === 'agent_log') {
        const logEntry = normaliseLog(message.payload);
        if (logEntry.agent_id === agentId) {
          setExecutionHistory((prev) => [...prev, logEntry]);
          if (['completed', 'failed', 'error'].includes(logEntry.status)) {
            setIsEvaluating(false);
          }
        }
      }
    });

    return () => {
      ws.close();
    };
  }, [agentId, config?.domain, normaliseLog, sessionId]);

  const handleRunEvaluation = async () => {
    const domainValue = config?.domain && isSustainabilityDomain(config.domain) ? config.domain : null;

    if (!domainValue) {
      toast.error('This agent is not mapped to a runnable sustainability domain yet.');
      return;
    }

    setIsEvaluating(true);
    setExecutionHistory([]);

    try {
      const { session_id } = await apiClient.createSession();
      setSessionId(session_id);
      await apiClient.startDomainAnalysis(session_id, domainValue);
      toast.success('Evaluation started successfully');
    } catch (err) {
      toast.error(`Failed to start evaluation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            {mode !== 'info' && (
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            {mode !== 'info' && (
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration Not Available</h3>
              <p className="text-muted-foreground">{error ?? 'No configuration found for this agent.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metrics = config.metrics ?? {};
  const statusLabel = (config.status ?? 'unknown').replace(/_/g, ' ');
  const domain = config.domain && isSustainabilityDomain(config.domain) ? config.domain : null;
  const showEvaluationButton = mode === 'full' && Boolean(domain);
  const displayedContext = context ?? (domain ? formatKey(domain) : config.domain ?? '—');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start space-x-4">
            {mode !== 'info' && (
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">{config.name}</h1>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {config.priority && (
              <Badge className={getPriorityColor(config.priority)}>
                {config.priority}
              </Badge>
            )}
            <Badge variant="outline">{config.type}</Badge>
            {config.domain && (
              <Badge variant="secondary">{config.domain}</Badge>
            )}
            {showEvaluationButton && (
              <Button
                onClick={handleRunEvaluation}
                disabled={isEvaluating}
                size="sm"
                className="rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {isEvaluating ? 'Running...' : 'Run Evaluation'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardMetricCard
            icon={getStatusIcon(statusLabel)}
            label="Status"
            value={capitalize(statusLabel)}
          />
          <DashboardMetricCard
            icon={<Zap className="h-4 w-4 text-blue-500" />}
            label="Success Rate"
            value={formatMetric(metrics.successRate, '%')}
          />
          <DashboardMetricCard
            icon={<Clock className="h-4 w-4 text-green-500" />}
            label="Avg Time"
            value={formatMetric(metrics.avgProcessingTime, 's')}
          />
          <DashboardMetricCard
            icon={<Activity className="h-4 w-4 text-purple-500" />}
            label="Total Runs"
            value={metrics.totalRuns != null ? String(metrics.totalRuns) : '—'}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Configuration</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="prompts">Prompts & Instructions</TabsTrigger>
            <TabsTrigger value="tools">Tools & Capabilities</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>General Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <KeyValueRow label="Domain" value={config.domain ?? '—'} />
                  <KeyValueRow label="Status" value={capitalize(statusLabel)} />
                  <KeyValueRow label="Priority" value={config.priority ? capitalize(config.priority) : '—'} />
                  <KeyValueRow label="Context" value={displayedContext} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium">Agent ID</p>
                    <p className="text-xs text-muted-foreground font-mono">{config.id}</p>
                  </div>
                  <CapabilityList title="Capabilities" values={config.capabilities} variant="outline" />
                  <CapabilityList title="Dependencies" values={config.dependencies} variant="secondary" />
                </CardContent>
              </Card>

              {config.orchestration && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GitBranch className="h-5 w-5" />
                      <span>Orchestration Model</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <KeyValueRow label="Workflow Type" value={config.orchestration.workflowType ?? '—'} />
                    <KeyValueRow label="Parallel Processing" value={formatBoolean(config.orchestration.parallelProcessing)} />
                    <KeyValueRow label="Retry Logic" value={formatBoolean(config.orchestration.retryLogic)} />
                    <KeyValueRow label="Error Handling" value={config.orchestration.errorHandling ?? '—'} />
                  </CardContent>
                </Card>
              )}
            </div>

            {config.configuration && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(config.configuration).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase">{formatKey(key)}</p>
                      <div className="mt-2 text-sm">{renderValue(value)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ListTree className="h-5 w-5" />
                  <span>Processing Workflow</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {config.processingStages && config.processingStages.length > 0 ? (
                  <div className="space-y-6">
                    {config.processingStages.map((stage, index) => (
                      <div key={`${stage.name}-${index}`} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          {index < config.processingStages!.length - 1 && (
                            <div className="flex-1 w-px bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{stage.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {stage.agents.length} agent{stage.agents.length === 1 ? '' : 's'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                          {stage.agents.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {stage.agents.map((agent) => (
                                <Badge key={agent} variant="secondary" className="text-xs">
                                  {agent}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No workflow stages defined for this agent yet." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Internal Agents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {config.internalAgents && config.internalAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.internalAgents.map((agent, index) => (
                      <div key={`${agent.name}-${index}`} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <h3 className="text-sm font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                        </div>
                        {agent.role && (
                          <Badge variant="outline" className="text-xs uppercase tracking-wide">
                            {agent.role}
                          </Badge>
                        )}
                        {agent.methods && agent.methods.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Methods</p>
                            <div className="flex flex-wrap gap-2">
                              {agent.methods.map((method) => (
                                <Badge key={method} variant="secondary" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No internal agents documented for this configuration." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Prompts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.prompts && Object.keys(config.prompts).length > 0 ? (
                  Object.entries(config.prompts).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">{formatKey(key)}</p>
                      {Array.isArray(value) ? (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {value.map((instruction, index) => (
                            <li key={`${key}-${index}`}>{instruction}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{value}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState message="No prompts have been configured for this agent." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Tooling</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.tools && config.tools.length > 0 ? (
                  config.tools.map((tool, index) => (
                    <div key={typeof tool === 'string' ? tool : tool.name ?? index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          {typeof tool === 'string' ? formatKey(tool) : tool.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Tool {index + 1}
                        </Badge>
                      </div>
                      {typeof tool === 'string' ? (
                        <p className="text-sm text-muted-foreground">Configured utility</p>
                      ) : (
                        <div className="space-y-2 text-sm">
                          {tool.description && <p className="text-muted-foreground">{tool.description}</p>}
                          {tool.parameters && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Parameters</p>
                              <pre className="bg-muted rounded-md p-3 text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(tool.parameters, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState message="No tools registered for this agent." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Executions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {executionHistory
                      .slice()
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((execution, index) => (
                        <div key={`${execution.session_id}-${index}`} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(execution.status)}
                              <div>
                                <p className="text-sm font-medium">{formatKey(execution.step_name)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(execution.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={['success', 'completed'].includes(execution.status) ? 'default' : 'destructive'}>
                              {execution.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Session {execution.session_id}</p>
                          {execution.details && Object.keys(execution.details).length > 0 && (
                            <pre className="bg-muted rounded-md p-3 text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(execution.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyState message="No execution history captured yet." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface DashboardMetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DashboardMetricCard({ icon, label, value }: DashboardMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center space-x-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface KeyValueRowProps {
  label: string;
  value: string;
}

function KeyValueRow({ label, value }: KeyValueRowProps) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}

interface CapabilityListProps {
  title: string;
  values?: string[];
  variant: 'outline' | 'secondary';
}

function CapabilityList({ title, values, variant }: CapabilityListProps) {
  if (!values || values.length === 0) {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
        <p className="text-sm mt-1 text-muted-foreground">—</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value) => (
          <Badge key={value} variant={variant} className="text-xs">
            {formatKey(value)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center border border-dashed rounded-lg p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'running':
    case 'started':
      return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
}

function formatMetric(value: number | undefined, suffix: string) {
  return value != null ? `${value}${suffix}` : '—';
}

function formatBoolean(value: boolean | undefined) {
  if (value === undefined) {
    return '—';
  }
  return value ? 'Enabled' : 'Disabled';
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatKey(value: string) {
  return value
    .split('_')
    .map((segment) => (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment))
    .join(' ');
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return <span>—</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <Badge key={String(item)} variant="secondary" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <pre className="bg-muted rounded-md p-3 text-xs font-mono whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span>{String(value)}</span>;
}

function isSustainabilityDomain(value: string): value is SustainabilityDomain {
  return value in SUSTAINABILITY_DOMAINS;
}
