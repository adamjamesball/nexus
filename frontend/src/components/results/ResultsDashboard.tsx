'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNexusStore } from '@/lib/store';
import { OrganizationEntity, ProcessingResults } from '@/types';
import { 
  Download, 
  FileText, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileSpreadsheet,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface EntityTableProps {
  entities: OrganizationEntity[];
}

const EntityTable: React.FC<EntityTableProps> = ({ entities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'confidence'>('name');

  const filteredEntities = entities
    .filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || entity.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidenceScore - a.confidenceScore;
      }
      return a.name.localeCompare(b.name);
    });

  const entityTypes = [...new Set(entities.map(e => e.type))];

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'confidence')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEntities.length} of {entities.length} entities
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">{entities.filter(e => e.confidenceScore >= 90).length} High Confidence</Badge>
          <Badge variant="outline">{entities.filter(e => e.isUserVerified).length} Verified</Badge>
        </div>
      </div>

      {/* Entity Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurisdiction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ownership
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entity.name}
                        </div>
                        {entity.parentId && (
                          <div className="text-xs text-gray-500">
                            Subsidiary
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{entity.type}</Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entity.jurisdiction || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entity.ownershipPercentage ? `${entity.ownershipPercentage}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceColor(entity.confidenceScore)}>
                        {Math.round(entity.confidenceScore)}%
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {entity.isUserVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No entities found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

interface ExecutiveSummaryProps {
  results: ProcessingResults;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ results }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.entities.length}
            </div>
            <div className="text-sm text-gray-600">Entities Identified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(results.confidenceScore)}%
            </div>
            <div className="text-sm text-gray-600">Overall Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(results.processingTime / 1000)}s
            </div>
            <div className="text-sm text-gray-600">Processing Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results.keyInsights.length}
            </div>
            <div className="text-sm text-gray-600">Key Insights</div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {results.executiveSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{insight}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Strategic Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{recommendation.title || 'Recommendation'}</div>
                  <div className="text-gray-600">{recommendation.description || ''}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

interface ResultsDashboardProps {
  className?: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ className }) => {
  const { currentSession } = useNexusStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'entities'>('summary');

  if (!currentSession || !currentSession.results) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No results available</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete document processing to view results
          </p>
        </CardContent>
      </Card>
    );
  }

  const { results } = currentSession;

  const handleDownload = async (format: 'pdf' | 'excel') => {
    try {
      // This would integrate with the actual backend API
      toast.success(`${format.toUpperCase()} report download started`);
    } catch (error) {
      toast.error('Download failed. Please try again.');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Analysis Results</span>
            </CardTitle>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('pdf')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('excel')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('summary')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'summary'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'entities'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Entity Details ({results.entities.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && <ExecutiveSummary results={results} />}
      {activeTab === 'entities' && <EntityTable entities={results.entities} />}
    </div>
  );
};