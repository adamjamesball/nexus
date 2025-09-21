import { 
  FileText, 
  Brain, 
  Leaf, 
  Factory, 
  Users, 
  Shield, 
  TrendingUp, 
  FileBarChart,
  Recycle,
  Droplets,
  Lightbulb
} from 'lucide-react';
import { SustainabilityAgent } from '@/types/agents';

export const sustainabilityAgents: SustainabilityAgent[] = [
  {
    id: 'smart-document',
    name: 'Smart Document Agent',
    description: 'Advanced multi-modal document processing and data extraction for sustainability reports and organizational documents.',
    icon: FileText,
    capabilities: [
      'Multi-format document parsing (PDF, Excel, Word)',
      'Table and chart extraction',
      'OCR and image analysis',
      'Data validation and cleaning'
    ],
    status: 'available',
    category: 'analysis',
    color: {
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-950 text-blue-300 border-blue-800',
      accent: 'blue'
    },
    domains: ['Data Processing', 'Document Analysis'],
    frameworks: ['Multi-modal AI', 'Computer Vision']
  },
  {
    id: 'carbon-expert',
    name: 'Carbon Expert Agent',
    description: 'GHG Protocol compliance specialist for comprehensive carbon footprint assessment and climate impact analysis.',
    icon: Leaf,
    capabilities: [
      'Scope 1, 2 & 3 emissions calculation',
      'GHG Protocol compliance verification',
      'Carbon accounting methodology',
      'Climate risk assessment'
    ],
    status: 'available',
    category: 'environmental',
    color: {
      light: 'bg-green-100 text-green-700 border-green-200',
      dark: 'bg-green-950 text-green-300 border-green-800',
      accent: 'green'
    },
    domains: ['Carbon Accounting', 'Climate', 'Decarbonization'],
    frameworks: ['GHG Protocol', 'TCFD', 'SBTi']
  },
  {
    id: 'nature-expert',
    name: 'Nature Expert Agent',
    description: 'Biodiversity impact assessment and nature-positive strategy development aligned with global frameworks.',
    icon: Recycle,
    capabilities: [
      'Biodiversity impact assessment',
      'Ecosystem services valuation',
      'Nature-based solutions identification',
      'Natural capital accounting'
    ],
    status: 'available',
    category: 'environmental',
    color: {
      light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dark: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      accent: 'emerald'
    },
    domains: ['Nature & Biodiversity', 'Circularity'],
    frameworks: ['TNFD', 'SBTN', 'Natural Capital Protocol']
  },
  {
    id: 'pcf-expert',
    name: 'Product Carbon Footprint Agent',
    description: 'Life-cycle assessment specialist for product-level carbon footprint analysis and supply chain optimization.',
    icon: Factory,
    capabilities: [
      'Life-cycle assessment (LCA)',
      'Product carbon footprint calculation',
      'Supply chain emissions mapping',
      'Hotspot identification and optimization'
    ],
    status: 'available',
    category: 'environmental',
    color: {
      light: 'bg-orange-100 text-orange-700 border-orange-200',
      dark: 'bg-orange-950 text-orange-300 border-orange-800',
      accent: 'orange'
    },
    domains: ['Product Carbon Footprint', 'Supply Chain'],
    frameworks: ['ISO 14067', 'PAS 2050', 'GHG Protocol Product Standard']
  },
  {
    id: 'entity-intelligence',
    name: 'Entity Intelligence Agent',
    description: 'Organizational structure analysis and entity relationship mapping for comprehensive boundary assessment.',
    icon: Brain,
    capabilities: [
      'Organizational structure mapping',
      'Entity relationship analysis',
      'Ownership structure validation',
      'Boundary setting optimization'
    ],
    status: 'available',
    category: 'governance',
    color: {
      light: 'bg-purple-100 text-purple-700 border-purple-200',
      dark: 'bg-purple-950 text-purple-300 border-purple-800',
      accent: 'purple'
    },
    domains: ['Governance', 'Organizational Boundary'],
    frameworks: ['Corporate Governance', 'GHG Protocol Corporate Standard']
  },
  {
    id: 'social-impact',
    name: 'Social Impact Agent',
    description: 'Comprehensive social sustainability assessment covering human rights, labor practices, and community impact.',
    icon: Users,
    capabilities: [
      'Human rights impact assessment',
      'Labor practices evaluation',
      'Community engagement analysis',
      'Social KPI monitoring'
    ],
    status: 'available',
    category: 'social',
    color: {
      light: 'bg-rose-100 text-rose-700 border-rose-200',
      dark: 'bg-rose-950 text-rose-300 border-rose-800',
      accent: 'rose'
    },
    domains: ['Social Impact', 'Human Rights', 'Labor Practices'],
    frameworks: ['GRI', 'SASB', 'UN Global Compact']
  },
  {
    id: 'compliance-agent',
    name: 'Compliance Agent',
    description: 'Regulatory compliance verification and framework alignment across multiple sustainability standards.',
    icon: Shield,
    capabilities: [
      'Multi-framework compliance checking',
      'Regulatory requirement mapping',
      'Data quality validation',
      'Audit trail maintenance'
    ],
    status: 'available',
    category: 'governance',
    color: {
      light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      dark: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      accent: 'indigo'
    },
    domains: ['Compliance', 'Governance', 'Data Quality'],
    frameworks: ['GRI', 'SASB', 'TCFD', 'EU Taxonomy', 'CSRD']
  },
  {
    id: 'strategic-insight',
    name: 'Strategic Insight Agent',
    description: 'Advanced analytics and strategic recommendation engine for sustainability performance optimization.',
    icon: TrendingUp,
    capabilities: [
      'Cross-domain pattern analysis',
      'Strategic recommendation generation',
      'Performance benchmarking',
      'Risk-opportunity assessment'
    ],
    status: 'available',
    category: 'analysis',
    color: {
      light: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      dark: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      accent: 'cyan'
    },
    domains: ['Strategic Analysis', 'Performance Optimization'],
    frameworks: ['Integrated Thinking', 'Systems Analysis']
  },
  {
    id: 'report-generator',
    name: 'Report Generation Agent',
    description: 'Automated sustainability report creation with customizable templates and stakeholder-specific outputs.',
    icon: FileBarChart,
    capabilities: [
      'Multi-format report generation',
      'Stakeholder-specific customization',
      'Data visualization creation',
      'Executive summary synthesis'
    ],
    status: 'available',
    category: 'analysis',
    color: {
      light: 'bg-slate-100 text-slate-700 border-slate-200',
      dark: 'bg-slate-950 text-slate-300 border-slate-800',
      accent: 'slate'
    },
    domains: ['Reporting', 'Communication', 'Visualization'],
    frameworks: ['GRI', 'SASB', 'TCFD', 'Integrated Reporting']
  },
  {
    id: 'water-expert',
    name: 'Water Stewardship Agent',
    description: 'Water risk assessment and stewardship strategy development for sustainable water management.',
    icon: Droplets,
    capabilities: [
      'Water risk assessment',
      'Water footprint calculation',
      'Basin-level impact analysis',
      'Stewardship strategy development'
    ],
    status: 'available',
    category: 'environmental',
    color: {
      light: 'bg-sky-100 text-sky-700 border-sky-200',
      dark: 'bg-sky-950 text-sky-300 border-sky-800',
      accent: 'sky'
    },
    domains: ['Water Stewardship', 'Risk Management'],
    frameworks: ['CEO Water Mandate', 'Water Footprint Network']
  },
  {
    id: 'innovation-agent',
    name: 'Sustainability Innovation Agent',
    description: 'Emerging technology assessment and innovation opportunity identification for sustainability advancement.',
    icon: Lightbulb,
    capabilities: [
      'Technology trend analysis',
      'Innovation opportunity mapping',
      'Emerging solution assessment',
      'Transformation pathway design'
    ],
    status: 'available',
    category: 'analysis',
    color: {
      light: 'bg-amber-100 text-amber-700 border-amber-200',
      dark: 'bg-amber-950 text-amber-300 border-amber-800',
      accent: 'amber'
    },
    domains: ['Innovation', 'Technology', 'Future Planning'],
    frameworks: ['Technology Readiness Assessment', 'Innovation Systems']
  }
];

export const getAgentsByCategory = (category: SustainabilityAgent['category']) => {
  return sustainabilityAgents.filter(agent => agent.category === category);
};

export const getAgentById = (id: string) => {
  return sustainabilityAgents.find(agent => agent.id === id);
};