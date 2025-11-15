import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextApiRequest, NextApiResponse } from 'next';

// Store conversation history for each session (in-memory)
const conversationHistory = new Map<string, any[]>();

type ChatRequest = {
  message: string;
  sessionId: string;
};

type ChatResponse = {
  success: boolean;
  reply?: string;
  sessionId?: string;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, sessionId } = req.body as ChatRequest;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Initialize Gemini AI
    const apiKey = process.env.GEMENAI_API_KEY;

    if (!apiKey) {
      console.error('❌ ERROR: GEMENAI_API_KEY is not set');
      return res.status(500).json({
        success: false,
        error: 'API key not configured',
        details: 'GEMENAI_API_KEY environment variable is missing'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Get or create conversation history for this session
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    const history = conversationHistory.get(sessionId)!;

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1000,
      }
    });

    // Start a chat session with history
    const chat = model.startChat({
      history: history
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    // Update conversation history
    history.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: botReply }] }
    );

    // Keep only last 10 exchanges to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    return res.status(200).json({
      success: true,
      reply: botReply,
      sessionId: sessionId
    });

  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
}
