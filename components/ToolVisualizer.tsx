import React from 'react';
import { ToolCallData, ToolResponseData } from '../types';

interface ToolVisualizerProps {
  toolCalls: ToolCallData[];
  toolResponses: ToolResponseData[];
}

const ToolVisualizer: React.FC<ToolVisualizerProps> = ({ toolCalls, toolResponses }) => {
  if (toolCalls.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 my-2 w-full max-w-full">
      {toolCalls.map((call, index) => {
        const response = toolResponses.find(r => r.name === call.name); // Simple matching for demo
        
        return (
          <div key={index} className="bg-slate-100 border border-slate-200 rounded-md overflow-hidden text-xs font-mono">
            {/* Header: Function Name */}
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 flex items-center justify-between border-b border-indigo-200">
              <span className="font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                SUB-AGENT: {call.name}
              </span>
              <span className="bg-indigo-200 px-1.5 rounded text-[10px] uppercase">Routing</span>
            </div>

            {/* Content: Parameters & Result */}
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Inputs */}
              <div>
                <div className="text-slate-500 mb-1 font-bold uppercase text-[10px]">Parameters Extracted</div>
                <div className="bg-white p-2 rounded border border-slate-200 shadow-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-all text-blue-600">
                    {JSON.stringify(call.args, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Outputs (if available) */}
              {response && (
                 <div>
                    <div className="text-slate-500 mb-1 font-bold uppercase text-[10px]">System Output</div>
                    <div className="bg-emerald-50 p-2 rounded border border-emerald-100 shadow-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-all text-emerald-700">
                        {JSON.stringify(response.result, null, 2)}
                      </pre>
                    </div>
                 </div>
              )}
            </div>
            
            {!response && (
              <div className="bg-slate-50 px-3 py-1 border-t border-slate-200 text-slate-400 italic">
                Processing sub-agent request...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToolVisualizer;