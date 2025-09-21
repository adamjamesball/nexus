'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FileUploader } from '@/components/upload/FileUploader';
import { SustainabilityDashboard } from '@/components/dashboard/SustainabilityDashboard';
import { AgentCard } from '@/components/agents/AgentCard';
import { sustainabilityAgents } from '@/data/sustainabilityAgents';
import Link from 'next/link';
import { NEXUS_AGENT_NETWORK, SUSTAINABILITY_DOMAINS, SustainabilityDomain } from '@/types';
import { Leaf, TreePine, Package, Users, TrendingDown, Recycle, Droplets, Truck, Scale, DollarSign, Lightbulb, FileText } from 'lucide-react';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';
import { useNexusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Play,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  Zap,
  Brain,
  Settings,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const {
    onboarding,
    optimization,
    isFirstTimeUser,
    hasOptimizations
  } = useNexusStore();

  const isFirstTime = isFirstTimeUser();
  const showOptimization = !isFirstTime && hasOptimizations();

  // Simplified dashboard: list of super agents with brief descriptions and referenced utilities
  const SUPER_AGENT_ORDER: SustainabilityDomain[] = [
    'carbon', 'pcf', 'nature', 'social', 'decarbonization', 'circularity', 'water', 'supply_chain', 'governance', 'finance', 'innovation', 'reporting'
  ];
  const domains = SUPER_AGENT_ORDER.filter((d) => (SUSTAINABILITY_DOMAINS as any)[d]);
  const icons: Record<string, any> = {
    carbon: Leaf,
    nature: TreePine,
    pcf: Package,
    social: Users,
    decarbonization: TrendingDown,
    circularity: Recycle,
    water: Droplets,
    supply_chain: Truck,
    governance: Scale,
    finance: DollarSign,
    innovation: Lightbulb,
    reporting: FileText,
  };

  // Render simplified super agents view only
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nexus Brain Summary Section */}
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {isFirstTime ? 'Configure Your AI Brain' : 'Your AI Brain Status'}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {isFirstTime
                      ? 'Set up your AI to understand your business for smarter insights'
                      : 'Continuously learning and optimizing for better sustainability analysis'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {!isFirstTime && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-lg font-bold">{optimization.learningMetrics.totalAnalyses}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Analyses</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold">{(optimization.learningMetrics.accuracyScore * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-lg font-bold">{(optimization.learningMetrics.userSatisfactionScore * 5).toFixed(1)}/5</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Link href="/brain">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Settings className="h-4 w-4 mr-2" />
                      {isFirstTime ? 'Configure Brain' : 'Optimize Brain'}
                    </Button>
                  </Link>
                  {!isFirstTime && showOptimization && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{optimization.recommendations.length} recommendations ready</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isFirstTime && (
              <div className="mt-4 pt-4 border-t border-purple-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                    <Zap className="h-4 w-4" />
                    <span>AI web scouting for instant company intelligence</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                    <Brain className="h-4 w-4" />
                    <span>Continuous learning from every interaction</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>Smart recommendations based on your context</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <h1 className="text-2xl font-bold mb-6">Choose a Super Agent</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => {
            const meta = (SUSTAINABILITY_DOMAINS as any)[domain];
            const cfg = (NEXUS_AGENT_NETWORK as any)[domain];
            const utilities: any[] = cfg?.utilities || [];
            return (
              <Card key={domain}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      {(() => { const Icon = icons[domain] || FileText; return <Icon className="h-5 w-5" /> })()}
                      <span>{meta?.name || domain}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{meta?.description}</p>
                  {utilities.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Utility agents: {utilities.slice(0, 3).map((u) => u.name).join(', ')}
                      {utilities.length > 3 ? `, +${utilities.length - 3} more` : ''}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Utility agents: coming soon</div>
                  )}
                  <div className="pt-2">
                    <Link href={domain === 'carbon' ? '/dashboard/carbon' : '/dashboard/agents'}>
                      <Button size="sm" className="rounded-full">Choose</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}