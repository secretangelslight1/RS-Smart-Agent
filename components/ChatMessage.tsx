import React from 'react';
import { Message, Sender } from '../types';
import ToolVisualizer from './ToolVisualizer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Avatar / Sender Name */}
        <div className={`text-xs mb-1 font-semibold ${isUser ? 'text-blue-600 mr-1' : 'text-slate-500 ml-1'}`}>
          {isUser ? 'User' : 'RS Central Agent'}
        </div>

        {/* Message Bubble container */}
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm shadow-sm
            ${
              isUser
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }
          `}
        >
          {/* Tool Visualization (Sub-Agent Activities) - Only for Model */}
          {message.sender === Sender.MODEL && message.toolCalls && message.toolCalls.length > 0 && (
             <ToolVisualizer 
                toolCalls={message.toolCalls} 
                toolResponses={message.toolResponses || []} 
             />
          )}

          {/* Text Content */}
          {message.text && (
            <div className={`leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;