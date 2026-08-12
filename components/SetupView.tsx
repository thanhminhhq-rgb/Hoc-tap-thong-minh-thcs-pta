import React, { useState } from 'react';
import { QuizSetup, Difficulty, LeaderboardEntry, BookSeries } from '../types';
import Leaderboard from './Leaderboard';

interface SetupViewProps {
  onStart: (setup: QuizSetup) => void;
  onSummary: (setup: QuizSetup) => void;
  onEssay: (setup: QuizSetup) => void;
  onChat: (setup: QuizSetup) => void;
  error: string | null;
  leaderboard: LeaderboardEntry[];
  initialSetup?: QuizSetup | null;
  onDeleteEntry?: (id: string) => void;
  onClearAll?: () => void;
}

const PREDEFINED_SUBJECTS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Lịch sử & Địa lý',
  'Lịch sử',
  'Địa lý',
  'Tin học',
  'GDCD'
];

const THCS_GRADES = [
  { id: '6', label: 'Khối 6' },
  { id: '7', label: 'Khối 7' },
  { id: '8', label: 'Khối 8' },
  { id: '9', label: 'Khối 9' },
];

const SetupView: React.FC<SetupViewProps> = ({
  onStart,
  onSummary,
  onEssay,
  onChat,
  error,
  leaderboard,
  initialSetup,
  onDeleteEntry,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'teacher'>('practice');

  // Extract initial values if topic has "Môn: Bài"
  const getInitialTopicParts = () => {
    if (initialSetup?.topic && initialSetup.topic.includes(': ')) {
      const [s, ...t] = initialSetup.topic.split(': ');
      return { subject: s, topic: t.join(': ') };
    }
    return { subject: initialSetup?.topic ? '' : 'Toán học', topic: initialSetup?.topic || 'bài 1' };
  };

  const initialParts = getInitialTopicParts();
  const [subject, setSubject] = useState(initialParts.subject || 'Toán học');
  const [lessonName, setLessonName] = useState(initialParts.topic || 'bài 1');
  
  const [count, setCount] = useState(initialSetup?.count || 15);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialSetup?.difficulty || 'medium');
  
  // Thông tin người học
  const [playerName, setPlayerName] = useState(initialSetup?.playerName || 'Thanh');
  const [schoolName, setSchoolName] = useState(initialSetup?.schoolName || 'THCS Hồng Quang');
  const [className, setClassName] = useState(initialSetup?.className || '6A');
  const [wardName, setWardName] = useState(initialSetup?.wardName || '');
  const [province, setProvince] = useState(initialSetup?.province || 'Tuyên Quang');
  const [gradeNumber, setGradeNumber] = useState(initialSetup?.gradeNumber || '6');
  
  const [bookSeries, setBookSeries] = useState<BookSeries>(initialSetup?.bookSeries || 'none');
  const [advancedInstructions, setAdvancedInstructions] = useState(initialSetup?.advancedInstructions || '');
  const [showAdvanced, setShowAdvanced] = useState(!!initialSetup?.advancedInstructions);

  // Modals state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleOpenApiKeyModal = () => {
    const savedKey = localStorage.getItem('custom_gemini_api_key') || '';
    setCustomApiKey(savedKey);
    setShowApiKeyModal(true);
  };

  const getFullTopic = () => {
    if (subject && lessonName) {
      return `${subject}: ${lessonName}`;
    }
    return lessonName || subject;
  };

  const getSetupData = (): QuizSetup => ({
    playerName: playerName.trim() || 'Học sinh',
    topic: getFullTopic(),
    contentType: 'lesson',
    count: Math.min(Math.max(count || 10, 5), 50),
    difficulty,
    gradeLevel: 'secondary', // Strict THCS
    gradeNumber,
    className: className.trim() || '6A',
    schoolName: schoolName.trim() || 'THCS',
    wardName: wardName.trim(),
    province: province.trim() || 'Tuyên Quang',
    bookSeries,
    advancedInstructions,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() && !subject) return;
    onStart(getSetupData());
  };

  const handleSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() && !subject) return;
    onSummary(getSetupData());
  };

  const handleEssay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() && !subject) return;
    onEssay(getSetupData());
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() && !subject) return;
    onChat(getSetupData());
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      localStorage.setItem('custom_gemini_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setShowApiKeyModal(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 animate-slide-in">
      {/* Top Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-100 gap-4">
        {/* App Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-xl shadow-md shadow-indigo-100 shrink-0">
            💎
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block">
              ỨNG DỤNG HỌC TẬP THÔNG MINH
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 block -mt-0.5">
              Được tạo và phát triển bởi Phùng Thanh AI
            </span>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-sm font-semibold text-slate-600 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'practice'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-100'
                : 'hover:text-slate-900'
            }`}
          >
            <span>🎯</span> Bài học & Luyện tập
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <span>📊</span> Quản lý HS làm bài
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'teacher' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {leaderboard.length}
            </span>
          </button>
        </div>

        {/* Right API Key Button */}
        <button
          type="button"
          onClick={handleOpenApiKeyModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span>🔑</span> Cấu hình API Key
        </button>
      </div>

      {/* RENDER VIEW BASED ON ACTIVE TAB */}
      {activeTab === 'teacher' ? (
        <Leaderboard
          entries={leaderboard}
          onDeleteEntry={onDeleteEntry}
          onClearAll={onClearAll}
          onClose={() => setActiveTab('practice')}
        />
      ) : (
        <>
          {/* SECTION 1: Thông tin người học */}
          <div className="bg-white rounded-3xl shadow-sm border border-indigo-50/80 p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold">
                👤
              </div>
              <h2 className="text-xl font-bold text-slate-900">Thông tin người học</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="Thanh"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Trường học
                </label>
                <input
                  type="text"
                  placeholder="THCS Hồng Quang"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Lớp
                </label>
                <input
                  type="text"
                  placeholder="6A"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Xã / Phường
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hồng Quang..."
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Tỉnh / Thành phố
                </label>
                <input
                  type="text"
                  placeholder="Tuyên Quang"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 & SIDEBAR: Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Thiết lập nội dung bài học */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-indigo-50/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-lg">
                  🎯
                </div>
                <h2 className="text-xl font-bold text-slate-900">Thiết lập nội dung bài học</h2>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Môn học & Tên bài học | Khối lớp | Bộ sách */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Môn học & Tên bài học */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Môn học & Tên bài học *
                    </label>
                    <div className="space-y-2">
                      <select
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        {PREDEFINED_SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="bài 1..."
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Khối lớp (THCS ONLY: 6, 7, 8, 9) */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Khối lớp (6 - 9)
                    </label>
                    <select
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                      value={gradeNumber}
                      onChange={(e) => setGradeNumber(e.target.value)}
                    >
                      {THCS_GRADES.map((g) => (
                        <option key={g.id} value={g.id}>
                          🎒 {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bộ sách giáo khoa */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Bộ sách giáo khoa
                    </label>
                    <select
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all"
                      value={bookSeries}
                      onChange={(e) => setBookSeries(e.target.value as BookSeries)}
                    >
                      <option value="none">📖 Mặc định / Khác</option>
                      <option value="ket_noi_tri_thuc">📖 Kết nối tri thức</option>
                      <option value="canh_dieu">📖 Cánh diều</option>
                      <option value="chan_troi_sang_tao">📖 Chân trời sáng tạo</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Số câu hỏi | Mức độ (Độ khó) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số câu hỏi
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={5}
                        max={50}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-bold"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 15)}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                        CÂU
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mức độ (Độ khó)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDifficulty('easy')}
                        className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 ${
                          difficulty === 'easy'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>🌱</span> DỄ
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('medium')}
                        className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 ${
                          difficulty === 'medium'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>⚡</span> VỪA
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('hard')}
                        className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 ${
                          difficulty === 'hard'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        <span>🔥</span> KHÓ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 3: Thêm yêu cầu nâng cao */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>{showAdvanced ? '−' : '+'}</span>
                    <span>Thêm yêu cầu nâng cao (tùy chọn)</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 animate-slide-in">
                      <textarea
                        placeholder="Ví dụ: Đặt nhiều câu hỏi thực tế, tập trung vào công thức hoặc mốc sự kiện..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm min-h-[90px]"
                        value={advancedInstructions}
                        onChange={(e) => setAdvancedInstructions(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons grid */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleSummary}
                      className="w-full py-4 px-4 bg-white border-2 border-indigo-500/80 hover:bg-indigo-50/50 text-indigo-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <span>📚</span> Tổng hợp kiến thức
                    </button>
                    <button
                      type="button"
                      onClick={handleEssay}
                      className="w-full py-4 px-4 bg-white border-2 border-emerald-500/80 hover:bg-emerald-50/50 text-emerald-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <span>📝</span> Dạng đề tự luận
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleChat}
                    className="w-full py-4 px-4 bg-white border-2 border-amber-400 hover:bg-amber-50/50 text-amber-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <span>✨</span> Hỏi bất kỳ điều gì (Giải đáp thắc mắc)
                  </button>

                  <button
                    type="submit"
                    className="w-full py-4.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-base active:scale-[0.99]"
                  >
                    <span>🚀</span> Cập nhật & Bắt đầu
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Column: Side Cards */}
            <div className="space-y-6">
              {/* Card 1: Quản lý HS Làm Bài (Dark Card) */}
              <div className="bg-[#1e1b4b] text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl shadow-indigo-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-indigo-800/80 text-indigo-200 rounded-xl flex items-center justify-center text-xl">
                    📊
                  </div>
                  <span className="bg-indigo-600/90 text-indigo-100 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-400/20">
                    Dành cho Giáo viên
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-white">Quản Lý HS Làm Bài</h3>
                  <p className="text-slate-300 text-xs leading-relaxed font-normal">
                    Theo dõi thời gian truy cập, bài tập đã hoàn thành và điểm số của từng học sinh trong lớp.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('teacher')}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>📋</span> Xem Báo Cáo Chi Tiết ({leaderboard.length})
                </button>
              </div>

              {/* Card 2: Gợi ý học tập (Yellow Light Card) */}
              <div className="bg-amber-50/80 border border-amber-200/80 text-amber-950 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <span>💡</span> Gợi ý học tập
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-medium">
                  Vui lòng nhập đầy đủ thông tin người học và thiết lập môn học hoặc chủ đề trước khi bắt đầu để AI có thể cá nhân hóa bài học tốt nhất cho bạn nhé!
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Cấu hình API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h3 className="text-lg font-bold text-slate-900">Cấu hình API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Ứng dụng sử dụng trí tuệ nhân tạo Google Gemini để tạo câu hỏi và giải đáp thắc mắc.
              </p>
              
              <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-1.5">
                <div className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  <span>💡</span> Hướng dẫn lấy API Key miễn phí:
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Bạn có thể tạo và lấy Gemini API Key hoàn toàn miễn phí chỉ trong vài giây từ Google:
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-200 mt-1"
                >
                  <span>🔗</span> Lấy API Key tại Google AI Studio ↗
                </a>
              </div>

              <p className="text-slate-500 pt-1">
                Sau khi sao chép API Key, hãy dán vào ô bên dưới và nhấn <strong>Lưu cấu hình</strong>:
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-3 pt-1">
                <input
                  type="password"
                  placeholder="Nhập Google Gemini API Key..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-mono"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />

                {apiKeySaved && (
                  <p className="text-emerald-600 font-bold text-xs">✓ Đã lưu API Key thành công!</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupView;
