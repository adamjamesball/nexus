'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QualityAssurancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Quality Assurance</h1>
        <p className="text-sm text-muted-foreground">Controls, variance checks, and audit trails before sign-off.</p>

        <Card>
          <CardHeader>
            <CardTitle>Planned capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Automated validations and thresholds</li>
              <li>Variance analysis vs. prior periods</li>
              <li>Exception list with owners</li>
              <li>Audit trail and evidence links</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


