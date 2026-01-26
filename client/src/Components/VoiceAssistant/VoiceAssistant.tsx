import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Activity, Zap, X } from 'lucide-react';
import styles from './VoiceAssistant.module.css';

const VoiceAssistant: React.FC = () => {
  const [mode, setMode] = useState<"offline" | "sentry" | "listening" | "processing" | "speaking">("offline");
  const [transcript, setTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [isMicAlive, setIsMicAlive] = useState(false);
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const assistantVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isSystemActive = useRef(localStorage.getItem('assistant_active') === 'true');
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      assistantVoiceRef.current = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    if (isSystemActive.current) startSentryMode();
    return () => fullStop();
  }, []);

  const fullStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    synthRef.current.cancel();
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    setIsMicAlive(false);
  };

  const turnOff = () => {
    fullStop();
    isSystemActive.current = false;
    localStorage.setItem('assistant_active', 'false');
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
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsMicAlive(true);
    recognition.onend = () => {
      setIsMicAlive(false);
      if (isSystemActive.current && mode === "sentry") setTimeout(startSentryMode, 500);
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const text = (results[results.length - 1] as any)[0].transcript.toLowerCase();
      
      if (text.includes("echo") || text.includes("hey echo")) {
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
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsMicAlive(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (event.results[0].isFinal) handleCommand(text);
    };
    recognition.onend = () => {
      setIsMicAlive(false);
      if (mode === "listening" && !transcript && isSystemActive.current) startSentryMode();
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleCommand = async (command: string) => {
    setMode("processing");
    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      
      setAssistantReply(data.reply);

      if (data.action === "navigate" && data.route) {
        navigate(data.route);
        speak(data.reply, () => startSentryMode());
      } else if (data.action === "theme") {
        document.documentElement.classList.toggle("dark");
        speak(data.reply, () => startSentryMode());
      } else if (data.action === "close") {
        speak(data.reply, () => turnOff());
      } else {
        speak(data.reply, () => startSentryMode());
      }

    } catch (err) {
      speak("I'm sorry, I couldn't process that.", () => startSentryMode());
    }
  };

  const speak = (text: string, onComplete?: () => void) => {
    synthRef.current.cancel();
    setMode("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    if (assistantVoiceRef.current) utterance.voice = assistantVoiceRef.current;
    
    utterance.onend = () => { if (onComplete) onComplete(); };
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
            <p>"{transcript || assistantReply}"</p>
            {mode === "processing" && <Zap size={32} color="#eab308" style={{margin: '1rem auto', display:'block'}} className={styles.indicatorActive} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;