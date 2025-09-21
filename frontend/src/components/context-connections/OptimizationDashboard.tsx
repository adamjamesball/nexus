'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNexusStore } from '@/lib/store';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  Brain,
  FileText,
  Users,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OptimizationDashboard() {
  const {
    optimization,
    optimizationActions
  } = useNexusStore();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getImpactTextColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700 dark:text-red-300';
      case 'medium': return 'text-yellow-700 dark:text-yellow-300';
      case 'low': return 'text-green-700 dark:text-green-300';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };

  const handleCompleteRecommendation = async (recommendationId: string) => {
    optimizationActions.completeRecommendation(recommendationId, {
      rating: 5,
      comment: 'Implemented successfully'
    });
  };

  const mockRecommendations = [
    {
      id: '1',
      title: 'Connect SharePoint for Sustainability Reports',
      description: 'Nexus found references to sustainability documents in your SharePoint. Connecting this data source could improve analysis accuracy by 15%.',
      impact: 'high' as const,
      category: 'data-enrichment' as const,
      estimatedTimeMinutes: 10,
      isCompleted: false,
      createdDate: new Date(),
      potentialImprovement: '15% accuracy boost'
    },
    {
      id: '2',
      title: 'Update Company Profile with Recent Acquisitions',
      description: 'AI detected mentions of recent acquisitions that aren\'t in your current profile. Adding this context could enhance entity intelligence.',
      impact: 'medium' as const,
      category: 'profile-update' as const,
      estimatedTimeMinutes: 5,
      isCompleted: false,
      createdDate: new Date(),
      potentialImprovement: 'Better entity mapping'
    },
    {
      id: '3',
      title: 'Review Auto-Generated ESG Insights',
      description: 'Nexus generated 5 new ESG insights from your latest analysis. Review and validate these to improve future recommendations.',
      impact: 'medium' as const,
      category: 'validation' as const,
      estimatedTimeMinutes: 8,
      isCompleted: false,
      createdDate: new Date(),
      potentialImprovement: 'Enhanced learning'
    }
  ];

  const mockEnrichmentOpportunities = [
    {
      id: '1',
      title: 'Missing Scope 3 Emissions Data',
      description: 'Your analyses would benefit from additional supplier emissions data',
      dataCategory: 'carbon-footprint' as const,
      priority: 'high' as const,
      suggestions: ['Connect supplier ESG platform', 'Upload supply chain reports'],
      potentialImpact: 'More comprehensive carbon footprint analysis'
    },
    {
      id: '2',
      title: 'Biodiversity Impact Metrics',
      description: 'Limited nature impact data affects ecosystem risk assessments',
      dataCategory: 'nature' as const,
      priority: 'medium' as const,
      suggestions: ['Add land use data', 'Connect to TNFD reports'],
      potentialImpact: 'Better biodiversity risk evaluation'
    }
  ];

  const learningInsights = [
    'Improved carbon footprint calculations by 12% based on your feedback on Scope 3 emissions',
    'Enhanced entity recognition accuracy after processing your organizational chart',
    'Refined sustainability recommendations using patterns from your previous report reviews',
    'Updated risk assessment models based on your industry-specific compliance requirements'
  ];

  return (
    <div className="space-y-6">
      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>What Nexus Learned For You</span>
            <Badge variant="secondary">Auto-improving</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>Smart Recommendations</span>
            </div>
            <Badge variant="secondary">{mockRecommendations.length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <Card key={rec.id} className={cn('border', getImpactColor(rec.impact))}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge
                          variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>~{rec.estimatedTimeMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{rec.potentialImprovement}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteRecommendation(rec.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Enrichment Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Data Enrichment Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEnrichmentOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                          {opportunity.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
                        <ul className="text-xs space-y-1">
                          {opportunity.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <ArrowRight className="h-3 w-3 text-blue-500" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Add Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completeness Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Completeness</span>
                <span className="text-sm text-muted-foreground">
                  {(optimization.progressMetrics.completenessScore * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={optimization.progressMetrics.completenessScore * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {optimization.progressMetrics.missingDataCategories.length} categories need attention
              </p>
            </div>

            {/* Analysis Depth */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Depth</span>
                <Badge variant="secondary">{optimization.progressMetrics.analysisDepth}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✅ {optimization.progressMetrics.strengthAreas.length} strength areas identified</p>
                <p>🎯 {optimization.progressMetrics.improvementOpportunities.length} improvement opportunities</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Trend */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const TrendIcon = getTrendIcon(optimization.learningMetrics.improvementTrend);
                return <TrendIcon className={cn("h-6 w-6", getTrendColor(optimization.learningMetrics.improvementTrend))} />;
              })()}
              <div>
                <h3 className="font-semibold">System Learning Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Your Nexus brain is {optimization.learningMetrics.improvementTrend} based on recent interactions
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {(optimization.learningMetrics.userSatisfactionScore * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">User satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}