"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Entry = { word: string; label?: string; duration: number; source: string; topic: string };

const SOURCES: { match: RegExp; name: string; href: string }[] = [
  { match: /^INCLUDE/i, name: "INCLUDE · AI4Bharat", href: "https://zenodo.org/records/4010759" },
  { match: /^Amrita/i, name: "Amrita SLR", href: "https://doi.org/10.17632/dtg9s785v8.1" },
  { match: /^ISL-CSLTR/i, name: "ISL-CSLTR", href: "https://doi.org/10.17632/kcmpdxky7p.1" },
  { match: /^ISLVT/i, name: "ISLVT", href: "https://doi.org/10.17632/98mzk82wbb.1" },
];
const sourceOf = (entry: Entry) => SOURCES.find((s) => s.match.test(entry.source)) ?? { name: entry.source.split(",")[0], href: "/voice-demo/SOURCES.md" };
const display = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function score(word: string, q: string) {
  if (!q) return 1;
  if (word === q) return 4;
  if (word.startsWith(q)) return 3;
  if (word.split(" ").some((part) => part.startsWith(q))) return 2;
  return word.includes(q) ? 1 : 0;
}

function SigningBars() {
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-[3px] animate-pulse rounded-full bg-current" style={{ height: `${[60, 100, 75][i]}%`, animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  );
}

