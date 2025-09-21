'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActivityDataPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Activity Data Intake</h1>
        <p className="text-sm text-muted-foreground">Collect, validate, and cleanse activity data. Identify gaps and propose fixes.</p>

        <Card>
          <CardHeader>
            <CardTitle>Planned capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Upload energy, fuel, and process data</li>
              <li>Schema matching and validation</li>
              <li>Anomaly detection and issue list</li>
              <li>Proposed remediations and next steps</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


