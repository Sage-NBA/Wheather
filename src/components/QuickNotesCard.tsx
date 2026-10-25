import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Check } from "lucide-react";

interface Note {
  id: string;
  text: string;
  completed: boolean;
}

export default function QuickNotesCard() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("minihub_notes");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: "1", text: "Try searching the weather in Tokyo", completed: false },
      { id: "2", text: "Look at the cute puppy generator", completed: true },
      { id: "3", text: "Check Bitcoin live rate", completed: false },
    ];
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("minihub_notes", JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    };
    setNotes([newNote, ...notes]);
    setInput("");
  };

  const toggleNote = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckSquare size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Quick Scratchpad</h2>
              <p className="text-xs text-slate-400">Saved in LocalStorage</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-1 rounded-lg">
            {notes.filter((n) => n.completed).length}/{notes.length} done
          </span>
        </div>

        {/* Input */}
        <form onSubmit={addNote} className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a quick note or task..."
            className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-2 rounded-xl transition-all cursor-pointer"
            title="Add task"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Notes list */}
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No tasks yet. Add one above!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors group"
              >
                <button
                  type="button"
                  onClick={() => toggleNote(note.id)}
                  className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      note.completed
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {note.completed && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs select-none ${
                      note.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700 font-medium"
                    }`}
                  >
                    {note.text}
                  </span>
                </button>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Persistent in browser</span>
        {notes.some((n) => n.completed) && (
          <button
            onClick={() => setNotes(notes.filter((n) => !n.completed))}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
