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

  useEffect(() => {
    const fetchEvalResults = async () => {
      try {
        const response = await fetch('http://localhost:8000/v2/evals/company-intelligence');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EvalResult[] = await response.json();
        setEvalResults(data);
      } catch (error: any) {
        setEvalError(error.message);
      } finally {
        setEvalLoading(false);
      }
    };

    const fetchLlmLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/v2/logs/llm-calls');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LlmLog[] = await response.json();
        setLlmLogs(data);
      } catch (error: any) {
        setLlmLogsError(error.message);
      } finally {
        setLlmLogsLoading(false);
      }
    };

    fetchEvalResults();
    fetchLlmLogs();
  }, []);

  const totalEvals = evalResults.length;
  const correctEvals = evalResults.filter(res => res.match).length;
  const accuracy = totalEvals > 0 ? (correctEvals / totalEvals * 100).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Evals Dashboard</h1>

      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Company Intelligence Evaluation Summary</h2>
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
        {!evalLoading && !evalError && evalResults.length === 0 && <p>No evaluation results found. Run `npm run eval:company-intel` to generate some.</p>}
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