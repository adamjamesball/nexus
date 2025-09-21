import { LucideIcon } from 'lucide-react';

export interface SustainabilityAgent {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];
  status: 'available' | 'processing' | 'offline';
  category: 'environmental' | 'social' | 'governance' | 'analysis';
  color: {
    light: string;
    dark: string;
    accent: string;
  };
  domains: string[];
  frameworks: string[];
}

export interface AgentStatus {
  agentId: string;
  status: 'available' | 'processing' | 'offline';
  currentTask?: string;
  progress?: number;
  lastUpdated: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  frameworks: string[];
}