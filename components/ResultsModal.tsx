"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, TrendingUp, Bug, Zap, Skull, Shield, Clock, Code, AlertTriangle, FileText } from "lucide-react";

interface MutationDetail {
  id: string;
  mutation: string;
  originalCode: string;
  line: number;
  status: string;
  fileName: string;
}

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
    details: MutationDetail[];
  };
  testLines: number;
  totalScore: number;
  executionTime: number;
}
interface ResultsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  playerData: any;
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
  const [selectedMutationTab, setSelectedMutationTab] = useState<'overview' | 'details'>('overview');
  const [baseCodeUrl, setBaseCodeUrl] = useState<string>("");
  useEffect(() => {
    if (playerData) {
      const transformedData: PlayerData = {
        stats: {
          passed: playerData.stats?.passed ?? 0,
          failed: playerData.stats?.failed ?? 0,
          total: playerData.stats?.total ?? 0,
          executionTime: playerData.executionTime ?? "0",
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
          details: playerData.mutation?.details ?? [],
        },
        testLines: playerData.testLines ?? 0,
        totalScore: playerData.totalScore ?? 0,
        executionTime: playerData.executionTime ?? 0,
      };

      console.log("✅ Transformed data:", transformedData);
      setDisplayData(transformedData);
    }
  }, [playerData]);

  const getMutationStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'killed': return 'bg-green-900/30 border-green-500/50 text-green-400';
      case 'survived': return 'bg-red-900/30 border-red-500/50 text-red-400';
      case 'timeout': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400';
      case 'compileerror': return 'bg-orange-900/30 border-orange-500/50 text-orange-400';
      case 'ignored': return 'bg-blue-900/30 border-blue-500/50 text-blue-400';
      case 'nocoverage': return 'bg-slate-900/30 border-slate-500/50 text-slate-400';
      default: return 'bg-slate-900/30 border-slate-500/50 text-slate-400';
    }
  };

  const getMutationStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'killed': return <Skull className="w-4 h-4" />;
      case 'survived': return <Shield className="w-4 h-4" />;
      case 'timeout': return <Clock className="w-4 h-4" />;
      case 'compileerror': return <AlertTriangle className="w-4 h-4" />;
      case 'ignored': return <Code className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };
    const getMutationCategory = (mutationType: string) => {
    if (mutationType.includes('Arithmetic')) return 'Arithmetic';
    if (mutationType.includes('Equality')) return 'Equality';
    if (mutationType.includes('String')) return 'String';
    if (mutationType.includes('Block')) return 'Block';
    if (mutationType.includes('Assignment')) return 'Assignment';
    if (mutationType.includes('Increment') || mutationType.includes('Decrement')) return 'Increment/Decrement';
    return 'General';
  };
  const getMutationCategoryColor = (category: string) => {
    switch(category) {
      case 'Arithmetic': return 'bg-purple-900/30 border-purple-500/50 text-purple-400';
      case 'Equality': return 'bg-indigo-900/30 border-indigo-500/50 text-indigo-400';
      case 'String': return 'bg-pink-900/30 border-pink-500/50 text-pink-400';
      case 'Block': return 'bg-amber-900/30 border-amber-500/50 text-amber-400';
      case 'Assignment': return 'bg-teal-900/30 border-teal-500/50 text-teal-400';
      case 'Increment/Decrement': return 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400';
      default: return 'bg-slate-900/30 border-slate-500/50 text-slate-400';
    }
  };


  const getMutationStatusCount = (status: string) => {
    if (!displayData?.mutation?.details) return 0;
    return displayData.mutation.details.filter(d => d.status.toLowerCase() === status.toLowerCase()).length;
  };

    const getShortOriginalCode = (code: string) => {
    if (code.length > 40) {
      return code.substring(0, 40) + '...';
    }
    return code;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-orange-500/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/80 backdrop-blur-sm border-b border-orange-500/20 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 animate-pulse" />
            )}
            <h2 className="text-3xl font-bebas tracking-wider text-orange-300">
              {error ? "SUBMISSION FAILED" : "DETAILED RESULTS REPORT"}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passed Tests</span>
                      <span className="text-lg font-bold text-green-400">
                        {displayData.stats.passed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Failed Tests</span>
                      <span className="text-lg font-bold text-red-400">
                        {displayData.stats.failed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Tests</span>
                      <span className="text-lg font-bold text-orange-400">
                        {displayData.stats.total}
                      </span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Execution Time</span>
                      <span className="text-lg font-bold text-cyan-400">
                        {displayData.stats.executionTime}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Success Rate</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {displayData.stats.total > 0 ? 
                          ((displayData.stats.passed / displayData.stats.total) * 100).toFixed(1) + '%' : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coverage Stats */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Code Coverage
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Line Coverage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${Math.min(displayData.lineRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-green-400 w-12 text-right">
                            {displayData.lineRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Branch Coverage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              style={{ width: `${Math.min(displayData.branchCoverage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-blue-400 w-12 text-right">
                            {displayData.branchCoverage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Mutation Testing - Enhanced */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-orange-500/20 overflow-hidden">
                {/* Mutation Tabs */}
                <div className="border-b border-slate-700/50">
                  <div className="flex space-x-1 p-4">
                    <button
                      onClick={() => setSelectedMutationTab('overview')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedMutationTab === 'overview'
                          ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Overview
                    </button>
                    <button
                      onClick={() => setSelectedMutationTab('details')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedMutationTab === 'details'
                          ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Bug className="w-4 h-4 inline mr-2" />
                      Mutation Details ({displayData.mutation.details?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Mutation Content */}
                <div className="p-6">
                  {selectedMutationTab === 'overview' ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                          <p className="text-slate-400 text-sm mb-1">Mutation Score</p>
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <p className="text-2xl font-bold text-orange-400">
                              {displayData.mutation.score.toFixed(1)}%
                            </p>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                              style={{ width: `${Math.min(displayData.mutation.score, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                          <p className="text-slate-400 text-sm mb-1">Killed</p>
                          <div className="flex items-center gap-2">
                            <Skull className="w-5 h-5 text-green-400" />
                            <p className="text-2xl font-bold text-green-400">
                              {displayData.mutation.killed}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {displayData.mutation.total > 0 
                              ? `${((displayData.mutation.killed / displayData.mutation.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </p>
                        </div>
                        
                        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                          <p className="text-slate-400 text-sm mb-1">Survived</p>
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-400" />
                            <p className="text-2xl font-bold text-red-400">
                              {displayData.mutation.survived}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {displayData.mutation.total > 0 
                              ? `${((displayData.mutation.survived / displayData.mutation.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </p>
                        </div>
                        
                        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                          <p className="text-slate-400 text-sm mb-1">Timeout</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <p className="text-2xl font-bold text-yellow-400">
                              {displayData.mutation.timeout}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                          <p className="text-slate-400 text-sm mb-1">Compile Error</p>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                            <p className="text-2xl font-bold text-orange-400">
                              {getMutationStatusCount('compileerror')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                          <p className="text-slate-400 text-sm mb-1">Ignored</p>
                          <div className="flex items-center gap-2">
                            <Code className="w-5 h-5 text-blue-400" />
                            <p className="text-2xl font-bold text-blue-400">
                              {getMutationStatusCount('ignored')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-slate-300 font-medium mb-2">Mutation Distribution</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 rounded-lg bg-green-900/20 border border-green-500/20">
                            <p className="text-green-400 font-bold">{displayData.mutation.killed}</p>
                            <p className="text-xs text-slate-400">Killed</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-red-900/20 border border-red-500/20">
                            <p className="text-red-400 font-bold">{displayData.mutation.survived}</p>
                            <p className="text-xs text-slate-400">Survived</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
                            <p className="text-yellow-400 font-bold">{displayData.mutation.timeout}</p>
                            <p className="text-xs text-slate-400">Timeout</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-slate-900/30 border border-slate-500/20">
                            <p className="text-slate-400 font-bold">{displayData.mutation.noCoverage}</p>
                            <p className="text-xs text-slate-400">No Coverage</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (<div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-orange-300">Detailed Mutation Analysis</h4>
                        <span className="text-sm text-slate-400">
                          Total: {displayData.mutation.details?.length || 0} mutations
                        </span>
                      </div>
    
                      {displayData.mutation.details && displayData.mutation.details.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {displayData.mutation.details.map((detail, index) => (
                            <div
                              key={detail.id || index}
                              className={`p-4 rounded-lg border ${getMutationStatusColor(detail.status)} hover:border-opacity-100 transition-all`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    {getMutationStatusIcon(detail.status)}
                                    <div>
                                      <span className="font-bold text-slate-200 text-sm">
                                        Mutation {index + 1} • Line {detail.line}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div>
                                      <p className="text-xs text-slate-400 mb-1">Mutation Type</p>
                                      <p className="text-slate-300 font-medium text-sm">{detail.mutation}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400 mb-1">Category</p>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMutationCategoryColor(getMutationCategory(detail.mutation))}`}>
                                        {getMutationCategory(detail.mutation)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        detail.status.toLowerCase() === 'killed' ? 'bg-green-900/50 text-green-300' :
                                        detail.status.toLowerCase() === 'survived' ? 'bg-red-900/50 text-red-300' :
                                        detail.status.toLowerCase() === 'compileerror' ? 'bg-orange-900/50 text-orange-300' :
                                        detail.status.toLowerCase() === 'ignored' ? 'bg-blue-900/50 text-blue-300' :
                                        'bg-slate-800 text-slate-300'
                                      }`}>
                                        {detail.status}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-900/50 rounded p-3">
                                    <div className="flex items-start gap-2">
                                      <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs text-slate-400 mb-1">Code</p>
                                        <div className="flex items-center gap-2">
                                          <code className="text-slate-300 font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                                            {getShortOriginalCode(detail.originalCode)}
                                          </code>
                                          {detail.originalCode.length > 40 && (
                                            <span className="text-xs text-slate-500" title={detail.originalCode}>
                                              ...
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700/50">
                                <div className="flex items-center gap-2">
                                  <div className="text-slate-400">
                                    <span className="text-xs">File: </span>
                                    <span className="text-slate-300">{detail.fileName}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400">Impact: </span>
                                  <span className={`font-medium ${
                                    detail.status === 'Killed' ? 'text-green-400' :
                                    detail.status === 'Survived' ? 'text-red-400' :
                                    detail.status === 'CompileError' ? 'text-orange-400' :
                                    'text-slate-400'
                                  }`}>
                                    {detail.status === 'Killed' ? 'High - Test effective' :
                                     detail.status === 'Survived' ? 'Low - Test gap' :
                                     detail.status === 'CompileError' ? 'Medium - Invalid mutation' :
                                     'None'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No mutation details available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-900/30 rounded-lg">
                      <Code className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Test Lines Written</p>
                      <p className="text-2xl font-bold text-cyan-400 mt-1">
                        {displayData.testLines}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Lines of useful test code executed
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Score</p>
                      <p className="text-2xl font-bold text-orange-400 mt-1">
                        {displayData.totalScore.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Combined test quality score
                  </div>
                </div>



                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      <Bug className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Test Strength</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">
                        {displayData.mutation.score.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Mutation detection rate
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                CLOSE REPORT
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};