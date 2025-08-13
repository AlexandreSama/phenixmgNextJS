import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

type DiscordChannel = {
    id: string;
    name: string;
    type: number;         // 0=text, 5=annonces, 15=forum…
    position?: number;
};
type DiscordRole = {
    id: string;
    name: string;
    position: number;
    managed?: boolean;
};

export const dynamic = "force-dynamic";

export default async function SettingsPage(
    props: { params: Promise<{ guildId: string }> }
) {
    const { guildId } = await props.params;

    // Prisma: config existante
    const [channelsCfg, rolesCfg, modCfg] = await Promise.all([
        prisma.guildChannels.findUnique({ where: { guildId } }),
        prisma.guildRoles.findUnique({ where: { guildId } }),
        prisma.guildModerationSettings.findUnique({ where: { guildId } }),
    ]);

    // Discord: récupérer salons + rôles
    const BOT = process.env.DISCORD_BOT_TOKEN;
    if (!BOT) throw new Error("DISCORD_BOT_TOKEN manquant dans .env.local");

    const dFetch = async <T,>(url: string): Promise<T> => {
        const r = await fetch(url, {
            headers: { Authorization: `Bot ${BOT}` },
            cache: "no-store",
            next: { revalidate: 0 },
        });
        if (!r.ok) {
            const text = await r.text();
            throw new Error(`Discord API ${r.status}: ${text}`);
        }
        return (await r.json()) as T;
    };

    const [dChannels, dRoles] = await Promise.all([
        dFetch<DiscordChannel[]>(`https://discord.com/api/v10/guilds/${guildId}/channels`),
        dFetch<DiscordRole[]>(`https://discord.com/api/v10/guilds/${guildId}/roles`),
    ]);

    // Options salons: text/annonces/forum
    const allowedTypes = new Set([0, 5, 15]);
    const channelOptions = dChannels
        .filter((ch) => allowedTypes.has(ch.type))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((ch) => ({ id: ch.id, name: `#${ch.name}` }));

    // Options rôles (du plus haut vers le plus bas)
    const roleOptions = dRoles
        .slice()
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name }));

    const initial = {
        // GuildChannels
        welcomeChannelId: channelsCfg?.welcomeChannelId ?? "",
        goodbyeChannelId: channelsCfg?.goodbyeChannelId ?? "",
        logChannelId: channelsCfg?.logChannelId ?? "",
        botAnnouncementsChannelId: channelsCfg?.botAnnouncementsChannelId ?? "",
        raidsTd2ChannelId: channelsCfg?.raidsTd2ChannelId ?? "",
        activitiesTd2ChannelId: channelsCfg?.activitiesTd2ChannelId ?? "",
        incursionChannelId: channelsCfg?.incursionChannelId ?? "",
        buildChannelId: channelsCfg?.buildChannelId ?? "",
        // GuildRoles
        raidManagerRoleId: rolesCfg?.raidManagerRoleId ?? "",
        // Moderation
        muteRoleId: modCfg?.muteRoleId ?? "",
        maxWarnsMuteMinutes: modCfg?.maxWarnsMuteMinutes ?? null,
        maxWarnsKick: modCfg?.maxWarnsKick ?? null,
        maxWarnsBanDays: modCfg?.maxWarnsBanDays ?? null,
        warnDecayDays: modCfg?.warnDecayDays ?? null,
        automodEnabled: modCfg?.automodEnabled ?? false,
        blockInvites: modCfg?.blockInvites ?? false,
        blockLinks: modCfg?.blockLinks ?? false,
        capsThreshold: modCfg?.capsThreshold ?? null,
        mentionThreshold: modCfg?.mentionThreshold ?? null,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Paramètres du serveur</h1>
                <p className="text-white/70">
                    Configure les salons, rôles et options de modération. La section The Division 2 est optionnelle.
                </p>
            </div>

            <SettingsForm
                guildId={guildId}
                initial={initial}
                channels={channelOptions}
                roles={roleOptions}
            />
        </div>
    );
}
