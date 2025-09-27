import { AgentConfigInspector } from '@/components/agents/config/AgentConfigInspector';

type AgentConfigRouteParams = {
  agentId: string;
};

type AgentConfigSearchParams = {
  context?: string | string[];
  mode?: string | string[];
  [key: string]: string | string[] | undefined;
};

export default async function AgentConfigPage({
  params,
  searchParams,
}: {
  params?: Promise<AgentConfigRouteParams>;
  searchParams?: Promise<AgentConfigSearchParams>;
}) {
  const resolvedParams = params ? await params : { agentId: '' };
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const contextParam = resolvedSearchParams?.context;
  const modeParam = resolvedSearchParams?.mode;

  const context = Array.isArray(contextParam) ? contextParam[0] : contextParam;
  const mode = Array.isArray(modeParam) ? modeParam[0] : modeParam;

  return (
    <AgentConfigInspector
      agentId={resolvedParams.agentId}
      context={context ?? undefined}
      mode={mode === 'info' ? 'info' : 'full'}
    />
  );
}
