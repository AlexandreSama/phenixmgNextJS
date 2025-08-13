import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GuildSegmentLayout(
    props: { children: ReactNode; params: Promise<{ guildId: string }> }
) {
    // ✅ Next 15: params est async
    const { guildId } = await props.params;

    const session = await getServerSession(authOptions);
    const userId = session?.discord?.user?.id;

    if (!userId) {
        // selon ton choix: soit on redirige vers la page animée,
        // soit on notFound(); j'opte pour la redirection douce :
        redirect("/signed-out");
    }

    // Vérifie que l'utilisateur a bien un profil pour cette guilde
    const profile = await prisma.userProfile.findUnique({
        where: { guildId_userId: { guildId, userId } },
        select: { guildId: true },
    });

    if (!profile) {
        // pas autorisé à voir cette guilde
        notFound();
    }

    return <>{props.children}</>;
}
