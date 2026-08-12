
import React from 'react';
import Markdown from 'react-markdown';

interface SummaryViewProps {
  summary: string;
  topic: string;
  onBack: () => void;
  onStartQuiz: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, topic, onBack, onStartQuiz }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-indigo-50 animate-slide-in">
      {/* Header */}
      <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <button 
            onClick={onBack}
            className="mb-6 flex items-center text-indigo-100 hover:text-white transition-colors font-medium text-sm"
          >
            <span className="mr-2">←</span> Quay lại thiết lập
          </button>
          <h2 className="text-3xl font-bold mb-2">Tổng hợp kiến thức</h2>
          <p className="text-indigo-100 opacity-90 font-medium">{topic}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 md:p-12">
        <div className="markdown-body prose prose-indigo max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-indigo-600 prose-li:text-slate-600">
          <Markdown>{summary}</Markdown>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95"
          >
            Quay lại
          </button>
          <button
            onClick={onStartQuiz}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>✍️</span> Bắt đầu làm bài tập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
