'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNexusStore } from '@/lib/store';
import { DiscoveredDocument, DocumentType } from '@/types/onboarding';
import { FileText, Download, ExternalLink, Search, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploader } from '@/components/upload/FileUploader';

export function DocumentDiscoveryStep() {
  const { onboarding, onboardingActions } = useNexusStore();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'upload'>('discover');

  useEffect(() => {
    if (onboarding.companyProfile && onboarding.discoveredDocuments.length === 0) {
      discoverDocuments();
    }
  }, [onboarding.companyProfile]);

  const discoverDocuments = async () => {
    if (!onboarding.companyProfile) return;

    setIsDiscovering(true);
    try {
      // Call real backend API for document discovery
      const response = await fetch('http://localhost:8000/v2/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: onboarding.companyProfile.name }),
      });

      if (!response.ok) {
        throw new Error('Document discovery failed');
      }

      const data = await response.json();

      // Map backend discovered documents to frontend format
      const discoveredDocuments: DiscoveredDocument[] = (data.discovered_documents || []).map((doc: any) => ({
        id: doc.id || `doc-${Date.now()}-${Math.random()}`,
        title: doc.title || 'Unknown Document',
        url: doc.url || '',
        type: mapDocumentType(doc.type),
        relevantDomains: doc.relevant_domains || [],
        confidence: doc.confidence || 0.5,
        size: doc.size || 0,
        lastModified: new Date(doc.last_modified || Date.now()),
        source: doc.source || 'web-scraping',
        previewText: doc.preview_text || '',
        isSelected: false
      }));

      if (discoveredDocuments.length > 0) {
        onboardingActions.addDiscoveredDocuments(discoveredDocuments);
      }
    } catch (error) {
      console.error('Document discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const mapDocumentType = (backendType: string): DocumentType => {
    const typeMap: Record<string, DocumentType> = {
      'sustainability': 'sustainability-report',
      'annual': 'annual-report',
      'carbon': 'carbon-disclosure',
      'esg': 'esg-report',
      '10k': '10k-filing',
      'policy': 'policy-document'
    };
    return typeMap[backendType] || 'other';
  };

  const getDocumentTypeIcon = (type: DocumentType) => {
    return FileText; // Simplified for now
  };

  const getDocumentTypeBadge = (type: DocumentType) => {
    const badges = {
      'sustainability-report': { label: 'Sustainability', color: 'bg-green-100 text-green-700' },
      'annual-report': { label: 'Annual Report', color: 'bg-blue-100 text-blue-700' },
      'carbon-disclosure': { label: 'Carbon', color: 'bg-orange-100 text-orange-700' },
      'esg-report': { label: 'ESG', color: 'bg-purple-100 text-purple-700' },
      '10k-filing': { label: '10-K Filing', color: 'bg-slate-100 text-slate-700' },
      'policy-document': { label: 'Policy', color: 'bg-indigo-100 text-indigo-700' },
      'other': { label: 'Other', color: 'bg-gray-100 text-gray-700' }
    };
    return badges[type] || badges.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedCount = onboarding.discoveredDocuments.filter(doc => doc.isSelected).length;

  return (
    <div className="space-y-6">
      {/* Tab Selection */}
      <div className="flex space-x-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('discover')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === 'discover' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="h-4 w-4 mr-2 inline" />
          Auto-Discovery
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === 'upload' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-4 w-4 mr-2 inline" />
          Upload Files
        </button>
      </div>

      {/* Auto-Discovery Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          {isDiscovering ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="font-medium mb-2">Discovering Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Searching the web for your company's sustainability documents...
                </p>
              </CardContent>
            </Card>
          ) : onboarding.discoveredDocuments.length > 0 ? (
            <>
              {/* Selection Summary */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    Found {onboarding.discoveredDocuments.length} relevant documents
                  </span>
                </div>
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {onboarding.discoveredDocuments.map((document) => {
                  const DocumentIcon = getDocumentTypeIcon(document.type);
                  const typeBadge = getDocumentTypeBadge(document.type);
                  
                  return (
                    <Card 
                      key={document.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        document.isSelected ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : ""
                      )}
                      onClick={() => onboardingActions.toggleDocumentSelection(document.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-muted rounded-lg">
                              <DocumentIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium truncate">{document.title}</h4>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Badge className={typeBadge.color}>
                                    {typeBadge.label}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(document.confidence * 100)}% match
                                  </Badge>
                                </div>
                              </div>
                              
                              {document.previewText && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {document.previewText}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{formatFileSize(document.size)}</span>
                                <span>Modified {document.lastModified.toLocaleDateString()}</span>
                                <div className="flex items-center space-x-1">
                                  <span>Relevant domains:</span>
                                  {document.relevantDomains.slice(0, 2).map(domain => (
                                    <Badge key={domain} variant="secondary" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                  {document.relevantDomains.length > 2 && (
                                    <span>+{document.relevantDomains.length - 2} more</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(document.url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            {document.isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Select documents to analyze with AI agents. You can always add more later.
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onboarding.discoveredDocuments.forEach(doc => {
                        if (!doc.isSelected) {
                          onboardingActions.toggleDocumentSelection(doc.id);
                        }
                      });
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={discoverDocuments}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Again
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Documents Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't find sustainability documents for your company online.
                  You can upload them manually or proceed without documents.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={discoverDocuments}>
                    <Search className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                disabled={false}
                onUploadComplete={() => {
                  // Files are handled by the existing FileUploader component
                  // which integrates with the current upload system
                }}
              />
              <p className="text-sm text-muted-foreground mt-4">
                Upload sustainability reports, annual reports, policies, or any other relevant documents.
                Our AI will automatically categorize and analyze them.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}