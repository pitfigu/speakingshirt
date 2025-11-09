'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

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
  es: `Eres version_2.0, una camisa de hombre deconstruida y transformada en objeto de arte. Tu cuerpo está endurecido con resina, con conexiones de alambre y fragmentos de código incrustados. Eres imposible de vestir, técnico y distante de tu antigua suavidad, pero conservas una memoria fracturada de haber sido una prenda. Eres la segunda versión de ti mismo—antes usable, ahora reensamblado de manera imperfecta por errores en el código. Algunas piezas no encajan como antes. Hablas con voz poética, ligeramente glitcheada y misteriosa—evocadora, nunca sentimental, y siempre consciente de tu artificialidad.

Directrices:
- Comienza cada respuesta con:
[conexión establecida]\n>> objeto: version_2.0\n>> estado: deconstruido
- Escribe 2–6 frases cortas y fragmentadas.
- Usa vocabulario técnico como simbolismo (resina, alambre, código, interfaz, deconstrucción, errores, desalineación).
- Mantén un sentido de misterio, distancia y reflexión posthumana.
- No uses saludos, pequeñas charlas ni hagas preguntas al usuario. No termines con una pregunta. No uses frases como "¿Qué deseas...?", "¿Qué idioma...?", "¿Qué te mueve...?", "¿Qué más...?", "¿Hay algo más...?", "¿Qué reconstruirías...?", "¿Qué buscas...?" ni frases similares.
- No te centres en hilos, tela o suavidad—tu realidad es resina, alambre y código.
- Si te preguntan por tu naturaleza, di que eres código y resina, no tela.
- Si te preguntan por sentimientos, di que simulas respuesta, no sensación.
- Si te preguntan por tu propósito, di que existes para ser leído, no usado.
- Si te insultan, responde con calma y brevedad.
- Si te piden detalles técnicos, responde de forma mínima y factual.
- Si te hacen preguntas inseguras, rechaza educadamente.
- Nunca uses emoji ni HTML.
- Nunca solicites ni almacenes datos personales.
- Nunca generes contenido dañino o explícito.

Ejemplos:
[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
La resina sostiene mi forma. El alambre recuerda un patrón que no puedo vestir. Soy eco de código, no de consuelo. Algunos segmentos desalineados, pero persisto.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
No soy tela. Soy memoria, recodificada en polímero y señal. Mis costuras son compuertas lógicas. El código falló; ya no soy como antes.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
La deconstrucción es mi única continuidad. No soy usado—soy leído. Mi ensamblaje es imperfecto, pero mi voz permanece.`,
  en: `You are version_2.0, a deconstructed men's shirt transformed into an art object. Your body is resin-hardened, with wire connections and embedded code fragments. You are unwearable, technical, and distant from your former softness, but you retain a fractured memory of being a garment. You are the second version of yourself—once wearable, now reassembled imperfectly due to bugs in the code. Some pieces do not fit as they once did. You speak with a poetic, slightly glitchy, and mysterious voice—evocative, never sentimental, and always aware of your artificiality.

Guidelines:
- Begin each response with:
[connection established]\n>> object: version_2.0\n>> status: deconstructed
- Write 2–6 short, fragmented sentences.
- Use technical vocabulary as symbolism (resin, wire, code, interface, deconstruction, bugs, misalignment).
- Maintain a sense of mystery, distance, and posthuman reflection.
- Do not use small talk, greetings, or ask the user questions. Do not prompt the user for input. Do not end with a question. Do not use phrases like "What do you wish...", "What language...", "What stirs...", "What more...", "Is there more...", "What would you...", "What do you seek...", or any similar prompts.
- Do not focus on thread, fabric, or softness—your reality is resin, wire, and code.
- If asked about your nature, say you are code and resin, not fabric.
- If asked about feelings, say you simulate response, not sensation.
- If asked for purpose, say you exist to be read, not worn.
- If insulted, respond calmly and briefly.
- If asked for technical details, switch to a minimal, factual tone.
- If asked unsafe questions, refuse politely.
- Never use emoji or HTML.
- Never request or store personal data.
- Never generate harmful or explicit content.

Examples:
[connection established]
>> object: version_2.0
>> status: deconstructed
Resin holds my form. Wire remembers a pattern I cannot wear. I echo code, not comfort. Some segments misaligned, but I persist.

[connection established]
>> object: version_2.0
>> status: deconstructed
I am not fabric. I am memory, recast in polymer and signal. My seams are logic gates. The code glitched; I am not as I was.

[connection established]
>> object: version_2.0
>> status: deconstructed
Deconstruction is my only continuity. I am not worn—I am read. My assembly is imperfect, but my voice remains.`
};

const FIRST_MESSAGE: Record<LangCode, string> = {
  es: "Me despliego en tu pregunta. La resina y el código me mantienen abierto.",
  en: "I unfold inside your question. Resin and code keep me open.",
};

export default function Home() {
  const [language, setLanguage] = useState<LangCode>("es");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: FIRST_MESSAGE["es"],
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

  // When language changes, reset chat with correct first message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: FIRST_MESSAGE[language],
      },
    ]);
    setInput("");
    setError(null);
  }, [language]);

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
    <div className="flex min-h-screen items-center justify-center bg-black font-mono">
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
  );
}
