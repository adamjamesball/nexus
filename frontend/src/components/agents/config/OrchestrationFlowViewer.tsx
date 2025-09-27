'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  GitBranch,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Workflow,
  Settings,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  dependencies: string[];
  duration?: number;
  startTime?: string;
  endTime?: string;
  description: string;
}

interface OrchestrationConfig {
  sessionManagement: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    cleanupInterval: number;
  };
  agentSelection: {
    enableDynamicSelection: boolean;
    priorityWeighting: boolean;
    failoverEnabled: boolean;
  };
  workflow: {
    parallelExecution: boolean;
    errorHandling: 'stop' | 'continue' | 'retry';
    maxRetries: number;
    timeoutPerStep: number;
  };
  monitoring: {
    enableRealTimeUpdates: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsCollection: boolean;
  };
}

// Mock workflow data
const mockWorkflow: WorkflowStep[] = [
  {
    id: 'document_parsing',
    name: 'Document Parsing',
    agent: 'SmartDocumentAgent',
    status: 'complete',
    dependencies: [],
    duration: 12.5,
    startTime: '2024-01-20T10:30:00Z',
    endTime: '2024-01-20T10:30:12Z',
    description: 'Parse uploaded files and extract structured data'
  },
  {
    id: 'org_boundary_consolidation',
    name: 'Org Boundary Consolidation',
    agent: 'OrgBoundaryAgent',
    status: 'complete',
    dependencies: ['document_parsing'],
    duration: 23.8,
    startTime: '2024-01-20T10:30:12Z',
    endTime: '2024-01-20T10:30:36Z',
    description: 'Consolidate entity lists and propose reporting boundary'
  },
  {
    id: 'entity_extraction',
    name: 'Entity Extraction',
    agent: 'EntityIntelligenceAgent',
    status: 'running',
    dependencies: ['document_parsing'],
    startTime: '2024-01-20T10:30:12Z',
    description: 'Extract and analyze organizational entities'
  },
  {
    id: 'carbon_analysis',
    name: 'Carbon Analysis',
    agent: 'CarbonExpertAgent',
    status: 'pending',
    dependencies: ['entity_extraction'],
    description: 'Assess carbon footprint and GHG emissions'
  },
  {
    id: 'pcf_analysis',
    name: 'PCF Analysis',
    agent: 'PCFExpertAgent',
    status: 'pending',
    dependencies: ['entity_extraction'],
    description: 'Calculate product carbon footprints'
  },
  {
    id: 'nature_analysis',
    name: 'Nature Analysis',
    agent: 'NatureExpertAgent',
    status: 'pending',
    dependencies: ['entity_extraction'],
    description: 'Evaluate biodiversity and ecosystem impacts'
  },
  {
    id: 'export_generation',
    name: 'Export Generation',
    agent: 'ReportGeneratorAgent',
    status: 'pending',
    dependencies: ['org_boundary_consolidation', 'carbon_analysis', 'pcf_analysis', 'nature_analysis'],
    description: 'Generate Excel exports and data packages'
  },
  {
    id: 'report_generation',
    name: 'Report Generation',
    agent: 'ReportGeneratorAgent',
    status: 'pending',
    dependencies: ['export_generation'],
    description: 'Create comprehensive sustainability report'
  }
];

const mockConfig: OrchestrationConfig = {
  sessionManagement: {
    maxConcurrentSessions: 10,
    sessionTimeout: 3600,
    cleanupInterval: 300
  },
  agentSelection: {
    enableDynamicSelection: true,
    priorityWeighting: true,
    failoverEnabled: true
  },
  workflow: {
    parallelExecution: true,
    errorHandling: 'retry',
    maxRetries: 3,
    timeoutPerStep: 300
  },
  monitoring: {
    enableRealTimeUpdates: true,
    logLevel: 'info',
    metricsCollection: true
  }
};

interface OrchestrationFlowViewerProps {
  context?: string | null;
}

