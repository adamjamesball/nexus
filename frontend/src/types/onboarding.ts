// Onboarding and optimization type definitions for Nexus platform
import { SustainabilityDomain } from './index';

export type OnboardingStepId =
  | 'company-setup'
  | 'document-discovery'
  | 'integrations'
  | 'magic-moment'
  | 'results-review';

export type CompanySize = 
  | 'startup' 
  | 'small' 
  | 'medium' 
  | 'large' 
  | 'enterprise';

export type DocumentType = 
  | 'sustainability-report' 
  | 'annual-report' 
  | '10k-filing' 
  | 'esg-report' 
  | 'carbon-disclosure' 
  | 'policy-document' 
  | 'other';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  progress: number;
  estimatedTimeMinutes: number;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: CompanySize;
  jurisdiction: string;
  websites: string[];
  linkedinProfile?: string;
  stockSymbol?: string;
  confidence: number;
  isValidated: boolean;
  employeeCount?: number;
  revenue?: string;
  headquarters?: string;
}

export interface DiscoveredDocument {
  id: string;
  title: string;
  url: string;
  type: DocumentType;
  relevantDomains: SustainabilityDomain[];
  confidence: number;
  size: number;
  lastModified: Date;
  source: 'web-scraping' | 'user-upload' | 'integration';
  previewText?: string;
  isSelected: boolean;
}

export type IntegrationStatus = 'available' | 'connected' | 'disconnected' | 'error';

export interface ExternalIntegration {
  id: string;
  type: 'sharepoint' | 'google-drive' | 'onedrive' | 'box' | 'salesforce' | 'teams' | 'dropbox' | 'custom-api';
  name: string;
  status: IntegrationStatus;
  connectedAt: Date;
  dataSourcesFound: number;
  lastSync?: Date;
  credentials: Record<string, any>;
}

export interface MagicMomentInsight {
  id: string;
  title: string;
  description: string;
  type: 'company-intelligence' | 'industry-analysis' | 'compliance-guidance' | 'recommendations' | 'data-gaps';
  confidence: number;
  source: string;
  impact: 'high' | 'medium' | 'low';
  createdAt: Date;
  data?: Record<string, any>;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'data-enrichment' | 'profile-update' | 'validation' | 'integration-setup';
  estimatedTimeMinutes: number;
  isCompleted: boolean;
  createdDate: Date;
  completedDate?: Date;
  potentialImprovement: string;
  userFeedback?: {
    rating: number;
    comment?: string;
  };
}

export interface LearningMetrics {
  totalAnalyses: number;
  accuracyScore: number;
  userSatisfactionScore: number;
  dataQualityScore: number;
  improvementTrend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: Date;
  domainSpecificMetrics: Record<SustainabilityDomain, {
    analysisCount: number;
    accuracyScore: number;
    userFeedbackScore: number;
  }>;
}

export interface EnrichmentOpportunity {
  id: string;
  title: string;
  description: string;
  dataCategory: 'carbon-footprint' | 'nature' | 'social' | 'governance' | 'general';
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
  potentialImpact: string;
}

export interface ProgressMetrics {
  completenessScore: number;
  dataQualityScore: number;
  analysisDepth: 'basic' | 'intermediate' | 'comprehensive' | 'expert';
  missingDataCategories: string[];
  strengthAreas: SustainabilityDomain[];
  improvementOpportunities: SustainabilityDomain[];
  lastAssessment: Date;
}

export interface OnboardingState {
  currentStep: OnboardingStepId;
  steps: OnboardingStep[];
  companyProfile: CompanyProfile | null;
  discoveredDocuments: DiscoveredDocument[];
  selectedIntegrations: ExternalIntegration[];
  magicMomentResults: MagicMomentInsight[];
  isCompleted: boolean;
  completedAt?: Date;
  totalTimeSpentMinutes: number;
}

export interface OptimizationState {
  learningMetrics: LearningMetrics;
  recommendations: OptimizationRecommendation[];
  enrichmentOpportunities: EnrichmentOpportunity[];
  progressMetrics: ProgressMetrics;
  lastUpdated: Date;
  showOnboarding: boolean;
}

export interface OnboardingActions {
  setCurrentStep: (stepId: OnboardingStepId) => void;
  updateStepProgress: (stepId: OnboardingStepId, progress: number) => void;
  completeStep: (stepId: OnboardingStepId) => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  addDiscoveredDocuments: (documents: DiscoveredDocument[]) => void;
  toggleDocumentSelection: (documentId: string) => void;
  updateIntegration: (integration: ExternalIntegration) => void;
  addMagicMomentResults: (insights: MagicMomentInsight[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export interface OptimizationActions {
  updateLearningMetrics: (metrics: LearningMetrics) => void;
  addRecommendation: (recommendation: OptimizationRecommendation) => void;
  completeRecommendation: (recommendationId: string, feedback?: { rating: number; comment?: string }) => void;
  addEnrichmentOpportunity: (opportunity: EnrichmentOpportunity) => void;
  updateProgressMetrics: (metrics: ProgressMetrics) => void;
  refreshOptimizations: () => Promise<void>;
}