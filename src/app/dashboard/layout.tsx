import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import {redirect} from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    const userId = session?.discord?.user?.id;

    // Si pas co, le middleware next-auth redirigera, on met un fallback "sécurité"
    if (!userId) {
        redirect("/signed-out"); // ✅ plus de "Veuillez vous connecter."
    }

    // Récupérer les guildes liées à cet utilisateur (via UserProfile)
    const profiles = await prisma.userProfile.findMany({
        where: { userId },
        include: { guild: true },
        orderBy: { guildId: "asc" },
    });

    const guilds = profiles.map((p) => ({
        id: p.guildId,
        name: p.guild?.name ?? p.guildId,
        iconUrl: undefined as string | undefined, // plus tard si tu stockes l'icône côté DB
    }));

    return (
        <div className="relative min-h-screen">
            {/* blobs doux */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-600/15 blur-3xl" />
                <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
            </div>

            <Sidebar guilds={guilds} />

            <div className="lg:pl-80">
                <header className="sticky top-0 z-10 bg-[#0d0f12]/70 backdrop-blur border-b border-white/8">
                    <div className="max-w-7xl mx-auto px-6 py-3 text-sm text-white/70">Dashboard</div>
                </header>
                <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
            </div>
        </div>
    );
}
