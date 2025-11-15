// Generate a unique session ID for this chat session
const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// DOM elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');

// Initialize
let isProcessing = false;

// Add message to chat
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show/hide loading indicator
function setLoading(show) {
    loading.classList.toggle('active', show);
    sendBtn.disabled = show;
    isProcessing = show;
}

// Send message to backend
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message || isProcessing) {
        return;
    }
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show loading
    setLoading(true);
    
    try {
        // Send request to backend
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add bot response to chat
            addMessage(data.reply, false);
        } else {
            // Show error message
            addMessage('Sorry, I encountered an error: ' + (data.error || 'Unknown error'), false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I could not connect to the server. Please make sure the server is running.', false);
    } finally {
        // Hide loading
        setLoading(false);
        
        // Focus back on input
        userInput.focus();
    }
}

// Clear chat history
async function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        try {
            // Send clear request to backend
            await fetch('http://localhost:3000/api/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId
                })
            });
            
            // Clear chat container
            chatContainer.innerHTML = `
                <div class="welcome-message">
                    <h2>👋 Welcome!</h2>
                    <p>I'm your AI assistant powered by Google's Askyfyy AI. Ask me anything!</p>
                </div>
            `;
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Failed to clear chat history');
        }
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

clearBtn.addEventListener('click', clearChat);

// Focus on input when page loads
window.addEventListener('load', () => {
    userInput.focus();
});

// Welcome message
console.log('🤖 Askyfyy AI Chatbot is ready!');
console.log('Session ID:', sessionId);
