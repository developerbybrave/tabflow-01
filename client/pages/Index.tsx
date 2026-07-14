import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Heart,
  Link as LinkIcon,
  Play,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  Tv,
} from "lucide-react";

type Video = {
  id: string;
  videoId: string;
  addedAt: number;
  liked: boolean;
  bookmarked: boolean;
  watched: boolean;
};

const STORAGE_KEY = "tabflow-videos";
const initialVideos: Video[] = [
  { id: "seed-1", videoId: "dQw4w9WgXcQ", addedAt: Date.now() - 1000 * 60 * 3, liked: false, bookmarked: false, watched: false },
  { id: "seed-2", videoId: "ScMzIvxBSi4", addedAt: Date.now() - 1000 * 60 * 18, liked: true, bookmarked: false, watched: false },
  { id: "seed-3", videoId: "aqz-KE-bpKQ", addedAt: Date.now() - 1000 * 60 * 46, liked: false, bookmarked: true, watched: true },
];

const extractVideoId = (url: string) => {
  const match = url.trim().match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/);
  return match?.[1] ?? null;
};

function relativeTime(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function Index() {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [url, setUrl] = useState("");
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedVideos = localStorage.getItem(STORAGE_KEY);
    if (savedVideos) {
      try {
        const parsed = JSON.parse(savedVideos) as Video[];
        if (Array.isArray(parsed)) setVideos(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }, [videos, loaded]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const watchedCount = useMemo(() => videos.filter((video) => video.watched).length, [videos]);

  const updateVideo = (id: string, changes: Partial<Video>) => {
    setVideos((current) => current.map((video) => (video.id === id ? { ...video, ...changes } : video)));
  };

  const addVideo = () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setNotice("That doesn’t look like a valid YouTube link. Try pasting a video URL.");
      return;
    }
    if (videos.some((video) => video.videoId === videoId)) {
      setNotice("This video is already in your flow.");
      return;
    }
    setVideos((current) => [{ id: crypto.randomUUID(), videoId, addedAt: Date.now(), liked: false, bookmarked: false, watched: false }, ...current]);
    setUrl("");
    setNotice("Video added to your flow.");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[570px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-10 right-[-150px] h-80 w-80 rounded-full bg-violet-500/10 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 shadow-lg shadow-cyan-500/20">
              <Radio className="h-5 w-5 text-slate-950" strokeWidth={2.6} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-white">TabFlow</span>
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 sm:inline">Prototype</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Your video stream, simplified</p>
            </div>
          </div>
          <div className="rounded-full border border-white/[0.08] bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-inner shadow-white/[0.02]">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            Active <span className="hidden sm:inline">Videos</span>: <span className="text-white">{videos.length}</span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[640px] px-4 pb-16 pt-8 sm:px-5 sm:pt-11">
        <section className="mb-8 overflow-hidden rounded-2xl border border-cyan-300/10 bg-slate-900/60 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300"><LinkIcon className="h-4 w-4" /></span>
            Add something worth watching
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addVideo()}
              placeholder="Paste a YouTube link..."
              className="h-12 min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
              aria-label="YouTube video URL"
            />
            <button onClick={addVideo} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-200 active:scale-[0.98]">
              <Plus className="h-4 w-4" strokeWidth={2.8} /> Add to feed
            </button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><Sparkles className="h-3.5 w-3.5 text-violet-300" /> Only load what you play. Keep your tabs clear.</p>
        </section>

        <div className="mb-5 flex items-center justify-between px-1">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400" /><h1 className="text-sm font-bold text-white">Your flow</h1></div>
          <span className="text-xs font-medium text-slate-500">{watchedCount} watched</span>
        </div>

        {videos.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-8 py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-400/15 text-cyan-300"><Tv className="h-8 w-8" /></div>
            <h2 className="mt-5 text-lg font-bold text-white">Your feed is empty</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Paste a YouTube link above to start curating your perfect video flow.</p>
          </section>
        ) : (
          <div className="space-y-5">
            {videos.map((video, index) => {
              const isPlaying = playedIds.includes(video.id);
              return <article key={video.id} className={`group overflow-hidden rounded-2xl border bg-slate-900/75 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 ${video.watched ? "border-white/[0.05] opacity-65" : "border-white/[0.09] hover:border-cyan-300/20"}`}>
                <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 via-cyan-300 to-emerald-300 p-[2px]"><div className="grid h-full w-full place-items-center rounded-full bg-slate-900 text-xs font-bold text-cyan-200">CH</div></div>
                    <div><p className="text-sm font-bold text-slate-100">@curator_hub</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="h-3 w-3" /> {index === 0 ? relativeTime(video.addedAt) : relativeTime(video.addedAt)}</p></div>
                  </div>
                  {video.watched && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><Check className="h-3 w-3" /> Watched</span>}
                </div>
                <div className="relative aspect-video bg-slate-950">
                  {isPlaying ? <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <>
                    <img src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt="Video preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10" />
                    <button onClick={() => setPlayedIds((current) => [...current, video.id])} className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/20 text-white shadow-2xl backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-cyan-300 hover:text-slate-950" aria-label="Play video"><Play className="ml-1 h-7 w-7 fill-current" /></button>
                  </>}
                </div>
                <div className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateVideo(video.id, { liked: !video.liked })} className={`grid h-9 w-9 place-items-center rounded-lg transition ${video.liked ? "bg-rose-400/10 text-rose-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`} aria-label="Like video"><Heart className={`h-[18px] w-[18px] ${video.liked ? "fill-current" : ""}`} /></button>
                      <button onClick={() => updateVideo(video.id, { bookmarked: !video.bookmarked })} className={`grid h-9 w-9 place-items-center rounded-lg transition ${video.bookmarked ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`} aria-label="Bookmark video"><Bookmark className={`h-[18px] w-[18px] ${video.bookmarked ? "fill-current" : ""}`} /></button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateVideo(video.id, { watched: !video.watched })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${video.watched ? "bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15" : "bg-white/[0.07] text-slate-300 hover:bg-white/[0.12] hover:text-white"}`}>{video.watched ? "Watched" : "Mark watched"}</button>
                      <button onClick={() => setVideos((current) => current.filter((item) => item.id !== video.id))} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-400" aria-label="Remove video"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </article>;
            })}
          </div>
        )}
        <p className="mt-9 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-600"><ChevronRight className="h-3.5 w-3.5" /> Your flow lives right here in this browser</p>
      </div>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 shadow-2xl shadow-black/40"><CircleAlert className="h-4 w-4 shrink-0 text-cyan-300" />{notice}</div>}
    </main>
  );
}
