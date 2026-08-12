
import React, { useState, useRef } from 'react';
import { Question, UserAnswer } from '../types';
import confetti from 'canvas-confetti';

interface QuizEngineProps {
  questions: Question[];
  onComplete: (answers: UserAnswer[]) => void;
  onQuit: () => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ questions, onComplete, onQuit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestion = questions[currentIdx];

  const playSuccessSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.log("Audio play failed", e));
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const newAnswer: UserAnswer = {
      questionIndex: currentIdx,
      selectedIndex: selectedOption,
      isCorrect
    };

    setAnswers(prev => [...prev, newAnswer]);
    setIsAnswered(true);

    if (isCorrect) {
      setTotalPoints(prev => prev + 10); // Đổi từ 100 thành 10
      setShowPointsAnim(true);
      playSuccessSound();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#fbbf24']
      });
      setTimeout(() => setShowPointsAnim(false), 1000);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete([...answers]);
    }
  };

  const progress = ((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100 w-full relative overflow-hidden">
      {/* Points Animation Overlay */}
      {showPointsAnim && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="text-6xl font-black text-green-500 animate-points drop-shadow-lg">
            +10
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Câu hỏi {currentIdx + 1} / {questions.length}
          </span>
          <div className="flex items-center mt-1">
            <span className="text-lg font-bold text-indigo-600 mr-2">Score: {totalPoints}</span>
            <span className="text-xs font-medium text-slate-400">điểm</span>
          </div>
        </div>
        <button 
          onClick={onQuit}
          className="text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1"
        >
          <span>←</span> Quay lại đổi chủ đề
        </button>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-tight">
        {currentQuestion.question}
      </h3>

      <div className="space-y-4 mb-10">
        {currentQuestion.options.map((option, idx) => {
          let style = "bg-slate-50 border-2 border-slate-100 text-slate-700 hover:border-indigo-200";
          if (selectedOption === idx) {
            style = "bg-indigo-50 border-2 border-indigo-500 text-indigo-700";
          }
          if (isAnswered) {
            if (idx === currentQuestion.correctIndex) {
              style = "bg-green-50 border-2 border-green-500 text-green-700 shadow-sm shadow-green-100 scale-[1.02]";
            } else if (selectedOption === idx) {
              style = "bg-red-50 border-2 border-red-500 text-red-700";
            } else {
              style = "bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
              className={`w-full p-5 rounded-2xl text-left font-semibold transition-all duration-300 transform ${style} ${!isAnswered && 'active:scale-[0.98]'}`}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold transition-colors ${selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mb-8 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-slide-in">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-indigo-800 mr-2 flex items-center">
              <span className="mr-1">💡</span> Giải thích:
            </span>
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className="group relative px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Kiểm tra đáp án</span>
            {selectedOption !== null && (
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            {currentIdx === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo ➔'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizEngine;
