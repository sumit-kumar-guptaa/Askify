import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

type Message = {
  text: string;
  isUser: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => 
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    
    if (!message || isLoading) {
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
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
        setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { 
          text: 'Sorry, I encountered an error: ' + (data.error || 'Unknown error'), 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I could not connect to the server. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const clearChat = async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      try {
        await fetch('/api/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId
          })
        });

        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat:', error);
        alert('Failed to clear chat history');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Head>
        <title>Askyfyy AI Chatbot</title>
        <meta name="description" content="AI Chatbot powered by Gemini AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <h1>🤖 Askyfyy AI Chatbot</h1>
            <div className={styles.credits}>
              Made by <span className={styles.name}>Sadhvi</span>, <span className={styles.name}>Misthi</span> & <span className={styles.name}>Suhani</span>
            </div>
          </div>
          <button className={styles.clearBtn} onClick={clearChat}>
            Clear Chat
          </button>
        </div>

        <div className={styles.chatContainer} ref={chatContainerRef}>
          {messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <h2>👋 Welcome!</h2>
              <p>I&apos;m your AI assistant powered by Askyfyy AI. Ask me anything!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={msg.isUser ? styles.userMessage : styles.botMessage}
              >
                <div className={styles.messageContent}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows={1}
            className={styles.userInput}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={styles.sendBtn}
          >
            <span>Send</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
