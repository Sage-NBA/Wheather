import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Copy, Check, Eye, Lightbulb, Laugh } from "lucide-react";

interface Joke {
  setup: string;
  punchline: string;
}

export default function JokeAdviceCard() {
  const [mode, setMode] = useState<"joke" | "advice">("joke");
  const [joke, setJoke] = useState<Joke | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [showPunchline, setShowPunchline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchJoke = async () => {
    setLoading(true);
    setShowPunchline(false);
    try {
      const res = await fetch("https://official-joke-api.appspot.com/random_joke");
      const data = await res.json();
      setJoke({ setup: data.setup, punchline: data.punchline });
    } catch {
      setJoke({
        setup: "Why don't programmers like nature?",
        punchline: "It has too many bugs!",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      // Adding a timestamp query param to avoid browser cache
      const res = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
      const data = await res.json();
      setAdvice(data.slip.advice);
    } catch {
      setAdvice("Take time to relax and celebrate small wins every single day.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "joke") {
      fetchJoke();
    } else {
      fetchAdvice();
    }
  }, [mode]);

  const handleCopy = () => {
    const textToCopy =
      mode === "joke" && joke
        ? `${joke.setup} - ${joke.punchline}`
        : advice;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Daily Chuckle & Wisdom</h2>
              <p className="text-xs text-slate-400">Joke & Advice Slip APIs</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setMode("joke")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "joke"
                  ? "bg-white text-amber-700 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Laugh size={14} /> Joke
            </button>
            <button
              onClick={() => setMode("advice")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "advice"
                  ? "bg-white text-amber-700 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lightbulb size={14} /> Advice
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="min-h-[140px] flex flex-col justify-center bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-xl p-5 border border-amber-100/60 relative">
          {mode === "joke" ? (
            joke ? (
              <div className="space-y-3">
                <p className="text-slate-800 font-medium text-base leading-relaxed">
                  "{joke.setup}"
                </p>

                {showPunchline ? (
                  <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-amber-900 font-semibold text-sm animate-fade-in flex items-center justify-between">
                    <span>👉 {joke.punchline}</span>
                    <span className="text-xs text-amber-500">😄</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPunchline(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye size={14} /> Reveal punchline
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Loading joke...</p>
            )
          ) : (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">
                A Little Piece of Advice
              </p>
              <p className="text-slate-800 font-medium text-base italic leading-relaxed">
                "{advice || "Loading insightful advice..."}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-600" />
              <span className="text-green-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          onClick={mode === "joke" ? fetchJoke : fetchAdvice}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {mode === "joke" ? "Next Joke" : "New Advice"}
        </button>
      </div>
    </div>
  );
}
