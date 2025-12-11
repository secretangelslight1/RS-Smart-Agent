import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, ToolCallData, ToolResponseData } from './types';
import { sendMessageToGemini } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import LiveDashboard from './components/LiveDashboard';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); // Mobile dashboard toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: 'init-1',
      sender: Sender.MODEL,
      text: "Selamat datang di Sistem Rumah Sakit Pusat. Saya adalah **Agen Kelola Sistem**. Saya dapat membantu Anda dengan Pendaftaran Pasien, Penjadwalan Medis, Informasi Kesehatan, atau Administrasi Keuangan. Ada yang bisa saya bantu?",
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Prepare Model Message placeholder (to show tool calls in real-time)
    const modelMsgId = (Date.now() + 1).toString();
    const modelMsgPlaceholder: Message = {
      id: modelMsgId,
      sender: Sender.MODEL,
      text: '', // Empty initially
      toolCalls: [],
      toolResponses: [],
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, modelMsgPlaceholder]);

    // 3. Call Service
    const finalText = await sendMessageToGemini(
      text,
      (toolCall: ToolCallData) => {
        // Update state when a tool is called
        setMessages((prev) => 
          prev.map((m) => 
            m.id === modelMsgId 
              ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
              : m
          )
        );
      },
      (toolResult: ToolResponseData) => {
        // Update state when a tool returns a result
        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMsgId
              ? { ...m, toolResponses: [...(m.toolResponses || []), toolResult] }
              : m
          )
        );
      }
    );

    // 4. Finalize Model Message with text response
    setMessages((prev) =>
      prev.map((m) =>
        m.id === modelMsgId
          ? { ...m, text: finalText }
          : m
      )
    );
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex-none flex items-center justify-between px-4 md:px-6 shadow-sm z-30 relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight truncate max-w-[150px] md:max-w-none">Kelola Sistem RS</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Central Orchestrator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Quick Actions (Desktop) */}
           <div className="hidden md:flex gap-2 text-xs font-medium mr-2">
             <button 
               onClick={() => handleSendMessage("Saya ingin mengakses menu Manajemen Data Pasien.")}
               disabled={isLoading}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
             >
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
               Patient Mgmt
             </button>
             <button 
               onClick={() => handleSendMessage("Saya ingin mengakses menu Penjadwalan Medis.")}
               disabled={isLoading}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors disabled:opacity-50"
             >
               <span className="w-2 h-2 rounded-full bg-purple-500"></span> 
               Scheduling
             </button>
             <button 
               onClick={() => handleSendMessage("Saya ingin mengakses menu Billing dan Administrasi.")}
               disabled={isLoading}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-700 transition-colors disabled:opacity-50"
             >
               <span className="w-2 h-2 rounded-full bg-orange-500"></span> 
               Billing/Admin
             </button>
           </div>

           {/* Mobile Dashboard Toggle */}
           <button 
              onClick={() => setShowDashboard(!showDashboard)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Chat Section */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            <div className="max-w-3xl mx-auto flex flex-col">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Backdrop for mobile */}
        {showDashboard && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setShowDashboard(false)}
          />
        )}

        {/* Live Data Dashboard */}
        <div className={`
            fixed inset-y-0 right-0 w-[85vw] sm:w-80 bg-slate-900 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
            ${showDashboard ? 'translate-x-0' : 'translate-x-full'}
            lg:relative lg:translate-x-0 lg:block lg:w-80 xl:w-96 lg:flex-none lg:z-20
        `}>
          {/* Close button for mobile inside dashboard */}
          <div className="lg:hidden absolute top-4 right-4 z-50">
             <button onClick={() => setShowDashboard(false)} className="text-slate-400 hover:text-white p-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
          <LiveDashboard />
        </div>

      </div>
    </div>
  );
};

export default App;