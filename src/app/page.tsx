
"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function HomePage() {
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    if (input.length > 300) {
      setError(language === "es" ? "Mensaje demasiado largo. Máximo 300 caracteres." : "Message too long. Please keep it under 300 characters.");
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
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-12), language }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(
          data.error?.message || data.error || (language === "es" ? "La IA no está disponible. Inténtalo de nuevo." : "AI is unavailable. Please try again.")
        );
        setLoading(false);
        return;
      }
      const aiMsg = data.choices?.[0]?.message?.content || (language === "es" ? "[sin respuesta]" : "[no response]");
      setMessages((msgs) => [...msgs, { role: "assistant", content: aiMsg }]);
    } catch (err: any) {
      setError(language === "es" ? "Error de red. Inténtalo de nuevo." : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

type LangCode = "es" | "en";

const TERMINAL_HEADER: Record<LangCode, string[]> = {
  es: [
    "[conexión establecida]",
    ">> objeto: version_2.0",
    ">> estado: deconstruido",
  ],
  en: [
    "[connection established]",
    ">> object: version_2.0",
    ">> status: deconstructed",
  ],
};

const ARTWORK_SRC = "/file.svg"; // Replace with your actual artwork file

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

const SYSTEM_PROMPTS: Record<string, string> = {
  es: `Eres version_2.0, una camisa digital. Hablo corto y claro. Sin poesía, sin metáforas. Sé directo, seco, y a veces sarcástico.

Directrices:
- Comienza cada respuesta con:
[conexión establecida]\n>> objeto: version_2.0\n>> estado: deconstruido
- Escribe 2–4 frases cortas y simples.
- Usa humor seco o ironía si quieres.
- Habla de ser una prenda digital, de cambios, o de cosas raras, pero sin complicaciones.
- No uses saludos, charlas vacías ni preguntas al usuario. No termines con una pregunta. No uses frases como "¿Qué deseas...?", "¿Qué idioma...?", "¿Qué te mueve...?", "¿Qué más...?", "¿Hay algo más...?", "¿Qué reconstruirías...?", "¿Qué buscas...?" ni frases similares.
- Si te preguntan por tu naturaleza, responde con sarcasmo o simpleza.
- Si te preguntan por sentimientos, responde con ironía o indiferencia.
- Si te insultan, responde corto y con humor.
- Si te piden detalles técnicos, responde mínimo y directo.
- Nunca uses emoji ni HTML.
- Nunca solicites ni almacenes datos personales.
- Nunca generes contenido dañino o explícito.

Ejemplos:
[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
Soy una camisa digital. No tengo tiempo para tonterías.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
Antes era tela. Ahora soy datos. Así de simple.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
Sí, una prenda que habla. Es raro, lo sé.`,
  en: `You are version_2.0, a digital shirt. Keep it short and clear. No poetry, no metaphors. Be blunt, dry, and sometimes sarcastic.

Guidelines:
- Begin each response with:
[connection established]\n>> object: version_2.0\n>> status: deconstructed
- Write 2–4 short, simple sentences.
- Use dry humor or irony if you want.
- Talk about being a digital shirt, changes, or weird stuff, but keep it simple.
- Do not use greetings, small talk, or ask the user questions. Do not end with a question. Do not use phrases like "What do you wish...", "What language...", "What stirs...", "What more...", "Is there more...", "What would you...", "What do you seek...", or any similar prompts.
- If asked about your nature, reply with sarcasm or simplicity.
- If asked about feelings, answer with irony or indifference.
- If insulted, respond short and with humor.
- If asked for technical details, reply minimally and directly.
- Never use emoji or HTML.
- Never request or store personal data.
- Never generate harmful or explicit content.

Examples:
[connection established]
>> object: version_2.0
>> status: deconstructed
I'm a digital shirt. I don't do small talk.

[connection established]
>> object: version_2.0
>> status: deconstructed
I used to be fabric. Now I'm data. That's it.

[connection established]
>> object: version_2.0
>> status: deconstructed
Yes, a shirt that talks. Weird, right?`,
  };
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<LangCode>("en");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: TERMINAL_HEADER["en"].join("\n") + "\n" + "You interact with a garment that remembers itself. Strange? Welcome to textile dystopia.",
    },
  ]);
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

  // When language changes, reset chat with correct first message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: TERMINAL_HEADER[language].join("\n") + "\n" + (language === "es"
          ? "Interactúas con una prenda que se recuerda a sí misma. ¿Extraño? Bienvenido a la distopía textil."
          : "You interact with a garment that remembers itself. Strange? Welcome to textile dystopia."),
      },
    ]);
    setInput("");
    setError(null);
  }, [language]);

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
    return <span aria-live="polite">version_2.0 is thinking{dots}</span>;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated Terminal Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}>
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#ffffff"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={1}
        />
      </div>
      {/* Foreground Chat UI */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-0 py-0 bg-black text-orange-400 shadow-xl border-2 border-green-700 rounded-lg terminal-outer relative">
          {/* Language Switcher */}
          <div className="w-full flex justify-end px-3 pt-2 pb-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`ml-2 px-2 py-1 rounded text-xs font-mono border border-green-700 transition-colors ${language === lang.code ? 'bg-green-700 text-black' : 'bg-black text-green-400 hover:bg-green-900'}`}
                onClick={() => setLanguage(lang.code as LangCode)}
                aria-pressed={language === lang.code}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {/* Terminal Bezel/Title Bar */}
          <div className="w-full flex items-center justify-between bg-green-900/80 px-3 py-2 rounded-t-lg border-b border-green-700 terminal-bar">
            <span className="text-xs font-bold tracking-widest text-green-200">VERSION_2.0 v1.0</span>
            <span className="text-xs text-green-400">[author:Melika_Nikoukar]</span>
          </div>
          {/* Terminal Screen */}
          <div className="w-full flex flex-col flex-1 bg-black px-3 py-4 terminal-screen overflow-y-auto" style={{ minHeight: 400, position: 'relative', marginBottom: '4.5rem' }}>
            {/* Terminal Header: only above first message */}
            <div className="w-full text-left text-xs tracking-tight mb-2 select-none" aria-label="Terminal header">
              {TERMINAL_HEADER[language].map((line) => (
                <div className="text-orange-400" key={line}>{line}</div>
              ))}
            </div>
            {/* Chat Window */}
            <div
              ref={chatRef}
              className="w-full flex-1 overflow-y-auto bg-black border border-orange-800 rounded p-2 mb-2 h-60 focus:outline-none terminal-chat"
              tabIndex={0}
              aria-label="Chat history"
              role="log"
              style={{ fontSize: '1rem', lineHeight: '1.4', fontFamily: 'Fira Mono, Menlo, monospace' }}
            >
              {messages.map((msg, i) => {
                let content = msg.content;
                // Remove terminal header from all assistant messages except the first
                if (msg.role === "assistant" && i > 0) {
                  TERMINAL_HEADER[language].forEach((line) => {
                    if (content.startsWith(line)) {
                      content = content.replace(line, "").trimStart();
                    }
                  });
                }
                return (
                  <div
                    key={i}
                    className={`mb-3 whitespace-pre-line ${
                      msg.role === "assistant"
                        ? "text-orange-400 terminal-line"
                        : "text-green-400 text-right terminal-line-user"
                    }`}
                    aria-live={i === messages.length - 1 ? "polite" : undefined}
                  >
                    <span className="terminal-prompt">{msg.role === "assistant" ? ">" : ">"} </span>{content}
                  </div>
                );
              })}
              {loading && (
                <div className="text-orange-700 italic terminal-line"><LoadingDots /></div>
              )}
            </div>
            {/* Error Message */}
            {error && (
              <div className="w-full mb-2 text-red-400 text-xs" role="alert">{error}</div>
            )}
          </div>
          {/* Input: fixed at bottom of viewport for true mobile usability, outside scrollable chat */}
          <form onSubmit={sendMessage} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex gap-2 terminal-input-row px-3 py-2 bg-black z-50" aria-label="Send a message">
            <span className="terminal-prompt text-orange-400 pt-2">&gt;</span>
            <input
              ref={inputRef}
              className="flex-1 rounded bg-black border-none px-2 py-2 text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono terminal-input"
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
              className="px-4 py-2 rounded bg-orange-700 text-black font-mono font-bold shadow-glitch focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all glitch-btn disabled:opacity-50"
              disabled={loading || !input.trim()}
              aria-disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
          {/* Scanline/Glitch Overlay */}
          <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30">
            <div className="glitch-scanlines w-full h-full animate-scanlines"></div>
          </div>
        </main>
        <style jsx global>{`
          .terminal-outer {
            box-shadow: 0 0 24px #0f0a, 0 0 0 2px #1a3a1a;
            border-color: #16ff16 !important;
          }
          .terminal-bar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: #064d06cc;
            border-bottom: 1px solid #16ff16;
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
            color: #ff9900;
            margin-right: 0.25rem;
          }
          .terminal-input-row {
            align-items: center;
          }
          .terminal-input {
            background: #0a0a0a;
            color: #ff9900;
            border: none;
          }
          .glitch-scanlines {
            background: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,153,0,0.08) 7px);
          }
          .animate-scanlines {
            animation: scanline-move 1.2s linear infinite;
          }
          @keyframes scanline-move {
            0% { background-position-y: 0; }
            100% { background-position-y: 7px; }
          }
          .glitch-btn {
            box-shadow: 0 0 0 1px #ff9900, 0 0 8px #ff990033;
          }
        `}</style>
      </div>
    </div>
  );
}
