import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, ActivityType } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onDeleteEntry?: (id: string) => void;
  onClearAll?: () => void;
  onClose?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  onDeleteEntry,
  onClearAll,
  onClose
}) => {
  // Filter states
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');

  // Helper to extract subject from topic e.g. "Toán học: bài 1" -> "Toán học"
  const getSubject = (topic: string) => {
    if (topic.includes(': ')) {
      return topic.split(': ')[0].trim();
    }
    return topic.trim();
  };

  // Extract list of subjects
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      const subj = getSubject(e.topic);
      if (subj) set.add(subj);
    });
    return Array.from(set);
  }, [entries]);

  // Available classes based on selected grade
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    entries.forEach((e) => {
      if (selectedGrade === 'all' || e.gradeNumber === selectedGrade) {
        if (e.className) classSet.add(e.className);
      }
    });
    return Array.from(classSet).sort();
  }, [entries, selectedGrade]);

  // Available students based on Grade, Class, Subject & ActivityType
  const availableStudents = useMemo(() => {
    const studentMap = new Map<string, number>();
    entries.forEach((e) => {
      const matchGrade = selectedGrade === 'all' || e.gradeNumber === selectedGrade;
      const matchClass = selectedClass === 'all' || e.className === selectedClass;
      const matchSubj = selectedSubject === 'all' || getSubject(e.topic) === selectedSubject;
      const matchAct = selectedActivityType === 'all' || e.activityType === selectedActivityType;

      if (matchGrade && matchClass && matchSubj && matchAct) {
        studentMap.set(e.playerName, (studentMap.get(e.playerName) || 0) + 1);
      }
    });
    return Array.from(studentMap.entries()).map(([name, count]) => ({ name, count }));
  }, [entries, selectedGrade, selectedClass, selectedSubject, selectedActivityType]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchGrade = selectedGrade === 'all' || e.gradeNumber === selectedGrade;
      const matchClass = selectedClass === 'all' || e.className === selectedClass;
      const matchStudent = selectedStudent === 'all' || e.playerName === selectedStudent;
      const matchSubj = selectedSubject === 'all' || getSubject(e.topic) === selectedSubject;
      const matchAct = selectedActivityType === 'all' || (e.activityType || 'quiz') === selectedActivityType;
      
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search || 
        e.playerName.toLowerCase().includes(search) || 
        (e.className && e.className.toLowerCase().includes(search)) ||
        (e.schoolName && e.schoolName.toLowerCase().includes(search)) ||
        e.topic.toLowerCase().includes(search);

      return matchGrade && matchClass && matchStudent && matchSubj && matchAct && matchSearch;
    });
  }, [entries, selectedGrade, selectedClass, selectedStudent, selectedSubject, selectedActivityType, searchTerm]);

  // Statistics
  const totalStudents = useMemo(() => {
    return new Set(filteredEntries.map((e) => e.playerName)).size;
  }, [filteredEntries]);

  const totalAccesses = filteredEntries.length;

  const quizEntries = useMemo(() => {
    return filteredEntries.filter((e) => (e.activityType || 'quiz') === 'quiz');
  }, [filteredEntries]);

  const quizCount = quizEntries.length;

  const avgQuizScore = useMemo(() => {
    const validQuizzes = quizEntries.filter((e) => (e.total || 0) > 0);
    if (validQuizzes.length === 0) return 0;
    const sumPct = validQuizzes.reduce((acc, curr) => acc + ((curr.score || 0) / (curr.total || 1)) * 100, 0);
    return Math.round(sumPct / validQuizzes.length);
  }, [quizEntries]);

  // Scope label construction
  const scopeText = useMemo(() => {
    const parts: string[] = [];
    if (selectedGrade !== 'all') parts.push(`Khối ${selectedGrade}`);
    if (selectedClass !== 'all') parts.push(`Lớp ${selectedClass}`);
    if (selectedStudent !== 'all') parts.push(`Học sinh: ${selectedStudent}`);
    if (selectedSubject !== 'all') parts.push(`Môn: ${selectedSubject}`);
    if (selectedActivityType !== 'all') {
      const actMap: Record<string, string> = {
        quiz: 'Trắc nghiệm',
        summary: 'Tổng hợp kiến thức',
        essay: 'Đề tự luận',
        chat: 'Hỏi đáp AI',
      };
      parts.push(`Hoạt động: ${actMap[selectedActivityType] || selectedActivityType}`);
    }
    if (parts.length === 0) return 'Tất cả học sinh';
    return parts.join(' • ');
  }, [selectedGrade, selectedClass, selectedStudent, selectedSubject, selectedActivityType]);

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu làm bài của học sinh không? Action này không thể hoàn tác.')) {
      onClearAll?.();
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Xóa lượt làm bài này?')) {
      onDeleteEntry?.(id);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${timeStr} - ${dateStr}`;
  };

  const renderActivityBadge = (type?: ActivityType) => {
    switch (type) {
      case 'summary':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span>📚</span> Tổng hợp kiến thức
          </span>
        );
      case 'essay':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span>📝</span> Dạng đề tự luận
          </span>
        );
      case 'chat':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span>✨</span> Hỏi đáp AI
          </span>
        );
      case 'quiz':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <span>🎯</span> Bài trắc nghiệm
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6 animate-slide-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
            📊
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Thông Tin Học Sinh Làm Bài
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Báo cáo thời gian truy cập, điểm số và kết quả học tập theo Chương trình GDPT 2018 cấp THCS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>🖨️</span> In báo cáo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/50 shadow-sm"
          >
            <span>🗑️</span> Xóa dữ liệu
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 font-bold flex items-center justify-center transition-colors text-base"
              title="Đóng"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Phạm vi báo cáo */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
        <span className="text-rose-500 font-bold">📍 Phạm vi báo cáo:</span>
        <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-indigo-700 font-bold shadow-2xs">
          {scopeText}
        </span>
      </div>

      {/* Metric Stat Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Học sinh */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-indigo-200 shrink-0">
            👥
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-[11px] font-semibold text-slate-500">
              Học sinh ({scopeText})
            </div>
          </div>
        </div>

        {/* Card 2: Lượt truy cập */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-200 shrink-0">
            📝
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalAccesses}</div>
            <div className="text-[11px] font-semibold text-slate-500">
              Lượt truy cập ({scopeText})
            </div>
          </div>
        </div>

        {/* Card 3: Bài trắc nghiệm */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-200 shrink-0">
            🎯
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{quizCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">
              Bài trắc nghiệm ({scopeText})
            </div>
          </div>
        </div>

        {/* Card 4: Điểm trắc nghiệm TB */}
        <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-violet-200 shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{avgQuizScore}%</div>
            <div className="text-[11px] font-semibold text-slate-500">
              Điểm trắc nghiệm TB ({scopeText})
            </div>
          </div>
        </div>
      </div>

      {/* LỌC & TÌM KIẾM DANH SÁCH HỌC SINH Container */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <span>🔍</span> LỌC & TÌM KIẾM DANH SÁCH HỌC SINH
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Tên học sinh */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Tên học sinh {selectedClass !== 'all' ? `(${availableStudents.length} em trong lớp)` : ''}
            </label>
            <div className="space-y-2">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="all">
                  👤 Tất cả học sinh ({availableStudents.length} em)
                </option>
                {availableStudents.map((st) => (
                  <option key={st.name} value={st.name}>
                    👤 {st.name} ({st.count} bài)
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Hoặc gõ tìm tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Khối lớp THCS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Khối lớp THCS
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedClass('all');
                setSelectedStudent('all');
              }}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-indigo-500 outline-none"
            >
              <option value="all">🎒 Tất cả các Khối (6 - 9)</option>
              <option value="6">🎒 Khối 6</option>
              <option value="7">🎒 Khối 7</option>
              <option value="8">🎒 Khối 8</option>
              <option value="9">🎒 Khối 9</option>
            </select>
          </div>

          {/* Lớp học cụ thể */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Lớp học cụ thể
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent('all');
              }}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-indigo-500 outline-none"
            >
              <option value="all">🏫 Tất cả các Lớp ({availableClasses.length})</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  🏫 Lớp {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Môn học & Hoạt động GD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Môn học & Hoạt động GD
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-indigo-500 outline-none"
            >
              <option value="all">📚 Tất cả Môn học ({allSubjects.length})</option>
              {allSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  📚 {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Loại hoạt động */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Loại hoạt động
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-indigo-500 outline-none"
            >
              <option value="all">🎯 Tất cả Hoạt động</option>
              <option value="quiz">🎯 Trắc nghiệm</option>
              <option value="summary">📚 Tổng hợp kiến thức</option>
              <option value="essay">📝 Đề tự luận</option>
              <option value="chat">✨ Hỏi đáp AI</option>
            </select>
          </div>
        </div>

        {/* Interactive Student Pills Chips Section */}
        <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>👥</span>
            <span>Danh sách {availableStudents.length} học sinh đã tham gia làm bài:</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
            {/* All Students Chip */}
            <button
              type="button"
              onClick={() => setSelectedStudent('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStudent === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>🚀</span> Tất cả học sinh trong lớp ({availableStudents.length})
            </button>

            {/* Student Chips */}
            {availableStudents.map((st) => {
              const isSelected = selectedStudent === st.name;
              return (
                <button
                  type="button"
                  key={st.name}
                  onClick={() => setSelectedStudent(isSelected ? 'all' : st.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-100'
                  }`}
                >
                  <span>👤</span>
                  <span>{st.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {st.count} bài
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
              <th className="px-5 py-4 w-44">THỜI GIAN TRUY CẬP</th>
              <th className="px-5 py-4">HỌC SINH & LỚP</th>
              <th className="px-5 py-4">MÔN HỌC / HOẠT ĐỘNG GD</th>
              <th className="px-5 py-4">HÌNH THỨC HỌC TẬP</th>
              <th className="px-5 py-4 text-center">SỐ ĐIỂM / KẾT QUẢ</th>
              <th className="px-4 py-4 text-center w-20">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                  <p className="text-3xl mb-2">📭</p>
                  <p>Không tìm thấy kết quả làm bài nào phù hợp với bộ lọc.</p>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isQuiz = (entry.activityType || 'quiz') === 'quiz';
                const hasScore = isQuiz && entry.total !== undefined && entry.total > 0;
                const scorePct = hasScore ? Math.round(((entry.score || 0) / (entry.total || 1)) * 100) : 0;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thời gian truy cập */}
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">🕒</span>
                        <span>{formatDate(entry.date)}</span>
                      </div>
                    </td>

                    {/* Học sinh & Lớp */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{entry.playerName}</span>
                          {entry.className && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-md border border-indigo-100">
                              Lớp {entry.className}
                            </span>
                          )}
                          {entry.gradeNumber && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-md">
                              Khối {entry.gradeNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {entry.schoolName || 'THCS'}
                          {entry.province ? ` • ${entry.province}` : ''}
                        </div>
                      </div>
                    </td>

                    {/* Môn học / Hoạt động GD */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {entry.topic}
                    </td>

                    {/* Hình thức học tập */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderActivityBadge(entry.activityType)}
                    </td>

                    {/* Số điểm / Kết quả */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {hasScore ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold border ${
                          scorePct >= 80 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : scorePct >= 50 
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {entry.score}/{entry.total} câu ({scorePct}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">
                          Đã tham gia
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(entry.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa lượt làm bài này"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
