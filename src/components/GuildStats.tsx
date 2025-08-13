"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";

export type GuildInfo = {
    id: string;
    name: string;
    icon?: string | null;
    banner?: string | null;
    premium_tier?: number;
    premium_subscription_count?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
};

function cls(...v: Array<string | false | null | undefined>) {
    return v.filter(Boolean).join(" ");
}

export default function GuildStats({ guild }: { guild: GuildInfo }) {
    const iconUrl = guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
        : null;
    const bannerUrl = guild.banner
        ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=2048`
        : null;

    const tier = guild.premium_tier ?? 0;
    const boosts = guild.premium_subscription_count ?? 0;
    const total = guild.approximate_member_count ?? 0;
    const online = guild.approximate_presence_count ?? 0;

    // Paliers Discord
    const thresholds = [0, 2, 7, 14];
    const next = thresholds[Math.min(tier + 1, 3)];
    const atMax = tier >= 3;
    const toNext = atMax ? 0 : Math.max(0, next - boosts);
    const pctNext = atMax ? 100 : Math.min(100, Math.round((boosts / next) * 100));
    const pctOnline = total > 0 ? Math.round((online / total) * 100) : 0;

    const InitialIcon = useMemo(() => {
        const letter = (guild.name?.[0] ?? "?").toUpperCase();
        return (
            <div
                className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 text-white/90"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,99,71,.45), rgba(255,165,0,.35))",
                }}
                aria-label={letter}
            >
                <span className="text-2xl font-semibold">{letter}</span>
            </div>
        );
    }, [guild.name]);

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(guild.id);
        } catch {}
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* ---------- HERO ---------- */}
            <motion.section
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-3xl border border-white/10"
            >
                <div className="relative h-44 sm:h-56 md:h-64">
                    {bannerUrl ? (
                        <Image
                            src={bannerUrl}
                            alt=""
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#160f0f] via-[#141216] to-[#15110c]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </div>

                {/* Contenu */}
                <div className="relative -mt-12 sm:-mt-14 px-4 sm:px-6 pb-5 sm:pb-6">
                    <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
                        {/* Left: avatar + meta */}
                        <div className="flex items-center gap-4">
                            {/* Avatar + anneau dégradé */}
                            <div className="relative">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-rose-500/60 via-orange-400/60 to-amber-300/60 blur-md" />
                                <div className="relative rounded-2xl bg-black/30 p-1 border border-white/10">
                                    {iconUrl ? (
                                        <Image
                                            src={iconUrl}
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="rounded-xl"
                                        />
                                    ) : (
                                        InitialIcon
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
                                    {guild.name}
                                </h1>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/70">
                    ID&nbsp;: <span className="font-mono text-white/80">{guild.id}</span>
                  </span>
                                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/70">
                    Boost&nbsp;: <b>Niveau {tier}</b>
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={copyId}
                                className="rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-2 text-xs sm:text-sm"
                            >
                                Copier l’ID
                            </button>
                            <a
                                href={`https://discord.com/channels/${guild.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-2 text-xs sm:text-sm"
                            >
                                Ouvrir dans Discord
                            </a>
                        </div>
                    </div>

                    {/* Progress boosts */}
                    <div className="mt-4 sm:mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-white/70">
                                Boosts&nbsp;: <b className="text-white">{boosts}</b>
                                {!atMax && (
                                    <>
                                        {" "}
                                        • Prochain palier: <b className="text-white">{next}</b>
                                    </>
                                )}
                            </div>
                            <div className="text-[11px] text-white/60">
                                {atMax ? "Palier maximum atteint" : `Il reste ${toNext}`}
                            </div>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-rose-500 to-orange-400"
                                style={{ width: `${pctNext}%` }}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ---------- KPIs responsive (1→2→4) ---------- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <NeonCard title="Membres" value={total.toLocaleString()} hint="Total serveur" />
                <NeonCard title="En ligne" value={online.toLocaleString()} hint={`${pctOnline}% en ligne`} />
                <NeonCard title="Boosts" value={boosts} hint={`Niveau ${tier}`} />
                <CircleCard
                    title={atMax ? "Boosts (Max)" : "Progression palier"}
                    value={`${pctNext}%`}
                    hint={atMax ? "Niveau 3 atteint" : `${toNext} restants`}
                    percent={pctNext}
                />
            </section>

            {/* ---------- Infos rapides ---------- */}
            <motion.section
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
                <div className="text-sm text-white/70 mb-3">Infos rapides</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="ID" value={guild.id} mono />
                    <InfoRow label="Niveau Boost" value={String(tier)} />
                    <InfoRow label="Boosts" value={String(boosts)} />
                    <InfoRow label="Membres en ligne" value={`${online} (${pctOnline}%)`} />
                </ul>
            </motion.section>
        </div>
    );
}

/* ======= UI sub-components ======= */

function NeonCard({
                      title,
                      value,
                      hint,
                  }: {
    title: string;
    value: string | number;
    hint?: string;
}) {
    return (
        <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
        >
            {/* aura */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/0 via-orange-400/0 to-amber-300/0 [mask-image:radial-gradient(60%_60%_at_30%_20%,black,transparent)]" />
            <div className="text-xs sm:text-sm text-white/60">{title}</div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-semibold">{value}</div>
            {hint && <div className="mt-1 text-[11px] sm:text-xs text-white/50">{hint}</div>}
        </motion.div>
    );
}

function CircleCard({
                        title,
                        value,
                        hint,
                        percent,
                    }: {
    title: string;
    value: string;
    hint?: string;
    percent: number; // 0..100
}) {
    const r = 40;
    const c = 2 * Math.PI * r;
    const dash = Math.round((percent / 100) * c);

    return (
        <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
        >
            <div className="text-xs sm:text-sm text-white/60">{title}</div>
            <div className="mt-2 flex items-center gap-4">
                <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                    <circle cx="48" cy="48" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none" />
                    <circle
                        cx="48"
                        cy="48"
                        r={r}
                        stroke="url(#grad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${c - dash}`}
                        fill="none"
                    />
                    <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                </svg>
                <div>
                    <div className="text-2xl sm:text-3xl font-semibold leading-none">{value}</div>
                    {hint && <div className="mt-1 text-[11px] sm:text-xs text-white/55">{hint}</div>}
                </div>
            </div>
        </motion.div>
    );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <li className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-white/60">{label}</span>
            <span className={cls("text-white/80", mono && "font-mono truncate")}>{value}</span>
        </li>
    );
}
