'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { NEXUS_AGENT_NETWORK, SustainabilityDomain } from '@/types';
import { toast } from 'sonner';

export default function AgentsSelectionPage() {
  const { currentSession } = useNexusStore();
  const [selectedDomain, setSelectedDomain] = useState<SustainabilityDomain | null>(null);
  const [selectedUtilities, setSelectedUtilities] = useState<Record<string, boolean>>({});

  const domains = useMemo(() => {
    return Object.keys(NEXUS_AGENT_NETWORK).filter((k) => k !== 'cross_domain') as SustainabilityDomain[];
  }, []);

  const currentConfig = selectedDomain ? (NEXUS_AGENT_NETWORK as any)[selectedDomain] : null;
  const master = currentConfig?.master;
  const utilities = currentConfig?.utilities || [];

  const toggleUtility = (id: string) => {
    setSelectedUtilities((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStart = () => {
    if (!selectedDomain) {
      toast.error('Select a super agent domain first');
      return;
    }
    const chosen = Object.keys(selectedUtilities).filter((k) => selectedUtilities[k]);
    if (chosen.length === 0) {
      toast.error('Select at least one utility agent');
      return;
    }
    toast.success(`Starting ${selectedDomain} with ${chosen.length} utilities`);
    // Hook: navigate or trigger processing flow on this domain (future extension)
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Select Agents</h1>
          {currentSession && (
            <Badge variant="secondary">Session: {currentSession.id.slice(-8)}</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Super Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domains.map((domain) => {
                  const cfg: any = (NEXUS_AGENT_NETWORK as any)[domain];
                  const isSelected = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className={`w-full text-left p-3 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-card'}`}
                    >
                      <div className="font-medium">{cfg?.master?.name || domain}</div>
                      <div className="text-xs text-muted-foreground">{cfg?.master?.description || 'Domain master agent'}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Utility Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDomain && (
                <p className="text-sm text-muted-foreground">Select a super agent to view its utilities.</p>
              )}
              {selectedDomain && utilities.length === 0 && (
                <p className="text-sm text-muted-foreground">No utilities defined for this domain.</p>
              )}
              {selectedDomain && utilities.length > 0 && (
                <div className="space-y-2">
                  {utilities.map((u: any) => {
                    const checked = !!selectedUtilities[u.id];
                    return (
                      <label key={u.id} className="flex items-start space-x-3 p-3 rounded border bg-card">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          onChange={() => toggleUtility(u.id)}
                        />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.description}</div>
                        </div>
                      </label>
                    );
                  })}
                  <div className="pt-2">
                    <Button onClick={handleStart}>Start with selected utilities</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}