"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNexusStore } from "@/lib/store";

export default function ContextBuilderPage() {
  const { currentSession } = useNexusStore();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const items = [
    { key: "entities", label: "Entity list", help: "Upload a master list of entities and relationships (parent/subsidiary)." },
    { key: "sites", label: "Sites & facilities", help: "Upload site directory with addresses, country codes, and operations." },
    { key: "suppliers", label: "Suppliers", help: "Provide your supplier roster to improve Scope 3 visibility." },
    { key: "products", label: "Products (PCF)", help: "Provide product catalog with material breakdown for PCF." },
    { key: "energy", label: "Energy bills", help: "Upload electricity and fuels data by site for Scope 1 & 2." },
    { key: "policies", label: "Policies", help: "Upload relevant policies and procedures for compliance context." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Context & Connections Builder</h1>
          <Link href="/dashboard" className="text-blue-600 text-sm underline">Back to Dashboard</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How to improve agent performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              This platform learns from every run and every interaction. Provide context below to boost the quality of results on current and future runs (reinforcement learning).
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Upload structured lists (CSV/XLSX) wherever possible</li>
              <li>Use consistent entity names and ISO country codes</li>
              <li>Prefer primary data over estimates for PCF and Scope 1/2</li>
              <li>Provide prior inventories and reports for cross-checking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="p-4 border rounded-lg bg-white flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {added[item.key] ? (
                      <Badge className="bg-green-100 text-green-700">Added</Badge>
                    ) : (
                      <Badge variant="outline">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.help}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAdded((s) => ({ ...s, [item.key]: true }))}
                  >
                    Mark as Added
                  </Button>
                  <Button
                    onClick={() => alert("Upload flow integrates with existing uploader")}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback & Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">
              After each run, provide feedback to improve future performance. Corrections, comments, and ratings feed the learning engine.
            </p>
            <Button
              onClick={async () => {
                if (!currentSession) return;
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/sessions/${currentSession.id}/feedback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'comment', content: { message: 'Great results – improving with added supplier list.' } })
                });
                alert('Feedback sent');
              }}
            >
              Send Example Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
