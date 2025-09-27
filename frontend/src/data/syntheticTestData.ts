// Synthetic test data for sustainability AI agents
// This data simulates real-world sustainability documents and metrics for testing

export interface SyntheticDocument {
  id: string;
  name: string;
  type: 'sustainability_report' | 'carbon_inventory' | 'supplier_data' | 'energy_bill' | 'policy_document' | 'lca_report';
  size: number;
  content: string;
  extractedData: Record<string, any>;
}

export interface SyntheticOrganization {
  id: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'joint_venture' | 'supplier';
  jurisdiction: string;
  parentId?: string;
  parentName?: string;
  ownershipPercentage?: number;
  employees: number;
  revenue: number; // in millions USD
  sites: SyntheticSite[];
}

export interface SyntheticSite {
  id: string;
  name: string;
  type: 'headquarters' | 'manufacturing' | 'office' | 'warehouse' | 'retail';
  location: {
    country: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  metrics: {
    energyConsumption: number; // MWh/year
    waterConsumption: number; // m³/year
    wasteGenerated: number; // tonnes/year
    employees: number;
  };
}

export interface SyntheticCarbonData {
  scope1: {
    totalEmissions: number; // tCO2e
    sources: {
      stationaryCombustion: number;
      mobileCombustion: number;
      processEmissions: number;
      fugitiveEmissions: number;
    };
  };
  scope2: {
    totalEmissions: number; // tCO2e
    locationBased: number;
    marketBased: number;
    renewableEnergy: number; // percentage
  };
  scope3: {
    totalEmissions: number; // tCO2e
    categories: {
      purchasedGoods: number;
      capitalGoods: number;
      upstreamTransport: number;
      businessTravel: number;
      employeeCommuting: number;
      downstreamTransport: number;
      useOfSoldProducts: number;
      endOfLifeTreatment: number;
    };
  };
}

export interface SyntheticProductData {
  id: string;
  name: string;
  category: string;
  carbonFootprint: number; // kg CO2e per unit
  lifecycle: {
    rawMaterials: number;
    manufacturing: number;
    transport: number;
    usePhase: number;
    endOfLife: number;
  };
  materials: {
    name: string;
    percentage: number;
    recycledContent: number;
  }[];
}

export interface SyntheticSocialData {
  workforce: {
    totalEmployees: number;
    diversity: {
      genderBalance: { male: number; female: number; other: number };
      ageDistribution: { under30: number; between30and50: number; over50: number };
      ethnicity: Record<string, number>;
    };
    safetyMetrics: {
      ltir: number; // Lost Time Injury Rate
      incidents: number;
      trainingHours: number;
    };
  };
  community: {
    investmentAmount: number; // USD
    programsSupported: number;
    beneficiaries: number;
    localHiring: number; // percentage
  };
  humanRights: {
    supplierAssessments: number;
    grievanceMechanisms: boolean;
    childLaborRisk: 'low' | 'medium' | 'high';
    forcedLaborRisk: 'low' | 'medium' | 'high';
  };
}

// Generate synthetic test organizations
export const syntheticOrganizations: SyntheticOrganization[] = [
  {
    id: 'org-001',
    name: 'Global Manufacturing Corp',
    type: 'parent',
    jurisdiction: 'United States',
    employees: 15000,
    revenue: 2500,
    sites: [
      {
        id: 'site-001',
        name: 'Corporate Headquarters',
        type: 'headquarters',
        location: {
          country: 'USA',
          region: 'California',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        metrics: {
          energyConsumption: 1200,
          waterConsumption: 5000,
          wasteGenerated: 50,
          employees: 800
        }
      },
      {
        id: 'site-002',
        name: 'Manufacturing Plant Alpha',
        type: 'manufacturing',
        location: {
          country: 'USA',
          region: 'Texas',
          coordinates: { lat: 29.7604, lng: -95.3698 }
        },
        metrics: {
          energyConsumption: 15000,
          waterConsumption: 50000,
          wasteGenerated: 1200,
          employees: 2500
        }
      }
    ]
  },
  {
    id: 'org-002',
    name: 'European Operations Ltd',
    type: 'subsidiary',
    jurisdiction: 'United Kingdom',
    ownershipPercentage: 100,
    employees: 3500,
    revenue: 450,
    sites: [
      {
        id: 'site-003',
        name: 'European Distribution Center',
        type: 'warehouse',
        location: {
          country: 'UK',
          region: 'England',
          coordinates: { lat: 51.5074, lng: -0.1278 }
        },
        metrics: {
          energyConsumption: 800,
          waterConsumption: 3000,
          wasteGenerated: 200,
          employees: 450
        }
      }
    ]
  },
  {
    id: 'org-003',
    name: 'Asia Pacific Holdings',
    type: 'subsidiary',
    jurisdiction: 'Singapore',
    ownershipPercentage: 75,
    employees: 8000,
    revenue: 850,
    sites: [
      {
        id: 'site-004',
        name: 'Manufacturing Plant Beta',
        type: 'manufacturing',
        location: {
          country: 'Singapore',
          region: 'Central',
          coordinates: { lat: 1.3521, lng: 103.8198 }
        },
        metrics: {
          energyConsumption: 12000,
          waterConsumption: 45000,
          wasteGenerated: 800,
          employees: 1800
        }
      }
    ]
  }
];

// Generate synthetic carbon data
export const syntheticCarbonData: SyntheticCarbonData = {
  scope1: {
    totalEmissions: 45000,
    sources: {
      stationaryCombustion: 25000,
      mobileCombustion: 12000,
      processEmissions: 6000,
      fugitiveEmissions: 2000
    }
  },
  scope2: {
    totalEmissions: 85000,
    locationBased: 92000,
    marketBased: 85000,
    renewableEnergy: 35
  },
  scope3: {
    totalEmissions: 450000,
    categories: {
      purchasedGoods: 180000,
      capitalGoods: 45000,
      upstreamTransport: 25000,
      businessTravel: 8000,
      employeeCommuting: 12000,
      downstreamTransport: 35000,
      useOfSoldProducts: 120000,
      endOfLifeTreatment: 25000
    }
  }
};

// Generate synthetic product data
export const syntheticProducts: SyntheticProductData[] = [
  {
    id: 'prod-001',
    name: 'EcoWidget Pro',
    category: 'Consumer Electronics',
    carbonFootprint: 15.5,
    lifecycle: {
      rawMaterials: 6.2,
      manufacturing: 4.8,
      transport: 1.5,
      usePhase: 2.3,
      endOfLife: 0.7
    },
    materials: [
      { name: 'Aluminum', percentage: 35, recycledContent: 80 },
      { name: 'Steel', percentage: 25, recycledContent: 60 },
      { name: 'Plastic (ABS)', percentage: 20, recycledContent: 30 },
      { name: 'Electronics', percentage: 15, recycledContent: 15 },
      { name: 'Other', percentage: 5, recycledContent: 0 }
    ]
  },
  {
    id: 'prod-002',
    name: 'Industrial Controller X200',
    category: 'Industrial Equipment',
    carbonFootprint: 285.3,
    lifecycle: {
      rawMaterials: 125.5,
      manufacturing: 85.2,
      transport: 15.8,
      usePhase: 45.6,
      endOfLife: 13.2
    },
    materials: [
      { name: 'Steel', percentage: 45, recycledContent: 70 },
      { name: 'Aluminum', percentage: 20, recycledContent: 85 },
      { name: 'Copper', percentage: 15, recycledContent: 90 },
      { name: 'Electronics', percentage: 12, recycledContent: 25 },
      { name: 'Other metals', percentage: 8, recycledContent: 40 }
    ]
  }
];

// Generate synthetic social data
export const syntheticSocialData: SyntheticSocialData = {
  workforce: {
    totalEmployees: 26500,
    diversity: {
      genderBalance: { male: 14500, female: 11800, other: 200 },
      ageDistribution: { under30: 8500, between30and50: 13200, over50: 4800 },
      ethnicity: {
        'White': 12500,
        'Asian': 8000,
        'Hispanic/Latino': 3500,
        'Black/African American': 1800,
        'Other': 700
      }
    },
    safetyMetrics: {
      ltir: 0.85,
      incidents: 23,
      trainingHours: 185000
    }
  },
  community: {
    investmentAmount: 2500000,
    programsSupported: 45,
    beneficiaries: 12000,
    localHiring: 78
  },
  humanRights: {
    supplierAssessments: 156,
    grievanceMechanisms: true,
    childLaborRisk: 'low',
    forcedLaborRisk: 'low'
  }
};

// Generate synthetic documents
export const syntheticDocuments: SyntheticDocument[] = [
  {
    id: 'doc-001',
    name: 'Annual Sustainability Report 2024',
    type: 'sustainability_report',
    size: 2500000,
    content: 'Executive Summary: Global Manufacturing Corp achieved a 15% reduction in Scope 1 and 2 emissions compared to 2023 baseline...',
    extractedData: {
      emissionsReduction: 15,
      targetYear: 2030,
      netZeroCommitment: true,
      certifications: ['ISO 14001', 'ISO 45001', 'OHSAS 18001']
    }
  },
  {
    id: 'doc-002',
    name: 'GHG Inventory 2024',
    type: 'carbon_inventory',
    size: 850000,
    content: 'Scope 1 Emissions: 45,000 tCO2e\nScope 2 Emissions: 85,000 tCO2e\nScope 3 Emissions: 450,000 tCO2e...',
    extractedData: syntheticCarbonData
  },
  {
    id: 'doc-003',
    name: 'Supplier Sustainability Assessment',
    type: 'supplier_data',
    size: 1200000,
    content: 'Tier 1 Suppliers Assessment Results: 89% compliance rate with sustainability standards...',
    extractedData: {
      tier1Suppliers: 245,
      assessmentCompliance: 89,
      riskCategories: ['water stress', 'deforestation', 'human rights']
    }
  },
  {
    id: 'doc-004',
    name: 'EcoWidget Pro LCA Report',
    type: 'lca_report',
    size: 650000,
    content: 'Life Cycle Assessment for EcoWidget Pro following ISO 14040/14044 standards...',
    extractedData: syntheticProducts[0]
  },
  {
    id: 'doc-005',
    name: 'Energy Consumption Report Q4 2024',
    type: 'energy_bill',
    size: 320000,
    content: 'Quarterly energy consumption across all facilities: 28,000 MWh...',
    extractedData: {
      totalConsumption: 28000,
      renewablePercentage: 35,
      peakDemand: 12.5,
      costs: 4200000
    }
  }
];

// Water stewardship test data
export const syntheticWaterData = {
  totalWithdrawal: 125000, // m³/year
  sources: {
    municipal: 45000,
    groundwater: 55000,
    surfaceWater: 25000
  },
  consumption: 89000,
  discharge: 36000,
  recycling: 28000,
  stressLevel: 'medium-high',
  basinRisk: {
    physical: 'high',
    regulatory: 'medium',
    reputational: 'low'
  }
};

// Nature and biodiversity test data
export const syntheticNatureData = {
  biodiversityFootprint: {
    landUse: 1250, // hectares
    waterUse: 125000, // m³
    greenhouseGases: 580000, // tCO2e
    pollutants: 45 // impact points
  },
  ecosystemServices: {
    carbonSequestration: 2500, // tCO2/year
    waterPurification: 15000, // m³/year
    pollination: 'medium dependency',
    climateRegulation: 'high dependency'
  },
  protectedAreas: {
    near: 3,
    within10km: 8,
    directImpact: false
  }
};

// Innovation and technology test data
export const syntheticInnovationData = {
  rdInvestment: 45000000, // USD
  sustainabilityPatents: 12,
  emergingTechnologies: [
    {
      name: 'Carbon Capture Integration',
      readinessLevel: 6,
      investmentRequired: 15000000,
      potentialImpact: 'high'
    },
    {
      name: 'Circular Design Platform',
      readinessLevel: 8,
      investmentRequired: 3000000,
      potentialImpact: 'medium'
    }
  ],
  collaborations: 8,
  startupPartnerships: 3
};

// Export all synthetic data for testing
export const allSyntheticData = {
  organizations: syntheticOrganizations,
  carbon: syntheticCarbonData,
  products: syntheticProducts,
  social: syntheticSocialData,
  documents: syntheticDocuments,
  water: syntheticWaterData,
  nature: syntheticNatureData,
  innovation: syntheticInnovationData
};
