'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Reporting</h1>
        <p className="text-sm text-muted-foreground">Generate inventory packs and narratives aligned to standards.</p>

        <Card>
          <CardHeader>
            <CardTitle>Planned capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Excel and PDF report packages</li>
              <li>CSRD/ESRS-aligned narratives</li>
              <li>Charts and executive summaries</li>
              <li>Export assets for assurance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


