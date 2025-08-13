"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GuildSelect, { type Guild } from "@/components/GuildSelect";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Sidebar({ guilds }: { guilds: Guild[] }) {
    const pathname = usePathname();
    const { status } = useSession();

    const hasGuilds = guilds.length > 0;
    const selectedId =
        pathname?.startsWith("/dashboard/") ? pathname.split("/")[2] : undefined;
    const current = selectedId ?? (hasGuilds ? guilds[0].id : "");

    const Item = ({ href, label }: { href: string; label: string }) => {
        const isActive = pathname?.startsWith(href);
        return (
            <Link
                href={href}
                className={`block rounded-xl px-3 py-2 text-sm transition
          ${isActive ? "bg-white/10 text-white" : "text-white/90 hover:text-white hover:bg-white/10"}`}
            >
                {label}
            </Link>
        );
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-80 p-6 border-r border-white/10 bg-[#0f1216]/70 backdrop-blur-xl">
            {/* Logo + titre */}
            <div className="flex items-center gap-3 mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.webp" className="h-9 w-9" alt="logo" />
                <div className="text-2xl font-bold" style={{ fontFamily: "Cinzel, ui-serif" }}>
                    PhenixMG
                </div>
            </div>

            {/* Sélecteur de serveur */}
            <div className="mb-6">
                <GuildSelect guilds={guilds} />
            </div>

            {!hasGuilds && (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/70">
                    Aucun serveur associé à votre compte.
                </div>
            )}

            {/* Nav */}
            <nav className={`space-y-1 ${!hasGuilds ? "opacity-50 pointer-events-none" : ""}`}>
                <Item href={`/dashboard/${current}`} label="Dashboard" />
                <Item href={`/dashboard/${current}/settings`} label="Settings" />
                <Item href={`/dashboard/${current}/raids`} label="Raids & Activités" />
                <Item href={`/dashboard/${current}/moderation`} label="Modération" />
            </nav>

            {/* Footer */}
            <div className="absolute bottom-6 left-6 right-6">
                {status === "authenticated" ? (
                    <button
                        onClick={() => signOut({callbackUrl: "/signed-out" })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm"
                    >
                        Se déconnecter
                    </button>
                ) : (
                    <button
                        onClick={() => signIn("discord")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm"
                    >
                        Se connecter avec Discord
                    </button>
                )}
            </div>
        </aside>
    );
}
