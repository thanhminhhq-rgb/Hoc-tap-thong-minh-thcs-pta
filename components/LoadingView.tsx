
import React, { useEffect, useState } from 'react';

interface LoadingViewProps {
  onCancel?: () => void;
}

const LoadingView: React.FC<LoadingViewProps> = ({ onCancel }) => {
  const [messageIdx, setMessageIdx] = useState(0);
  const messages = [
    "Đang quét nội dung tài liệu của bạn...",
    "Gemini đang phân tích hình ảnh bài học...",
    "Đang biên soạn câu hỏi trắc nghiệm thông minh...",
    "Đang chuẩn bị lời giải chi tiết cho bạn...",
    "Chỉ còn vài giây nữa là xong...",
    "AI đang chọn lọc những kiến thức trọng tâm..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-12 flex flex-col items-center justify-center text-center border border-indigo-50 min-h-[450px] animate-slide-in">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2 h-16 flex items-center justify-center max-w-sm">
        {messages[messageIdx]}
      </h2>
      <p className="text-slate-400 text-sm mb-12">Công nghệ AI đang tạo lộ trình ôn tập cá nhân hóa cho bạn</p>
      
      {onCancel && (
        <button 
          onClick={onCancel}
          className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all flex items-center gap-2 border border-slate-200 active:scale-95"
        >
          <span>←</span> Quay lại chỉnh sửa
        </button>
      )}
    </div>
  );
};

export default LoadingView;
