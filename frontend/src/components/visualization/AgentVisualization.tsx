'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNexusStore } from '@/lib/store';
import { AgentStatus } from '@/types';
import { 
  Bot, 
  Brain, 
  Leaf, 
  Users, 
  Scale, 
  FileText, 
  TrendingUp, 
  FileImage,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const getAgentIcon = (agentId: string) => {
  switch (agentId) {
    case 'document-processor': return FileText;
    case 'entity-intelligence': return Brain;
    case 'carbon-expert': return Leaf;
    case 'nature-agent': return Leaf;
    case 'social-impact': return Users;
    case 'compliance-agent': return Scale;
    case 'strategic-insight': return TrendingUp;
    case 'report-generator': return FileImage;
    default: return Bot;
  }
};

const getStatusColor = (status: AgentStatus['status']) => {
  switch (status) {
    case 'idle': return 'bg-gray-100 text-gray-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'error': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: AgentStatus['status']) => {
  switch (status) {
    case 'idle': return Clock;
    case 'processing': return Loader2;
    case 'completed': return CheckCircle;
    case 'error': return XCircle;
    default: return Clock;
  }
};

interface AgentCardProps {
  agent: AgentStatus;
  isActive: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive }) => {
  const AgentIcon = getAgentIcon(agent.id);
  const StatusIcon = getStatusIcon(agent.status);

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive && "ring-2 ring-blue-500 shadow-lg",
      agent.status === 'processing' && "animate-pulse"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <AgentIcon className="h-4 w-4" />
            <span className="truncate">{agent.name}</span>
          </div>
          <Badge variant="secondary" className={getStatusColor(agent.status)}>
            <StatusIcon className={cn(
              "h-3 w-3 mr-1",
              agent.status === 'processing' && "animate-spin"
            )} />
            {agent.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-gray-600 line-clamp-2">
            {agent.description}
          </p>
          
          {agent.status === 'processing' && (
            <div className="space-y-2">
              <Progress value={agent.progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(agent.progress)}%</span>
                <span>{formatDuration(agent.startTime)}</span>
              </div>
            </div>
          )}

          {agent.currentTask && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <span className="font-medium">Current task:</span>
              <p className="mt-1">{agent.currentTask}</p>
            </div>
          )}

          {agent.insights && agent.insights.length > 0 && (
            <div className="bg-green-50 p-2 rounded">
              <span className="text-xs font-medium text-green-700">Key Insights:</span>
              <ul className="mt-1 space-y-1">
                {agent.insights.slice(0, 2).map((insight, index) => (
                  <li key={index} className="text-xs text-green-600">
                    • {insight.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {agent.status === 'completed' && (
            <div className="flex items-center justify-between text-xs text-green-600">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </span>
              {agent.startTime && agent.endTime && (
                <span>{formatDuration(agent.startTime, agent.endTime)}</span>
              )}
            </div>
          )}

          {agent.status === 'error' && (
            <div className="bg-red-50 p-2 rounded">
              <span className="text-xs font-medium text-red-700">Error occurred</span>
              <p className="text-xs text-red-600 mt-1">
                Agent encountered an issue during processing
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface AgentVisualizationProps {
  className?: string;
}

export const AgentVisualization: React.FC<AgentVisualizationProps> = ({ className }) => {
  const { currentSession, isProcessing } = useNexusStore();

  if (!currentSession) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active session</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload files to begin processing
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeAgents = currentSession.agents.filter(agent => 
    agent.status === 'processing' || agent.status === 'completed'
  );

  const completedCount = currentSession.agents.filter(agent => 
    agent.status === 'completed'
  ).length;

  const overallProgress = (completedCount / currentSession.agents.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Agent Collaboration Network</span>
            </div>
            <Badge variant={isProcessing ? 'default' : 'secondary'}>
              {isProcessing ? 'Processing' : currentSession.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{completedCount} / {currentSession.agents.length} agents completed</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            {isProcessing && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    AI agents are analyzing your documents...
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Multiple specialized agents are working in parallel to provide comprehensive insights
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentSession.agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={agent.status === 'processing'}
          />
        ))}
      </div>

      {/* Processing Timeline */}
      {activeAgents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center space-x-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    agent.status === 'completed' ? 'bg-green-500' : 
                    agent.status === 'processing' ? 'bg-blue-500 animate-pulse' : 
                    'bg-gray-300'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    {agent.currentTask && (
                      <p className="text-xs text-gray-500 truncate">{agent.currentTask}</p>
                    )}
                  </div>
                  {agent.status === 'processing' && (
                    <div className="text-xs text-blue-600">
                      {Math.round(agent.progress)}%
                    </div>
                  )}
                  {agent.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};