import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Sparkles, RefreshCw, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { generateProjectSummary } from '../services/aiService';

const AISummaryModal = ({ isOpen, onClose, dashboardData, sowDocument }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    
    try {
      const aiSummary = await generateProjectSummary(dashboardData, sowDocument);
      setSummary(aiSummary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  React.useEffect(() => {
    if (isOpen && !summary && !loading) {
      generateSummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Project Summary</h2>
              <p className="text-sm text-slate-500">Comprehensive analysis of EllaCap EQ development progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {summary && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy summary to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-slate-600" />
                  )}
                </button>
                
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate summary"
                >
                  <RefreshCw className={`h-5 w-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="mt-4 text-slate-600 font-medium">Analyzing project data...</p>
              <p className="text-sm text-slate-500">Generating comprehensive summary with AI insights</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Failed to Generate Summary</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={generateSummary}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div className="prose prose-slate max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">AI-Generated Analysis</span>
                </div>
                <p className="text-sm text-purple-700">
                  This summary is generated using Azure OpenAI to analyze current project data against the SOW deliverables. 
                  Generated at {new Date().toLocaleString()}.
                </p>
              </div>
              
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-slate-800 mb-3 mt-6">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-4">{children}</h3>,
                  ul: ({children}) => <ul className="list-disc pl-6 space-y-1 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 space-y-1 mb-4">{children}</ol>,
                  li: ({children}) => <li className="text-slate-700 leading-relaxed">{children}</li>,
                  p: ({children}) => <p className="text-slate-700 leading-relaxed mb-4">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-slate-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-slate-600">{children}</em>,
                  code: ({inline, children}) => 
                    inline 
                      ? <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm">{children}</code>
                      : <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4"><code>{children}</code></pre>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-blue-800">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;