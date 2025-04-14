import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://magicloops.dev/api/loop/6cf9d2e2-32cd-4db3-b42e-09b2eb0fc916/run?query=${encodeURIComponent(inputValue)}`);
      const data = await response.json();
      
      // Add console.log to debug the response
      console.log('API Response:', data);

      const botMessage = {
        text: data || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting right now.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fas fa-comments"></i>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="chatbot-container">
            <div className="chatbot-header">
              <h3>Stray Help Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`message ${message.sender}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-content">
                    {message.sender === 'bot' ? (
                      <div className="formatted-response">
                        {message.text && typeof message.text === 'string' && (
                          <div className="response-text">
                            {message.text.split('\n').map((paragraph, index) => (
                              <p key={index} className="response-paragraph">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chatbot-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about stray animal help..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;