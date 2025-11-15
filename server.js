const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini AI
const apiKey = process.env.GEMENAI_API_KEY;

if (!apiKey) {
    console.error('❌ ERROR: GEMENAI_API_KEY is not set in .env file');
    process.exit(1);
}

console.log('✅ API Key loaded successfully');
const genAI = new GoogleGenerativeAI(apiKey);

// Store conversation history for each session
const conversationHistory = new Map();

// Root route - serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        const history = conversationHistory.get(sessionId);

        // Initialize the model (using gemini-2.0-flash for better compatibility)
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

        res.json({
            success: true,
            reply: botReply,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

// Clear conversation history endpoint
app.post('/api/clear', (req, res) => {
    const { sessionId } = req.body;
    if (sessionId && conversationHistory.has(sessionId)) {
        conversationHistory.delete(sessionId);
    }
    res.json({ success: true, message: 'Conversation history cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Gemini AI Chatbot is ready!');
});
