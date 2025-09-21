'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SustainabilityAgent } from '@/types/agents';
import { cn } from '@/lib/utils';
import { Activity, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface AgentCardProps {
  agent: SustainabilityAgent;
  onClick?: (agent: SustainabilityAgent) => void;
  showStatus?: boolean;
  compact?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  onClick, 
  showStatus = true, 
  compact = false 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(agent);
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'offline':
        return <Activity className="h-4 w-4 text-gray-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'offline':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
    }
  };

  return (
    <Card 
      className={cn(
        "h-full transition-all duration-200 hover:shadow-lg cursor-pointer group",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      <CardHeader className={cn("space-y-3", compact && "pb-3")}>
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-lg",
            agent.color.light
          )}>
            <agent.icon className="h-6 w-6" />
          </div>
          {showStatus && (
            <Badge className={cn("ml-2", getStatusColor())}>
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="text-xs capitalize">{agent.status}</span>
              </div>
            </Badge>
          )}
        </div>
        
        <div>
          <CardTitle className="text-lg leading-tight">
            {agent.name}
          </CardTitle>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-2">
              {agent.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!compact && (
          <>
            {/* Domains */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sustainability Domains</h4>
              <div className="flex flex-wrap gap-1">
                {agent.domains.slice(0, 3).map((domain) => (
                  <Badge key={domain} variant="outline" className="text-xs">
                    {domain}
                  </Badge>
                ))}
                {agent.domains.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.domains.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Key Capabilities */}
            <div>
              <h4 className="text-sm font-medium mb-2">Key Capabilities</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {agent.capabilities.slice(0, 2).map((capability, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{capability}</span>
                  </li>
                ))}
                {agent.capabilities.length > 2 && (
                  <li className="text-xs font-medium">
                    +{agent.capabilities.length - 2} more capabilities
                  </li>
                )}
              </ul>
            </div>

            {/* Frameworks */}
            <div>
              <h4 className="text-sm font-medium mb-2">Frameworks</h4>
              <div className="flex flex-wrap gap-1">
                {agent.frameworks.slice(0, 2).map((framework) => (
                  <Badge key={framework} variant="secondary" className="text-xs">
                    {framework}
                  </Badge>
                ))}
                {agent.frameworks.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{agent.frameworks.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        {onClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-4 group-hover:bg-accent"
          >
            <span>Explore Agent</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};