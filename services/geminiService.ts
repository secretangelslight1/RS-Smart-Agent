import { GoogleGenAI, Chat } from "@google/genai";
import { TOOL_DECLARATIONS, SYSTEM_INSTRUCTION } from "../constants";
import { Message, Sender, ToolCallData, ToolResponseData } from "../types";
import { executeMockTool } from "./mockExecutor";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      temperature: 0.2, // Lower temperature for more deterministic tool usage
    },
  });
};

export const sendMessageToGemini = async (
  userMessage: string,
  onToolCall: (toolCall: ToolCallData) => void,
  onToolResult: (toolResponse: ToolResponseData) => void
): Promise<string> => {
  if (!chatSession) initializeChat();
  if (!chatSession) throw new Error("Failed to initialize chat");

  try {
    // 1. Send user message
    let result = await chatSession.sendMessage({
      message: userMessage,
    });

    // 2. Loop to handle potential multiple tool calls (though mostly single turn here)
    // The loop continues as long as the model wants to call a function
    while (result.functionCalls && result.functionCalls.length > 0) {
      const functionCalls = result.functionCalls;
      
      // We process calls sequentially for this demo
      for (const call of functionCalls) {
        // Visualize the tool call
        const toolCallData: ToolCallData = {
          id: call.id || Math.random().toString(36).substr(2, 9),
          name: call.name,
          args: call.args as Record<string, any>,
        };
        onToolCall(toolCallData);

        // Execute local mock logic
        const toolResult = await executeMockTool(toolCallData);

        // Visualize result
        const responseData: ToolResponseData = {
          name: call.name,
          result: toolResult
        };
        onToolResult(responseData);

        // Send result back to Gemini
        // We must update the result variable with the new response from the model
        // after providing the tool output
        result = await chatSession.sendToolResponse({
          functionResponses: [{
             id: call.id,
             name: call.name,
             response: { result: toolResult }
          }]
        });
      }
    }

    // 3. Return final text response
    return result.text || "Permintaan diproses, namun tidak ada respons teks.";

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat memproses permintaan Anda dengan sistem AI.";
  }
};