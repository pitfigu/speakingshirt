'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const TERMINAL_HEADER = [
  "[connection established]",
  ">> object: shirt_01",
  ">> status: deconstructed",
];

const ARTWORK_SRC = "/file.svg"; // Replace with your actual artwork file

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I unfold inside your question. What do you wish to read from me?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading]);

  // Auto-focus input after send
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    if (input.length > 300) {
      setError("Message too long. Please keep it under 300 characters.");
      return;
    }
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-12) }), // limit context
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(
          data.error?.message || data.error || "AI is unavailable. Please try again."
        );
        setLoading(false);
        return;
      }
      const aiMsg = data.choices?.[0]?.message?.content || "[no response]";
      setMessages((msgs) => [...msgs, { role: "assistant", content: aiMsg }]);
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Animated dots for loading
  function LoadingDots() {
    const [dots, setDots] = useState("");
    useEffect(() => {
      if (!loading) return;
      const interval = setInterval(() => {
        setDots((d) => (d.length < 3 ? d + "." : ""));
      }, 400);
      return () => clearInterval(interval);
    }, [loading]);
    return <span aria-live="polite">shirt_01 is thinking{dots}</span>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-0 py-0 bg-black text-green-400 shadow-xl border-2 border-green-700 rounded-lg terminal-outer">
        {/* Terminal Bezel/Title Bar */}
        <div className="w-full flex items-center justify-between bg-green-900/80 px-3 py-2 rounded-t-lg border-b border-green-700 terminal-bar">
          <span className="text-xs font-bold tracking-widest text-green-200">SPEAKINGSHIRT v1.0</span>
          <span className="text-xs text-green-400">[QR-INTERFACE]</span>
        </div>
        {/* Terminal Screen */}
        <div className="w-full flex flex-col flex-1 bg-black px-3 py-4 terminal-screen overflow-y-auto" style={{ minHeight: 400 }}>
          {/* Artwork */}
          <div className="mb-4 w-full flex justify-center">
            <Image
              src={ARTWORK_SRC}
              alt="SpeakingShirt artwork"
              width={80}
              height={80}
              className="rounded border border-green-700 shadow-glitch"
              priority
              draggable={false}
            />
          </div>
          {/* Terminal Header */}
          <div className="w-full text-left text-xs tracking-tight mb-2 select-none" aria-label="Terminal header">
            {TERMINAL_HEADER.map((line) => (
              <div className="text-green-400" key={line}>{line}</div>
            ))}
          </div>
          {/* Chat Window */}
          <div
            ref={chatRef}
            className="w-full flex-1 overflow-y-auto bg-black border border-green-800 rounded p-2 mb-2 h-60 focus:outline-none terminal-chat"
            tabIndex={0}
            aria-label="Chat history"
            role="log"
            style={{ fontSize: '1rem', lineHeight: '1.4', fontFamily: 'Fira Mono, Menlo, monospace' }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 whitespace-pre-line ${
                  msg.role === "assistant"
                    ? "text-green-300 terminal-line"
                    : "text-green-500 text-right terminal-line-user"
                }`}
                aria-live={i === messages.length - 1 ? "polite" : undefined}
              >
                <span className="terminal-prompt">{msg.role === "assistant" ? "$" : ">"} </span>{msg.content}
              </div>
            ))}
            {loading && (
              <div className="text-green-700 italic terminal-line"><LoadingDots /></div>
            )}
          </div>
          {/* Error Message */}
          {error && (
            <div className="w-full mb-2 text-red-400 text-xs" role="alert">{error}</div>
          )}
          {/* Input */}
          <form onSubmit={sendMessage} className="w-full flex gap-2 terminal-input-row" aria-label="Send a message">
            <span className="terminal-prompt text-green-400 pt-2">&gt;</span>
            <input
              ref={inputRef}
              className="flex-1 rounded bg-black border-none px-2 py-2 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              autoComplete="off"
              aria-label="Type your message"
              disabled={loading}
              maxLength={300}
              style={{ fontSize: '1rem', fontFamily: 'Fira Mono, Menlo, monospace' }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-700 text-black font-mono font-bold shadow-glitch focus:outline-none focus:ring-2 focus:ring-green-400 transition-all glitch-btn disabled:opacity-50"
              disabled={loading || !input.trim()}
              aria-disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
        {/* Scanline/Glitch Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30">
          <div className="glitch-scanlines w-full h-full animate-scanlines"></div>
        </div>
      </main>
      <style jsx global>{`
        .terminal-outer {
          box-shadow: 0 0 24px #0f0a, 0 0 0 2px #1a3a1a;
        }
        .terminal-bar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .terminal-screen {
          font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
          background: #0a0a0a;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .terminal-chat {
          background: #0a0a0a;
          border: 1px solid #1a3a1a;
        }
        .terminal-line {
          padding-left: 0.5rem;
        }
        .terminal-line-user {
          color: #7fff7f;
        }
        .terminal-prompt {
          font-weight: bold;
          color: #00ff99;
          margin-right: 0.25rem;
        }
        .terminal-input-row {
          align-items: center;
        }
        .terminal-input {
          background: #0a0a0a;
          color: #7fff7f;
          border: none;
        }
        .glitch-scanlines {
          background: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,255,128,0.08) 7px);
        }
        .animate-scanlines {
          animation: scanline-move 1.2s linear infinite;
        }
        @keyframes scanline-move {
          0% { background-position-y: 0; }
          100% { background-position-y: 7px; }
        }
        .glitch-btn {
          box-shadow: 0 0 0 1px #00ff99, 0 0 8px #00ff9933;
        }
      `}</style>
    </div>
  );
}
