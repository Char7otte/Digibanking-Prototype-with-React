import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Activity, Zap, X, Globe } from 'lucide-react';
import styles from './VoiceAssistant.module.css';

type Message = { role: 'user' | 'assistant'; text: string; };

const VoiceAssistant: React.FC = () => {
  const [mode, setMode] = useState<"offline" | "sentry" | "listening" | "processing" | "speaking">("offline");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputLang, setInputLang] = useState<"en-US" | "zh-CN">("en-US");
  const [isMicAlive, setIsMicAlive] = useState(false);
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const isSystemActive = useRef(localStorage.getItem('assistant_active') === 'true');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    if (isSystemActive.current) startSentryMode();
    return () => fullStop();
  }, []);

  // --- RESTART MIC WHEN LANGUAGE CHANGES ---
  useEffect(() => {
    if (isSystemActive.current && mode === "sentry") {
      fullStop(); 
      setTimeout(() => startSentryMode(), 200);
    }
  }, [inputLang]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fullStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
    synthRef.current.cancel();
    if (readTimer.current) clearTimeout(readTimer.current);
    setIsMicAlive(false);
  };

  const turnOff = () => {
    fullStop();
    isSystemActive.current = false;
    localStorage.setItem('assistant_active', 'false');
    setMessages([]);
    setMode("offline");
  };

  const toggleSystem = () => {
    if (mode === "offline") {
      isSystemActive.current = true;
      localStorage.setItem('assistant_active', 'true');
      speak(inputLang === "en-US" ? "Echo online." : "系统启动", () => startSentryMode());
    } else { turnOff(); }
  };

  const cycleLanguage = () => {
    const newLang = inputLang === "en-US" ? "zh-CN" : "en-US";
    setInputLang(newLang);
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
    recognition.lang = inputLang; // Apply current language
    
    recognition.onstart = () => setIsMicAlive(true);
    recognition.onend = () => { 
      if (isSystemActive.current && mode === "sentry") setTimeout(startSentryMode, 500); 
    };

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results).map((r: any) => r[0].transcript).join("").toLowerCase();
      
      const wakeWords = inputLang === "en-US" 
        ? ["echo", "hey echo"] 
        : ["echo", "爱可", "你好", "哈喽", "hi"];

      if (wakeWords.some(word => text.includes(word))) { 
        recognition.stop(); 
        const reply = inputLang === "en-US" ? "Yes?" : "我在"; 
        speak(reply, () => startCommandMode()); 
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
    recognition.lang = inputLang; // Apply current language
    
    recognition.onstart = () => setIsMicAlive(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
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
    setMessages(prev => [...prev, { role: 'user', text: command }]);
    setTranscript("");

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);

      if (data.action === "navigate") navigate(data.route);
      if (data.action === "theme") document.documentElement.classList.toggle("dark");
      
      const nextStep = data.action === "close" ? () => turnOff() : () => startSentryMode();
      speak(data.reply, nextStep);
    } catch (err) { 
      speak("Connection Error.", () => startSentryMode()); 
    }
  };

  // --- UPDATED SPEAK FUNCTION (Female Voice Priority) ---
  const speak = (text: string, onComplete?: () => void) => {
    synthRef.current.cancel();
    setMode("speaking");
    if (readTimer.current) clearTimeout(readTimer.current);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // Determine target language based on state or text content
    const isChinese = inputLang === "zh-CN" || /[\u4e00-\u9fa5]/.test(text);
    
    if (isChinese) {
      // 1. Try finding specific Female Chinese voices (Google, Huihui, Yaoyao)
      selectedVoice = voices.find(v => (v.lang.includes("zh") || v.lang.includes("CN")) && 
        (v.name.includes("Google") || v.name.includes("Huihui") || v.name.includes("Yaoyao")));
      
      // 2. Fallback to any Chinese voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes("zh") || v.lang.includes("CN"));
      }
    } else {
      // 1. Try finding specific Female English voices (Google US, Zira, Samantha)
      selectedVoice = voices.find(v => v.lang.includes("en-US") && 
        (v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Samantha")));
      
      // 2. Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes("en-US"));
      }
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => { 
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
        <span onClick={cycleLanguage} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}>
          {inputLang === "en-US" ? "EN" : "中文"} <Globe size={10} />
        </span>
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

            <div className={styles.chatHistory}>
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm mt-4 italic">
                  {inputLang === "en-US" ? 'Say "Echo" to start...' : '请说 "你好" (Nǐ hǎo) 开始...'}
                </p>
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