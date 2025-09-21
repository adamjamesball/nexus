'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { MagicMomentInsight } from '@/types/onboarding';
import {
  CheckCircle,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Target,
  Globe,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  BarChart3,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsReviewStepProps {
  onContinue?: () => void;
}

export function ResultsReviewStep({ onContinue }: ResultsReviewStepProps) {
  const { onboarding, onboardingActions } = useNexusStore();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'company-intelligence': return Globe;
      case 'industry-analysis': return TrendingUp;
      case 'compliance-guidance': return Target;
      case 'recommendations': return Zap;
      case 'data-gaps': return AlertTriangle;
      default: return Sparkles;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default: return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const handleComplete = () => {
    onboardingActions.updateStepProgress('results-review', 100);
    onContinue?.();
  };

  const highImpactInsights = onboarding.magicMomentResults.filter(insight => insight.impact === 'high');
  const totalInsights = onboarding.magicMomentResults.length;
  const avgConfidence = totalInsights > 0
    ? onboarding.magicMomentResults.reduce((sum, insight) => sum + insight.confidence, 0) / totalInsights
    : 0;

  return (
    <div className="space-y-6">
      {/* Results Overview Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Your AI Intelligence Report
                </h2>
                <p className="text-muted-foreground mt-1">
                  Nexus AI has analyzed your company and generated personalized sustainability insights
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-sm bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                Analysis Complete
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for first analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Insights</p>
                <p className="text-2xl font-bold">{totalInsights}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highImpactInsights.length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{Math.round(avgConfidence * 100)}%</p>
              </div>
              <Target className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">{onboarding.discoveredDocuments.filter(doc => doc.isSelected).length}</p>
              </div>
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      {onboarding.magicMomentResults.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Insights</h3>
            <Badge variant="outline">{onboarding.magicMomentResults.length} insights discovered</Badge>
          </div>

          {onboarding.magicMomentResults.map((insight) => {
            const IconComponent = getInsightIcon(insight.type);

            return (
              <Card key={insight.id} className={cn('transition-all hover:shadow-md', getInsightColor(insight.impact))}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Source: {insight.source}
                        </span>
                        {insight.data && (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Insights Generated</h3>
            <p className="text-sm text-muted-foreground">
              No insights were generated during the magic moment step. You can still proceed to start your analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>What's Next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your Nexus AI brain is now configured and ready to provide intelligent sustainability analysis.
              These insights will be refined and expanded with each analysis you run.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Company profile established</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Data sources identified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI insights generated</span>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full" size="lg">
              <ArrowRight className="h-4 w-4 mr-2" />
              Complete Setup & Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}