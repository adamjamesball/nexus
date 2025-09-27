'use client';

import { Button } from '@/components/ui/button';
import { Settings, Eye, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ButtonSize = 'default' | 'icon' | 'sm' | 'lg';

interface InspectionButtonProps {
  agentId: string;
  variant?: 'config' | 'orchestration' | 'info';
  size?: ButtonSize | 'xs';
  className?: string;
  context?: string; // Context for where this button is placed (e.g., 'org-boundary', 'carbon')
}

export function InspectionButton({
  agentId,
  variant = 'config',
  size = 'xs',
  className = '',
  context
}: InspectionButtonProps) {
  const router = useRouter();

  const handleInspect = () => {
    if (variant === 'config') {
      router.push(`/dashboard/config/agents/${agentId}${context ? `?context=${context}` : ''}`);
    } else if (variant === 'orchestration') {
      router.push(`/dashboard/config/orchestration${context ? `?context=${context}` : ''}`);
    } else {
      // Info variant shows a modal or drawer with basic agent info
      router.push(`/dashboard/config/agents/${agentId}?mode=info${context ? `&context=${context}` : ''}`);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'config':
        return <Settings className="h-3 w-3" />;
      case 'orchestration':
        return <Eye className="h-3 w-3" />;
      case 'info':
        return <Info className="h-3 w-3" />;
      default:
        return <Settings className="h-3 w-3" />;
    }
  };

  const getLabel = () => {
    switch (variant) {
      case 'config':
        return 'Config';
      case 'orchestration':
        return 'Flow';
      case 'info':
        return 'Info';
      default:
        return 'Config';
    }
  };

  const getTitle = () => {
    switch (variant) {
      case 'config':
        return 'Inspect agent configuration';
      case 'orchestration':
        return 'View orchestration flow';
      case 'info':
        return 'View agent information';
      default:
        return 'Inspect agent configuration';
    }
  };

  const resolvedSize: ButtonSize = size === 'xs' ? 'sm' : size ?? 'sm';

  return (
    <Button
      variant="ghost"
      size={resolvedSize}
      onClick={handleInspect}
      className={`text-muted-foreground hover:text-foreground ${className}`}
      title={getTitle()}
    >
      {getIcon()}
      <span className="ml-1 text-xs">{getLabel()}</span>
    </Button>
  );
}
