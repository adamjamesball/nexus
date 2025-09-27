// Core system types for Nexus 360-degree sustainability AI platform

// Sustainability domain definitions
export type SustainabilityDomain = 
  | 'carbon' | 'pcf' | 'nature' | 'social' | 'decarbonization' 
  | 'circularity' | 'water' | 'supply_chain' 
  | 'governance' | 'finance' | 'innovation' | 'reporting';

export type AgentType = 'master' | 'utility' | 'cross_domain';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  file?: File;
  domainRelevance?: SustainabilityDomain[];
}

export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  domain?: SustainabilityDomain;
  type: AgentType;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentTask?: string;
  startTime?: string;
  endTime?: string;
  insights?: AgentInsight[];
  dependencies?: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AgentInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  dataPoints: string[];
  recommendations?: string[];
}

export interface OrganizationEntity {
  id: string;
  name: string;
  type: string;
  facilityType?: string;
  parentId?: string | null;
  parentName?: string | null;
  ownershipPercentage?: number;
  jurisdiction?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  businessUnit?: string | null;
  division?: string | null;
  confidenceScore: number;
  isUserVerified: boolean;
  metadata: {
    sourceFile?: string;
    sourceSheet?: string;
    sourceRow?: number;
    entityIdentifier?: string;
    displayName?: string;
    [key: string]: any;
  };
}

export interface OrgBoundaryIssue {
  code: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | string;
  entity?: string;
  field?: string;
  sourceFile?: string;
  sourceSheet?: string;
  sourceRow?: number;
  recommendation?: string;
  details?: string[];
}

export interface OrgBoundaryEdge {
  entityId: string;
  parentId?: string | null;
  parentName?: string | null;
  relationship?: string;
}

export interface OrgBoundarySummary {
  numEntities?: number;
  numIssues?: number;
  numHierarchyLinks?: number;
  regions?: string[];
  countries?: string[];
  [key: string]: unknown;
}

export interface OrgBoundaryResults {
  summary: OrgBoundarySummary;
  narrative?: string;
  recommendations?: string[];
  issues: OrgBoundaryIssue[];
  hierarchy: OrgBoundaryEdge[];
  exports?: string[];
}

