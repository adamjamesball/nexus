// Utility functions for accessing synthetic test data in components
import { allSyntheticData } from '@/data/syntheticTestData';
import { allMockAgentResponses } from '@/data/mockApiResponses';

// API client for test data (simulates real API calls)
export class TestDataClient {
  private baseUrl = '/api';

  async getAgentResults(agentId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/results`);
      if (!response.ok) throw new Error(`Agent ${agentId} not found`);
      return await response.json();
    } catch (error) {
      console.warn(`Falling back to local data for agent ${agentId}`);
      return allMockAgentResponses[agentId as keyof typeof allMockAgentResponses];
    }
  }

  async getSyntheticData(dataType: keyof typeof allSyntheticData) {
    try {
      const response = await fetch(`${this.baseUrl}/test-data/${dataType}`);
      if (!response.ok) throw new Error(`Data type ${dataType} not found`);
      return await response.json();
    } catch (error) {
      console.warn(`Falling back to local data for ${dataType}`);
      return allSyntheticData[dataType];
    }
  }

  // Direct access methods for convenience
  getOrganizations() {
    return allSyntheticData.organizations;
  }

  getCarbonData() {
    return allSyntheticData.carbon;
  }

  getProductData() {
    return allSyntheticData.products;
  }

  getSocialData() {
    return allSyntheticData.social;
  }

  getDocuments() {
    return allSyntheticData.documents;
  }

  getWaterData() {
    return allSyntheticData.water;
  }

  getNatureData() {
    return allSyntheticData.nature;
  }

  getInnovationData() {
    return allSyntheticData.innovation;
  }
}

// Export singleton instance
export const testDataClient = new TestDataClient();

// Utility functions for generating realistic test scenarios
export const testScenarios = {
  // Simulate a large enterprise with complex structure
  largeEnterprise: {
    name: 'Global Manufacturing Corp',
    description: 'Multi-national manufacturing company with complex ownership structure',
    entities: allSyntheticData.organizations,
    challenges: [
      'Scope 3 emissions across global supply chain',
      'Biodiversity impact in emerging markets',
      'Regulatory compliance across multiple jurisdictions',
      'Social impact measurement inconsistencies'
    ],
    documents: allSyntheticData.documents.filter(doc => 
      ['sustainability_report', 'carbon_inventory', 'supplier_data'].includes(doc.type)
    )
  },

  // Simulate a product-focused analysis
  productAnalysis: {
    name: 'Product Carbon Footprint Assessment',
    description: 'Life-cycle analysis of product portfolio',
    products: allSyntheticData.products,
    challenges: [
      'High carbon intensity in raw materials',
      'Limited recycled content in key components',
      'Complex supply chain emissions tracking',
      'End-of-life treatment optimization'
    ],
    documents: allSyntheticData.documents.filter(doc => 
      doc.type === 'lca_report'
    )
  },

  // Simulate social impact assessment
  socialAssessment: {
    name: 'Social Impact Evaluation',
    description: 'Comprehensive workforce and community impact analysis',
    social: allSyntheticData.social,
    challenges: [
      'Diversity representation in leadership',
      'Safety performance across global operations',
      'Community investment effectiveness',
      'Human rights in supply chain'
    ],
    documents: allSyntheticData.documents.filter(doc => 
      doc.type === 'policy_document'
    )
  },

  // Simulate nature and biodiversity assessment
  natureAssessment: {
    name: 'Nature & Biodiversity Impact Analysis',
    description: 'TNFD-aligned assessment of nature dependencies and impacts',
    nature: allSyntheticData.nature,
    water: allSyntheticData.water,
    challenges: [
      'Operations near protected areas',
      'Water stress in key locations',
      'Biodiversity impact quantification',
      'Nature-based solution opportunities'
    ],
    documents: allSyntheticData.documents.filter(doc => 
      ['sustainability_report', 'supplier_data'].includes(doc.type)
    )
  }
};

// Helper function to generate random test data variations
export function generateTestVariation(baseData: any, variationPercent: number = 10): any {
  if (typeof baseData === 'number') {
    const variation = baseData * (variationPercent / 100);
    return baseData + (Math.random() - 0.5) * 2 * variation;
  }
  
  if (Array.isArray(baseData)) {
    return baseData.map(item => generateTestVariation(item, variationPercent));
  }
  
  if (typeof baseData === 'object' && baseData !== null) {
    const result = { ...baseData };
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'number') {
        result[key] = generateTestVariation(result[key], variationPercent);
      }
    });
    return result;
  }
  
  return baseData;
}

// Export test data summary for debugging
export function getTestDataSummary() {
  return {
    organizations: allSyntheticData.organizations.length,
    documents: allSyntheticData.documents.length,
    products: allSyntheticData.products.length,
    agents: Object.keys(allMockAgentResponses).length,
    scenarios: Object.keys(testScenarios).length,
    totalDataPoints: Object.values(allSyntheticData).reduce((total, data) => {
      if (Array.isArray(data)) return total + data.length;
      return total + 1;
    }, 0)
  };
}
