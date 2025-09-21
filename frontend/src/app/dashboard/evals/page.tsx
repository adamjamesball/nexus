"use client";

import React, { useEffect, useState } from 'react';

interface EvalResult {
  input: string;
  expected_name: string;
  actual_name: string;
  match: boolean;
  full_result: any;
  full_expected: any;
}

interface LlmLog {
  timestamp: string;
  provider: string;
  model: string;
  input_messages: any[];
  output_content: string;
  usage: any;
  finish_reason: string;
}

const EvalsDashboardPage = () => {
  const [evalResults, setEvalResults] = useState<EvalResult[]>([]);
  const [llmLogs, setLlmLogs] = useState<LlmLog[]>([]);
  const [evalLoading, setEvalLoading] = useState<boolean>(true);
  const [llmLogsLoading, setLlmLogsLoading] = useState<boolean>(true);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [llmLogsError, setLlmLogsError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const fetchData = async () => {
    setEvalLoading(true);
    setLlmLogsLoading(true);
    setEvalError(null);
    setLlmLogsError(null);

    try {
      const evalResponse = await fetch('http://localhost:8000/v2/evals/company-intelligence');
      if (!evalResponse.ok) {
        throw new Error(`HTTP error! status: ${evalResponse.status}`);
      }
      const evalData: EvalResult[] = await evalResponse.json();
      setEvalResults(evalData);
    } catch (error: any) {
      setEvalError(error.message);
    } finally {
      setEvalLoading(false);
    }

    try {
      const llmLogsResponse = await fetch('http://localhost:8000/v2/logs/llm-calls');
      if (!llmLogsResponse.ok) {
        throw new Error(`HTTP error! status: ${llmLogsResponse.status}`);
      }
      const llmLogsData: LlmLog[] = await llmLogsResponse.json();
      setLlmLogs(llmLogsData);
    } catch (error: any) {
      setLlmLogsError(error.message);
    } finally {
      setLlmLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('http://localhost:8000/v2/evals/company-intelligence/run', {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.detail || response.statusText}`);
      }
      alert("Evaluation started successfully in the background!");
      // Give some time for the background process to start and potentially write results
      setTimeout(fetchData, 2000); 
    } catch (error: any) {
      alert(`Failed to start evaluation: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalEvals = evalResults.length;
  const correctEvals = evalResults.filter(res => res.match).length;
  const accuracy = totalEvals > 0 ? (correctEvals / totalEvals * 100).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Evals Dashboard</h1>

      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Company Intelligence Evaluation Summary</h2>
          <button
            onClick={runEvaluation}
            disabled={isEvaluating}
            className={`px-4 py-2 rounded-md text-white ${isEvaluating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isEvaluating ? 'Running Evaluation...' : 'Run Evaluation'}
          </button>
        </div>
        {evalLoading && <p>Loading evaluation results...</p>}
        {evalError && <p className="text-red-500">Error loading evaluation results: {evalError}</p>}
        {!evalLoading && !evalError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Total Samples</p>
              <p className="text-2xl font-bold">{totalEvals}</p>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Correct Matches</p>
              <p className="text-2xl font-bold">{correctEvals}</p>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{accuracy}%</p>
            </div>
          </div>
        )}

        {!evalLoading && !evalError && evalResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background border border-border rounded-md">
              <thead>
                <tr className="bg-muted">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-muted-foreground">Input</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-muted-foreground">Expected Name</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-muted-foreground">Actual Name</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-muted-foreground">Match</th>
                </tr>
              </thead>
              <tbody>
                {evalResults.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-accent/20' : 'bg-background'}>
                    <td className="py-2 px-4 border-b border-border text-sm">{result.input}</td>
                    <td className="py-2 px-4 border-b border-border text-sm">{result.expected_name}</td>
                    <td className="py-2 px-4 border-b border-border text-sm">{result.actual_name}</td>
                    <td className="py-2 px-4 border-b border-border text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.match ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                        {result.match ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!evalLoading && !evalError && evalResults.length === 0 && <p>No evaluation results found. Click 'Run Evaluation' to generate some.</p>}
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">LLM Call Logs</h2>
        {llmLogsLoading && <p>Loading LLM call logs...</p>}
        {llmLogsError && <p className="text-red-500">Error loading LLM call logs: {llmLogsError}</p>}
        {!llmLogsLoading && !llmLogsError && llmLogs.length > 0 && (
          <div className="overflow-x-auto max-h-96">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {llmLogs.map((log, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-border last:border-b-0">
                  <p><strong className="text-primary">Timestamp:</strong> {log.timestamp}</p>
                  <p><strong className="text-primary">Provider:</strong> {log.provider}</p>
                  <p><strong className="text-primary">Model:</strong> {log.model}</p>
                  <p><strong className="text-primary">Input Messages:</strong> {JSON.stringify(log.input_messages, null, 2)}</p>
                  <p><strong className="text-primary">Output Content:</strong> {log.output_content}</p>
                  <p><strong className="text-primary">Usage:</strong> {JSON.stringify(log.usage, null, 2)}</p>
                  <p><strong className="text-primary">Finish Reason:</strong> {log.finish_reason}</p>
                </div>
              ))}
            </pre>
          </div>
        )}
        {!llmLogsLoading && !llmLogsError && llmLogs.length === 0 && <p>No LLM call logs found. Make some LLM calls to generate logs.</p>}
      </div>
    </div>
  );
};

export default EvalsDashboardPage;
