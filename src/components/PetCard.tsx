import { useState, useEffect } from "react";
import { Heart, RefreshCw, Dog, ExternalLink } from "lucide-react";

export default function PetCard() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(12);

  const extractBreed = (url: string) => {
    try {
      const parts = url.split("/breeds/")[1]?.split("/")[0];
      if (!parts) return "Good Boy / Girl";
      return parts
        .split("-")
        .reverse()
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    } catch {
      return "Adorable Pup";
    }
  };

  const fetchPet = async () => {
    setLoading(true);
    setLiked(false);
    try {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      if (data.status === "success" && data.message) {
        setImageUrl(data.message);
        setBreed(extractBreed(data.message));
      }
    } catch (err) {
      console.error("Failed to load pet image", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, []);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    } else {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Dog size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Instant Pup</h2>
              <p className="text-xs text-slate-400">Dog CEO API</p>
            </div>
          </div>

          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Open full size"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 flex items-center justify-center group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Random dog"
              className={`w-full h-full object-cover transition-all duration-300 ${
                loading ? "opacity-30 blur-xs" : "opacity-100"
              }`}
            />
          ) : (
            <span className="text-xs text-slate-400">Loading doggo...</span>
          )}

          {/* Breed Tag overlay */}
          {breed && (
            <div className="absolute bottom-2 left-2 bg-slate-900/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium tracking-wide">
              {breed}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            liked
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heart
            size={14}
            className={liked ? "fill-rose-500 text-rose-500" : "text-slate-400"}
          />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={fetchPet}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Another Pup
        </button>
      </div>
    </div>
  );
}
