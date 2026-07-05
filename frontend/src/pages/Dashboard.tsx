import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  TrendingUp, 
  Layers, 
  Award,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Resume History
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes/history');
      return response.data;
    }
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess('Resume analyzed successfully!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      // Navigate to detailed view
      setTimeout(() => {
        navigate(`/resumes/${data.resume._id}`);
      }, 1000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to upload and parse resume');
      setUploadProgress(false);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      setSuccess('Resume deleted');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setTimeout(() => setSuccess(''), 2000);
    }
  });

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      triggerUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      triggerUpload(files[0]);
    }
  };

  const triggerUpload = (file: File) => {
    setError('');
    setSuccess('');
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowed.includes(file.type)) {
      return setError('Only PDF, DOCX, and TXT files are allowed.');
    }

    if (file.size > 10 * 1024 * 1024) {
      return setError('File size exceeds the 10MB limit.');
    }

    setUploadProgress(true);
    const formData = new FormData();
    formData.append('resume', file);
    uploadMutation.mutate(formData);
  };

  // Prepare chart details
  const areaChartData = [...history]
    .reverse()
    .map((item: any, index: number) => ({
      name: `R-${index + 1}`,
      score: item.atsScore || 0,
      date: new Date(item.createdAt).toLocaleDateString()
    }));

  const latestScore = history.length > 0 ? history[0].atsScore : 0;
  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc: number, item: any) => acc + (item.atsScore || 0), 0) / history.length)
    : 0;

  return (
    <div className="pl-64 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-8 animate-slide-up">
        {/* Title Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">Upload and review your resume portfolio analysis.</p>
          </div>
        </header>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-indigo-950/40 border border-indigo-500/50 p-4 rounded-xl flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin flex-shrink-0" />
            <span className="text-sm text-indigo-200">{success}</span>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Latest ATS Score</span>
                <h3 className="text-3xl font-extrabold text-white mt-2">{latestScore || '--'}/100</h3>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg border border-border">
                <Award className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Based on your most recent resume upload.</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Average Score</span>
                <h3 className="text-3xl font-extrabold text-white mt-2">{averageScore || '--'}/100</h3>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg border border-border">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Average score across all analyzed documents.</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Resumes</span>
                <h3 className="text-3xl font-extrabold text-white mt-2">{history.length}</h3>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg border border-border">
                <Layers className="h-5 w-5 text-sky-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Documents stored in your personal profile history.</p>
          </div>
        </section>

        {/* Upload Zone & Chart Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drag & Drop Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              bg-card/40 border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[350px]
              hover:border-indigo-500/50 hover:bg-zinc-900/30 group
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
            />
            {uploadProgress ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-indigo-400 animate-spin" />
                <h3 className="text-lg font-semibold text-zinc-200">Analyzing Resume...</h3>
                <p className="text-xs text-zinc-400 max-w-xs">Extracting content & running ATS calculation heuristics with Gemini AI.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-5 bg-zinc-800/80 rounded-full border border-border group-hover:scale-105 transition-transform duration-200">
                  <UploadCloud className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Drag & drop your resume</h3>
                <p className="text-sm text-zinc-400 max-w-xs">Supports PDF, DOCX, and TXT files up to 10MB.</p>
                <button className="mt-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-border text-sm font-semibold transition-all duration-150">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between min-h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">ATS Score History</h3>
              <span className="text-xs text-zinc-400">Score progress over time</span>
            </div>
            {areaChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full gap-2">
                <p className="text-sm text-zinc-500">No score history details available.</p>
                <p className="text-xs text-zinc-600">Upload multiple resumes to view your score trend.</p>
              </div>
            )}
          </div>
        </div>

        {/* History List */}
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Upload History</h3>
            <span className="text-xs text-zinc-400">{history.length} records</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-zinc-900 border border-border animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="flex flex-col gap-3">
              {history.map((item: any) => (
                <div 
                  key={item.id}
                  className="bg-zinc-900/60 border border-border hover:border-zinc-700 p-4 rounded-xl flex items-center justify-between transition-all duration-150 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2.5 bg-zinc-800 rounded-lg border border-border">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
                        {item.originalName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{(item.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Score badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Score:</span>
                      <span className={`
                        px-2.5 py-1 rounded-md text-xs font-bold border
                        ${item.atsScore >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : item.atsScore >= 60 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'}
                      `}>
                        {item.atsScore || 'Parsing'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/resumes/${item.id}`)}
                        className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 rounded-lg border border-border hover:border-red-500/30 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-2">
              <FileText className="h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-500">No resumes uploaded yet.</p>
              <p className="text-xs text-zinc-600 max-w-xs">Drag and drop your first resume file above to generate an ATS evaluation report.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
