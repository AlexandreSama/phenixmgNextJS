import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GuildStats from "@/components/GuildStats";

export const dynamic = "force-dynamic";

type GuildInfo = {
    id: string;
    name: string;
    icon?: string | null;
    banner?: string | null;
    premium_tier?: number;
    premium_subscription_count?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
};

export default async function GuildDashboard(
    props: { params: Promise<{ guildId: string }> }
) {
    // ✅ Next 15: params est async
    const { guildId } = await props.params;

    const session = await getServerSession(authOptions);
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/dashboard/${guildId}`);
    }

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        throw new Error("DISCORD_BOT_TOKEN manquant dans .env.local");
    }

    const r = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
        {
            headers: { Authorization: `Bot ${token}` },
            cache: "no-store",
            next: { revalidate: 0 },
        }
    );

    if (!r.ok) {
        const text = await r.text();
        throw new Error(`Discord API: ${r.status} ${text}`);
    }

    const guild = (await r.json()) as GuildInfo;
    return <GuildStats guild={guild} />;
}
