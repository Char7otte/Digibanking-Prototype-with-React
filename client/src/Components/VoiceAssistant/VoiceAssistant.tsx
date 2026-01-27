import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Activity, Zap, X } from 'lucide-react';
import styles from './VoiceAssistant.module.css';

// Define message type
type Message = {
  role: 'user' | 'assistant';
  text: string;
};

const VoiceAssistant: React.FC = () => {
  const [mode, setMode] = useState<"offline" | "sentry" | "listening" | "processing" | "speaking">("offline");
  const [transcript, setTranscript] = useState("");
  // New state for conversation history
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMicAlive, setIsMicAlive] = useState(false);
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const assistantVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isSystemActive = useRef(localStorage.getItem('assistant_active') === 'true');
  
  // Ref to auto-scroll to bottom of chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Ref for the read-time delay
  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      assistantVoiceRef.current = voices.find(v => v.lang.includes("en-US")) || voices[0];
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    if (isSystemActive.current) startSentryMode();
    return () => fullStop();
  }, []);

  // Auto-scroll whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fullStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
    synthRef.current.cancel();
    
    // Clear the read timer if we force stop
    if (readTimer.current) clearTimeout(readTimer.current);
    
    setIsMicAlive(false);
  };

  const turnOff = () => {
    fullStop();
    isSystemActive.current = false;
    localStorage.setItem('assistant_active', 'false');
    setMessages([]); // Clear history on close
    setMode("offline");
  };

  const toggleSystem = () => {
    if (mode === "offline") {
      isSystemActive.current = true;
      localStorage.setItem('assistant_active', 'true');
      speak("Echo online.", () => startSentryMode());
    } else {
      turnOff();
    }
  };

  const startSentryMode = () => {
    if (!isSystemActive.current) return;
    fullStop();
    setMode("sentry");
    setTranscript(""); 
    
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsMicAlive(true);
    recognition.onend = () => { 
      if (isSystemActive.current && mode === "sentry") setTimeout(startSentryMode, 500); 
    };

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results).map((r: any) => r[0].transcript).join("").toLowerCase();
      if (text.includes("echo")) { 
        recognition.stop(); 
        speak("Yes?", () => startCommandMode()); 
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {}
  };

  const startCommandMode = () => {
    fullStop();
    setMode("listening");
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Recognition();
    
    recognition.onstart = () => setIsMicAlive(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text); // Show live text
      if (event.results[0].isFinal) handleCommand(text);
    };
    recognition.onend = () => { 
      if (mode === "listening" && !transcript) startSentryMode(); 
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleCommand = async (command: string) => {
    setMode("processing");
    // Add User Message to History
    setMessages(prev => [...prev, { role: 'user', text: command }]);
    setTranscript(""); // Clear live transcript

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      
      // Add Echo Message to History
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);

      if (data.action === "navigate") navigate(data.route);
      if (data.action === "theme") document.documentElement.classList.toggle("dark");
      
      const nextStep = data.action === "close" ? () => turnOff() : () => startSentryMode();
      speak(data.reply, nextStep);
    } catch (err) { 
      speak("Error connecting.", () => startSentryMode()); 
    }
  };

  const speak = (text: string, onComplete?: () => void) => {
    synthRef.current.cancel();
    setMode("speaking");
    
    // Clear any pending timers
    if (readTimer.current) clearTimeout(readTimer.current);

    const utterance = new SpeechSynthesisUtterance(text);
    if (assistantVoiceRef.current) utterance.voice = assistantVoiceRef.current;
    
    utterance.onend = () => { 
      // --- ADDED 3 SECOND DELAY HERE ---
      // This keeps the overlay open for 3s after speaking finishes
      readTimer.current = setTimeout(() => {
        if (onComplete) onComplete(); 
      }, 3000);
    };
    
    synthRef.current.speak(utterance);
  };

  if (mode === "offline") {
    return (
      <div className={styles.container}>
        <button onClick={toggleSystem} className={`${styles.mainButton} ${styles.modeOffline}`}>
          <Mic size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusBadge}>
        <div className={`${styles.indicatorDot} ${isMicAlive ? styles.indicatorActive : ''}`}></div>
        <span>{mode}</span>
      </div>
      
      <button 
        onClick={toggleSystem} 
        className={`${styles.mainButton} ${mode === 'sentry' ? styles.modeSentry : styles.modeListening}`}
      >
        {mode === 'sentry' ? <Mic size={24} /> : <Activity size={24} />}
      </button>

      {(mode === "listening" || mode === "processing" || mode === "speaking") && (
        <div className={styles.overlay}>
          <div className={styles.modalCard}>
            <button onClick={() => startSentryMode()} className={styles.closeButton}>
               <X size={20} />
            </button>

            {/* --- Chat History Section --- */}
            <div className={styles.chatHistory}>
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm mt-4 italic">Say "Echo" to start...</p>
              )}
              
              {messages.map((msg, index) => (
                <div key={index} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.echoRow}`}>
                  <span className={styles.messageLabel}>{msg.role === 'user' ? 'You' : 'Echo'}</span>
                  <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.echoBubble}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* --- Live Status / Transcript --- */}
            <div className={styles.liveTranscript}>
              {mode === "processing" && <Zap size={20} className="animate-pulse mx-auto text-yellow-500" />}
              {transcript && <span>"{transcript}..."</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;