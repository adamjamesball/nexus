'use client';

import { Suspense } from 'react';
import { OrchestrationFlowViewer } from '@/components/agents/config/OrchestrationFlowViewer';
import { useSearchParams } from 'next/navigation';

export default function OrchestrationConfigPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading orchestration...</div>}>
      <OrchestrationConfigContent />
    </Suspense>
  );
}

function OrchestrationConfigContent() {
  const searchParams = useSearchParams();
  const context = searchParams.get('context');
  return <OrchestrationFlowViewer context={context} />;
}
