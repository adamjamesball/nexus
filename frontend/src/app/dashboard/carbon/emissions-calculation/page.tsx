'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmissionsCalculationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Emissions Calculation</h1>
        <p className="text-sm text-muted-foreground">Transparent, traceable calculations with factors, allocation, and uncertainty flags.</p>

        <Card>
          <CardHeader>
            <CardTitle>Planned capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Emissions factor sourcing and mapping</li>
              <li>Scope/category wise calculations</li>
              <li>Allocation strategies and rationale</li>
              <li>Uncertainty estimation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


