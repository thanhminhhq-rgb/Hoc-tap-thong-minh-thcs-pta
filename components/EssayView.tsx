
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { EssayQuestion } from '../types';

interface EssayViewProps {
  questions: EssayQuestion[];
  topic: string;
  onBack: () => void;
}

const EssayView: React.FC<EssayViewProps> = ({ questions, topic, onBack }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Dạng đề tự luận</h2>
            <p className="text-xs text-slate-500 font-medium">{topic}</p>
          </div>
        </div>
        <div className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold">
          {questions.length} CÂU HỎI
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-indigo-200"
          >
            <button 
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full p-6 text-left flex justify-between items-start gap-4"
            >
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-800 leading-tight pt-1">
                  {q.question}
                </h3>
              </div>
              <span className={`text-2xl text-slate-300 transition-transform duration-300 ${expandedIndex === idx ? 'rotate-180' : ''}`}>
                ↓
              </span>
            </button>

            {expandedIndex === idx && (
              <div className="px-6 pb-8 pt-2 border-t border-slate-50 animate-fade-in">
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center">
                    <span className="mr-2">💡</span> Ý chính cần đạt
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {q.keyPoints.map((point, pIdx) => (
                      <span key={pIdx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
                        • {point}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center">
                    <span className="mr-2">📝</span> Gợi ý đáp án chi tiết
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="markdown-body prose prose-sm max-w-none prose-p:text-slate-600 prose-headings:text-slate-800">
                      <Markdown>{q.suggestedAnswer}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default EssayView;
