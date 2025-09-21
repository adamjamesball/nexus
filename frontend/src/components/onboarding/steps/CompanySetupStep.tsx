'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { CompanyProfile, CompanySize } from '@/types/onboarding';
import { Building, Globe, MapPin, Users, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyInfo {
  name: string;
  industry: string;
  size: CompanySize;
  jurisdiction: string;
  websites: string[];
  employeeCount?: number;
  revenue?: string;
  headquarters?: string;
  confidence: number;
}

export function CompanySetupStep() {
  const { onboarding, onboardingActions } = useNexusStore();
  const [companyName, setCompanyName] = useState(onboarding.companyProfile?.name || '');
  const [isSearching, setIsSearching] = useState(false);
  const [discoveredInfo, setDiscoveredInfo] = useState<CompanyInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const companySizes: { value: CompanySize; label: string; description: string }[] = [
    { value: 'startup', label: 'Startup', description: '1-10 employees' },
    { value: 'small', label: 'Small', description: '11-50 employees' },
    { value: 'medium', label: 'Medium', description: '51-200 employees' },
    { value: 'large', label: 'Large', description: '201-1000 employees' },
    { value: 'enterprise', label: 'Enterprise', description: '1000+ employees' }
  ];

  useEffect(() => {
    if (companyName && companyName.length > 2) {
      const timeoutId = setTimeout(() => {
        searchCompanyInfo(companyName);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [companyName]);

  const searchCompanyInfo = async (name: string) => {
    setIsSearching(true);
    try {
      // Call real backend API
      const response = await fetch('http://localhost:8000/v2/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: name }),
      });

      if (!response.ok) {
        throw new Error('Company search failed');
      }

      const data = await response.json();

      // Map backend response to frontend format
      const discoveredInfo: CompanyInfo = {
        name: data.name || name,
        industry: data.industry || 'Unknown',
        size: mapEmployeeCountToSize(data.employee_count),
        jurisdiction: data.jurisdiction || 'Unknown',
        websites: data.websites || [],
        employeeCount: data.employee_count,
        revenue: data.revenue,
        headquarters: data.headquarters,
        confidence: data.confidence || 0.1
      };

      setDiscoveredInfo(discoveredInfo);

      // Auto-save to store
      onboardingActions.updateCompanyProfile({
        ...discoveredInfo,
        isValidated: false
      });
    } catch (error) {
      console.error('Company search failed:', error);
      // Fallback to manual entry on error
      setDiscoveredInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  const mapEmployeeCountToSize = (employeeCount?: number): CompanySize => {
    if (!employeeCount) return 'medium';
    if (employeeCount <= 10) return 'startup';
    if (employeeCount <= 50) return 'small';
    if (employeeCount <= 200) return 'medium';
    if (employeeCount <= 1000) return 'large';
    return 'enterprise';
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    
    if (!name) {
      setDiscoveredInfo(null);
      onboardingActions.updateCompanyProfile({ name: '' } as any);
    }
  };

  const handleSizeChange = (size: CompanySize) => {
    if (discoveredInfo) {
      const updatedInfo = { ...discoveredInfo, size };
      setDiscoveredInfo(updatedInfo);
      onboardingActions.updateCompanyProfile(updatedInfo);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (discoveredInfo) {
      const updatedInfo = { ...discoveredInfo, [field]: value };
      setDiscoveredInfo(updatedInfo);
      onboardingActions.updateCompanyProfile(updatedInfo);
    }
  };

  const confirmCompanyInfo = () => {
    if (discoveredInfo) {
      onboardingActions.updateCompanyProfile({
        ...discoveredInfo,
        isValidated: true
      });
      onboardingActions.updateStepProgress('company-setup', 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Company Name</label>
        <div className="relative">
          <input
            type="text"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="Enter your company name..."
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          We'll automatically discover your company information from public sources
        </p>
      </div>

      {/* Discovered Company Information */}
      {discoveredInfo && !isSearching && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Company Information Discovered</h3>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(discoveredInfo.confidence * 100)}% confidence
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{discoveredInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{discoveredInfo.industry}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={discoveredInfo.headquarters || ''}
                      onChange={(e) => handleFieldChange('headquarters', e.target.value)}
                      className="text-sm font-medium bg-background border rounded px-2 py-1"
                    />
                  ) : (
                    <p className="text-sm font-medium">{discoveredInfo.headquarters}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{discoveredInfo.jurisdiction}</p>
                </div>
              </div>

              {/* Employee Count */}
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">~{discoveredInfo.employeeCount} employees</p>
                  <p className="text-xs text-muted-foreground">
                    {companySizes.find(s => s.value === discoveredInfo.size)?.label} company
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{discoveredInfo.revenue}</p>
                  <p className="text-xs text-muted-foreground">Annual revenue</p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center space-x-3 md:col-span-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <a 
                    href={discoveredInfo.websites[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {discoveredInfo.websites[0]}
                  </a>
                  <p className="text-xs text-muted-foreground">Primary website</p>
                </div>
              </div>
            </div>

            {/* Company Size Selection */}
            {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {companySizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => handleSizeChange(size.value)}
                      className={cn(
                        "p-3 text-left border rounded-lg text-sm transition-all hover:bg-muted/50",
                        discoveredInfo.size === size.value 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                          : "border-border"
                      )}
                    >
                      <div className="font-medium">{size.label}</div>
                      <div className="text-xs text-muted-foreground">{size.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation */}
            <div className="pt-2 border-t">
              <Button
                onClick={confirmCompanyInfo}
                className="w-full"
                disabled={!discoveredInfo}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Company Information
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="font-medium mb-2">Discovering Company Information</h3>
            <p className="text-sm text-muted-foreground">
              Searching public databases and websites for your company details...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Fallback */}
      {companyName && !isSearching && !discoveredInfo && companyName.length > 2 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Couldn't find company information automatically. You can proceed with manual entry or try a different company name.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const manualProfile: CompanyProfile = {
                  name: companyName,
                  industry: '',
                  size: 'medium',
                  jurisdiction: '',
                  websites: [],
                  confidence: 1.0,
                  isValidated: false
                };
                onboardingActions.updateCompanyProfile(manualProfile);
                setDiscoveredInfo(manualProfile);
                setIsEditing(true);
              }}
            >
              Enter Details Manually
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}