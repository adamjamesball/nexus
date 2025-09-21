import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProcessingSession, UploadedFile, AgentStatus, ProcessingResults, NEXUS_AGENT_NETWORK, SustainabilityDomain } from '@/types';
import { 
  OnboardingState, 
  OptimizationState, 
  OnboardingActions, 
  OptimizationActions,
  OnboardingStepId,
  CompanyProfile,
  DiscoveredDocument,
  ExternalIntegration,
  MagicMomentInsight,
  OptimizationRecommendation,
  LearningMetrics,
  EnrichmentOpportunity,
  ProgressMetrics
} from '@/types/onboarding';

interface NexusStore {
  // Session management
  currentSession: ProcessingSession | null;
  sessions: ProcessingSession[];
  
  // Upload management
  uploadedFiles: UploadedFile[];
  totalUploadSize: number;
  
  // Processing state
  isProcessing: boolean;
  processingStartTime: Date | null;
  
  // WebSocket connection
  isConnected: boolean;
  connectionError: string | null;
  
  // Onboarding state
  onboarding: OnboardingState;
  
  // Optimization state
  optimization: OptimizationState;
  
  // Actions
  createSession: () => string;
  setCurrentSession: (session: ProcessingSession) => void;
  updateSession: (sessionId: string, updates: Partial<ProcessingSession>) => void;
  
  // File management
  addFiles: (files: File[]) => UploadedFile[];
  removeFile: (fileId: string) => void;
  updateFileStatus: (fileId: string, status: UploadedFile['status'], progress?: number) => void;
  clearFiles: () => void;
  
  // Agent management
  updateAgentStatus: (sessionId: string, agentId: string, updates: Partial<AgentStatus>) => void;
  
  // Processing management
  startProcessing: () => void;
  completeProcessing: (results: ProcessingResults) => void;
  setProcessingError: (error: string) => void;
  
  // WebSocket management
  setConnectionStatus: (connected: boolean, error?: string) => void;
  
  // Onboarding actions
  onboardingActions: OnboardingActions;
  
  // Optimization actions
  optimizationActions: OptimizationActions;
  
  // Utility methods
  isFirstTimeUser: () => boolean;
  hasOptimizations: () => boolean;
  
  // Reset store
  reset: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createInitialOnboardingState = (): OnboardingState => ({
  currentStep: 'company-setup',
  steps: [
    {
      id: 'company-setup',
      title: 'Company Setup',
      description: 'Set up your company profile for personalized analysis',
      status: 'active',
      progress: 0,
      estimatedTimeMinutes: 3
    },
    {
      id: 'document-discovery',
      title: 'Document Discovery',
      description: 'Find and upload your sustainability documents',
      status: 'pending',
      progress: 0,
      estimatedTimeMinutes: 5
    },
    {
      id: 'integrations',
      title: 'Connect Data Sources',
      description: 'Link SharePoint, Google Drive, and other sources',
      status: 'pending',
      progress: 0,
      estimatedTimeMinutes: 4
    },
    {
      id: 'magic-moment',
      title: 'See AI in Action',
      description: 'Experience instant AI-powered sustainability insights',
      status: 'pending',
      progress: 0,
      estimatedTimeMinutes: 2
    },
    {
      id: 'results-review',
      title: 'Review Your Intelligence',
      description: 'Review the AI-generated insights and prepare for your first analysis',
      status: 'pending',
      progress: 0,
      estimatedTimeMinutes: 3
    }
  ],
  companyProfile: null,
  discoveredDocuments: [],
  selectedIntegrations: [],
  magicMomentResults: [],
  isCompleted: false,
  totalTimeSpentMinutes: 0
});

const createInitialOptimizationState = (): OptimizationState => ({
  learningMetrics: {
    totalAnalyses: 0,
    accuracyScore: 0,
    userSatisfactionScore: 0,
    dataQualityScore: 0,
    improvementTrend: 'stable',
    lastUpdated: new Date(),
    domainSpecificMetrics: {} as Record<SustainabilityDomain, any>
  },
  recommendations: [],
  enrichmentOpportunities: [],
  progressMetrics: {
    completenessScore: 0,
    dataQualityScore: 0,
    analysisDepth: 'basic',
    missingDataCategories: [],
    strengthAreas: [],
    improvementOpportunities: [],
    lastAssessment: new Date()
  },
  lastUpdated: new Date(),
  showOnboarding: true
});

const createInitialAgents = (): AgentStatus[] => {
  const agents: AgentStatus[] = [];
  
  // Add cross-domain agents
  NEXUS_AGENT_NETWORK.cross_domain.forEach(agent => {
    agents.push({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      type: agent.type,
      status: 'idle',
      progress: 0,
      priority: agent.priority,
      dependencies: [],
      insights: []
    });
  });

  // Add domain master agents and their utilities
  Object.entries(NEXUS_AGENT_NETWORK).forEach(([domainKey, domainConfig]) => {
    if (domainKey === 'cross_domain') return;
    
    const domain = domainKey as SustainabilityDomain;
    const config = domainConfig as any;

    // Add master agent
    if (config.master) {
      agents.push({
        id: config.master.id,
        name: config.master.name,
        description: config.master.description,
        domain: config.master.domain,
        type: config.master.type,
        status: 'idle',
        progress: 0,
        priority: config.master.priority,
        dependencies: ['document-intelligence'],
        insights: []
      });
    }

    // Add utility agents
    if (config.utilities) {
      config.utilities.forEach((utility: any) => {
        agents.push({
          id: utility.id,
          name: utility.name,
          description: utility.description,
          domain: utility.domain,
          type: utility.type,
          status: 'idle',
          progress: 0,
          priority: utility.priority,
          dependencies: [config.master.id],
          insights: []
        });
      });
    }
  });

  return agents;
};

export const useNexusStore = create<NexusStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      uploadedFiles: [],
      totalUploadSize: 0,
      isProcessing: false,
      processingStartTime: null,
      isConnected: false,
      connectionError: null,
      
