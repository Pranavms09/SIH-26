import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../lib/AppContext';
import { BotMessageSquare, X, Send, Zap, ArrowRight } from 'lucide-react';

const suggestedPrompts = [
  'Why was this record flagged?',
  'Show records awaiting verification.',
  'Which villages have the lowest extraction accuracy?',
  'Summarize mutation history for 124/3A.',
  'Find duplicate survey numbers.',
];

const mockResponses: Record<string, string> = {
  'Why was this record flagged?': 'Record LR-MH-2026-018492 was flagged because the extracted area (2.4B ha) appears to be a handwriting recognition error — the "B" was likely a smudge over "8". The confidence for this field is 72.1%, below the 80% threshold. A verification officer should review page 1 of the source document.',
  'Show records awaiting verification.': 'There are currently **12 records** awaiting manual verification:\n\n• 8 in Pune district (Haveli tehsil)\n• 2 in Nagpur district\n• 2 in Nashik district\n\nThe oldest pending record was flagged 3 hours ago. Would you like to open the Verification queue?',
  'Find duplicate survey numbers.': 'I found **3 potential duplicate survey numbers** in the system:\n\n• Survey 124/3A appears in 2 records (Pimpri and Chinchwad)\n• Survey 88/2B has 2 mutation records with conflicting ownership\n\nThis may indicate boundary changes or data entry errors. I recommend reviewing both records.',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Doc2DigitalCopilot() {
  const { copilotOpen, setCopilotOpen } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[text] || 'I\'m analyzing the land records for your query. Based on the current data, let me check the relevant records and validation rules. Could you be more specific about which district or survey number you\'re referring to?';
      const assistantMsg: Message = { id: `m-${Date.now() + 1}`, role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {copilotOpen && (
        <motion.aside
          className="copilot-drawer"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Doc2Digital Copilot"
        >
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-header-left">
              <div className="copilot-icon">
                <BotMessageSquare size={15} />
              </div>
              <div>
                <div className="copilot-title">Doc2Digital Copilot</div>
                <div className="copilot-subtitle">Contextual AI Assistant</div>
              </div>
            </div>
            <button className="copilot-close" onClick={() => setCopilotOpen(false)} aria-label="Close copilot">
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="copilot-messages">
            {messages.length === 0 && (
              <div className="copilot-empty">
                <div className="copilot-empty-icon">
                  <Zap size={18} />
                </div>
                <p className="copilot-empty-text">Ask me anything about land records, processing, or verification.</p>
                <div className="copilot-suggestions">
                  {suggestedPrompts.map(p => (
                    <button key={p} className="copilot-suggestion" onClick={() => sendMessage(p)}>
                      <span>{p}</span>
                      <ArrowRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <motion.div
                key={msg.id}
                className={`copilot-msg ${msg.role}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'assistant' && (
                  <div className="copilot-msg-avatar">
                    <BotMessageSquare size={11} />
                  </div>
                )}
                <div className="copilot-msg-content">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.startsWith('•') ? (
                        <div style={{ paddingLeft: 8, color: 'var(--text-secondary)' }}>{line}</div>
                      ) : line.startsWith('**') ? (
                        <strong style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</strong>
                      ) : (
                        line
                      )}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="copilot-msg assistant">
                <div className="copilot-msg-avatar"><BotMessageSquare size={11} /></div>
                <div className="copilot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="copilot-input-area">
            <input
              ref={inputRef}
              className="copilot-input"
              placeholder="Ask about records, validation, or extraction…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
            />
            <button
              className="copilot-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
