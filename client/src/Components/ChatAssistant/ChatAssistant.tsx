// client/src/Components/ChatAssistant/ChatAssistant.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, X, Zap, Languages } from "lucide-react";
import axios from "axios";
import styles from "./ChatAssistant.module.css";

interface Message {
    role: "user" | "assistant";
    text: string;
}

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<"en" | "zh">("en");
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update greeting when language changes
    useEffect(() => {
        const greeting =
            language === "en"
                ? "Hello! I'm Wall-E. How can I help you with your banking today?"
                : "你好！我是 Wall-E。今天我能为您提供什么银行服务？";
        setMessages([{ role: "assistant", text: greeting }]);
    }, [language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await axios.post("http://localhost:8080/api/ai/chat", {
                message: userMsg,
                lang: language,
            });
            const result = res.data;
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: result.reply },
            ]);

            if (result.action === "navigate" && result.route) {
                setTimeout(() => navigate(result.route), 1000);
            }
        } catch (err) {
            const errorMsg =
                language === "en"
                    ? "I'm having trouble reaching the server."
                    : "我无法连接到服务器。";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: errorMsg },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.container}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`${styles.toggleButton} shadow-lg`}
                >
                    <MessageSquare size={28} color="white" />
                </button>
            )}

            {isOpen && (
                <div className={`${styles.chatWindow} shadow-lg`}>
                    <div className={styles.header}>
                        <div className="d-flex align-items-center gap-2">
                            <div className={styles.statusDot}></div>
                            <span className="fw-bold">
                                {language === "en" ? "Wall-E" : "Wall-E 助手"}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                onClick={() =>
                                    setLanguage((l) =>
                                        l === "en" ? "zh" : "en",
                                    )
                                }
                                className={styles.langBtn}
                            >
                                <Languages size={14} />{" "}
                                {language === "en" ? "中文" : "EN"}
                            </button>
                            <X
                                size={20}
                                style={{ cursor: "pointer" }}
                                onClick={() => setIsOpen(false)}
                            />
                        </div>
                    </div>

                    <div className={styles.messagesArea}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.messageWrapper} ${msg.role === "user" ? styles.userWrapper : styles.assistantWrapper}`}
                            >
                                <div
                                    className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.assistantBubble}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={styles.typingIndicator}>
                                <Zap size={14} className="text-warning" />
                                {language === "en"
                                    ? "Wall-E is thinking..."
                                    : "Wall-E 正在思考..."}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={
                                language === "en"
                                    ? "Type a message..."
                                    : "请输入信息..."
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className={styles.sendButton}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;