      // Onboarding & Optimization state
      onboarding: createInitialOnboardingState(),
      optimization: createInitialOptimizationState(),

      // Session actions
      createSession: () => {
        const sessionId = generateId();
        const newSession: ProcessingSession = {
          id: sessionId,
          status: 'uploading',
          files: [],
          agents: createInitialAgents(),
          startTime: new Date().toISOString()
        };
        
        set((state) => ({
          currentSession: newSession,
          sessions: [...state.sessions, newSession]
        }));
        
        return sessionId;
      },

      setCurrentSession: (session) => {
        set({ currentSession: session });
      },

      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? { ...session, ...updates } : session
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { ...state.currentSession, ...updates }
            : state.currentSession
        }));
      },

      // File management
      addFiles: (files) => {
        const newFiles: UploadedFile[] = files.map(file => ({
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          file
        }));

        const totalSize = get().totalUploadSize + newFiles.reduce((sum, file) => sum + file.size, 0);
        
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, ...newFiles],
          totalUploadSize: totalSize
        }));

        // Update current session with new files
        const currentSession = get().currentSession;
        if (currentSession) {
          get().updateSession(currentSession.id, {
            files: [...currentSession.files, ...newFiles]
          });
        }
        return newFiles;
      },

      removeFile: (fileId) => {
        const file = get().uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId),
          totalUploadSize: state.totalUploadSize - file.size
        }));

        // Update current session
        const currentSession = get().currentSession;
        if (currentSession) {
          get().updateSession(currentSession.id, {
            files: currentSession.files.filter(f => f.id !== fileId)
          });
        }
      },

      updateFileStatus: (fileId, status, progress = 0) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === fileId ? { ...file, status, progress } : file
          )
        }));

        // Update current session
        const currentSession = get().currentSession;
        if (currentSession) {
          get().updateSession(currentSession.id, {
            files: currentSession.files.map(file =>
              file.id === fileId ? { ...file, status, progress } : file
            )
          });
        }
      },

      clearFiles: () => {
        set({
          uploadedFiles: [],
          totalUploadSize: 0
        });
      },

      // Agent management
      updateAgentStatus: (sessionId, agentId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  agents: session.agents.map(agent =>
                    agent.id === agentId ? { ...agent, ...updates } : agent
                  )
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                agents: state.currentSession.agents.map(agent =>
                  agent.id === agentId ? { ...agent, ...updates } : agent
                )
              }
            : state.currentSession
        }));
      },

      // Processing management
      startProcessing: () => {
        const currentSession = get().currentSession;
        if (!currentSession) return;

        set({
          isProcessing: true,
          processingStartTime: new Date()
        });

        get().updateSession(currentSession.id, {
          status: 'processing'
        });
      },

      completeProcessing: (results) => {
        const currentSession = get().currentSession;
        if (!currentSession) return;

        const processingTime = get().processingStartTime 
          ? Date.now() - get().processingStartTime!.getTime()
          : 0;

        set({
          isProcessing: false,
          processingStartTime: null
        });

        get().updateSession(currentSession.id, {
          status: 'completed',
          results,
          endTime: new Date().toISOString(),
          totalProcessingTime: processingTime
        });
      },

      setProcessingError: (error) => {
        const currentSession = get().currentSession;
        if (!currentSession) return;

        set({
          isProcessing: false,
          processingStartTime: null
        });

        get().updateSession(currentSession.id, {
          status: 'error',
          errorMessage: error,
          endTime: new Date().toISOString()
        });
      },

      // WebSocket management
      setConnectionStatus: (connected, error) => {
        set({
          isConnected: connected,
          connectionError: error || null
        });
      },
      
      // Onboarding actions
      onboardingActions: {
        setCurrentStep: (stepId: OnboardingStepId) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              currentStep: stepId,
              steps: state.onboarding.steps.map(step => ({
                ...step,
                status: step.id === stepId ? 'active' : 
                       state.onboarding.steps.findIndex(s => s.id === stepId) > 
                       state.onboarding.steps.findIndex(s => s.id === step.id) ? 'pending' : 'completed'
              }))
            }
          }));
        },
        
        updateStepProgress: (stepId: OnboardingStepId, progress: number) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              steps: state.onboarding.steps.map(step =>
                step.id === stepId ? { ...step, progress } : step
              )
            }
          }));
        },
        
        completeStep: (stepId: OnboardingStepId) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              steps: state.onboarding.steps.map(step =>
                step.id === stepId ? { ...step, status: 'completed', progress: 100 } : step
              )
            }
          }));
        },
        
        updateCompanyProfile: (profile: Partial<CompanyProfile>) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              companyProfile: state.onboarding.companyProfile 
                ? { ...state.onboarding.companyProfile, ...profile }
                : profile as CompanyProfile
            }
          }));
        },
        
        addDiscoveredDocuments: (documents: DiscoveredDocument[]) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              discoveredDocuments: [...state.onboarding.discoveredDocuments, ...documents]
            }
          }));
        },
        
        toggleDocumentSelection: (documentId: string) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              discoveredDocuments: state.onboarding.discoveredDocuments.map(doc =>
                doc.id === documentId ? { ...doc, isSelected: !doc.isSelected } : doc
              )
            }
          }));
        },
        
        updateIntegration: (integration: ExternalIntegration) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              selectedIntegrations: state.onboarding.selectedIntegrations.some(i => i.id === integration.id)
                ? state.onboarding.selectedIntegrations.map(i => i.id === integration.id ? integration : i)
                : [...state.onboarding.selectedIntegrations, integration]
            }
          }));
        },
        
        addMagicMomentResults: (insights: MagicMomentInsight[]) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              magicMomentResults: [...state.onboarding.magicMomentResults, ...insights]
            }
          }));
        },
        
        completeOnboarding: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              isCompleted: true,
              completedAt: new Date(),
              steps: state.onboarding.steps.map(step => ({ ...step, status: 'completed' as const }))
            },
            optimization: {
              ...state.optimization,
              showOnboarding: false
            }
          }));
        },
        
        resetOnboarding: () => {
          set((state) => ({
            onboarding: createInitialOnboardingState()
          }));
        }
      },
      
      // Optimization actions
      optimizationActions: {
        updateLearningMetrics: (metrics: LearningMetrics) => {
          set((state) => ({
            optimization: {
              ...state.optimization,
              learningMetrics: metrics,
              lastUpdated: new Date()
            }
          }));
        },
        
        addRecommendation: (recommendation: OptimizationRecommendation) => {
          set((state) => ({
            optimization: {
              ...state.optimization,
              recommendations: [...state.optimization.recommendations, recommendation],
              lastUpdated: new Date()
            }
          }));
        },
        
        completeRecommendation: (recommendationId: string, feedback?: { rating: number; comment?: string }) => {
          set((state) => ({
            optimization: {
              ...state.optimization,
              recommendations: state.optimization.recommendations.map(rec =>
                rec.id === recommendationId 
                  ? { ...rec, isCompleted: true, completedDate: new Date(), userFeedback: feedback }
                  : rec
              ),
              lastUpdated: new Date()
            }
          }));
        },
        
        addEnrichmentOpportunity: (opportunity: EnrichmentOpportunity) => {
          set((state) => ({
            optimization: {
              ...state.optimization,
              enrichmentOpportunities: [...state.optimization.enrichmentOpportunities, opportunity],
              lastUpdated: new Date()
            }
          }));
        },
        
        updateProgressMetrics: (metrics: ProgressMetrics) => {
          set((state) => ({
            optimization: {
              ...state.optimization,
              progressMetrics: metrics,
              lastUpdated: new Date()
            }
          }));
        },
        
        refreshOptimizations: async () => {
          // This would typically make API calls to refresh optimization data
          // For now, we'll just update the timestamp
          set((state) => ({
            optimization: {
              ...state.optimization,
              lastUpdated: new Date()
            }
          }));
        }
      },
      
      // Utility methods
      isFirstTimeUser: () => {
        const state = get();
        return !state.onboarding.isCompleted;
      },
      
      hasOptimizations: () => {
        const state = get();
        return state.optimization.recommendations.length > 0 || 
               state.optimization.enrichmentOpportunities.length > 0;
      },

      // Reset
      reset: () => {
        set({
          currentSession: null,
          sessions: [],
          uploadedFiles: [],
          totalUploadSize: 0,
          isProcessing: false,
          processingStartTime: null,
          isConnected: false,
          connectionError: null,
          onboarding: createInitialOnboardingState(),
          optimization: createInitialOptimizationState()
        });
      }
    }),
    {
      name: 'nexus-store'
    }
  )
);