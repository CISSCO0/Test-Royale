"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface PlayerData {
  stats: {
    passed: number;
    failed: number;
    total: number;
    executionTime: string;
  };
  coverageSummary: number;
  lineRate: number;
  branchCoverage: number;
  mutation: {
    score: number;
    total: number;
    killed: number;
    survived: number;
    timeout: number;
    noCoverage: number;
  };
  testLines: number;
  totalScore: number;
  executionTime: number;
}

interface ResultsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  playerData: any; // ✅ Accept any and transform
  error: string | null;
  onClose: () => void;
}

export const ResultsModal = ({
  isOpen,
  isLoading,
  playerData,
  error,
  onClose,
}: ResultsModalProps) => {
  const [displayData, setDisplayData] = useState<PlayerData | null>(null);

  useEffect(() => {
    if (playerData) {
      // ✅ Map backend data structure to component interface
      const transformedData: PlayerData = {
        stats: {
          passed: playerData.submission?.stats?.passed ?? 0,
          failed: playerData.submission?.stats?.failed ?? 0,
          total: playerData.submission?.stats?.total ?? 0,
          executionTime: playerData.submission?.stats?.executionTime ?? "0",
        },
        coverageSummary: playerData.coverageSummary ?? 0,
        lineRate: playerData.lineRate ?? 0,
        branchCoverage: playerData.branchCoverage ?? 0,
        mutation: {
          score: playerData.mutation?.score ?? 0,
          total: playerData.mutation?.total ?? 0,
          killed: playerData.mutation?.killed ?? 0,
          survived: playerData.mutation?.survived ?? 0,
          timeout: playerData.mutation?.timeout ?? 0,
          noCoverage: playerData.mutation?.noCoverage ?? 0,
        },
        testLines: playerData.testLines ?? 0,
        totalScore: playerData.totalScore ?? 0,
        executionTime: playerData.executionTime ?? 0,
      };

      console.log("✅ Transformed data:", transformedData);
      setDisplayData(transformedData);
    }
  }, [playerData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/80 backdrop-blur-sm border-b border-orange-500/20 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 animate-pulse" />
            )}
            <h2 className="text-3xl font-bebas tracking-wider text-orange-300">
              {error ? "SUBMISSION FAILED" : "RESULTS REPORT"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-orange-300 font-mono">Generating report...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
              <p className="text-red-300 text-center font-mono">{error}</p>
            </div>
          ) : displayData ? (
            <>
              {/* Test Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Stats */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Test Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passed Tests</span>
                      <span className="text-lg font-bold text-green-400">
                        {displayData?.stats?.passed ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Failed Tests</span>
                      <span className="text-lg font-bold text-red-400">
                        {displayData?.stats?.failed ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Tests</span>
                      <span className="text-lg font-bold text-orange-400">
                        {displayData?.stats?.total ?? 0}
                      </span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Execution Time</span>
                      <span className="text-lg font-bold text-cyan-400">
                        {displayData?.stats?.executionTime ?? 0}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coverage Stats */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Code Coverage
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Line Coverage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{
                              width: `${Math.min(displayData?.lineRate ?? 0, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-green-400 w-12 text-right">
                          {(displayData?.lineRate ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Branch Coverage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{
                              width: `${Math.min(displayData?.branchCoverage ?? 0, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-blue-400 w-12 text-right">
                          {(displayData?.branchCoverage ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Summary</span>
                      <span className="text-lg font-bold text-orange-400">
                        {(displayData?.coverageSummary ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mutation Testing */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Mutation Testing
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Mutation Score</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">
                      {(displayData?.mutation?.score ?? 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Mutants</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">
                      {displayData?.mutation?.total ?? 0}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Killed</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {displayData?.mutation?.killed ?? 0}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Survived</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">
                      {displayData?.mutation?.survived ?? 0}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Timeout</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">
                      {displayData?.mutation?.timeout ?? 0}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">No Coverage</p>
                    <p className="text-2xl font-bold text-slate-400 mt-1">
                      {displayData?.mutation?.noCoverage ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <p className="text-slate-400 text-sm mb-2">Test Lines Written</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {displayData?.testLines ?? 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <p className="text-slate-400 text-sm mb-2">Total Score</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {(displayData?.totalScore ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
              >
                CLOSE REPORT
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};