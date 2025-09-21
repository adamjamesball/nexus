'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { OnboardingStepId } from '@/types/onboarding';
import { CheckCircle, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanySetupStep } from './steps/CompanySetupStep';
import { DocumentDiscoveryStep } from './steps/DocumentDiscoveryStep';
import { IntegrationSetupStep } from './steps/IntegrationSetupStep';
import { MagicMomentStep } from './steps/MagicMomentStep';
import { ResultsReviewStep } from './steps/ResultsReviewStep';

interface OnboardingOrchestratorProps {
  onComplete?: () => void;
}

export function OnboardingOrchestrator({ onComplete }: OnboardingOrchestratorProps) {
  const {
    onboarding,
    onboardingActions
  } = useNexusStore();

  const [startTime] = useState(Date.now());

  const currentStep = onboarding.steps.find(step => step.id === onboarding.currentStep);
  const currentStepIndex = onboarding.steps.findIndex(step => step.id === onboarding.currentStep);
  const completedSteps = onboarding.steps.filter(step => step.status === 'completed').length;
  const totalProgress = (completedSteps / onboarding.steps.length) * 100;

  useEffect(() => {
    // Update time spent
    const interval = setInterval(() => {
      const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);
      // You could update this in the store if needed
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [startTime]);

  const handleNext = () => {
    if (currentStepIndex < onboarding.steps.length - 1) {
      const nextStep = onboarding.steps[currentStepIndex + 1];
      onboardingActions.completeStep(onboarding.currentStep);
      onboardingActions.setCurrentStep(nextStep.id);
    } else {
      // Complete onboarding
      onboardingActions.completeOnboarding();
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = onboarding.steps[currentStepIndex - 1];
      onboardingActions.setCurrentStep(prevStep.id);
    }
  };

  const handleSkipStep = () => {
    if (currentStep) {
      onboardingActions.completeStep(currentStep.id);
      handleNext();
    }
  };

  const canContinue = () => {
    switch (onboarding.currentStep) {
      case 'company-setup':
        return !!onboarding.companyProfile?.name;
      case 'document-discovery':
        return onboarding.discoveredDocuments.some(doc => doc.isSelected) || 
               onboarding.discoveredDocuments.length > 0; // Allow continuing with no selection
      case 'integrations':
        return true; // Optional step
      case 'magic-moment':
        return onboarding.magicMomentResults.length > 0;
      case 'results-review':
        return true; // Always allow continuing from results review
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (onboarding.currentStep) {
      case 'company-setup':
        return <CompanySetupStep />;
      case 'document-discovery':
        return <DocumentDiscoveryStep />;
      case 'integrations':
        return <IntegrationSetupStep />;
      case 'magic-moment':
        return <MagicMomentStep />;
      case 'results-review':
        return <ResultsReviewStep onContinue={handleNext} />;
      default:
        return null;
    }
  };

  const estimatedTimeRemaining = onboarding.steps
    .slice(currentStepIndex)
    .reduce((total, step) => total + step.estimatedTimeMinutes, 0);

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Welcome to Nexus AI</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Let's set up your AI-powered sustainability intelligence platform
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              ~{estimatedTimeRemaining} min remaining
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Setup Progress</span>
                <span>{Math.round(totalProgress)}% complete</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {onboarding.steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all",
                    step.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                    step.status === 'active' ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === 'active' ? (
                      <Clock className="h-4 w-4 animate-pulse" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-current" />
                    )}
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < onboarding.steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Step {currentStepIndex + 1}</span>
              <span className="text-muted-foreground">•</span>
              <span>{currentStep?.title}</span>
            </div>
            {currentStep && (
              <Badge variant="outline" className="text-xs">
                ~{currentStep.estimatedTimeMinutes} min
              </Badge>
            )}
          </CardTitle>
          {currentStep && (
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-2">
          {onboarding.currentStep !== 'magic-moment' && onboarding.currentStep !== 'results-review' && (
            <Button
              variant="ghost"
              onClick={handleSkipStep}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip this step
            </Button>
          )}
          
          {onboarding.currentStep !== 'results-review' && (
            <Button
              onClick={handleNext}
              disabled={!canContinue() && onboarding.currentStep !== 'integrations'}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStepIndex === onboarding.steps.length - 1 ? 'Complete Setup' : 'Continue'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}