export default function SignDictionary() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const [signs, setSigns] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState(false);

  // The index is the same file the avatar demo uses, so new vocabulary appears here automatically.
  useEffect(() => {
    fetch("/voice-demo/sign-index.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((index) => {
        const list: Entry[] = (index.signs ?? []).map((e: Entry) => ({
          word: e.word,
          label: e.label,
          duration: e.duration,
          source: e.source ?? "",
          topic: e.word.length === 1 ? "Alphabet" : e.topic || "Everyday",
        }));
        list.sort((a, b) => a.word.localeCompare(b.word));
        setSigns(list);
        const fromUrl = norm(new URLSearchParams(window.location.search).get("w") ?? "");
        const initial = list.find((e) => e.word === fromUrl) ?? list.find((e) => e.word === "hello") ?? list[0];
        if (initial) {
          setSelected(initial.word);
          pending.current = initial.word;
        }
      })
      .catch(() => setFailed(true));
  }, []);

  const post = useCallback((message: object) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  const play = useCallback(
    (word: string, speed = slow ? 0.5 : 1) => {
      if (!ready) {
        pending.current = word;
        return;
      }
      post({ type: "signsense-play", word, speed });
    },
    [post, ready, slow]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.source !== "signsense-avatar") return;
      if (event.data.type === "ready") setReady(true);
      if (event.data.type === "playing") setPlaying(true);
      if (event.data.type === "ended" || event.data.type === "error") setPlaying(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The avatar announces "ready" only once, which can happen before this listener exists. Keep asking until it answers.
  useEffect(() => {
    if (ready) return;
    const ping = () => post({ type: "signsense-ping" });
    ping();
    const id = window.setInterval(ping, 1000);
    return () => window.clearInterval(id);
  }, [ready, post]);

  // Play whatever was chosen while the avatar was still loading.
  useEffect(() => {
    if (ready && pending.current) {
      post({ type: "signsense-play", word: pending.current, speed: slow ? 0.5 : 1 });
      pending.current = null;
    }
  }, [ready, post, slow]);

  // "/" jumps to search, as on most documentation sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const select = (word: string) => {
    setSelected(word);
    setCopied(false);
    const url = new URL(window.location.href);
    url.searchParams.set("w", word);
    window.history.replaceState(null, "", url);
    play(word);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    signs?.forEach((s) => counts.set(s.topic, (counts.get(s.topic) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [signs]);

  const q = norm(query);
  const results = useMemo(() => {
    if (!signs) return [];
    return signs
      .filter((s) => topic === "All" || s.topic === topic)
      .map((s) => ({ s, rank: score(s.word, q) }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.s.word.localeCompare(b.s.word))
      .map((r) => r.s);
  }, [signs, topic, q]);

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    results.forEach((s) => {
      const key = s.word.charAt(0).toUpperCase();
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [results]);

  const current = signs?.find((s) => s.word === selected) ?? null;
  const source = current ? sourceOf(current) : null;

  const copyLink = async () => {
    if (!current) return;
    const url = `${window.location.origin}/signs?w=${encodeURIComponent(current.word)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const toggleSlow = () => {
    const next = !slow;
    setSlow(next);
    current && play(current.word, next ? 0.5 : 1);
  };

  const tile = (s: Entry) => {
    const active = s.word === selected;
    return (
      <li key={s.word}>
        <button
          onClick={() => select(s.word)}
          aria-pressed={active}
          className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ${
            active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white hover:border-brand-500/40 hover:bg-brand-500/[0.04]"
          }`}
        >
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium tracking-tight">{s.label ?? display(s.word)}</span>
            <span className={`mt-0.5 block text-xs ${active ? "text-white/55" : "text-ink/45"}`}>{s.topic}</span>
          </span>
          <span className={`shrink-0 font-mono text-[11px] ${active ? "text-white/70" : "text-ink/35 group-hover:text-brand-500"}`}>
            {active && playing ? <SigningBars /> : seconds(s.duration)}
          </span>
        </button>
      </li>
    );
  };

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 sm:pb-28 sm:pt-16">
        <header className="grid gap-7 border-b border-ink/10 px-1 pb-8 sm:gap-8 sm:px-0 sm:pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label">Indian Sign Language dictionary</p>
            <h1 className="display mt-4 max-w-3xl text-[2.6rem] sm:mt-5 sm:text-7xl">
              Every sign, on demand.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink/60 sm:mt-6 sm:text-base">
              Search the SignSense vocabulary and watch the 3D avatar sign each word. Every motion comes from Deaf signers recorded for open
              research datasets. Each word has its own link, so you can share it.
            </p>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-ink/10 rounded-2xl border border-ink/10 bg-white text-center md:divide-x-0 md:border-0 md:bg-transparent md:text-right md:gap-8">
            {[
              [signs ? String(signs.length) : "–", "signs"],
              [signs ? String(topics.length) : "–", "topics"],
              ["2", "datasets"],
            ].map(([value, label]) => (
              <div key={label} className="px-3 py-4 md:p-0">
                <dt className="label">{label}</dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:mt-2 sm:text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="mt-6 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* Player first in the DOM so it sits on top on phones */}
          <aside ref={playerRef} className="scroll-mt-24 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_24px_70px_-45px_rgba(13,13,18,0.35)]">
                <div className="relative aspect-[5/4] w-full bg-[radial-gradient(ellipse_at_50%_32%,#e9e8ff,#d8d6f4_75%)] sm:aspect-square">
                  <iframe
                    ref={frameRef}
                    src="/voice-demo/index.html?embed=1"
                    title="SignSense avatar signing the selected word"
                    className="absolute inset-0 h-full w-full"
                    allow="fullscreen"
                  />
                  <span
                    className={`pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur ${
                      playing ? "bg-brand-500 text-white" : "bg-white/70 text-ink/60"
                    }`}
                  >
                    {playing ? <SigningBars /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    {playing ? "Signing" : ready ? "Ready" : "Loading"}
                  </span>
                </div>

                <div className="p-5 sm:p-7">
                  {current ? (
                    <>
                      <p className="label">{current.topic}</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{current.label ?? display(current.word)}</h2>
                      <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-ink/10 py-4 text-sm sm:mt-5">
                        <div>
                          <dt className="text-ink/45">Duration</dt>
                          <dd className="mt-1 font-medium">{seconds(current.duration)}</dd>
                        </div>
                        <div>
                          <dt className="text-ink/45">Recorded for</dt>
                          <dd className="mt-1 font-medium">
                            <a href={source!.href} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-4 hover:decoration-brand-500">
                              {source!.name}
                            </a>
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => play(current.word)}
                          disabled={!ready}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-2 py-3 text-[13px] font-semibold text-white sm:text-sm transition-colors hover:bg-brand-500 disabled:opacity-40"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                          Replay
                        </button>
                        <button
                          onClick={toggleSlow}
                          aria-pressed={slow}
                          aria-label="Slow motion, half speed"
                          disabled={!ready}
                          className={`rounded-lg border px-2 py-3 text-[13px] font-semibold transition-colors disabled:opacity-40 sm:text-sm ${
                            slow ? "border-brand-500 bg-brand-500/10 text-brand-700" : "border-ink/15 hover:border-ink/40"
                          }`}
                        >
                          {slow ? "0.5× ✓" : "Slow 0.5×"}
                        </button>
                        <button onClick={copyLink} className="rounded-lg border border-ink/15 px-2 py-3 text-[13px] font-semibold sm:text-sm transition-colors hover:border-ink/40">
                          <span aria-live="polite">{copied ? "Copied ✓" : "Copy link"}</span>
                        </button>
                      </div>
                      <a href="/demo" className="mt-5 inline-block text-sm font-semibold text-brand-600 underline decoration-brand-500/30 underline-offset-4 hover:decoration-brand-500">
                        Use it in a sentence in the free demo →
                      </a>
                    </>
                  ) : (
                    <p className="text-ink/50">{failed ? "The sign list could not be loaded. Refresh to try again." : "Loading signs…"}</p>
                  )}
                </div>
              </div>
              <p className="mt-4 px-1 text-xs leading-5 text-ink/45 sm:px-0">
                These are prototype motions retargeted from video, not yet reviewed by Deaf ISL experts. ISL varies by region; some signs may differ
                where you live. <a href="/voice-demo/SOURCES.md" className="underline underline-offset-2 hover:text-ink">Sources and licences</a>.
              </p>
            </div>
          </aside>

          <div className="min-w-0 lg:order-1">
            <div className="relative">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && results[0] && select(results[0].word)}
                placeholder="Search a word, e.g. friend"
                aria-label="Search signs"
                className="w-full rounded-xl border border-ink/15 bg-white py-3.5 pl-12 pr-4 text-base sm:py-4 sm:pr-14 outline-none transition placeholder:text-ink/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              />
              <kbd className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${query ? "hidden" : "hidden sm:block"} rounded-md border border-ink/15 px-2 py-0.5 font-mono text-xs text-ink/40`}>/</kbd>
            </div>

            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by topic">
              {[["All", signs?.length ?? 0] as [string, number], ...topics].map(([name, count]) => (
                <button
                  key={name}
                  onClick={() => setTopic(name)}
                  aria-pressed={topic === name}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-colors sm:py-1.5 ${
                    topic === name ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/70 hover:border-ink/35 hover:text-ink"
                  }`}
                >
                  {name} <span className={topic === name ? "text-white/55" : "text-ink/35"}>{count}</span>
                </button>
              ))}
            </div>

            {!q && groups.length > 6 && (
              <nav aria-label="Jump to letter" className="no-scrollbar -mx-4 mt-5 flex gap-1 overflow-x-auto px-4 font-mono text-xs sm:mx-0 sm:mt-6 sm:flex-wrap sm:px-0">
                {groups.map(([letter]) => (
                  <a key={letter} href={`#letter-${letter}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink/55 hover:bg-ink hover:text-white sm:h-7 sm:w-7 sm:rounded-md">
                    {letter}
                  </a>
                ))}
              </nav>
            )}

            <div className="mt-6 sm:mt-8" aria-live="polite">
              {signs && results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
                  <p className="text-lg font-medium">No sign for “{query.trim()}” yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
                    The vocabulary is growing. In the free demo, words without a sign are shown as captions so nothing is lost.
                  </p>
                  <button onClick={() => { setQuery(""); setTopic("All"); }} className="mt-5 text-sm font-semibold text-brand-600 underline underline-offset-4">
                    Show all signs
                  </button>
                </div>
              )}

              {q && results.length > 0 ? (
                <>
                  <p className="label mb-4">{results.length} {results.length === 1 ? "match" : "matches"}</p>
                  <ul className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">{results.map(tile)}</ul>
                </>
              ) : (
                groups.map(([letter, items]) => (
                  <div key={letter} id={`letter-${letter}`} className="scroll-mt-28 border-t border-ink/10 py-6 first:border-t-0 first:pt-0">
                    <h3 className="mb-4 font-mono text-sm text-ink/40">{letter}</h3>
                    <ul className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">{items.map(tile)}</ul>
                  </div>
                ))
              )}

              {!signs && !failed && (
                <ul className="grid grid-cols-2 gap-2.5 xl:grid-cols-3" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => (
                    <li key={i} className="h-[66px] animate-pulse rounded-xl bg-ink/[0.05]" />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