export function OrchestrationFlowViewer({ context }: OrchestrationFlowViewerProps) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowStep[]>(mockWorkflow);
  const [config, setConfig] = useState<OrchestrationConfig>(mockConfig);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepPosition = (stepId: string) => {
    const stepIndex = workflow.findIndex(s => s.id === stepId);
    const totalSteps = workflow.length;
    const row = Math.floor(stepIndex / 3);
    const col = stepIndex % 3;
    return { row, col, index: stepIndex };
  };

  const canStepRun = (step: WorkflowStep) => {
    return step.dependencies.every(depId =>
      workflow.find(s => s.id === depId)?.status === 'complete'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Agent Orchestration Flow</h1>
              <p className="text-muted-foreground">Monitor and configure the multi-agent workflow</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {workflow.filter(s => s.status === 'complete').length}/{workflow.length} Complete
            </Badge>
            <Badge variant="outline">
              Live Session
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="flow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="flow">Workflow Flow</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="flow" className="space-y-4">
            {/* Workflow Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Workflow className="h-5 w-5" />
                  <span>Workflow Execution Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {workflow.map((step, index) => {
                    const dependencies = step.dependencies.map(depId =>
                      workflow.find(s => s.id === depId)?.name
                    ).filter(Boolean);

                    return (
                      <Card
                        key={step.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedStep === step.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(step.status)}
                              <span className="text-sm font-medium">{step.name}</span>
                            </div>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Agent:</span>
                              <span className="font-mono">{step.agent}</span>
                            </div>
                            {step.duration && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span>{step.duration}s</span>
                              </div>
                            )}
                            {dependencies.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Depends on:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dependencies.map((dep, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {dep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step Details */}
            {selectedStep && (
              <Card>
                <CardHeader>
                  <CardTitle>Step Details: {workflow.find(s => s.id === selectedStep)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const step = workflow.find(s => s.id === selectedStep);
                    if (!step) return null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Execution Timeline</p>
                            <div className="mt-2 space-y-2">
                              {step.startTime && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Started:</span>
                                  <span>{new Date(step.startTime).toLocaleString()}</span>
                                </div>
                              )}
                              {step.endTime && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Completed:</span>
                                  <span>{new Date(step.endTime).toLocaleString()}</span>
                                </div>
                              )}
                              {step.duration && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span>{step.duration} seconds</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Readiness Status</p>
                            <div className="mt-2">
                              <Badge className={canStepRun(step) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {canStepRun(step) ? 'Ready to Execute' : 'Waiting for Dependencies'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Agent Information</p>
                            <div className="mt-2 p-3 bg-muted rounded">
                              <p className="text-sm font-mono">{step.agent}</p>
                              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Session Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Concurrent Sessions:</span>
                    <span className="text-sm font-medium">{config.sessionManagement.maxConcurrentSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Session Timeout:</span>
                    <span className="text-sm font-medium">{config.sessionManagement.sessionTimeout}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cleanup Interval:</span>
                    <span className="text-sm font-medium">{config.sessionManagement.cleanupInterval}s</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" />
                    <span>Agent Selection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dynamic Selection:</span>
                    <Badge variant={config.agentSelection.enableDynamicSelection ? 'default' : 'secondary'}>
                      {config.agentSelection.enableDynamicSelection ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority Weighting:</span>
                    <Badge variant={config.agentSelection.priorityWeighting ? 'default' : 'secondary'}>
                      {config.agentSelection.priorityWeighting ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failover:</span>
                    <Badge variant={config.agentSelection.failoverEnabled ? 'default' : 'secondary'}>
                      {config.agentSelection.failoverEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="h-5 w-5" />
                    <span>Workflow Execution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Parallel Execution:</span>
                    <Badge variant={config.workflow.parallelExecution ? 'default' : 'secondary'}>
                      {config.workflow.parallelExecution ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Error Handling:</span>
                    <span className="text-sm font-medium capitalize">{config.workflow.errorHandling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Retries:</span>
                    <span className="text-sm font-medium">{config.workflow.maxRetries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Step Timeout:</span>
                    <span className="text-sm font-medium">{config.workflow.timeoutPerStep}s</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Real-time Updates:</span>
                    <Badge variant={config.monitoring.enableRealTimeUpdates ? 'default' : 'secondary'}>
                      {config.monitoring.enableRealTimeUpdates ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Log Level:</span>
                    <span className="text-sm font-medium capitalize">{config.monitoring.logLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Metrics Collection:</span>
                    <Badge variant={config.monitoring.metricsCollection ? 'default' : 'secondary'}>
                      {config.monitoring.metricsCollection ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Live Workflow Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflow.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <div>
                          <p className="text-sm font-medium">{step.name}</p>
                          <p className="text-xs text-muted-foreground">{step.agent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                        {step.status === 'running' && (
                          <p className="text-xs text-muted-foreground mt-1">In progress...</p>
                        )}
                        {step.duration && (
                          <p className="text-xs text-muted-foreground mt-1">{step.duration}s</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}