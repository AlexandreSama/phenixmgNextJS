"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Guild = { id: string; name: string; iconUrl?: string };

export default function GuildSelect({ guilds }: { guilds: Guild[] }) {
    const router = useRouter();
    const pathname = usePathname();

    const hasGuilds = guilds.length > 0;
    const selectedId =
        pathname?.startsWith("/dashboard/") ? pathname.split("/")[2] : undefined;

    const current = useMemo(
        () => guilds.find((g) => g.id === selectedId) ?? guilds[0],
        [guilds, selectedId]
    );

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [focus, setFocus] = useState(0);
    const boxRef = useRef<HTMLDivElement>(null);

    // --- Bonus UX 3: persister la recherche (sessionStorage) ---
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("guildselect:q");
            if (saved) setQ(saved);
        } catch {}
    }, []);
    useEffect(() => {
        try {
            sessionStorage.setItem("guildselect:q", q);
        } catch {}
    }, [q]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return guilds;
        return guilds.filter(
            (g) => g.name.toLowerCase().includes(s) || g.id.toLowerCase().includes(s)
        );
    }, [guilds, q]);

    // Fermer sur clic extérieur / ESC
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    // Fermer quand la route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Gérer l'index du focus quand la liste change
    useEffect(() => {
        setFocus((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
    }, [filtered.length]);

    const go = (id: string) => {
        setOpen(false);
        router.push(`/dashboard/${id}`);
    };

    // --- Bonus UX 1: prefetch au survol
    const prefetch = (id: string) => {
        try {
            router.prefetch(`/dashboard/${id}`);
        } catch {}
    };

    // Fallback d’icône (initiale) — Bonus UX 2
    const Icon = ({ g}: { g: Guild; size?: number }) => {
        if (g.iconUrl) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={g.iconUrl} alt="" className="h-full w-full object-cover" />;
        }
        const letter = (g.name?.[0] ?? "?").toUpperCase();
        return (
            <div
                className="h-full w-full grid place-items-center text-xs font-semibold text-white/90"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,99,71,0.45), rgba(255,165,0,0.35))",
                }}
                aria-label={letter}
            >
                {letter}
            </div>
        );
    };

    return (
        <div
            className="relative"
            ref={boxRef}
            onKeyDown={(e) => {
                if (!open) return;
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setFocus((i) => Math.min(i + 1, filtered.length - 1));
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setFocus((i) => Math.max(i - 1, 0));
                }
                if (e.key === "Enter" && filtered[focus]) {
                    e.preventDefault();
                    go(filtered[focus].id);
                }
            }}
        >
            <button
                onClick={() => hasGuilds && setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={!hasGuilds}
                className="w-full flex items-center gap-3 rounded-2xl border border-white/10
                   bg-white/[0.04] hover:bg-white/[0.07] px-3 py-2
                   disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/10">
                    {current && <Icon g={current} />}
                </div>

                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">
                        {current ? current.name : "Sélectionner un serveur"}
                    </div>
                    <div className="text-[11px] text-white/55 leading-tight truncate">
                        {current?.id}
                    </div>
                </div>

                <span className="text-white/60">▾</span>
            </button>

            {open && (
                <div
                    className="absolute left-0 right-0 mt-2 rounded-2xl border border-white/10
                     bg-[#0d1015]/95 backdrop-blur-xl shadow-2xl p-2 z-50"
                    role="listbox"
                >
                    {/* Recherche */}
                    <div className="p-2">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher un serveur…"
                            className="w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm outline-none
                         placeholder:text-white/40 focus:bg-white/[0.08]"
                        />
                    </div>

                    <div className="max-h-72 overflow-auto py-1">
                        {filtered.map((g, idx) => (
                            <button
                                key={g.id}
                                onClick={() => go(g.id)}
                                onMouseEnter={() => prefetch(g.id)} // --- Bonus UX 1
                                className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-left
                  ${g.id === current?.id ? "bg-white/[0.08]" : "hover:bg-white/10"}
                  ${idx === focus ? "outline outline-white/30" : ""}`}
                                role="option"
                                aria-selected={g.id === current?.id}
                            >
                                <div className="h-7 w-7 rounded-md overflow-hidden bg-white/10">
                                    <Icon g={g} size={28} />
                                </div>
                                <div className="truncate">
                                    <div className="font-medium truncate">{g.name}</div>
                                    <div className="text-[11px] text-white/55">{g.id}</div>
                                </div>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="px-3 py-6 text-center text-sm text-white/50">
                                Aucun résultat.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
