
import React, { useState, useEffect } from 'react';
import { AppState, Question, QuizSetup, UserAnswer, LeaderboardEntry, EssayQuestion } from './types';
import { generateQuiz, generateSummary, generateEssayQuestions } from './services/geminiService';
import SetupView from './components/SetupView';
import QuizEngine from './components/QuizEngine';
import ResultsView from './components/ResultsView';
import LoadingView from './components/LoadingView';
import SummaryView from './components/SummaryView';
import EssayView from './components/EssayView';
import ChatView from './components/ChatView';

const LEADERBOARD_KEY = 'brainboost_leaderboard_v2';
const LAST_SETUP_KEY = 'brainboost_last_setup';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.SETUP);
  const [isInitializing, setIsInitializing] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentSetup, setCurrentSetup] = useState<QuizSetup | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Tải bảng xếp hạng
    const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
    if (savedLeaderboard) {
      try { 
        setLeaderboard(JSON.parse(savedLeaderboard)); 
      } catch (e) {}
    } else {
      // Seed initial sample data for THCS teacher dashboard demo
      const demoData: LeaderboardEntry[] = [
        {
          id: 'demo-1',
          playerName: 'Thanh',
          schoolName: 'THCS Hồng Quang',
          className: '6A',
          gradeNumber: '6',
          province: 'Tuyên Quang',
          score: 14,
          total: 15,
          topic: 'Toán học: bài 1',
          activityType: 'quiz',
          date: Date.now() - 1000 * 60 * 20
        },
        {
          id: 'demo-2',
          playerName: 'Thanh',
          schoolName: 'THCS Hồng Quang',
          className: '6A',
          gradeNumber: '6',
          province: 'Tuyên Quang',
          score: 0,
          total: 0,
          topic: 'Toán học: bài 1',
          activityType: 'chat',
          date: Date.now() - 1000 * 60 * 60
        },
        {
          id: 'demo-3',
          playerName: 'Nguyễn Văn Minh',
          schoolName: 'THCS Hồng Quang',
          className: '7B',
          gradeNumber: '7',
          province: 'Tuyên Quang',
          score: 18,
          total: 20,
          topic: 'Ngữ văn: Tóm tắt bài Độc lập',
          activityType: 'summary',
          date: Date.now() - 1000 * 60 * 180
        },
        {
          id: 'demo-4',
          playerName: 'Lê Thị Mai',
          schoolName: 'THCS Tân Trào',
          className: '8A',
          gradeNumber: '8',
          province: 'Tuyên Quang',
          score: 9,
          total: 10,
          topic: 'Khoa học tự nhiên: Đề tự luận Phản ứng hóa học',
          activityType: 'essay',
          date: Date.now() - 1000 * 60 * 360
        }
      ];
      setLeaderboard(demoData);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(demoData));
    }

    // 2. Tải thiết lập học tập gần nhất
    const savedSetup = localStorage.getItem(LAST_SETUP_KEY);
    if (savedSetup) {
      try { setCurrentSetup(JSON.parse(savedSetup)); } catch (e) {}
    }
    
    setIsInitializing(false);
  }, []);

  const saveActivityLog = (
    setup: QuizSetup,
    activityType: 'quiz' | 'summary' | 'essay' | 'chat',
    score?: number,
    total?: number
  ) => {
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      playerName: setup.playerName || 'Học sinh',
      schoolName: setup.schoolName || 'THCS Hồng Quang',
      className: setup.className || '6A',
      gradeNumber: setup.gradeNumber || '6',
      wardName: setup.wardName || '',
      province: setup.province || 'Tuyên Quang',
      score: score ?? 0,
      total: total ?? 0,
      topic: setup.topic,
      activityType,
      date: Date.now()
    };
    const updated = [newEntry, ...leaderboard];
    setLeaderboard(updated);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  };

  const handleDeleteEntry = (id: string) => {
    const updated = leaderboard.filter(item => item.id !== id);
    setLeaderboard(updated);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setLeaderboard([]);
    localStorage.removeItem(LEADERBOARD_KEY);
  };

  const startQuiz = async (setup: QuizSetup) => {
    setState(AppState.LOADING);
    setError(null);
    setCurrentSetup(setup);
    
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify(setup));
    
    try {
      const generatedQuestions = await generateQuiz(setup);
      if (generatedQuestions.length === 0) {
        throw new Error("Không có câu hỏi nào được tạo ra.");
      }
      setQuestions(generatedQuestions);
      setUserAnswers([]);
      setState(AppState.PLAYING);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không mong muốn");
      setState(AppState.SETUP);
    }
  };

  const startSummary = async (setup: QuizSetup) => {
    setState(AppState.LOADING);
    setError(null);
    setCurrentSetup(setup);
    
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify(setup));
    saveActivityLog(setup, 'summary');
    
    try {
      const knowledgeSummary = await generateSummary(setup);
      setSummary(knowledgeSummary);
      setState(AppState.SUMMARY);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo tóm tắt kiến thức.");
      setState(AppState.SETUP);
    }
  };

  const startEssay = async (setup: QuizSetup) => {
    setState(AppState.LOADING);
    setError(null);
    setCurrentSetup(setup);
    
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify(setup));
    saveActivityLog(setup, 'essay');
    
    try {
      const questions = await generateEssayQuestions(setup);
      setEssayQuestions(questions);
      setState(AppState.ESSAY);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo đề tự luận.");
      setState(AppState.SETUP);
    }
  };

  const startChat = (setup: QuizSetup) => {
    setCurrentSetup(setup);
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify(setup));
    saveActivityLog(setup, 'chat');
    setState(AppState.CHAT);
  };

  const handleComplete = (answers: UserAnswer[]) => {
    setUserAnswers(answers);
    const score = answers.filter(a => a.isCorrect).length;
    if (currentSetup) {
      saveActivityLog(currentSetup, 'quiz', score, questions.length);
    }
    setState(AppState.RESULTS);
  };

  const reset = () => {
    setState(AppState.SETUP);
    setQuestions([]);
    setUserAnswers([]);
    setError(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-4"></div>
          <p className="text-slate-400 font-medium">Đang khởi động...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (state) {
      case AppState.SETUP:
        return (
          <SetupView 
            onStart={startQuiz} 
            onSummary={startSummary}
            onEssay={startEssay}
            onChat={startChat}
            error={error} 
            leaderboard={leaderboard} 
            initialSetup={currentSetup}
            onDeleteEntry={handleDeleteEntry}
            onClearAll={handleClearAll}
          />
        );
      case AppState.SUMMARY:
        return (
          <SummaryView 
            summary={summary || ''} 
            topic={currentSetup?.topic || ''} 
            onBack={() => setState(AppState.SETUP)}
            onStartQuiz={() => currentSetup && startQuiz(currentSetup)}
          />
        );
      case AppState.ESSAY:
        return (
          <EssayView 
            questions={essayQuestions} 
            topic={currentSetup?.topic || ''} 
            onBack={() => setState(AppState.SETUP)}
          />
        );
      case AppState.CHAT:
        return (
          <ChatView 
            setup={currentSetup!} 
            onBack={() => setState(AppState.SETUP)}
          />
        );
      case AppState.LOADING:
        return <LoadingView onCancel={reset} />;
      case AppState.PLAYING:
        return (
          <QuizEngine 
            questions={questions} 
            onComplete={handleComplete} 
            onQuit={reset}
          />
        );
      case AppState.RESULTS:
        return (
          <ResultsView 
            questions={questions} 
            answers={userAnswers} 
            onRestart={reset}
            setup={currentSetup}
            leaderboard={leaderboard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-start py-6 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <main className="animate-slide-in">
          {renderContent()}
        </main>
      </div>
      
      <footer className="mt-8 pb-6 text-slate-400 text-xs text-center font-medium space-y-1">
        <div>&copy; {new Date().getFullYear()} ỨNG DỤNG HỌC TẬP THÔNG MINH - Nền tảng học tập THCS thông minh.</div>
        <div className="text-indigo-600 font-semibold">Được tạo và phát triển bởi Phùng Thanh AI</div>
      </footer>
    </div>
  );
};

export default App;
