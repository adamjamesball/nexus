'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useNexusStore } from '@/lib/store';

export default function CarbonUtilitiesPage() {
  // Session will be initialized on the destination page

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Carbon & Climate</h1>
        <p className="text-sm text-muted-foreground">Build an auditable GHG inventory and prioritize decarbonization.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Org Boundary & Structure</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Consolidate entities and propose reporting boundary. Outputs: canonical list, boundary, issues, narrative.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/org-boundary">Start working with the agent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Activity Data Intake</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Collect, validate, and cleanse activity data. Identify gaps and propose fixes.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/carbon/activity-data">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Emissions Calculation</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Transparent scope-wise calculations with factors, allocation and uncertainty flags.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/carbon/emissions-calculation">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Estimate Missing Data</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gap-fill where inputs are incomplete using conservative, explainable methods.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/carbon/estimate-missing-data">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quality Assurance</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Controls, variance checks, and audit trails to ready for assurance.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/carbon/quality-assurance">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporting</span>
                {/* Button moved to bottom */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate inventory packs and narratives aligned to standards.</p>
              <div className="pt-4">
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard/carbon/reporting">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Direct navigation; no modal */}
    </div>
  );
}


