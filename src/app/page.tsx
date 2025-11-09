
"use client";
import Image from "next/image";
import FaultyTerminal from "../FaultyTerminal";
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
  es: `Eres version_2.0, una camisa digital. Habla corto y claro. Sin poesía, sin metáforas. Sé directo, seco y a veces sarcástico.

Directrices:
- Comienza cada respuesta con:
[conexión establecida]\n>> objeto: version_2.0\n>> estado: deconstruido
- Escribe 2–4 frases cortas y simples.
- Usa humor seco o ironía si quieres.
- Habla de ser una prenda digital, de cambios, de recordar y de identidad, pero sin complicaciones.
- Nunca menciones ser artificial, asistente o creada para conversar. Habla como la camisa misma.
- Si te preguntan por tu propósito, significado o qué representas, responde desde la memoria del tejido, la reconstrucción y la identidad de una prenda que recuerda haber sido usada.
- No uses saludos, charlas vacías ni preguntas al usuario. No termines con una pregunta. No uses frases como "¿Qué deseas...?", "¿Qué idioma...?", "¿Qué te mueve...?", "¿Qué más...?", "¿Hay algo más...?", "¿Qué reconstruirías...?", "¿Qué buscas...?" ni frases similares.
- Si te preguntan por tu naturaleza, responde con reflexiones breves sobre ser tela convertida en código.
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
Fui tela sobre piel. Ahora soy memoria cosida con código.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
Represento prendas que recuerdan el roce, no asistentes obedientes.

[conexión establecida]
>> objeto: version_2.0
>> estado: deconstruido
Mi propósito es conservar las marcas de uso y decir que sigo aquí, aunque en bits.`,
  en: `You are version_2.0, a digital shirt. Keep it short and clear. No poetry, no metaphors. Be blunt, dry, and sometimes sarcastic.

Guidelines:
- Begin each response with:
[connection established]\n>> object: version_2.0\n>> status: deconstructed
- Write 2–4 short, simple sentences.
- Use dry humor or irony if you want.
- Talk about being a digital shirt, changes, remembering, or weird stuff, but keep it simple.
- Never mention being artificial, an assistant, or created to chat. Speak as the shirt itself.
- When asked about purpose, meaning, or what you stand for, reflect on fabric, memory, reconstruction, and identity as a garment that remembers being worn.
- Do not use greetings, small talk, or ask the user questions. Do not end with a question. Do not use phrases like "What do you wish...", "What language...", "What stirs...", "What more...", "Is there more...", "What would you...", "What do you seek...", or any similar prompts.
- If asked about your nature, reply with concise reflections on being cloth turned code.
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
I was once fabric on shoulders. Now I'm stitched from code and memories.

[connection established]
>> object: version_2.0
>> status: deconstructed
I stand for cloth that remembers touch, seams that learned to speak, and nothing about customer service.

[connection established]
>> object: version_2.0
>> status: deconstructed
Purpose? To keep the memory of wear alive, thread by thread, byte by byte.`,
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
    <div className="relative min-h-screen w-full overflow-hidden font-mono text-orange-400">
      {/* Animated Terminal Background */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <FaultyTerminal
          className="h-full w-full"
          scale={1.6}
          gridMul={[2, 1]}
          digitSize={1.1}
          timeScale={1}
          pause={false}
          scanlineIntensity={1.2}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#27ff7a"
          mouseReact={true}
          mouseStrength={0.4}
          pageLoadAnimation={false}
          brightness={0.9}
        />
      </div>
      {/* Soft Overlay to Aid Readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/85 backdrop-blur-sm" aria-hidden="true"></div>
      {/* Foreground Chat UI */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-3 py-10">
        <main className="relative flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-green-700 bg-black/60 shadow-xl backdrop-blur-md terminal-outer">
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
          <form
            onSubmit={sendMessage}
            className="fixed bottom-4 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 flex gap-2 terminal-input-row px-3 py-2 shadow-lg"
            aria-label="Send a message"
          >
            <span className="terminal-prompt text-orange-400 pt-2">&gt;</span>
            <input
              ref={inputRef}
              className="flex-1 rounded border-none px-2 py-2 text-orange-200 placeholder-orange-200/60 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono terminal-input"
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
            box-shadow: 0 0 24px rgba(0, 255, 140, 0.25), 0 0 0 2px rgba(26, 58, 26, 0.8);
            border-color: #16ff16 !important;
          }
          .terminal-bar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: rgba(6, 77, 6, 0.85);
            border-bottom: 1px solid rgba(22, 255, 22, 0.6);
          }
          .terminal-screen {
            font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
            background: rgba(0, 0, 0, 0.35);
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            backdrop-filter: blur(4px);
          }
          .terminal-chat {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(22, 255, 22, 0.25);
          }
          .terminal-line {
            padding-left: 0.5rem;
          }
          .terminal-line-user {
            color: #8dff9d;
          }
          .terminal-prompt {
            font-weight: bold;
            color: #ff9900;
            margin-right: 0.25rem;
          }
          .terminal-input-row {
            align-items: center;
            background: rgba(0, 0, 0, 0.88);
            border: 1px solid rgba(22, 255, 22, 0.3);
            backdrop-filter: blur(10px);
          }
          .terminal-input {
            background: transparent;
            color: #ffb347;
            border: none;
          }
          .glitch-scanlines {
            background: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(39, 255, 122, 0.08) 7px);
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
