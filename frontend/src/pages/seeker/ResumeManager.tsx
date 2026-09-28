import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiUpload, HiDocumentText, HiDownload, HiRefresh, HiSparkles, HiExclamation, HiCheckCircle } from 'react-icons/hi';
import { resumesApi } from '../../services/api';
import Button from '../../components/ui/Button';
import AtsScoreGauge from '../../components/dashboard/AtsScoreGauge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ResumeManager: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
  });

  const latestResumeId = resumes?.[0]?.id;

  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['resumeAnalysis', latestResumeId],
    queryFn: () => latestResumeId ? resumesApi.getAnalysisByResume(latestResumeId) : null,
    enabled: !!latestResumeId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => resumesApi.upload(file),
    onSuccess: () => {
      toast.success('Resume uploaded successfully!');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setTimeout(() => {
         queryClient.invalidateQueries({ queryKey: ['resumeAnalysis'] });
      }, 1000); // give backend a sec to analyze
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to upload resume'),
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error('Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (selectedFile) uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Resume Manager</h1>
        <p className="page-subtitle">Upload your resume and get AI-powered insights to boost your ATS score.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & History */}
        <div className="space-y-6">
          
          {/* Upload Area */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Upload New Resume</h2>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 bg-white/5'} ${selectedFile ? 'border-green-500/50 bg-green-500/5' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx" onChange={handleChange} />
              
              {!selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/50 mb-2">
                    <HiUpload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-white">Drag and drop your file here</p>
                  <p className="text-xs text-white/40 mb-4">or</p>
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <p className="text-xs text-white/30 mt-2">Supported formats: PDF, DOCX (Max 5MB)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2">
                    <HiDocumentText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-white truncate max-w-full px-4">{selectedFile.name}</p>
                  <p className="text-xs text-white/40 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Cancel</Button>
                    <Button size="sm" onClick={handleUploadClick} isLoading={uploadMutation.isPending}>
                      Analyze Resume
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Uploaded Resumes</h2>
            
            {resumesLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
            ) : resumes && resumes.length > 0 ? (
              <div className="space-y-3">
                {resumes.map((resume, i) => (
                  <div key={resume.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <HiDocumentText className={`w-5 h-5 flex-shrink-0 ${i === 0 ? 'text-primary-400' : 'text-white/40'}`} />
                      <div className="truncate">
                        <p className={`text-sm font-medium truncate ${i === 0 ? 'text-white' : 'text-white/70'}`}>{resume.fileName}</p>
                        <p className="text-xs text-white/40">{new Date(resume.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={resumesApi.getDownloadUrl(resume.id)} target="_blank" rel="noreferrer" 
                       className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                      <HiDownload />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 text-center py-4 border border-dashed border-white/10 rounded-lg">No resumes uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiSparkles className="text-yellow-400" /> AI Resume Analysis
            </h2>
            {analysis && (
              <button onClick={() => refetchAnalysis()} className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                <HiRefresh /> Refresh
              </button>
            )}
          </div>

          {analysisLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Analyzing your resume..." />
            </div>
          ) : !resumes || resumes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <HiDocumentText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">No Analysis Available</h3>
                <p className="text-sm text-white/50 max-w-sm mx-auto">Upload a resume to get instant ATS scoring and AI-powered improvement suggestions.</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-fade-in">
              {/* Score section */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 rounded-2xl p-6 border border-white/10">
                <AtsScoreGauge score={analysis.atsScore} size={160} />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-1 flex items-center gap-2">
                      <HiCheckCircle className="text-green-400" /> Key Strengths
                    </h3>
                    <p className="text-sm text-white leading-relaxed">{analysis.strengths || 'N/A'}</p>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-1 flex items-center gap-2">
                      <HiExclamation className="text-red-400" /> Areas for Improvement
                    </h3>
                    <p className="text-sm text-white leading-relaxed">{analysis.weaknesses || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <h4 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Missing Skills</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{analysis.missingSkills || 'None identified'}</p>
                </div>
                
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Suggested Certifications</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{analysis.suggestedCertifications || 'None identified'}</p>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <HiSparkles className="text-primary-400" /> Recommended Action Plan
                </h4>
                <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {analysis.improvements || 'No specific actions recommended. Your resume looks great!'}
                </div>
              </div>

              {analysis.careerPath && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary-500/10 to-transparent border border-primary-500/20">
                  <h4 className="text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">Career Path Projection</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{analysis.careerPath}</p>
                </div>
              )}
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-yellow-400">Analysis pending or failed. Try uploading again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
