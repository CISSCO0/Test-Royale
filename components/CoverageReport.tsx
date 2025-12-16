"use client"

import React from "react"
import { CoverageCodeEditor } from "./coverage-code-editor";


interface LineCoverage {
  line: number;
  covered: boolean;
}

interface GameCoverageReportProps {
  stdout: string;
  stderr: string;
  coverageSummary: any[];
  lineCoverage: LineCoverage[];
  baseCode: string;
  executionTime: number;
  playerName: string;
}

export function GameCoverageReport({ 
  stdout, 
  stderr, 
  coverageSummary, 
  lineCoverage, 
  baseCode,
  executionTime,
  playerName
}: GameCoverageReportProps) {
  
  const coveredLines = lineCoverage
    .filter(l => l.covered)
    .map(l => l.line);

  const totalCoverage = lineCoverage.length > 0 
    ? (lineCoverage.filter(l => l.covered).length / lineCoverage.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-foreground tracking-wider">COVERAGE REPORT</h2>
          <p className="text-muted-foreground text-sm mt-1">{playerName}'s Test Results</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalCoverage.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Overall Coverage</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-green-400">
            {lineCoverage.filter(l => l.covered).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Lines Covered</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-red-400">
            {lineCoverage.filter(l => !l.covered).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Lines Missed</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-blue-400">
            {lineCoverage.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Lines</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-cyan-400">{executionTime.toFixed(2)}s</div>
          <div className="text-xs text-muted-foreground mt-1">Execution Time</div>
        </div>
      </div>

      {/* Code Visualization */}
      <div className="space-y-4">
        <h3 className="font-bebas text-2xl text-foreground tracking-wider">Code Coverage</h3>
        <div className="h-[400px] rounded-lg border border-border overflow-hidden bg-background">
          <CoverageCodeEditor 
            value={baseCode}
            coveredLines={coveredLines}
            editable={false}
          />
        </div>
      </div>

      {/* Coverage Summary */}
      {coverageSummary.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bebas text-2xl text-foreground tracking-wider">Coverage by Class</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="text-left p-4 text-foreground font-semibold">Class</th>
                  <th className="text-center p-4 text-foreground font-semibold">Covered</th>
                  <th className="text-center p-4 text-foreground font-semibold">Missed</th>
                  <th className="text-center p-4 text-foreground font-semibold">Coverage %</th>
                </tr>
              </thead>
              <tbody>
                {coverageSummary.map((c, index) => (
                  <tr 
                    key={c.class} 
                    className={`border-b border-border last:border-0 ${
                      index % 2 === 0 ? 'bg-card' : 'bg-secondary/50'
                    } hover:bg-primary/5 transition-colors`}
                  >
                    <td className="p-4 text-foreground font-medium">{c.class}</td>
                    <td className="p-4 text-center text-green-600 font-semibold">{c.covered}</td>
                    <td className="p-4 text-center text-red-600 font-semibold">{c.missed}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${
                        parseFloat(c.percent) >= 80 ? 'text-green-600' :
                        parseFloat(c.percent) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {c.percent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Console Outputs */}
      <div className="grid grid-cols-2 gap-6">
        {stdout && (
          <div className="space-y-4">
            <h3 className="font-bebas text-2xl text-foreground tracking-wider">Test Output</h3>
            <div className="bg-background p-4 rounded-lg border border-border max-h-48 overflow-auto">
              <pre className="text-foreground font-mono text-sm whitespace-pre-wrap">{stdout}</pre>
            </div>
          </div>
        )}

        {stderr && (
          <div className="space-y-4">
            <h3 className="font-bebas text-2xl text-foreground tracking-wider">Errors</h3>
            <div className="bg-background p-4 rounded-lg border border-red-200 max-h-48 overflow-auto">
              <pre className="text-red-600 font-mono text-sm whitespace-pre-wrap">{stderr}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}