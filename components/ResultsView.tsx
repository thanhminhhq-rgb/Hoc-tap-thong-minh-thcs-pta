
import React from 'react';
import { Question, UserAnswer, LeaderboardEntry, QuizSetup } from '../types';
import Leaderboard from './Leaderboard';

interface ResultsViewProps {
  questions: Question[];
  answers: UserAnswer[];
  onRestart: () => void;
  setup: QuizSetup | null;
  leaderboard: LeaderboardEntry[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, answers, onRestart, setup, leaderboard }) => {
  const score = answers.filter(a => a.isCorrect).length;
  const totalPoints = score * 10; // Đổi từ 100 thành 10
  const percentage = Math.round((score / questions.length) * 100);

  let message = "Hãy tiếp tục cố gắng!";
  let icon = "🌱";
  if (percentage === 100) { message = "Điểm tuyệt đối!"; icon = "🏆"; }
  else if (percentage >= 80) { message = "Làm tốt lắm!"; icon = "🌟"; }
  else if (percentage >= 50) { message = "Khá tốt!"; icon = "👍"; }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-indigo-50">
        <div className="bg-indigo-600 p-10 text-center text-white">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-xl font-medium opacity-80 mb-1">Chúc mừng, {setup?.playerName}!</h2>
          <p className="text-sm opacity-70 mb-4">Lớp {setup?.className} - Trường {setup?.schoolName} - {setup?.province}</p>
          <h2 className="text-3xl font-bold mb-1">{message}</h2>
          
          <div className="flex flex-col items-center mt-4 mb-6">
            <span className="text-5xl font-black tracking-tight">{totalPoints}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Tổng điểm tích lũy</span>
          </div>

          <p className="opacity-90 font-medium">Bạn đã trả lời đúng {score} trên {questions.length} câu</p>
          
          <div className="mt-8 relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                      className="text-indigo-800"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                  />
                  <circle
                      className="text-white transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                  />
              </svg>
              <span className="absolute text-xl font-bold">{percentage}%</span>
          </div>
        </div>

        <div className="p-8 max-h-[400px] overflow-y-auto bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
            <span>Xem lại đáp án</span>
            <span className="text-xs font-normal text-slate-500 italic">Dành cho {setup?.topic}</span>
          </h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers.find(a => a.questionIndex === idx);
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-start mb-3">
                      <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${userAnswer?.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {userAnswer?.isCorrect ? '✓' : '✕'}
                      </span>
                      <p className="font-semibold text-slate-800">{q.question}</p>
                  </div>
                  {!userAnswer?.isCorrect && (
                      <p className="text-sm text-slate-500 ml-9">
                          Đáp án đúng: <span className="font-bold text-green-600">{q.options[q.correctIndex]}</span>
                      </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Làm bộ câu hỏi khác
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="mr-3 text-yellow-500">🏆</span>
          Bảng xếp hạng vinh danh
        </h2>
        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
};

export default ResultsView;
