'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNexusStore } from '@/lib/store';
import { MagicMomentInsight } from '@/types/onboarding';
import {
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MagicMomentStepProps {
  onInsightsGenerated?: () => void;
}

export function MagicMomentStep({ onInsightsGenerated }: MagicMomentStepProps) {
  const { onboarding, onboardingActions } = useNexusStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const tasks = [
    'Analyzing your company profile...',
    'Searching web for sustainability reports...',
    'Discovering industry benchmarks...',
    'Extracting key ESG metrics...',
    'Identifying compliance frameworks...',
    'Generating personalized insights...'
  ];

  useEffect(() => {
    if (!hasStarted && onboarding.companyProfile?.name) {
      // Auto-start if we have company info
      setTimeout(() => {
        handleGenerateInsights();
      }, 1000);
    }
  }, [hasStarted, onboarding.companyProfile?.name]);

  const handleGenerateInsights = async () => {
    setHasStarted(true);
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate AI processing with realistic progress
      for (let i = 0; i < tasks.length; i++) {
        setCurrentTask(tasks[i]);
        setProgress((i / tasks.length) * 100);

        // Simulate processing time for each task
        const processingTime = i === 0 ? 1500 : i === tasks.length - 1 ? 2000 : 1800 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Update progress smoothly
        setProgress(((i + 1) / tasks.length) * 100);
      }

      // Call real backend API for magic moment insights
      const companyName = onboarding.companyProfile?.name || 'Your Company';
      const industry = onboarding.companyProfile?.industry || 'Technology';
      const size = onboarding.companyProfile?.size || 'medium';

      const response = await fetch('http://localhost:8000/v2/companies/magic-moment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          industry: industry,
          size: size
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();

      // Map backend insights to frontend format
      const insights: MagicMomentInsight[] = (data.insights || []).map((insight: any) => ({
        id: insight.id || `insight-${Date.now()}-${Math.random()}`,
        title: insight.title || 'Unknown Insight',
        description: insight.description || '',
        type: insight.type || 'recommendations',
        confidence: insight.confidence || 0.5,
        source: insight.source || 'AI Analysis',
        impact: insight.impact || 'medium',
        createdAt: new Date(insight.createdAt || Date.now()),
        data: insight.data || {}
      }));

      onboardingActions.addMagicMomentResults(insights);
      onboardingActions.updateStepProgress('magic-moment', 100);

    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGenerating(false);
      setCurrentTask('');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Introduction */}
      {!hasStarted && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Experience Nexus AI Magic</h3>
            <p className="text-muted-foreground">
              Watch as our AI scouts the web and generates instant insights about {onboarding.companyProfile?.name || 'your company'}'s sustainability profile.
            </p>
          </div>
          <Button
            onClick={handleGenerateInsights}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate My Insights
          </Button>
        </div>
      )}

      {/* Processing State */}
      {isGenerating && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold">AI Intelligence at Work</h3>
                  <p className="text-sm text-muted-foreground">{currentTask}</p>
                </div>
                <Badge variant="secondary">Processing...</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                  <Globe className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div>Web Search</div>
                </div>
                <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                  <FileText className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <div>Report Analysis</div>
                </div>
                <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <div>Benchmarking</div>
                </div>
                <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                  <Sparkles className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                  <div>Insights</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Insights */}
      {onboarding.magicMomentResults.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Your Personalized Sustainability Intelligence</h3>
            <Badge variant="secondary">{onboarding.magicMomentResults.length} insights</Badge>
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

          {/* Success Summary */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Nexus AI!</h3>
              <p className="text-muted-foreground mb-4">
                Your sustainability intelligence platform is now personalized and ready to provide deep insights.
                Every analysis will build on this foundation to get smarter and more accurate.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span>AI Personalized</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Benchmarks Loaded</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Ready for Analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}