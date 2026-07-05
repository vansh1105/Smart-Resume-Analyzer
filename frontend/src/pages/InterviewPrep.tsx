import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { 
  Loader2, 
  ChevronRight, 
  MessageSquare,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'technical' | 'hr' | 'project' | 'behavioral'>('all');

  // Fetch Resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes/history');
      return response.data;
    }
  });

  // Fetch Resume Analysis details (which contains questions)
  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['resumeDetails', selectedResumeId],
    queryFn: async () => {
      if (!selectedResumeId) return null;
      const response = await api.get(`/resumes/${selectedResumeId}`);
      return response.data;
    },
    enabled: !!selectedResumeId
  });

  const interviewQuestions = details?.analysis?.interviewQuestions || [];

  // Filtered Questions
  const filteredQuestions = interviewQuestions.filter((q: any) => {
    if (filterType === 'all') return true;
    return q.type === filterType;
  });

  const handleSelectQuestion = (idx: number) => {
    setSelectedQuestionIdx(idx);
    setRevealAnswer(false);
  };

  const currentQuestion = selectedQuestionIdx !== null ? filteredQuestions[selectedQuestionIdx] : null;

  return (
    <div className="pl-64 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-8 animate-slide-up">
        {/* Title Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AI Interview Prep Simulator</h1>
          <p className="text-sm text-zinc-400 mt-1">Review tailored interview questions drafted from your actual resume projects and experience metrics.</p>
        </header>

        {/* Resume Selector */}
        <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between gap-6">
          <div className="max-w-md w-full">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Select Resume to Generate Questions
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                setSelectedQuestionIdx(null);
                setRevealAnswer(false);
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

          <div className="hidden sm:flex items-center gap-3 bg-zinc-900/60 p-4 rounded-xl border border-border">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div className="text-left text-xs">
              <span className="text-zinc-400 font-semibold block">Tailored Questions</span>
              <span className="text-zinc-500">{interviewQuestions.length} questions loaded</span>
            </div>
          </div>
        </div>

        {selectedResumeId ? (
          isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <span className="text-sm text-zinc-400">Loading tailored questions...</span>
            </div>
          ) : interviewQuestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question list (Left side) */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {/* Category filters */}
                <div className="flex flex-wrap gap-1 bg-card border border-border p-1 rounded-xl">
                  {(['all', 'technical', 'hr', 'project', 'behavioral'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setSelectedQuestionIdx(null);
                        setRevealAnswer(false);
                      }}
                      className={`
                        flex-1 text-center py-1.5 rounded-lg text-xs font-semibold capitalize transition
                        ${filterType === type 
                          ? 'bg-zinc-800 text-white' 
                          : 'text-zinc-400 hover:text-zinc-200'}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Questions listbox */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 max-h-[450px] overflow-y-auto">
                  {filteredQuestions.map((q: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`
                        text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 transition
                        ${selectedQuestionIdx === idx 
                          ? 'bg-zinc-900 border-indigo-500 text-indigo-400' 
                          : 'bg-zinc-900/40 border-border text-zinc-300 hover:border-zinc-700'}
                      `}
                    >
                      <span className="truncate leading-relaxed">{q.question}</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    </button>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-8">No questions matching this filter category.</p>
                  )}
                </div>
              </div>

              {/* Simulation Flashcard (Right side) */}
              <div className="lg:col-span-2">
                {currentQuestion ? (
                  <div className="bg-card border border-border rounded-xl p-8 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>

                    {/* Metadata headers */}
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded text-[10px] uppercase font-extrabold tracking-wider">
                          {currentQuestion.type}
                        </span>
                        <span className={`
                          px-2.5 py-1 rounded text-[10px] uppercase font-extrabold tracking-wider border
                          ${currentQuestion.difficulty === 'hard' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : currentQuestion.difficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                        `}>
                          {currentQuestion.difficulty}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">Question {selectedQuestionIdx! + 1} of {filteredQuestions.length}</span>
                    </div>

                    {/* Core Question Display */}
                    <div className="py-8">
                      <h3 className="text-xl font-bold text-white leading-relaxed">
                        "{currentQuestion.question}"
                      </h3>
                    </div>

                    {/* Answer Reveal Area */}
                    <div className="space-y-4">
                      {revealAnswer ? (
                        <div className="bg-zinc-900 border border-border p-5 rounded-xl animate-slide-up">
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Suggested Answer Strategy
                          </span>
                          <p className="text-sm text-zinc-300 leading-relaxed font-light">
                            {currentQuestion.suggestedAnswer}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevealAnswer(true)}
                          className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-border text-sm font-semibold transition"
                        >
                          Reveal Strategy & Sample Answer
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3 min-h-[420px]">
                    <MessageSquare className="h-10 w-10 text-zinc-700" />
                    <h4 className="text-base font-bold text-zinc-400">Select a question to practice</h4>
                    <p className="text-xs text-zinc-600 max-w-xs">Pick one of the interview questions in the left sidebar list to load details and practice mock interview replies.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-zinc-500">
              No interview prep questions found for this resume. Try re-analyzing.
            </div>
          )
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
            <Layers className="h-10 w-10 text-zinc-700" />
            <h4 className="text-base font-bold text-zinc-400">Choose a resume to practice</h4>
            <p className="text-xs text-zinc-600 max-w-sm">Load questions by choosing one of your analyzed resumes above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
