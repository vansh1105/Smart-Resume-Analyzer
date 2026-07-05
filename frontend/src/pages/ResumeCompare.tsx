import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus
} from 'lucide-react';

export const ResumeCompare: React.FC = () => {
  const [resumeAId, setResumeAId] = useState('');
  const [resumeBId, setResumeBId] = useState('');

  // Fetch Resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes/history');
      return response.data;
    }
  });

  // Fetch Resume A Details
  const { data: dataA } = useQuery({
    queryKey: ['resumeDetailsA', resumeAId],
    queryFn: async () => {
      if (!resumeAId) return null;
      const response = await api.get(`/resumes/${resumeAId}`);
      return response.data;
    },
    enabled: !!resumeAId
  });

  // Fetch Resume B Details
  const { data: dataB } = useQuery({
    queryKey: ['resumeDetailsB', resumeBId],
    queryFn: async () => {
      if (!resumeBId) return null;
      const response = await api.get(`/resumes/${resumeBId}`);
      return response.data;
    },
    enabled: !!resumeBId
  });

  const getComparison = () => {
    if (!dataA || !dataB) return null;

    const resumeA = dataA.resume;
    const analysisA = dataA.analysis;
    const resumeB = dataB.resume;
    const analysisB = dataB.analysis;

    // Score Diff
    const scoreDiff = (analysisB.atsScore || 0) - (analysisA.atsScore || 0);

    // Skills Added & Removed
    const skillsA: string[] = resumeA.parsedDetails?.skills?.map((s: string) => s.toLowerCase()) || [];
    const skillsB: string[] = resumeB.parsedDetails?.skills?.map((s: string) => s.toLowerCase()) || [];

    const rawSkillsA: string[] = resumeA.parsedDetails?.skills || [];
    const rawSkillsB: string[] = resumeB.parsedDetails?.skills || [];

    const skillsAdded = rawSkillsB.filter(s => !skillsA.includes(s.toLowerCase()));
    const skillsRemoved = rawSkillsA.filter(s => !skillsB.includes(s.toLowerCase()));

    // Better & Weaker Sections
    const betterSections: string[] = [];
    const weakerSections: string[] = [];
    const equalSections: string[] = [];

    const sectionsA = analysisA.sectionBreakdown || {};
    const sectionsB = analysisB.sectionBreakdown || {};

    Object.keys(sectionsB).forEach((sectionKey) => {
      const valA = sectionsA[sectionKey] || 0;
      const valB = sectionsB[sectionKey] || 0;
      const formattedName = sectionKey.replace(/([A-Z])/g, ' $1').trim().toLowerCase();

      if (valB > valA) {
        betterSections.push(formattedName);
      } else if (valB < valA) {
        weakerSections.push(formattedName);
      } else {
        equalSections.push(formattedName);
      }
    });

    return {
      nameA: resumeA.originalName,
      nameB: resumeB.originalName,
      scoreA: analysisA.atsScore,
      scoreB: analysisB.atsScore,
      scoreDiff,
      skillsAdded,
      skillsRemoved,
      betterSections,
      weakerSections
    };
  };

  const comp = getComparison();

  return (
    <div className="pl-64 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-8 animate-slide-up">
        {/* Title Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Resume Comparison</h1>
          <p className="text-sm text-zinc-400 mt-1">Select and audit the changes between two versions of your resume side-by-side.</p>
        </header>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Base Resume (Version A)
            </label>
            <select
              value={resumeAId}
              onChange={(e) => setResumeAId(e.target.value)}
              className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              <option value="">-- Select Resume A --</option>
              {resumes.map((item: any) => (
                <option key={item.id} value={item.id} disabled={item.id === resumeBId}>
                  {item.originalName} ({item.atsScore || 'No Score'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Comparison Resume (Version B)
            </label>
            <select
              value={resumeBId}
              onChange={(e) => setResumeBId(e.target.value)}
              className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              <option value="">-- Select Resume B --</option>
              {resumes.map((item: any) => (
                <option key={item.id} value={item.id} disabled={item.id === resumeAId}>
                  {item.originalName} ({item.atsScore || 'No Score'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {comp ? (
          <div className="flex flex-col gap-8 animate-slide-up">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score A card */}
              <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Version A Score</span>
                <h3 className="text-3xl font-extrabold text-white mt-2">{comp.scoreA}/100</h3>
                <p className="text-xs text-zinc-500 mt-4 truncate">{comp.nameA}</p>
              </div>

              {/* Score B card */}
              <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Version B Score</span>
                <h3 className="text-3xl font-extrabold text-white mt-2">{comp.scoreB}/100</h3>
                <p className="text-xs text-zinc-500 mt-4 truncate">{comp.nameB}</p>
              </div>

              {/* Variance Difference Card */}
              <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Score Variance</span>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-3xl font-extrabold text-white">
                      {comp.scoreDiff > 0 ? `+${comp.scoreDiff}` : comp.scoreDiff}
                    </h3>
                    {comp.scoreDiff > 0 ? (
                      <TrendingUp className="h-6 w-6 text-emerald-400" />
                    ) : comp.scoreDiff < 0 ? (
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    ) : (
                      <span className="text-zinc-500 text-sm font-semibold">No Change</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {comp.scoreDiff > 0 
                    ? 'Version B has improved over version A.' 
                    : comp.scoreDiff < 0 
                      ? 'Version B has decreased in score index.' 
                      : 'No change between versions.'}
                </p>
              </div>
            </div>

            {/* Skills Added / Removed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  Skills Added in Version B
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {comp.skillsAdded.length > 0 ? (
                    comp.skillsAdded.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-950/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 rounded-lg">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">No new skills added.</span>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-400" />
                  Skills Removed in Version B
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {comp.skillsRemoved.length > 0 ? (
                    comp.skillsRemoved.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-950/20 border border-red-500/20 text-xs font-semibold text-red-400 rounded-lg">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">No skills removed.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Better / Weaker Sections breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Stronger Sections (Version B)
                </h3>
                <div className="flex flex-col gap-2">
                  {comp.betterSections.length > 0 ? (
                    comp.betterSections.map((sec, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-border capitalize text-xs text-zinc-200">
                        <span>{sec}</span>
                        <span className="text-emerald-400 font-semibold">+ Improved</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">No section score increases.</span>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  Weaker Sections (Version B)
                </h3>
                <div className="flex flex-col gap-2">
                  {comp.weakerSections.length > 0 ? (
                    comp.weakerSections.map((sec, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-border capitalize text-xs text-zinc-200">
                        <span>{sec}</span>
                        <span className="text-red-400 font-semibold">- Decreased</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">No section score decreases.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
            <GitCompare className="h-10 w-10 text-zinc-700" />
            <h4 className="text-base font-bold text-zinc-400">Select Resumes to compare</h4>
            <p className="text-xs text-zinc-600 max-w-sm">Choose two different resumes from your history list above to perform a side-by-side assessment audit.</p>
          </div>
        )}
      </div>
    </div>
  );
};
