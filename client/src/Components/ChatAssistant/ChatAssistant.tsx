// client/src/Components/ChatAssistant/ChatAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, X, Zap } from 'lucide-react';
import axios from 'axios';
import styles from './ChatAssistant.module.css'; // Import CSS Module

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm Ada. How can I help you with your banking today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:8080/api/ai/chat', { message: userMsg });
      const result = res.data;
      setMessages(prev => [...prev, { role: 'assistant', text: result.reply }]);

      if (result.action === "navigate" && result.route) {
        setTimeout(() => navigate(result.route), 1000);
      } else if (result.action === "theme") {
         document.body.classList.toggle('dark-mode');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble reaching the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.container}>
      
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className={`${styles.toggleButton} shadow-lg`}>
          <MessageSquare size={28} color="white" />
        </button>
      )}

      {isOpen && (
        <div className={`${styles.chatWindow} shadow-lg`}>
          {/* Header */}
          <div className={styles.header}>
             <div className="d-flex align-items-center gap-2">
                <div className={styles.statusDot}></div>
                <span className="fw-bold">Ada Assistant</span>
             </div>
             <div style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
                <X size={20} />
             </div>
          </div>

          {/* Messages Area */}
          <div className={styles.messagesArea}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}>
                 <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                    {msg.text}
                 </div>
              </div>
            ))}
            {isTyping && (
                <div className={styles.typingIndicator}>
                    <Zap size={14} className="text-warning" /> Ada is typing...
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <input 
              type="text" 
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSend} className={styles.sendButton}>
               <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;