'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { ExternalIntegration, IntegrationStatus } from '@/types/onboarding';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Settings,
  Database,
  Cloud,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function IntegrationSetupStep() {
  const { onboarding, onboardingActions } = useNexusStore();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const availableIntegrations = [
    {
      id: 'sharepoint',
      name: 'Microsoft SharePoint',
      description: 'Connect to your SharePoint sites for document discovery',
      icon: FileText,
      category: 'Document Management',
      estimatedDataValue: 'Sustainability reports, policies, ESG documents',
      setupTimeMinutes: 3,
      status: 'available' as IntegrationStatus,
      priority: 'high' as const
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Access documents from Google Drive and Google Workspace',
      icon: Cloud,
      category: 'Cloud Storage',
      estimatedDataValue: 'Corporate documents, presentations, spreadsheets',
      setupTimeMinutes: 2,
      status: 'available' as IntegrationStatus,
      priority: 'medium' as const
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Extract sustainability and compliance data from Salesforce',
      icon: Database,
      category: 'CRM',
      estimatedDataValue: 'Customer sustainability requirements, compliance records',
      setupTimeMinutes: 5,
      status: 'available' as IntegrationStatus,
      priority: 'medium' as const
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Access shared files and conversation data from Teams',
      icon: Users,
      category: 'Collaboration',
      estimatedDataValue: 'Meeting notes, shared sustainability discussions',
      setupTimeMinutes: 2,
      status: 'available' as IntegrationStatus,
      priority: 'low' as const
    },
    {
      id: 'dropbox',
      name: 'Dropbox Business',
      description: 'Connect to Dropbox for business document access',
      icon: Cloud,
      category: 'Cloud Storage',
      estimatedDataValue: 'Business documents, reports, presentations',
      setupTimeMinutes: 2,
      status: 'available' as IntegrationStatus,
      priority: 'low' as const
    },
    {
      id: 'custom-api',
      name: 'Custom API',
      description: 'Connect your proprietary systems via REST API',
      icon: Settings,
      category: 'Custom Integration',
      estimatedDataValue: 'Custom sustainability data, internal metrics',
      setupTimeMinutes: 10,
      status: 'available' as IntegrationStatus,
      priority: 'low' as const
    }
  ];

  const handleConnect = async (integrationId: string) => {
    setConnectingId(integrationId);

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const integration: ExternalIntegration = {
        id: integrationId,
        name: availableIntegrations.find(i => i.id === integrationId)?.name || '',
        type: integrationId as any,
        status: 'connected',
        connectedAt: new Date(),
        dataSourcesFound: Math.floor(Math.random() * 10) + 1,
        lastSync: new Date(),
        credentials: {} // This would contain actual auth tokens
      };

      onboardingActions.updateIntegration(integration);
      onboardingActions.updateStepProgress('integrations',
        (onboarding.selectedIntegrations.length + 1) * 25
      );
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    const integration: ExternalIntegration = {
      id: integrationId,
      name: availableIntegrations.find(i => i.id === integrationId)?.name || '',
      type: integrationId as any,
      status: 'disconnected',
      connectedAt: new Date(),
      dataSourcesFound: 0,
      credentials: {}
    };

    onboardingActions.updateIntegration(integration);
  };

  const getStatusIcon = (integrationId: string) => {
    const connected = onboarding.selectedIntegrations.find(i => i.id === integrationId);
    const isConnecting = connectingId === integrationId;

    if (isConnecting) return Clock;
    if (connected?.status === 'connected') return CheckCircle;
    if (connected?.status === 'error') return AlertTriangle;
    return ExternalLink;
  };

  const getStatusColor = (integrationId: string) => {
    const connected = onboarding.selectedIntegrations.find(i => i.id === integrationId);
    const isConnecting = connectingId === integrationId;

    if (isConnecting) return 'text-blue-500';
    if (connected?.status === 'connected') return 'text-green-500';
    if (connected?.status === 'error') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Recommended</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Suggested</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Optional</Badge>;
      default:
        return null;
    }
  };

  const connectedCount = onboarding.selectedIntegrations.filter(i => i.status === 'connected').length;
  const totalEstimatedData = connectedCount * 15; // Rough estimate

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Connect your data sources to give Nexus more context about your business.
          These integrations are optional but will significantly improve AI accuracy.
        </p>
        {connectedCount > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{connectedCount} integration{connectedCount !== 1 ? 's' : ''} connected</span>
            <span className="text-muted-foreground">• ~{totalEstimatedData} potential data sources</span>
          </div>
        )}
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {availableIntegrations.map((integration) => {
          const StatusIcon = getStatusIcon(integration.id);
          const isConnected = onboarding.selectedIntegrations.find(i => i.id === integration.id)?.status === 'connected';
          const isConnecting = connectingId === integration.id;
          const connectedIntegration = onboarding.selectedIntegrations.find(i => i.id === integration.id);

          return (
            <Card key={integration.id} className={cn(
              "transition-all hover:shadow-md",
              isConnected && "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      <integration.icon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{integration.name}</h3>
                        {getPriorityBadge(integration.priority)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {integration.description}
                      </p>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>Category: {integration.category}</div>
                        <div>Data: {integration.estimatedDataValue}</div>
                        <div>Setup time: ~{integration.setupTimeMinutes} min</div>
                        {isConnected && connectedIntegration && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>{connectedIntegration.dataSourcesFound} data sources found</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <StatusIcon className={cn("h-4 w-4", getStatusColor(integration.id))} />

                    {isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant={integration.priority === 'high' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Summary */}
      {connectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span>Integration Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Enhanced AI Accuracy</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Automatic document discovery</li>
                  <li>• Contextual business understanding</li>
                  <li>• Real-time data synchronization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Time Savings</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• No manual document uploads</li>
                  <li>• Automated data extraction</li>
                  <li>• Continuous learning from updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip Option */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">
          You can always add integrations later from your settings
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            onboardingActions.updateStepProgress('integrations', 100);
          }}
        >
          Continue without integrations
        </Button>
      </div>
    </div>
  );
}