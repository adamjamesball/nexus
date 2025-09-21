// Mock API responses for testing AI agents
import { allSyntheticData } from './syntheticTestData';

export interface AgentAnalysisResult {
  agentId: string;
  status: 'completed' | 'processing' | 'error';
  confidence: number;
  insights: {
    id: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    dataPoints: any[];
  }[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
  }[];
  metrics: Record<string, number>;
  processingTime: number;
}

// Smart Document Agent mock response
export const mockDocumentAgentResponse: AgentAnalysisResult = {
  agentId: 'smart-document',
  status: 'completed',
  confidence: 0.94,
  insights: [
    {
      id: 'doc-insight-1',
      title: 'Multi-format Document Processing Complete',
      description: 'Successfully processed 5 documents including PDF sustainability reports, Excel carbon inventories, and Word policy documents',
      impact: 'high',
      category: 'Data Extraction',
      dataPoints: allSyntheticData.documents
    },
    {
      id: 'doc-insight-2',
      title: 'High-Quality Data Extraction Achieved',
      description: '94% accuracy in structured data extraction from unstructured documents',
      impact: 'high',
      category: 'Data Quality',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'doc-rec-1',
      title: 'Standardize Document Templates',
      description: 'Implement standardized templates for sustainability reporting to improve data extraction accuracy',
      priority: 'medium',
      effort: 'medium',
      impact: 'high',
      timeline: '3-6 months'
    }
  ],
  metrics: {
    documentsProcessed: 5,
    dataPointsExtracted: 847,
    accuracyScore: 0.94
  },
  processingTime: 3200
};

// Carbon Expert Agent mock response
export const mockCarbonAgentResponse: AgentAnalysisResult = {
  agentId: 'carbon-expert',
  status: 'completed',
  confidence: 0.91,
  insights: [
    {
      id: 'carbon-insight-1',
      title: 'Scope 3 Emissions Dominate Carbon Footprint',
      description: 'Scope 3 emissions represent 77% of total carbon footprint (450,000 tCO2e), primarily from purchased goods and use of sold products',
      impact: 'high',
      category: 'Emissions Profile',
      dataPoints: [allSyntheticData.carbon]
    },
    {
      id: 'carbon-insight-2',
      title: 'Strong Progress on Scope 1 & 2 Reduction',
      description: '15% reduction in Scope 1 & 2 emissions achieved vs. baseline, on track for SBTi targets',
      impact: 'medium',
      category: 'Target Performance',
      dataPoints: []
    },
    {
      id: 'carbon-insight-3',
      title: 'Renewable Energy Adoption Accelerating',
      description: '35% renewable energy adoption across operations, above industry average of 28%',
      impact: 'medium',
      category: 'Energy Transition',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'carbon-rec-1',
      title: 'Implement Scope 3 Supplier Engagement Program',
      description: 'Launch comprehensive supplier engagement program to reduce purchased goods emissions by 20%',
      priority: 'high',
      effort: 'high',
      impact: 'high',
      timeline: '12-18 months'
    },
    {
      id: 'carbon-rec-2',
      title: 'Accelerate Renewable Energy Transition',
      description: 'Target 100% renewable electricity by 2027 through PPAs and on-site generation',
      priority: 'high',
      effort: 'medium',
      impact: 'medium',
      timeline: '24-36 months'
    }
  ],
  metrics: {
    totalEmissions: 580000,
    scope1Percentage: 7.8,
    scope2Percentage: 14.7,
    scope3Percentage: 77.6,
    renewablePercentage: 35,
    targetAlignment: 0.85
  },
  processingTime: 4100
};

// Nature Expert Agent mock response
export const mockNatureAgentResponse: AgentAnalysisResult = {
  agentId: 'nature-expert',
  status: 'completed',
  confidence: 0.88,
  insights: [
    {
      id: 'nature-insight-1',
      title: 'Moderate Biodiversity Impact Identified',
      description: 'Operations show medium dependency on ecosystem services, particularly pollination and climate regulation',
      impact: 'medium',
      category: 'Biodiversity Risk',
      dataPoints: [allSyntheticData.nature]
    },
    {
      id: 'nature-insight-2',
      title: 'Protected Areas in Proximity',
      description: '8 protected areas within 10km of operations, requiring enhanced biodiversity monitoring',
      impact: 'medium',
      category: 'Conservation Risk',
      dataPoints: []
    },
    {
      id: 'nature-insight-3',
      title: 'Natural Capital Opportunities',
      description: 'Potential for 2,500 tCO2/year carbon sequestration through nature-based solutions',
      impact: 'high',
      category: 'Natural Capital',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'nature-rec-1',
      title: 'Develop Biodiversity Monitoring Program',
      description: 'Implement TNFD-aligned monitoring for sites near protected areas',
      priority: 'high',
      effort: 'medium',
      impact: 'medium',
      timeline: '6-12 months'
    },
    {
      id: 'nature-rec-2',
      title: 'Invest in Nature-Based Solutions',
      description: 'Deploy reforestation and wetland restoration projects for carbon sequestration',
      priority: 'medium',
      effort: 'high',
      impact: 'high',
      timeline: '18-24 months'
    }
  ],
  metrics: {
    landUseFootprint: 1250,
    waterDependency: 125000,
    carbonSequestrationPotential: 2500,
    protectedAreasNearby: 8,
    biodiversityRiskScore: 0.65
  },
  processingTime: 3800
};

