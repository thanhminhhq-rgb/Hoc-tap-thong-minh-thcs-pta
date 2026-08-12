
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, ArrowLeft, Bot, User, Sparkles, Loader2, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { QuizSetup, FileData } from '../types';
import { askAnything } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatViewProps {
  setup: QuizSetup;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ setup, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Chào **${setup.playerName}**! Mình là **BẠN ĐỒNG HÀNH**. Mình đã sẵn sàng để giải đáp mọi thắc mắc của bạn về bài học **"${setup.topic}"**. Bạn muốn hỏi gì nào?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<FileData | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileData({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFileData(undefined);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !fileData) || isLoading) return;

    const userMessage = input.trim();
    const currentFileData = fileData;
    
    setInput('');
    setFileData(undefined);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage || (currentFileData ? `[Đã gửi tệp: ${fileName}]` : '') 
    }]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await askAnything(setup, userMessage || "Hãy phân tích tệp này giúp mình.", history, currentFileData);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Rất tiếc, mình gặp chút trục trặc khi kết nối. Bạn thử hỏi lại nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Hỏi bất kỳ điều gì
            </h2>
            <p className="text-xs text-indigo-100 opacity-80 truncate max-w-[200px]">
              Chủ đề: {setup.topic}
            </p>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                <div className="prose prose-sm max-w-none prose-slate">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 bg-white text-slate-400 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
        {fileData && (
          <div className="mb-3 flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-slide-in">
            <div className="flex items-center gap-2 overflow-hidden">
              {fileData.mimeType.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-indigo-200">
                  <img 
                    src={`data:${fileData.mimeType};base64,${fileData.data}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-indigo-700 truncate">{fileName}</p>
                <p className="text-[10px] text-indigo-500">Sẵn sàng để gửi</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={removeFile}
              className="p-1.5 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-slate-800 transition-all"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,.pdf,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Tải lên hình ảnh hoặc tài liệu"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !fileData) || isLoading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 uppercase tracking-widest font-bold">
          Sức mạnh bởi Trí tuệ nhân tạo GEMS
        </p>
      </form>
    </div>
  );
};

export default ChatView;
