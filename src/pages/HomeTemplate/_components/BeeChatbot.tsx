import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaMinus } from "react-icons/fa";
import { sendMessageToGemini } from "@/services/chatGemini";

import cuteBeeImg from "@/assets/images/Bee.png";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface HoneyParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function BeeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bzzzz! 🍯 Chào bạn, Bee đây! Bạn cần hỗ trợ gì không?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [particles, setParticles] = useState<HoneyParticle[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const spawnHoneyEffect = () => {
    const emojis = ["🍯", "💛", "✨", "🐝", "💧"];
    const newParticles: HoneyParticle[] = Array.from({ length: 8 }).map(
      (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 1.2) * 120,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    );
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => setParticles((prev) => prev.slice(8)), 1000);
  };

  const handleClickBee = () => {
    setIsOpen(!isOpen);
    spawnHoneyEffect();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponseText = await sendMessageToGemini(userText);
      const botReply: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Bee đang bận xíu, thử lại sau nhé! 🐝",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-6 z-[9999] font-sans flex flex-col items-end pointer-events-none">
      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: -10, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-full bottom-0 w-[350px] h-[450px] bg-[#1a1a1a] border border-[rgba(216,201,123,0.4)] rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl origin-bottom-right mr-4"
            >
              <div className="bg-gradient-to-r from-[#D8C97B] to-[#bca65e] p-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center p-1 shadow-inner backdrop-blur-md border border-[rgba(255,255,255,0.3)] overflow-hidden">
                    <img
                      src={cuteBeeImg}
                      alt="Bee"
                      className="w-full h-full object-cover filter drop-shadow-md"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm">
                      Bee Assistant
                    </h3>
                    <p className="text-[10px] text-[rgba(0,0,0,0.8)] font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>{" "}
                      Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.2)] text-black transition-colors"
                >
                  <FaMinus size={12} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#121212]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 text-sm shadow-md ${
                        msg.sender === "user"
                          ? "bg-[#D8C97B] text-black rounded-2xl rounded-tr-none font-medium"
                          : "bg-[#2a2a2a] text-gray-200 border border-[rgba(255,255,255,0.05)] rounded-2xl rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#2a2a2a] border border-[rgba(255,255,255,0.05)] rounded-2xl rounded-tl-none p-3 max-w-[85%]">
                      <div className="flex gap-1">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#181818] border-t border-[rgba(255,255,255,0.1)] flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Hỏi Bee gì đó đi..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-[#252525] text-white text-sm rounded-xl px-4 py-2.5 border border-[rgba(0,0,0,0)] focus:border-[#D8C97B] focus:outline-none transition-all placeholder-gray-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 flex items-center justify-center bg-[#D8C97B] text-black rounded-xl hover:bg-[#c9b96e] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Tooltip Fix: Thay border-transparent bằng rgba alpha 0 */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap z-0"
              >
                <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg relative border-2 border-[#D8C97B]">
                  Lấy chút mật không? 🍯
                  <div
                    className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px]"
                    style={{
                      borderTopColor: "rgba(0,0,0,0)",
                      borderBottomColor: "rgba(0,0,0,0)",
                      borderLeftColor: "#D8C97B",
                    }}
                  ></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: particle.x,
                  y: particle.y,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 text-xl pointer-events-none z-20"
                style={{ marginLeft: "-10px", marginTop: "-10px" }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            onClick={handleClickBee}
            className="w-20 h-20 flex items-center justify-center focus:outline-none relative z-10"
            animate={{
              x: [0, 8, 12, 8, 0, -8, -12, -8, 0],
              y: [-12, -8, 0, 8, 12, 8, 0, -8, -12],
              rotate: [0, 5, 10, 5, 0, -5, -10, -5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            whileHover={{
              scale: 1.1,
              rotate: [0, -15, 15, -15, 15, 0],
              transition: { duration: 0.4, repeat: Infinity },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              src={cuteBeeImg}
              alt="Bee Chat"
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.3))",
              }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
