import type { NextApiRequest, NextApiResponse } from 'next';

// Store conversation history for each session (in-memory)
const conversationHistory = new Map<string, any[]>();

type ClearRequest = {
  sessionId: string;
};

type ClearResponse = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClearResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body as ClearRequest;

    if (sessionId && conversationHistory.has(sessionId)) {
      conversationHistory.delete(sessionId);
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
