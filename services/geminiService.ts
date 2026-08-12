
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizSetup, EssayQuestion, FileData } from "../types";

// Helper to sanitize any raw API key string (removes whitespace, quotes, or accidental prefixes)
const sanitizeKey = (rawKey: string): string => {
  let k = rawKey.trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  if (k.toLowerCase().startsWith('api_key=')) {
    k = k.slice(8).trim();
  }
  if (k.toLowerCase().startsWith('gemini_api_key=')) {
    k = k.slice(15).trim();
  }
  return k;
};

const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    if (customKey) {
      const cleanCustom = sanitizeKey(customKey);
      if (cleanCustom) return cleanCustom;
    }
  }

  const envKey = 
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    (import.meta as any).env?.GEMINI_API_KEY;

  if (envKey) {
    const cleanEnv = sanitizeKey(envKey);
    if (cleanEnv) return cleanEnv;
  }

  throw new Error('Chưa cấu hình Gemini API Key! Vui lòng bấm nút "🔑 Cấu hình API Key" ở góc trên bên phải trang web để nhập Gemini API Key của bạn.');
};

const getAIClient = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

// Automatic model fallback sequence to ensure 100% compatibility across all API keys & regions
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

const generateWithFallback = async (
  ai: GoogleGenAI,
  preferredModel: string,
  params: Omit<Parameters<typeof ai.models.generateContent>[0], 'model'>
) => {
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Thử model ${modelName} thất bại, tự động chuyển mô hình tương thích tiếp theo...`, err);
      // Stop retrying if key is invalid/missing
      if (
        err?.message?.includes('An API Key must be set') || 
        err?.message?.includes('API_KEY_INVALID') || 
        err?.status === 401
      ) {
        throw err;
      }
    }
  }
  throw lastError;
};

export const generateSummary = async (setup: QuizSetup): Promise<string> => {
  const ai = getAIClient();
  
  const gradeNames: Record<string, string> = {
    primary: 'Tiểu học',
    secondary: 'Trung học cơ sở',
    highschool: 'Trung học thông phổ',
    advanced: 'Đại học / Người đi làm'
  };

  const bookSeriesNames: Record<string, string> = {
    canh_dieu: 'Cánh diều',
    ket_noi_tri_thuc: 'Kết nối tri thức với cuộc sống',
    chan_troi_sang_tao: 'Chân trời sáng tạo',
    none: 'Chương trình chuẩn'
  };

  const studentContext = `Học sinh lớp ${setup.className}, khối ${setup.gradeNumber} (${gradeNames[setup.gradeLevel]}), trường ${setup.schoolName}, tỉnh ${setup.province}.`;

  let prompt = `Bạn là một chuyên gia giáo dục AI. Hãy viết một bản TỔNG HỢP KIẾN THỨC chi tiết, dễ hiểu và khoa học cho nội dung sau:
  - Chủ đề/Bài học: ${setup.topic}
  - Đối tượng: ${studentContext}
  - Bộ sách: ${bookSeriesNames[setup.bookSeries]}`;

  if (setup.advancedInstructions) {
    prompt += `\n- Yêu cầu bổ sung: ${setup.advancedInstructions}`;
  }

  prompt += `\n\nYêu cầu bản tóm tắt bao gồm:
  1. Khái niệm/Định nghĩa chính.
  2. Các nội dung trọng tâm (chia theo các mục rõ ràng).
  3. Các công thức hoặc quy tắc cần nhớ (nếu có).
  4. Ví dụ minh họa ngắn gọn.
  5. Lời khuyên để học tốt phần này.
  
  Định dạng: Sử dụng Markdown để trình bày đẹp mắt, rõ ràng. Ngôn ngữ: Tiếng Việt.`;

  const parts: any[] = [{ text: prompt }];

  if (setup.fileData) {
    parts.push({
      inlineData: {
        data: setup.fileData.data,
        mimeType: setup.fileData.mimeType
      }
    });
  }

  try {
    const response = await generateWithFallback(ai, "gemini-3.1-flash-lite-preview", {
      contents: { parts }
    });

    return response.text || "Không thể tạo bản tóm tắt kiến thức lúc này.";
  } catch (error: any) {
    console.error("Error generating summary:", error);
    if (error?.message?.includes('An API Key must be set') || error?.message?.includes('Chưa cấu hình Gemini API Key')) {
      throw new Error("Chưa cấu hình API Key. Vui lòng bấm vào '🔑 Cấu hình API Key' ở góc trên bên phải để nhập Gemini API Key.");
    }
    throw new Error(error?.message || "Lỗi khi kết nối với AI để tạo tóm tắt.");
  }
};

export const generateEssayQuestions = async (setup: QuizSetup): Promise<EssayQuestion[]> => {
  const ai = getAIClient();
  
  const gradeNames: Record<string, string> = {
    primary: 'Tiểu học',
    secondary: 'Trung học cơ sở',
    highschool: 'Trung học thông phổ',
    advanced: 'Đại học / Người đi làm'
  };

  const bookSeriesNames: Record<string, string> = {
    canh_dieu: 'Cánh diều',
    ket_noi_tri_thuc: 'Kết nối tri thức với cuộc sống',
    chan_troi_sang_tao: 'Chân trời sáng tạo',
    none: 'Chương trình chuẩn'
  };

  const studentContext = `Học sinh lớp ${setup.className}, khối ${setup.gradeNumber} (${gradeNames[setup.gradeLevel]}), trường ${setup.schoolName}, tỉnh ${setup.province}.`;

  let prompt = `Bạn là một chuyên gia giáo dục AI. Hãy tạo 3-5 câu hỏi TỰ LUẬN (essay questions) chuyên sâu cho nội dung sau:
  - Chủ đề/Bài học: ${setup.topic}
  - Đối tượng: ${studentContext}
  - Bộ sách: ${bookSeriesNames[setup.bookSeries]}`;

  if (setup.advancedInstructions) {
    prompt += `\n- Yêu cầu bổ sung: ${setup.advancedInstructions}`;
  }

  prompt += `\n\nYêu cầu mỗi câu hỏi bao gồm:
  1. Nội dung câu hỏi (mang tính tư duy, phân tích hoặc vận dụng).
  2. Gợi ý đáp án chi tiết (viết dưới dạng bài mẫu hoặc các bước giải).
  3. Các ý chính cần đạt (key points) để học sinh tự đánh giá.
  
  YÊU CẦU ĐỊNH DẠNG: Trả về một mảng JSON các đối tượng có cấu trúc:
  {
    "question": "nội dung câu hỏi",
    "suggestedAnswer": "đáp án gợi ý chi tiết (Markdown)",
    "keyPoints": ["ý 1", "ý 2", ...]
  }`;

  const parts: any[] = [{ text: prompt }];

  if (setup.fileData) {
    parts.push({
      inlineData: {
        data: setup.fileData.data,
        mimeType: setup.fileData.mimeType
      }
    });
  }

  try {
    const response = await generateWithFallback(ai, "gemini-3.1-flash-lite-preview", {
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              suggestedAnswer: { type: Type.STRING },
              keyPoints: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["question", "suggestedAnswer", "keyPoints"],
          },
        },
      },
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error generating essay questions:", error);
    if (error?.message?.includes('An API Key must be set') || error?.message?.includes('Chưa cấu hình Gemini API Key')) {
      throw new Error("Chưa cấu hình API Key. Vui lòng bấm vào '🔑 Cấu hình API Key' ở góc trên bên phải để nhập Gemini API Key.");
    }
    throw new Error(error?.message || "Lỗi khi tạo đề tự luận.");
  }
};

export const askAnything = async (setup: QuizSetup, question: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], fileData?: FileData): Promise<string> => {
  const ai = getAIClient();
  
  const gradeNames: Record<string, string> = {
    primary: 'Tiểu học',
    secondary: 'Trung học cơ sở',
    highschool: 'Trung học thông phổ',
    advanced: 'Đại học / Người đi làm'
  };

  const studentContext = `Học sinh lớp ${setup.className}, khối ${setup.gradeNumber} (${gradeNames[setup.gradeLevel]}), trường ${setup.schoolName}, tỉnh ${setup.province}.`;

  const systemInstruction = `Bạn là "BẠN ĐỒNG HÀNH" - một trợ lý học tập AI thông minh, thân thiện và tận tâm.
  Nhiệm vụ của bạn là giải đáp mọi thắc mắc của học sinh liên quan đến bài học.
  
  BỐI CẢNH BÀI HỌC:
  - Chủ đề/Bài học: ${setup.topic}
  - Đối tượng: ${studentContext}
  
  HƯỚNG DẪN TRẢ LỜI:
  1. Trả lời chính xác, ngắn gọn, dễ hiểu và phù hợp với trình độ của học sinh.
  2. Khuyến khích học sinh tư duy, không chỉ đưa ra đáp án trực tiếp nếu đó là bài tập.
  3. Sử dụng Markdown để trình bày rõ ràng (in đậm, danh sách, công thức...).
  4. Nếu câu hỏi không liên quan đến bài học, hãy nhắc nhở nhẹ nhàng và hướng học sinh quay lại chủ đề chính, nhưng vẫn có thể trả lời ngắn gọn nếu hữu ích.
  5. Luôn giữ thái độ tích cực, động viên học sinh.`;

  const modelsToTry = ["gemini-3-flash-preview", ...FALLBACK_MODELS];
  const parts: any[] = [{ text: question }];

  const effectiveFileData = fileData || (history.length === 0 ? setup.fileData : undefined);
  if (effectiveFileData) {
    parts.push({
      inlineData: {
        data: effectiveFileData.data,
        mimeType: effectiveFileData.mimeType
      }
    });
  }

  let lastErr: any = null;
  for (const modelName of modelsToTry) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction },
        history: history,
      });
      const response = await chat.sendMessage({ message: parts });
      return response.text || "Xin lỗi, mình không thể trả lời câu hỏi này lúc này.";
    } catch (error: any) {
      lastErr = error;
      if (error?.message?.includes('An API Key must be set') || error?.message?.includes('Chưa cấu hình Gemini API Key')) {
        throw new Error("Chưa cấu hình API Key. Vui lòng bấm vào '🔑 Cấu hình API Key' ở góc trên bên phải để nhập Gemini API Key.");
      }
    }
  }

  console.error("Error in askAnything:", lastErr);
  throw new Error(lastErr?.message || "Lỗi khi kết nối với AI.");
};

export const generateQuiz = async (setup: QuizSetup): Promise<Question[]> => {
  const ai = getAIClient();
  
  const gradeNames: Record<string, string> = {
    primary: 'Tiểu học',
    secondary: 'Trung học cơ sở',
    highschool: 'Trung học thông phổ',
    advanced: 'Đại học / Người đi làm'
  };

  const bookSeriesNames: Record<string, string> = {
    canh_dieu: 'Cánh diều',
    ket_noi_tri_thuc: 'Kết nối tri thức với cuộc sống',
    chan_troi_sang_tao: 'Chân trời sáng tạo',
    none: 'Chương trình chuẩn'
  };

  const typeDesc = setup.contentType === 'topic' ? 'theo chủ đề rộng' : 'theo một bài học cụ thể';
  const studentContext = `Học sinh lớp ${setup.className}, khối ${setup.gradeNumber} (${gradeNames[setup.gradeLevel]}), trường ${setup.schoolName}, tỉnh ${setup.province}.`;

  let prompt = `Bạn là một chuyên gia giáo dục AI. Hãy tạo một bộ câu hỏi trắc nghiệm ${typeDesc}. 
  Tất cả nội dung (câu hỏi, các lựa chọn, giải thích) PHẢI bằng tiếng Việt.
  
  ĐỐI TƯỢNG: ${studentContext}
  BỘ SÁCH GIÁO KHOA: ${bookSeriesNames[setup.bookSeries]}.
  MỨC ĐỘ KHÓ: ${setup.difficulty === 'easy' ? 'Dễ' : setup.difficulty === 'medium' ? 'Trung bình' : 'Khó'}. 
  SỐ CÂU HỎI: ${setup.count}.`;

  if (setup.fileData) {
    prompt += `\n\nQUAN TRỌNG: Hãy trích xuất kiến thức từ hình ảnh/tài liệu đính kèm để đặt câu hỏi. Đảm bảo câu hỏi bám sát nội dung trong tài liệu này.`;
  }

  prompt += `\nCHỦ ĐỀ/YÊU CẦU: "${setup.topic}".`;

  if (setup.advancedInstructions && setup.advancedInstructions.trim() !== "") {
    prompt += `\nLƯU Ý NÂNG CAO: "${setup.advancedInstructions}".`;
  }

  prompt += `\n\nYÊU CẦU ĐỊNH DẠNG:
  - Mỗi câu hỏi có đúng 4 lựa chọn.
  - Phải có giải thích ngắn gọn tại sao đáp án đó đúng.
  - Phải trả về mảng JSON đúng cấu trúc.`;

  const parts: any[] = [{ text: prompt }];
  
  if (setup.fileData) {
    parts.push({
      inlineData: {
        data: setup.fileData.data,
        mimeType: setup.fileData.mimeType
      }
    });
  }

  try {
    const response = await generateWithFallback(ai, 'gemini-3-flash-preview', {
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "explanation"],
          },
        },
      },
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    if (error?.message?.includes('An API Key must be set') || error?.message?.includes('Chưa cấu hình Gemini API Key')) {
      throw new Error("Chưa cấu hình API Key. Vui lòng bấm vào '🔑 Cấu hình API Key' ở góc trên bên phải để nhập Gemini API Key.");
    }
    throw new Error(error?.message || "Không thể tạo câu hỏi từ bài học này. Vui lòng kiểm tra lại chủ đề hoặc Gemini API Key.");
  }
};
