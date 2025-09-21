'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNexusStore } from '@/lib/store';
import { OnboardingOrchestrator } from '@/components/onboarding/OnboardingOrchestrator';
import { OptimizationDashboard } from '@/components/context-connections/OptimizationDashboard';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BrainPage() {
  const {
    onboarding,
    optimization,
    isFirstTimeUser,
    hasOptimizations,
    onboardingActions
  } = useNexusStore();

  const isFirstTime = isFirstTimeUser();
  const showOptimization = !isFirstTime && hasOptimizations();
  const showEmptyOptimization = !isFirstTime && !hasOptimizations();

  // Calculate completion stats for the progress display
  const completedSteps = onboarding.steps.filter(step => step.status === 'completed').length;
  const totalSteps = onboarding.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleCompleteOnboarding = () => {
    console.log('Onboarding completed!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Nexus Brain</h1>
                <p className="text-muted-foreground">Configure your AI intelligence platform</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Configuration Hub</span>
          </div>
        </div>

        {/* Main Content */}
        {isFirstTime ? (
          <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                      <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome to Your AI Brain
                      </h2>
                      <p className="text-muted-foreground mt-1 text-lg">
                        Let's configure Nexus to understand your business for smarter insights
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {completedSteps}/{totalSteps} steps complete
                    </Badge>
                    <div className="mt-2 w-32">
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Flow */}
            <OnboardingOrchestrator onComplete={handleCompleteOnboarding} />

            {/* Benefits Preview */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>What Your Brain Will Enable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Instant Intelligence</p>
                      <p className="text-sm text-muted-foreground">AI scouts the web for your sustainability data automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Smart Recommendations</p>
                      <p className="text-sm text-muted-foreground">Get personalized suggestions based on your business context</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Continuous Learning</p>
                      <p className="text-sm text-muted-foreground">System gets smarter with every interaction</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brain Status Header */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-full shadow-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        Your AI Brain is Active
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Continuously learning and optimizing for better sustainability insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Active Learning</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {optimization.lastUpdated.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Insights & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Analyses Run</p>
                      <p className="text-2xl font-bold">{optimization.learningMetrics.totalAnalyses}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy Score</p>
                      <p className="text-2xl font-bold">{(optimization.learningMetrics.accuracyScore * 100).toFixed(0)}%</p>
                    </div>
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Data Quality</p>
                      <p className="text-2xl font-bold">{(optimization.learningMetrics.dataQualityScore * 100).toFixed(0)}%</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">User Rating</p>
                      <p className="text-2xl font-bold">{(optimization.learningMetrics.userSatisfactionScore * 5).toFixed(1)}/5</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Dashboard */}
            {showOptimization && <OptimizationDashboard />}

            {/* Empty State for Optimization */}
            {showEmptyOptimization && (
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-amber-100 dark:bg-amber-950 rounded-full">
                      <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Building Your Intelligence Profile</h3>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        Your Nexus brain is still learning about your business. Run a few analyses to see personalized optimization recommendations appear here.
                      </p>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="outline" className="mt-4">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Run Your First Analysis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span>Quick Actions</span>
                  </div>
                  <Badge variant="secondary">Configure & Optimize</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm">Add Data Sources</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Review Learning</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <Brain className="h-5 w-5" />
                    <span className="text-sm">Update Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}