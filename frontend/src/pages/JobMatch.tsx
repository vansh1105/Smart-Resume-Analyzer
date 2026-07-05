import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const JobMatch: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);

  // Fetch Resumes for Selection
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes/history');
      return response.data;
    }
  });

  // Fetch Job Match history for the selected resume
  const { data: matchHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['jobMatches', selectedResumeId],
    queryFn: async () => {
      if (!selectedResumeId) return [];
      const response = await api.get(`/jobs/history/${selectedResumeId}`);
      return response.data;
    },
    enabled: !!selectedResumeId
  });

  // Calculate Match Mutation
  const matchMutation = useMutation({
    mutationFn: async (payload: { resumeId: string; jobTitle: string; descriptionText: string }) => {
      const response = await api.post('/jobs/match', payload);
      return response.data.jobDescription;
    },
    onSuccess: (data) => {
      setSuccess('Job Description matching completed!');
      setMatchResult(data.analysisResults);
      queryClient.invalidateQueries({ queryKey: ['jobMatches', selectedResumeId] });
      setTimeout(() => setSuccess(''), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to match Job Description');
    }
  });

  // Delete Match History Entry Mutation
  const deleteMatchMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobMatches', selectedResumeId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMatchResult(null);

    if (!selectedResumeId) {
      return setError('Please select a resume to match.');
    }
    if (!jobTitle) {
      return setError('Please provide a Job Title.');
    }
    if (!descriptionText || descriptionText.trim().length < 50) {
      return setError('Job description text must be at least 50 characters.');
    }

    matchMutation.mutate({
      resumeId: selectedResumeId,
      jobTitle,
      descriptionText
    });
  };

  return (
    <div className="pl-64 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-8 animate-slide-up">
        {/* Title Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Job Description Matcher</h1>
          <p className="text-sm text-zinc-400 mt-1">Compare your resume against target roles to identify missing skills and optimize content.</p>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-indigo-950/40 border border-indigo-500/50 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            <span className="text-sm text-indigo-200">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paste Form (Left Side) */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-1 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Role Description
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Select Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    setMatchResult(null);
                  }}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.originalName} ({item.atsScore || 'No Score'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Job Description Text
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste details of the job listing description here..."
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={matchMutation.isPending}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50"
              >
                {matchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    Matching Context...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    Calculate Match
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Details (Right Side) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {matchResult ? (
              <div className="flex flex-col gap-6">
                {/* Visual Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Match radial card */}
                  <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Role Match Percentage</span>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Score mapping resume capability overlap with the role.</p>
                    </div>
                    <div className={`
                      h-16 w-16 rounded-xl flex flex-col items-center justify-center font-extrabold border
                      ${matchResult.matchPercentage >= 75 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : matchResult.matchPercentage >= 50 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'}
                    `}>
                      <span className="text-lg">{matchResult.matchPercentage}%</span>
                    </div>
                  </div>

                  {/* Readiness rating card */}
                  <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Company Readiness Score</span>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Candidate's preparation rating to deliver on the job.</p>
                    </div>
                    <div className="h-16 w-16 bg-zinc-900 border border-border rounded-xl flex flex-col items-center justify-center font-extrabold text-indigo-400 text-lg">
                      {matchResult.companyReadinessScore}/100
                    </div>
                  </div>
                </div>

                {/* Skills analysis pills */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Role Keywords Overlap</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Matching Skills & Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matchingSkills?.length > 0 || matchResult.matchingKeywords?.length > 0 ? (
                          [...(matchResult.matchingSkills || []), ...(matchResult.matchingKeywords || [])].map((kw: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-950/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 rounded-lg">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">None parsed.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Missing Keywords & Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missingSkills?.length > 0 || matchResult.missingKeywords?.length > 0 ? (
                          [...(matchResult.missingSkills || []), ...(matchResult.missingKeywords || [])].map((kw: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-red-950/20 border border-red-500/20 text-xs font-semibold text-red-400 rounded-lg">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">None parsed.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Optimization Improvements</h3>
                  <div className="flex flex-col gap-3">
                    {matchResult.recommendedImprovements?.map((rec: string, i: number) => (
                      <div key={i} className="bg-zinc-900/60 border border-border p-4 rounded-xl text-sm text-zinc-300 leading-relaxed">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedResumeId ? (
              /* History of past job description match results */
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Past Matches for selected Resume</h3>

                {isLoadingHistory ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-zinc-900 border border-border animate-pulse rounded-lg"></div>
                    <div className="h-12 bg-zinc-900 border border-border animate-pulse rounded-lg"></div>
                  </div>
                ) : matchHistory.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {matchHistory.map((match: any) => (
                      <div 
                        key={match._id}
                        className="bg-zinc-900/60 border border-border p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{match.jobTitle}</h4>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(match.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-bold border
                            ${match.analysisResults.matchPercentage >= 75 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                          `}>
                            {match.analysisResults.matchPercentage}% Match
                          </span>
                          
                          <button
                            onClick={() => setMatchResult(match.analysisResults)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded border border-border text-zinc-300 transition"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteMatchMutation.mutate(match._id)}
                            className="p-1.5 bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 rounded border border-border hover:border-red-500/30 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-6 text-center">No comparison history records for this resume.</p>
                )}
              </div>
            ) : (
              /* No selection banner */
              <div className="bg-card border border-border rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                <Layers className="h-10 w-10 text-zinc-700" />
                <h4 className="text-base font-bold text-zinc-400">Select a resume to evaluate matches</h4>
                <p className="text-xs text-zinc-600 max-w-sm">Choose one of your analyzed resumes in the left selection panel, then enter a job title and description details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
