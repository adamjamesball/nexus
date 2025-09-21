'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNexusStore } from '@/lib/store';
import { AgentVisualization } from '@/components/visualization/AgentVisualization';
import { DomainVisualization } from '@/components/visualization/DomainVisualization';
import { 
  Activity, 
  BarChart3, 
  FileText, 
  Globe, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Award
} from 'lucide-react';

type ViewMode = 'overview' | 'agents' | 'domains' | 'insights';

interface SustainabilityMetrics {
  overallScore: number;
  maturityLevel: string;
  domainsAnalyzed: number;
  totalDomains: number;
  criticalFindings: number;
  recommendations: number;
}

interface SustainabilityDashboardProps {
  className?: string;
}

export const SustainabilityDashboard: React.FC<SustainabilityDashboardProps> = ({ className }) => {
  const { currentSession, isProcessing } = useNexusStore();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Calculate metrics from current session
  const calculateMetrics = (): SustainabilityMetrics => {
    if (!currentSession) {
      return {
        overallScore: 0,
        maturityLevel: 'Not Available',
        domainsAnalyzed: 0,
        totalDomains: 10,
        criticalFindings: 0,
        recommendations: 0
      };
    }

    const results = currentSession.results;
    if (!results) {
      return {
        overallScore: 0,
        maturityLevel: 'In Progress',
        domainsAnalyzed: 0,
        totalDomains: 10,
        criticalFindings: 0,
        recommendations: 0
      };
    }

    const domainsAnalyzed = Object.keys(results.domainResults || {}).length;
    const criticalFindings = Object.values(results.domainResults || {})
      .flatMap(domain => domain.keyFindings || [])
      .filter(finding => finding.severity === 'critical').length;

    return {
      overallScore: results.overallScore || 0,
      maturityLevel: results.maturityLevel || 'Developing',
      domainsAnalyzed,
      totalDomains: 10,
      criticalFindings,
      recommendations: results.recommendations?.length || 0
    };
  };

  const metrics = calculateMetrics();

  const getMaturityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'leader': return 'text-green-700 bg-green-100 border-green-200';
      case 'advanced': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'developing': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'beginner': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentSession) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            360-Degree Sustainability Intelligence
          </h2>
          <p className="text-gray-600 mb-4">
            Comprehensive analysis across all sustainability domains
          </p>
          <p className="text-sm text-gray-500">
            Upload your sustainability documents to begin comprehensive analysis across Carbon, 
            Nature, Social Impact, Governance, and 6 other critical domains.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span>Sustainability Intelligence Dashboard</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive analysis across all sustainability domains
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'domains' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('domains')}
              >
                <Target className="h-4 w-4 mr-1" />
                Domains
              </Button>
              <Link href="/dashboard/agents">
                <Button
                  variant={viewMode === 'agents' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Agents
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      {viewMode === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <p className={cn("text-2xl font-bold", getScoreColor(metrics.overallScore))}>
                      {Math.round(metrics.overallScore)}
                    </p>
                  </div>
                  <Award className={cn("h-8 w-8", getScoreColor(metrics.overallScore))} />
                </div>
                <Progress value={metrics.overallScore} className="mt-3 h-2" />
              </CardContent>
            </Card>

            {/* Maturity Level */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maturity Level</p>
                    <Badge className={cn("mt-1", getMaturityColor(metrics.maturityLevel))}>
                      {metrics.maturityLevel}
                    </Badge>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Domains Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Domains Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.domainsAnalyzed}/{metrics.totalDomains}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <Progress 
                  value={(metrics.domainsAnalyzed / metrics.totalDomains) * 100} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </Card>

            {/* Critical Findings */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Findings</p>
                    <p className="text-2xl font-bold text-red-600">
                      {metrics.criticalFindings}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isProcessing ? (
                      <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isProcessing ? 'Analysis in Progress' : 'Analysis Complete'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isProcessing 
                          ? 'AI agents are processing your sustainability data across all domains'
                          : `Analysis completed in ${currentSession.totalProcessingTime || 0}ms`
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={isProcessing ? 'default' : 'secondary'}>
                    {currentSession.status}
                  </Badge>
                </div>

                {isProcessing && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Multi-Domain Processing Active
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Our specialized AI agents are conducting comprehensive analysis across Carbon & Climate, 
                      Nature & Biodiversity, Social Impact, Governance, Finance, Supply Chain, Water, 
                      Circularity, Decarbonization, and Innovation domains.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          {currentSession.results?.keyInsights && currentSession.results.keyInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {currentSession.results.keyInsights.slice(0, 4).map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Domain-specific View */}
      {viewMode === 'domains' && <DomainVisualization />}

      {/* Agent-specific View */}
      {viewMode === 'agents' && <AgentVisualization />}
    </div>
  );
};