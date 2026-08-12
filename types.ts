
export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GradeLevel = 'primary' | 'secondary' | 'highschool' | 'advanced';
export type BookSeries = 'canh_dieu' | 'ket_noi_tri_thuc' | 'chan_troi_sang_tao' | 'none';
export type ContentType = 'topic' | 'lesson';

export interface FileData {
  data: string; // base64 string
  mimeType: string;
}

export interface UserProfile {
  id: string;
  loginId: string; // Gmail hoặc Số điện thoại
  password?: string; // Mật khẩu (lưu local)
  playerName: string;
  schoolName: string;
  className: string;
  province: string;
  gradeLevel: GradeLevel;
  gradeNumber: string;
  createdAt: number; // Thời điểm đăng ký (timestamp)
}

export interface QuizSetup {
  playerName: string;
  topic: string;
  contentType: ContentType;
  count: number;
  difficulty: Difficulty;
  gradeLevel: GradeLevel;
  gradeNumber: string;
  className: string;
  schoolName: string;
  wardName?: string;
  province: string;
  bookSeries: BookSeries;
  advancedInstructions?: string;
  fileData?: FileData;
}

export enum AppState {
  SETUP,
  LOADING,
  PLAYING,
  RESULTS,
  SUMMARY,
  ESSAY,
  CHAT
}

export interface EssayQuestion {
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
}

export interface UserAnswer {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export type ActivityType = 'quiz' | 'summary' | 'essay' | 'chat';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  schoolName?: string;
  className?: string;
  gradeNumber?: string;
  wardName?: string;
  province?: string;
  score?: number;
  total?: number;
  topic: string;
  activityType?: ActivityType;
  date: number;
}