// Social Impact Agent mock response
export const mockSocialAgentResponse: AgentAnalysisResult = {
  agentId: 'social-impact',
  status: 'completed',
  confidence: 0.92,
  insights: [
    {
      id: 'social-insight-1',
      title: 'Strong Workforce Diversity Progress',
      description: 'Gender balance at 45% women, exceeding industry benchmark of 35%',
      impact: 'medium',
      category: 'Diversity & Inclusion',
      dataPoints: [allSyntheticData.social]
    },
    {
      id: 'social-insight-2',
      title: 'Excellent Safety Performance',
      description: 'LTIR of 0.85 significantly below industry average of 2.1',
      impact: 'high',
      category: 'Workplace Safety',
      dataPoints: []
    },
    {
      id: 'social-insight-3',
      title: 'Robust Community Investment',
      description: '$2.5M community investment reaching 12,000 beneficiaries',
      impact: 'high',
      category: 'Community Impact',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'social-rec-1',
      title: 'Enhance Leadership Diversity',
      description: 'Target 40% diverse representation in senior leadership by 2026',
      priority: 'medium',
      effort: 'medium',
      impact: 'medium',
      timeline: '18-24 months'
    },
    {
      id: 'social-rec-2',
      title: 'Expand Skills Development Programs',
      description: 'Increase training hours to 200,000 annually with focus on green skills',
      priority: 'medium',
      effort: 'medium',
      impact: 'high',
      timeline: '12-18 months'
    }
  ],
  metrics: {
    totalEmployees: 26500,
    genderBalance: 45,
    ltir: 0.85,
    communityInvestment: 2500000,
    trainingHours: 185000,
    localHiring: 78
  },
  processingTime: 3500
};

// Product Carbon Footprint Agent mock response
export const mockPCFAgentResponse: AgentAnalysisResult = {
  agentId: 'pcf-expert',
  status: 'completed',
  confidence: 0.89,
  insights: [
    {
      id: 'pcf-insight-1',
      title: 'Raw Materials Drive Product Emissions',
      description: 'Raw materials account for 40% of product carbon footprint across analyzed products',
      impact: 'high',
      category: 'Lifecycle Hotspots',
      dataPoints: allSyntheticData.products
    },
    {
      id: 'pcf-insight-2',
      title: 'High Recycled Content in Key Materials',
      description: 'Aluminum and steel show 80% and 60% recycled content respectively',
      impact: 'medium',
      category: 'Circularity',
      dataPoints: []
    },
    {
      id: 'pcf-insight-3',
      title: 'Use Phase Optimization Opportunity',
      description: 'Energy-efficient design could reduce use phase emissions by 30%',
      impact: 'high',
      category: 'Design Optimization',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'pcf-rec-1',
      title: 'Increase Recycled Content Targets',
      description: 'Set target of 90% recycled content for aluminum and steel by 2026',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      timeline: '12-24 months'
    },
    {
      id: 'pcf-rec-2',
      title: 'Implement Design for Circularity',
      description: 'Redesign products for easier disassembly and material recovery',
      priority: 'medium',
      effort: 'high',
      impact: 'high',
      timeline: '24-36 months'
    }
  ],
  metrics: {
    averageCarbonFootprint: 150.4,
    recycledContentAverage: 58,
    circularityScore: 0.72,
    hotspotsMapped: 15,
    optimizationPotential: 0.25
  },
  processingTime: 4200
};

