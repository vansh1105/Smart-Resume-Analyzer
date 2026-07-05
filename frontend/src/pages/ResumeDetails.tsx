import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Calendar,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export const ResumeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ats' | 'ai' | 'projects' | 'structure'>('ats');

  // Fetch Resume details
  const { data, isLoading, error } = useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      const response = await api.get(`/resumes/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  // Reanalyze Mutation
  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/resumes/${id}/reanalyze`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
    }
  });

  if (isLoading) {
    return (
      <div className="pl-64 min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
        <span className="text-sm text-zinc-400">Loading analysis reports...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pl-64 min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <h3 className="text-lg font-bold text-white">Error loading report</h3>
        <p className="text-sm text-zinc-500 max-w-sm">The requested resume report could not be found or retrieved.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-border text-sm font-semibold transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { resume, analysis } = data;
  const { parsedDetails } = resume;
  const { atsScore, sectionBreakdown, suggestions, aiFeedback, projectCritique } = analysis;

  // Setup radar chart data
  const radarData = [
    { subject: 'Completeness', value: sectionBreakdown.completeness || 0 },
    { subject: 'Contact Info', value: sectionBreakdown.contactInfo || 0 },
    { subject: 'Skills', value: sectionBreakdown.skills || 0 },
    { subject: 'Projects', value: sectionBreakdown.projects || 0 },
    { subject: 'Experience', value: sectionBreakdown.experience || 0 },
    { subject: 'Education', value: sectionBreakdown.education || 0 },
    { subject: 'Formatting', value: sectionBreakdown.formatting || 0 },
    { subject: 'Keywords', value: sectionBreakdown.keywordDensity || 0 },
    { subject: 'Action Verbs', value: sectionBreakdown.actionVerbs || 0 },
    { subject: 'Grammar', value: sectionBreakdown.grammar || 0 }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pl-64 min-h-screen bg-background print:pl-0 print:bg-white print:text-black">
      {/* Print-only CSS block */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, nav, button, .tabs-header, .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-card, .bg-zinc-900, .bg-zinc-900\\/60 {
            background-color: #f4f4f5 !important;
            border: 1px solid #e4e4e7 !important;
            color: black !important;
          }
          .text-white, .text-zinc-100, .text-zinc-200 {
            color: black !important;
          }
          .text-zinc-400, .text-zinc-500 {
            color: #71717a !important;
          }
          .border, .border-border {
            border-color: #e4e4e7 !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-8 print-full-width">
        {/* Back navigation & Actions */}
        <header className="flex justify-between items-center no-print">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => reanalyzeMutation.mutate()}
              disabled={reanalyzeMutation.isPending}
              className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-border text-sm font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`h-4 w-4 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>
        </header>

        {/* Resume Header Info */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-zinc-800 rounded-xl border border-border">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white print:text-black">
                {parsedDetails?.name || resume.originalName}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Parsed from <span className="font-semibold text-zinc-200">{resume.originalName}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-border">
            <div className="text-right">
              <span className="text-xs text-zinc-400 uppercase tracking-wider block">ATS Match Index</span>
              <span className="text-sm text-zinc-500 font-medium">Score Heuristics</span>
            </div>
            <div className={`
              h-12 w-12 rounded-lg border flex items-center justify-center font-extrabold text-lg
              ${atsScore >= 80 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : atsScore >= 60 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'}
            `}>
              {atsScore}
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-border tabs-header no-print">
          {(['ats', 'ai', 'projects', 'structure'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-3 border-b-2 text-sm font-semibold capitalize transition
                ${activeTab === tab 
                  ? 'border-indigo-500 text-white' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {tab === 'ats' ? 'ATS Evaluation' : tab === 'ai' ? 'AI Improvements' : tab === 'projects' ? 'Project critique' : 'Resume details'}
            </button>
          ))}
        </div>

        {/* TAB 1: ATS EVALUATION */}
        {activeTab === 'ats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Radar Chart */}
            <div className="bg-card border border-border rounded-xl p-6 lg:col-span-1 flex flex-col items-center justify-center min-h-[350px]">
              <h3 className="text-sm font-bold text-white mb-4">ATS Matrix Breakdown</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#27272a" tick={false} />
                    <Radar name="Resume" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle Section breakdown sliders */}
            <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-white mb-4">ATS Core Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(sectionBreakdown).map(([key, val]: any) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white">{val}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                      <div 
                        className={`h-full rounded-full ${val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Suggestions Panel */}
            <div className="bg-card border border-border rounded-xl p-6 lg:col-span-3">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-400" />
                ATS Scoring Adjustments & Key Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((sug: string, idx: number) => (
                  <div key={idx} className="bg-zinc-900/60 border border-border p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI IMPROVEMENTS */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-8">
            {/* Resume Summary */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                AI Professional Executive Profile Summary
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-border">
                {aiFeedback?.summary || 'No summary available.'}
              </p>
            </div>

            {/* Bullet Point Improvements */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Bullet Point Improvements</h3>
              {aiFeedback?.bulletPointImprovements && aiFeedback.bulletPointImprovements.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {aiFeedback.bulletPointImprovements.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border rounded-xl p-4 bg-zinc-900/40">
                      <div>
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1.5">Original Phrasing</span>
                        <p className="text-sm text-zinc-400 line-through leading-relaxed">{item.original}</p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-border pt-3.5 md:pt-0 md:pl-4">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Recommended Alternative
                        </span>
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium">{item.suggested}</p>
                        {item.impact && (
                          <span className="text-xs text-zinc-500 mt-2 block italic">Impact: {item.impact}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No specific bullet point rewrites generated. Good job!</p>
              )}
            </div>

            {/* Grammar Corrections */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Grammar, Style & Typos</h3>
              {aiFeedback?.grammarCorrections && aiFeedback.grammarCorrections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-zinc-400">
                        <th className="pb-3 font-semibold">Original Sentence</th>
                        <th className="pb-3 font-semibold">Corrected Version</th>
                        <th className="pb-3 font-semibold">Critique Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {aiFeedback.grammarCorrections.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="py-3.5 text-zinc-400 line-through pr-4">{item.original}</td>
                          <td className="py-3.5 text-zinc-200 font-semibold pr-4">{item.corrected}</td>
                          <td className="py-3.5 text-zinc-500 italic">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No immediate grammar errors found.</p>
              )}
            </div>

            {/* Career & Skills Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Missing / Key Skills to Add</h3>
                <div className="flex flex-wrap gap-2">
                  {aiFeedback?.skillSuggestions && aiFeedback.skillSuggestions.length > 0 ? (
                    aiFeedback.skillSuggestions.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-900 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400">
                        + {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No missing skills recommended.</span>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Target Career Paths</h3>
                <div className="flex flex-wrap gap-2">
                  {aiFeedback?.careerSuggestions && aiFeedback.careerSuggestions.length > 0 ? (
                    aiFeedback.careerSuggestions.map((path: string, idx: number) => (
                      <span key={idx} className="bg-indigo-650/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300">
                        {path}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No target paths suggested.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT CRITIQUE */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white mb-2">Project Description Critique</h3>
            
            {projectCritique && projectCritique.length > 0 ? (
              <div className="flex flex-col gap-6">
                {projectCritique.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <h4 className="text-base font-bold text-white">{proj.projectTitle}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Impact Score:</span>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-bold
                          ${proj.impactScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
                        `}>
                          {proj.impactScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Key Strengths</span>
                          <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                            {proj.strengths?.map((str: string, i: number) => <li key={i}>{str}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">Identified Weaknesses</span>
                          <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-1">
                            {proj.weaknesses?.map((wk: string, i: number) => <li key={i}>{wk}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <div>
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Recommended Tech Stack additions</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {proj.missingTech?.map((tech: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-border text-[10px] rounded text-zinc-400">{tech}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block mb-1">Suggested Revisions</span>
                          <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                            {proj.improvementSuggestions?.map((sug: string, i: number) => <li key={i}>{sug}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-zinc-500">
                No project components detected in the parsed resume structure.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STRUCTURE & PARSED DATA */}
        {activeTab === 'structure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side metadata */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Contact Information</h3>
                
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-zinc-500 block">Email Address</span>
                    <span className="text-zinc-200 break-all">{parsedDetails?.email || '--'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Phone Number</span>
                    <span className="text-zinc-200">{parsedDetails?.phone || '--'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">LinkedIn Profile</span>
                    <span className="text-zinc-200 break-all">{parsedDetails?.linkedin || '--'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">GitHub Portfolio</span>
                    <span className="text-zinc-200 break-all">{parsedDetails?.github || '--'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Personal Site</span>
                    <span className="text-zinc-200 break-all">{parsedDetails?.portfolio || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3.5">Skills Set</h3>
                <div className="flex flex-wrap gap-1.5">
                  {parsedDetails?.skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-zinc-900 border border-border rounded text-xs text-zinc-300">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-zinc-500">None parsed</span>}
                </div>
              </div>
            </div>

            {/* Right side Experience & Education lists */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Experience Timeline */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  Work Experience
                </h3>
                
                {parsedDetails?.experience && parsedDetails.experience.length > 0 ? (
                  <div className="relative border-l border-zinc-800 pl-6 space-y-8">
                    {parsedDetails.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 status-dot-active border border-zinc-900"></div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-white">{exp.position}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                            <span className="font-semibold text-zinc-300">{exp.company}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                          
                          {exp.description && (
                            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed bg-zinc-900/30 p-2.5 rounded border border-border/30">
                              {exp.description}
                            </p>
                          )}
                          
                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="list-disc pl-4 text-xs text-zinc-300 mt-3 space-y-1">
                              {exp.highlights.map((high: string, i: number) => <li key={i}>{high}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500">No experience parsed.</span>
                )}
              </div>

              {/* Education timeline */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-400" />
                  Education Credentials
                </h3>
                
                {parsedDetails?.education && parsedDetails.education.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {parsedDetails.education.map((edu: any, idx: number) => (
                      <div key={idx} className="bg-zinc-900/40 border border-border p-4.5 rounded-xl flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white">{edu.school}</h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            {edu.degree} in <span className="font-medium text-zinc-300">{edu.fieldOfStudy}</span>
                          </p>
                          <span className="text-[10px] text-zinc-500 mt-2 block">Graduated: {edu.startYear} - {edu.endYear}</span>
                        </div>
                        {edu.gpa && (
                          <div className="py-1 px-2.5 bg-zinc-800 rounded border border-border text-xs text-zinc-300 font-bold">
                            GPA: {edu.gpa}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500">No education entries parsed.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
