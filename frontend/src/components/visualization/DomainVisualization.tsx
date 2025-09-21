'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNexusStore } from '@/lib/store';
import { SustainabilityDomain, SUSTAINABILITY_DOMAINS, DomainResult } from '@/types';
import { 
  Leaf, 
  TreePine, 
  Users, 
  TrendingDown, 
  Recycle,
  Droplets,
  Truck,
  Scale,
  DollarSign,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const getDomainIcon = (domain: SustainabilityDomain) => {
  switch (domain) {
    case 'carbon': return Leaf;
    case 'nature': return TreePine;
    case 'social': return Users;
    case 'decarbonization': return TrendingDown;
    case 'circularity': return Recycle;
    case 'water': return Droplets;
    case 'supply_chain': return Truck;
    case 'governance': return Scale;
    case 'finance': return DollarSign;
    case 'innovation': return Lightbulb;
    default: return Leaf;
  }
};

const getMaturityColor = (level: string) => {
  switch (level) {
    case 'leader': return 'text-green-700 bg-green-100';
    case 'advanced': return 'text-blue-700 bg-blue-100';
    case 'developing': return 'text-yellow-700 bg-yellow-100';
    case 'beginner': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

interface DomainCardProps {
  domain: SustainabilityDomain;
  domainResult?: DomainResult;
  agentCount: number;
  completedAgents: number;
  isProcessing: boolean;
}

const DomainCard: React.FC<DomainCardProps> = ({ 
  domain, 
  domainResult, 
  agentCount, 
  completedAgents, 
  isProcessing 
}) => {
  const domainConfig = SUSTAINABILITY_DOMAINS[domain];
  const DomainIcon = getDomainIcon(domain);
  const progress = agentCount > 0 ? (completedAgents / agentCount) * 100 : 0;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      isProcessing && "ring-2 ring-blue-200"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <DomainIcon className={cn("h-5 w-5", `text-${domainConfig.color}-600`)} />
            <span>{domainConfig.name}</span>
          </div>
          {domainResult ? (
            <Badge className={getMaturityColor(domainResult.maturityLevel)}>
              {domainResult.maturityLevel}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-gray-600">
              {isProcessing ? (
                <Clock className="h-3 w-3 mr-1" />
              ) : null}
              {isProcessing ? 'Processing' : 'Pending'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-xs text-gray-600 line-clamp-2">
            {domainConfig.description}
          </p>

          {/* Score Display */}
          {domainResult && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sustainability Score</span>
              <span className={cn("text-lg font-bold", getScoreColor(domainResult.score))}>
                {Math.round(domainResult.score)}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Agent Progress</span>
              <span>{completedAgents}/{agentCount} completed</span>
            </div>
            <Progress 
              value={progress} 
              className={cn(
                "h-2",
                isProcessing && "animate-pulse"
              )} 
            />
          </div>

          {/* Key Findings Preview */}
          {domainResult?.keyFindings && domainResult.keyFindings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Key Findings</h4>
              <div className="space-y-1">
                {domainResult.keyFindings.slice(0, 2).map((finding, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {finding.severity === 'critical' ? (
                      <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs text-gray-600 line-clamp-1">
                      {finding.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Gaps */}
          {domainResult?.dataGaps && domainResult.dataGaps.length > 0 && (
            <div className="bg-yellow-50 p-2 rounded text-xs">
              <span className="font-medium text-yellow-700">Data Gaps:</span>
              <p className="text-yellow-600 mt-1">
                {domainResult.dataGaps.slice(0, 2).join(', ')}
                {domainResult.dataGaps.length > 2 && '...'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface DomainVisualizationProps {
  className?: string;
}

export const DomainVisualization: React.FC<DomainVisualizationProps> = ({ className }) => {
  const { currentSession, isProcessing } = useNexusStore();

  if (!currentSession) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sustainability analysis in progress</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload documents to begin comprehensive sustainability assessment
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group agents by domain
  const agentsByDomain = currentSession.agents.reduce((acc, agent) => {
    if (agent.domain) {
      if (!acc[agent.domain]) {
        acc[agent.domain] = { total: 0, completed: 0 };
      }
      acc[agent.domain].total++;
      if (agent.status === 'completed') {
        acc[agent.domain].completed++;
      }
    }
    return acc;
  }, {} as Record<SustainabilityDomain, { total: number; completed: number }>);

  const overallProgress = Object.values(agentsByDomain).reduce((acc, domain) => {
    return acc + (domain.completed / domain.total) * 10; // Each domain contributes equally
  }, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5" />
              <span>Sustainability Domain Analysis</span>
            </div>
            <Badge variant={isProcessing ? 'default' : 'secondary'}>
              {Math.round(overallProgress)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>360-Degree Assessment Progress</span>
                <span>{Object.keys(agentsByDomain).length} / 10 domains active</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            {isProcessing && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Comprehensive sustainability intelligence in progress...
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  AI agents are analyzing sustainability performance across all 10 domains
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.values(SUSTAINABILITY_DOMAINS).map((domainConfig) => {
          const domainStats = agentsByDomain[domainConfig.id] || { total: 0, completed: 0 };
          const domainResult = currentSession.results?.domainResults?.[domainConfig.id];
          
          return (
            <DomainCard
              key={domainConfig.id}
              domain={domainConfig.id}
              domainResult={domainResult}
              agentCount={domainStats.total}
              completedAgents={domainStats.completed}
              isProcessing={isProcessing && domainStats.total > domainStats.completed}
            />
          );
        })}
      </div>

      {/* Cross-Domain Insights */}
      {currentSession.results?.crossDomainInsights && currentSession.results.crossDomainInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cross-Domain Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentSession.results.crossDomainInsights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {insight.involvedDomains.slice(0, 3).map((domain) => {
                          const domainConfig = SUSTAINABILITY_DOMAINS[domain];
                          const DomainIcon = getDomainIcon(domain);
                          return (
                            <Badge key={domain} variant="secondary" className="text-xs">
                              <DomainIcon className="h-3 w-3 mr-1" />
                              {domainConfig.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "ml-2",
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      )}
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};