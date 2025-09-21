'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from './AgentCard';
import { sustainabilityAgents, getAgentsByCategory } from '@/data/sustainabilityAgents';
import { SustainabilityAgent } from '@/types/agents';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  Leaf, 
  Users, 
  Shield, 
  BarChart3, 
  Filter,
  Grid3X3,
  List,
  Activity,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'all' | 'environmental' | 'social' | 'governance' | 'analysis';
type LayoutMode = 'grid' | 'list';

const categoryConfig = {
  all: { icon: Grid3X3, label: 'All Agents', color: 'blue' },
  environmental: { icon: Leaf, label: 'Environmental', color: 'green' },
  social: { icon: Users, label: 'Social', color: 'rose' },
  governance: { icon: Shield, label: 'Governance', color: 'purple' },
  analysis: { icon: BarChart3, label: 'Analysis', color: 'cyan' }
};

export const AgentsOverviewDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  const filteredAgents = viewMode === 'all' 
    ? sustainabilityAgents 
    : getAgentsByCategory(viewMode);

  const getAgentStats = () => {
    const total = sustainabilityAgents.length;
    const available = sustainabilityAgents.filter(a => a.status === 'available').length;
    const processing = sustainabilityAgents.filter(a => a.status === 'processing').length;
    
    return { total, available, processing };
  };

  const handleAgentClick = (agent: SustainabilityAgent) => {
    toast.info(`${agent.name} selected. Future versions will show detailed agent views.`);
    // Future: Navigate to agent-specific view
    // router.push(`/dashboard/agents/${agent.id}`);
  };

  const stats = getAgentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <span>AI Agents Dashboard</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Specialized AI agents for comprehensive sustainability intelligence
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={layoutMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLayoutMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLayoutMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(categoryConfig) as [ViewMode, typeof categoryConfig[ViewMode]][]).map(([key, config]) => {
              const count = key === 'all' ? sustainabilityAgents.length : getAgentsByCategory(key).length;
              const IconComponent = config.icon;
              
              return (
                <Button
                  key={key}
                  variant={viewMode === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(key)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{config.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid/List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {categoryConfig[viewMode].label} ({filteredAgents.length})
          </h3>
        </div>

        {layoutMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={handleAgentClick}
                showStatus={true}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="md:flex md:items-center md:space-x-6">
                <div className="md:w-1/3">
                  <AgentCard
                    agent={agent}
                    onClick={handleAgentClick}
                    showStatus={true}
                    compact={true}
                  />
                </div>
                <div className="md:w-2/3 mt-4 md:mt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Capabilities</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {agent.capabilities.map((capability, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <h4 className="font-medium">Start Comprehensive Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Run all agents on your uploaded documents
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <h4 className="font-medium">Custom Agent Selection</h4>
                <p className="text-sm text-muted-foreground">
                  Choose specific agents for targeted analysis
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};