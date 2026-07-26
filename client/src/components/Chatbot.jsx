import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Career Coach. Ask me anything about job search, interviews, resumes, or career growth!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: inputValue };
    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await axios.post(
        'http://localhost:5000/api/chatbot/chat',
        {
          message: inputValue,
          conversationHistory,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>🤖 AI Career Coach</h3>
        <p>Ask me anything about your job search!</p>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: '18px', marginTop: '10px', marginBottom: '5px' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '16px', marginTop: '8px', marginBottom: '4px' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '14px', marginTop: '6px', marginBottom: '3px' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: '5px 0' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ marginLeft: '20px', margin: '8px 0' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ marginLeft: '20px', margin: '8px 0' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                  code: ({ children }) => <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{children}</code>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(255,255,255,0.3)', paddingLeft: '10px', margin: '8px 0', fontStyle: 'italic' }}>{children}</blockquote>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chatbot-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me about jobs, interviews, resumes..."
          className="chatbot-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="chatbot-send-btn"
          disabled={loading || !inputValue.trim()}
        >
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}