// Compliance Agent mock response
export const mockComplianceAgentResponse: AgentAnalysisResult = {
  agentId: 'compliance-agent',
  status: 'completed',
  confidence: 0.96,
  insights: [
    {
      id: 'compliance-insight-1',
      title: 'Strong Multi-Framework Alignment',
      description: '92% compliance across GRI, SASB, TCFD, and EU Taxonomy requirements',
      impact: 'high',
      category: 'Regulatory Compliance',
      dataPoints: []
    },
    {
      id: 'compliance-insight-2',
      title: 'CSRD Readiness Assessment',
      description: '78% readiness for EU Corporate Sustainability Reporting Directive',
      impact: 'medium',
      category: 'Future Regulations',
      dataPoints: []
    },
    {
      id: 'compliance-insight-3',
      title: 'Data Quality Validation Complete',
      description: '94% data quality score with comprehensive audit trail',
      impact: 'high',
      category: 'Data Governance',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'compliance-rec-1',
      title: 'Enhance CSRD Compliance',
      description: 'Address remaining CSRD requirements for full compliance by 2025',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      timeline: '6-12 months'
    },
    {
      id: 'compliance-rec-2',
      title: 'Implement Automated Compliance Monitoring',
      description: 'Deploy automated systems for continuous compliance monitoring',
      priority: 'medium',
      effort: 'medium',
      impact: 'medium',
      timeline: '9-15 months'
    }
  ],
  metrics: {
    overallCompliance: 92,
    griCompliance: 95,
    sasbCompliance: 89,
    tcfdCompliance: 91,
    csrdReadiness: 78,
    dataQualityScore: 94
  },
  processingTime: 2800
};

// Strategic Insight Agent mock response
export const mockStrategicAgentResponse: AgentAnalysisResult = {
  agentId: 'strategic-insight',
  status: 'completed',
  confidence: 0.93,
  insights: [
    {
      id: 'strategic-insight-1',
      title: 'Portfolio-Wide Decarbonization Opportunity',
      description: 'Integrated approach across all domains could achieve 40% emissions reduction by 2030',
      impact: 'high',
      category: 'Strategic Opportunity',
      dataPoints: []
    },
    {
      id: 'strategic-insight-2',
      title: 'Competitive Advantage in Sustainability',
      description: 'Leading performance in 7 out of 10 sustainability domains vs. industry peers',
      impact: 'high',
      category: 'Benchmarking',
      dataPoints: []
    },
    {
      id: 'strategic-insight-3',
      title: 'Investment-Ready Nature Projects',
      description: '$15M investment in nature-based solutions could offset 25% of Scope 1 emissions',
      impact: 'high',
      category: 'Investment Opportunity',
      dataPoints: []
    }
  ],
  recommendations: [
    {
      id: 'strategic-rec-1',
      title: 'Launch Integrated Sustainability Strategy',
      description: 'Develop cross-domain strategy integrating carbon, nature, and social objectives',
      priority: 'high',
      effort: 'high',
      impact: 'high',
      timeline: '6-18 months'
    },
    {
      id: 'strategic-rec-2',
      title: 'Establish Sustainability Innovation Fund',
      description: 'Create $50M fund for breakthrough sustainability technologies',
      priority: 'medium',
      effort: 'high',
      impact: 'high',
      timeline: '12-24 months'
    }
  ],
  metrics: {
    overallMaturityScore: 0.78,
    domainLeadership: 7,
    investmentOpportunities: 12,
    synergiesMapped: 25,
    strategicAlignment: 0.89
  },
  processingTime: 5200
};

// Export all mock responses
export const allMockAgentResponses = {
  'smart-document': mockDocumentAgentResponse,
  'carbon-expert': mockCarbonAgentResponse,
  'nature-expert': mockNatureAgentResponse,
  'social-impact': mockSocialAgentResponse,
  'pcf-expert': mockPCFAgentResponse,
  'compliance-agent': mockComplianceAgentResponse,
  'strategic-insight': mockStrategicAgentResponse
};

// Generate comprehensive sustainability insights
export const mockOverallInsights = {
  executiveSummary: 'Global Manufacturing Corp demonstrates strong sustainability leadership with above-average performance across environmental, social, and governance dimensions. Key opportunities exist in Scope 3 emissions reduction and circular economy transition.',
  maturityLevel: 'advancing' as const,
  overallScore: 78,
  domainScores: {
    carbon: 82,
    nature: 71,
    social: 86,
    governance: 88,
    water: 75,
    waste: 79,
    innovation: 73,
    supply: 69
  },
  keyAchievements: [
    '15% reduction in Scope 1 & 2 emissions vs. baseline',
    '45% female workforce representation',
    'LTIR of 0.85, well below industry average',
    '35% renewable energy adoption',
    '92% regulatory compliance score'
  ],
  priorityActions: [
    'Implement comprehensive Scope 3 supplier engagement program',
    'Develop TNFD-aligned biodiversity monitoring system',
    'Accelerate circular design implementation',
    'Enhance CSRD compliance readiness',
    'Launch integrated sustainability strategy'
  ],
  investmentOpportunities: [
    {
      title: 'Renewable Energy Transition',
      investment: 25000000,
      payback: '4-6 years',
      impact: 'High carbon reduction'
    },
    {
      title: 'Nature-Based Solutions',
      investment: 15000000,
      payback: '8-12 years',
      impact: 'Biodiversity + carbon benefits'
    },
    {
      title: 'Circular Economy Transition',
      investment: 35000000,
      payback: '6-8 years',
      impact: 'Waste reduction + cost savings'
    }
  ]
};