export interface CarbonSummary {
  summary: string;
  ghg_protocol_alignment?: boolean;
  entities_analyzed?: number;
  entitiesAnalyzed?: number;
  geographies?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface PCFSummary {
  summary: string;
  standards?: string[];
  next_steps?: string[];
  nextSteps?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface NatureSummary {
  summary: string;
  frameworks?: string[];
  sites_considered?: number;
  sitesConsidered?: number;
  recommendations?: string[];
  [key: string]: unknown;
}

export interface ReportExecutiveSummary {
  overview: string;
  highlights: string[];
}

export interface ReportContent {
  executiveSummary: ReportExecutiveSummary;
  sections: Record<string, any>;
}

export interface DomainResult {
  domain: SustainabilityDomain;
  score: number;
  confidence: number;
  maturityLevel: 'beginner' | 'developing' | 'advanced' | 'leader';
  keyFindings: Finding[];
  dataGaps: string[];
  recommendations: Recommendation[];
  agentInsights: Record<string, AgentInsight>;
  processingTime: number;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  dataSource: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  domains: SustainabilityDomain[];
}

export interface CrossDomainInsight {
  id: string;
  title: string;
  description: string;
  involvedDomains: SustainabilityDomain[];
  insight: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface ProcessingResults {
  id?: string;
  sessionId?: string;
  entities: OrganizationEntity[];
  overallScore?: number;
  maturityLevel?: 'beginner' | 'developing' | 'advanced' | 'leader';
  domainResults?: Record<SustainabilityDomain, DomainResult>;
  crossDomainInsights?: CrossDomainInsight[];
  executiveSummary?: string;
  keyInsights?: string[];
  recommendations?: Recommendation[];
  processingTime?: number;
  processingTimeMs?: number;
  confidenceScore?: number;
  reportUrl?: string;
  sustainabilityProfile?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  orgBoundary?: OrgBoundaryResults;
  carbon?: CarbonSummary;
  pcf?: PCFSummary;
  nature?: NatureSummary;
  report?: ReportContent;
  exports?: string[];
  [key: string]: unknown;
}

export interface ProcessingSession {
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  files: UploadedFile[];
  agents: AgentStatus[];
  backendSessionId?: string;
  results?: ProcessingResults;
  startTime: string;
  endTime?: string;
  totalProcessingTime?: number;
  errorMessage?: string;
  failureLogs?: FailureRecord[];
}

export interface FailureRecord {
  timestamp: string;
  sessionId?: string | null;
  step?: string | null;
  filePath?: string | null;
  errorCode: string;
  message: string;
  hint?: string | null;
  details?: Record<string, unknown> | null;
}

export interface WebSocketMessage {
  type: 'agent_update' | 'file_update' | 'session_update' | 'agent_log' | 'error';
  data?: any;
  payload?: unknown;
  timestamp?: string;
}

// Supported file types for upload
export const SUPPORTED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'text/csv': '.csv'
} as const;

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total

// Comprehensive sustainability domain definitions
export const SUSTAINABILITY_DOMAINS: Record<SustainabilityDomain, {
  id: SustainabilityDomain;
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  carbon: {
    id: 'carbon',
    name: 'Carbon & Climate',
    description: 'Build an auditable GHG inventory and prioritize decarbonization.',
    icon: 'leaf',
    color: 'green'
  },
  nature: {
    id: 'nature',
    name: 'Nature & Biodiversity',
    description: 'Screen locations for nature risk and identify nature-positive actions.',
    icon: 'tree-pine',
    color: 'emerald'
  },
  pcf: {
    id: 'pcf',
    name: 'Product Carbon Footprinting',
    description: 'Compute product footprints faster with traceable assumptions.',
    icon: 'package',
    color: 'rose'
  },
  social: {
    id: 'social',
    name: 'Social Impact',
    description: 'Assess social risks and improve workforce and community outcomes.',
    icon: 'users',
    color: 'blue'
  },
  decarbonization: {
    id: 'decarbonization',
    name: 'Decarbonization',
    description: 'Find high-impact levers and build a realistic transition plan.',
    icon: 'trending-down',
    color: 'purple'
  },
  circularity: {
    id: 'circularity',
    name: 'Circular Economy',
    description: 'Cut waste and costs with circular material flows.',
    icon: 'recycle',
    color: 'orange'
  },
  water: {
    id: 'water',
    name: 'Water Stewardship',
    description: 'Reduce water risk with local context and targeted actions.',
    icon: 'droplets',
    color: 'cyan'
  },
  supply_chain: {
    id: 'supply_chain',
    name: 'Supply Chain',
    description: 'Engage suppliers and upgrade to primary data where it matters.',
    icon: 'truck',
    color: 'amber'
  },
  governance: {
    id: 'governance',
    name: 'ESG Governance',
    description: 'Tighten controls and readiness for assurance and regulation.',
    icon: 'scale',
    color: 'slate'
  },
  finance: {
    id: 'finance',
    name: 'Sustainable Finance',
    description: 'Link financing to impact and track sustainability outcomes.',
    icon: 'dollar-sign',
    color: 'yellow'
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation & Technology',
    description: 'Accelerate change with data, automation, and new business models.',
    icon: 'lightbulb',
    color: 'violet'
  },
  reporting: {
    id: 'reporting',
    name: 'Reporting & Assurance',
    description: 'Produce audit-ready packs across CSRD/ESRS, ISSB, and SEC.',
    icon: 'file-text',
    color: 'indigo'
  }
};

// Complete agent network definition for 360-degree sustainability intelligence
export const NEXUS_AGENT_NETWORK = {
  // Cross-domain agents
  cross_domain: [
    {
      id: 'document-intelligence',
      name: 'Document Intelligence Agent',
      description: 'Multi-modal document processing and content extraction',
      type: 'cross_domain' as AgentType,
      priority: 'critical' as const,
      capabilities: ['document_parsing', 'content_extraction', 'multi_modal_analysis']
    },
    {
      id: 'entity-relationship',
      name: 'Entity Relationship Agent',
      description: 'Organizational mapping and relationship analysis',
      type: 'cross_domain' as AgentType,
      priority: 'high' as const,
      capabilities: ['entity_extraction', 'relationship_mapping', 'organizational_analysis']
    },
    {
      id: 'synthesis-agent',
      name: 'Cross-Domain Synthesis Agent',
      description: 'Integrates insights across all sustainability domains',
      type: 'cross_domain' as AgentType,
      priority: 'critical' as const,
      capabilities: ['cross_domain_analysis', 'insight_synthesis', 'maturity_assessment']
    },
    {
      id: 'compliance-orchestrator',
      name: 'Compliance Orchestrator',
      description: 'Multi-framework compliance analysis and reporting',
      type: 'cross_domain' as AgentType,
      priority: 'high' as const,
      capabilities: ['regulatory_compliance', 'framework_analysis', 'gap_assessment']
    },
    {
      id: 'report-generator',
      name: 'Report Generation Agent',
      description: 'Comprehensive sustainability reporting and visualization',
      type: 'cross_domain' as AgentType,
      priority: 'medium' as const,
      capabilities: ['report_generation', 'data_visualization', 'executive_summary']
    }
  ],
  
  // Domain-specific master and utility agents
  carbon: {
    master: {
      id: 'carbon-master',
      name: 'Carbon Master Agent',
      description: 'Orchestrates comprehensive carbon footprint analysis',
      domain: 'carbon' as SustainabilityDomain,
      type: 'master' as AgentType,
      priority: 'critical' as const
    },
    utilities: [
      {
        id: 'ghg-calculator',
        name: 'GHG Calculation Agent',
        description: 'Calculates greenhouse gas emissions across all scopes',
        domain: 'carbon' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'scope-analyzer',
        name: 'Scope Analysis Agent',
        description: 'Detailed Scope 1, 2, and 3 emissions analysis',
        domain: 'carbon' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'carbon-accounting',
        name: 'Carbon Accounting Agent',
        description: 'Carbon accounting and inventory management',
        domain: 'carbon' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'climate-risk-assessor',
        name: 'Climate Risk Assessment Agent',
        description: 'Climate-related risk analysis and scenario planning',
        domain: 'carbon' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'medium' as const
      },
      {
        id: 'carbon-offset-validator',
        name: 'Carbon Offset Validation Agent',
        description: 'Validates and analyzes carbon offset programs',
        domain: 'carbon' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'low' as const
      }
    ]
  },
  
  nature: {
    master: {
      id: 'nature-master',
      name: 'Nature Master Agent',
      description: 'Coordinates biodiversity and ecosystem impact assessment',
      domain: 'nature' as SustainabilityDomain,
      type: 'master' as AgentType,
      priority: 'high' as const
    },
    utilities: [
      {
        id: 'biodiversity-impact',
        name: 'Biodiversity Impact Agent',
        description: 'Assesses impact on biodiversity and species conservation',
        domain: 'nature' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'ecosystem-services',
        name: 'Ecosystem Services Agent',
        description: 'Evaluates ecosystem services and natural capital',
        domain: 'nature' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'land-use-analyzer',
        name: 'Land Use Analysis Agent',
        description: 'Analyzes land use changes and deforestation impact',
        domain: 'nature' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'medium' as const
      },
      {
        id: 'species-risk-assessor',
        name: 'Species Risk Assessment Agent',
        description: 'Assesses risks to threatened and endangered species',
        domain: 'nature' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'medium' as const
      }
    ]
  },
  
  social: {
    master: {
      id: 'social-master',
      name: 'Social Master Agent',
      description: 'Manages comprehensive social impact evaluation',
      domain: 'social' as SustainabilityDomain,
      type: 'master' as AgentType,
      priority: 'high' as const
    },
    utilities: [
      {
        id: 'human-rights-assessor',
        name: 'Human Rights Assessment Agent',
        description: 'Evaluates human rights practices and compliance',
        domain: 'social' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'community-impact',
        name: 'Community Impact Agent',
        description: 'Assesses impact on local communities and stakeholders',
        domain: 'social' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'labor-practices',
        name: 'Labor Practices Agent',
        description: 'Analyzes labor standards and working conditions',
        domain: 'social' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'high' as const
      },
      {
        id: 'health-safety',
        name: 'Health & Safety Agent',
        description: 'Evaluates workplace health and safety practices',
        domain: 'social' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'medium' as const
      },
      {
        id: 'diversity-inclusion',
        name: 'Diversity & Inclusion Agent',
        description: 'Assesses diversity, equity, and inclusion initiatives',
        domain: 'social' as SustainabilityDomain,
        type: 'utility' as AgentType,
        priority: 'medium' as const
      }
    ]
  }
  ,
  reporting: {
    master: {
      id: 'reporting-master',
      name: 'Reporting & Assurance Master',
      description: 'Coordinates disclosures, narratives, and evidence for assurance',
      domain: 'reporting' as SustainabilityDomain,
      type: 'master' as AgentType,
      priority: 'high' as const
    },
    utilities: []
  }
  // Additional domains would follow the same pattern...
} as const;
