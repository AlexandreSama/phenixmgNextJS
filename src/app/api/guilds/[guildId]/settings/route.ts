import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// Coerce number <- accepte "123" ou 123
const CInt = z.coerce.number().int().nonnegative().nullable();

const Schema = z.object({
    // Channels
    welcomeChannelId: z.string().min(1),
    goodbyeChannelId: z.string().min(1),
    logChannelId: z.string().min(1),
    botAnnouncementsChannelId: z.string().min(1),
    raidsTd2ChannelId: z.string().optional().nullable().transform((v) => v ?? ""),
    activitiesTd2ChannelId: z.string().optional().nullable().transform((v) => v ?? ""),
    incursionChannelId: z.string().optional().nullable().transform((v) => v ?? ""),
    buildChannelId: z.string().optional().nullable().transform((v) => v ?? ""),

    // Roles
    raidManagerRoleId: z.string().optional().nullable().transform((v) => v ?? ""),

    // Moderation
    muteRoleId: z.string().optional().nullable().transform((v) => v ?? ""),
    maxWarnsMuteMinutes: CInt,
    maxWarnsKick: CInt,
    maxWarnsBanDays: CInt,
    warnDecayDays: CInt,
    automodEnabled: z.coerce.boolean(),
    blockInvites: z.coerce.boolean(),
    blockLinks: z.coerce.boolean(),
    capsThreshold: CInt,
    mentionThreshold: CInt,
});

export async function POST(
    req: Request,
    ctx: { params: Promise<{ guildId: string }> } // ✅ Next 15: params est un Promise
) {
    const { guildId } = await ctx.params; // ✅ on attend params

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation error", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const data = parsed.data;

    try {
        await prisma.$transaction(async (tx) => {
            // GuildChannels
            await tx.guildChannels.upsert({
                where: { guildId },
                create: {
                    guildId,
                    welcomeChannelId: data.welcomeChannelId,
                    goodbyeChannelId: data.goodbyeChannelId,
                    logChannelId: data.logChannelId,
                    botAnnouncementsChannelId: data.botAnnouncementsChannelId,
                    raidsTd2ChannelId: data.raidsTd2ChannelId || null,
                    activitiesTd2ChannelId: data.activitiesTd2ChannelId || null,
                    incursionChannelId: data.incursionChannelId || null,
                    buildChannelId: data.buildChannelId || null,
                },
                update: {
                    welcomeChannelId: data.welcomeChannelId,
                    goodbyeChannelId: data.goodbyeChannelId,
                    logChannelId: data.logChannelId,
                    botAnnouncementsChannelId: data.botAnnouncementsChannelId,
                    raidsTd2ChannelId: data.raidsTd2ChannelId || null,
                    activitiesTd2ChannelId: data.activitiesTd2ChannelId || null,
                    incursionChannelId: data.incursionChannelId || null,
                    buildChannelId: data.buildChannelId || null,
                },
            });

            // GuildRoles
            await tx.guildRoles.upsert({
                where: { guildId },
                create: {
                    guildId,
                    raidManagerRoleId: data.raidManagerRoleId || null,
                },
                update: {
                    raidManagerRoleId: data.raidManagerRoleId || null,
                },
            });

            // Moderation
            await tx.guildModerationSettings.upsert({
                where: { guildId },
                create: {
                    guildId,
                    muteRoleId: data.muteRoleId || null,
                    maxWarnsMuteMinutes: data.maxWarnsMuteMinutes ?? null,
                    maxWarnsKick: data.maxWarnsKick ?? null,
                    maxWarnsBanDays: data.maxWarnsBanDays ?? null,
                    warnDecayDays: data.warnDecayDays ?? null,
                    automodEnabled: data.automodEnabled,
                    blockInvites: data.blockInvites,
                    blockLinks: data.blockLinks,
                    capsThreshold: data.capsThreshold ?? null,
                    mentionThreshold: data.mentionThreshold ?? null,
                },
                update: {
                    muteRoleId: data.muteRoleId || null,
                    maxWarnsMuteMinutes: data.maxWarnsMuteMinutes ?? null,
                    maxWarnsKick: data.maxWarnsKick ?? null,
                    maxWarnsBanDays: data.maxWarnsBanDays ?? null,
                    warnDecayDays: data.warnDecayDays ?? null,
                    automodEnabled: data.automodEnabled,
                    blockInvites: data.blockInvites,
                    blockLinks: data.blockLinks,
                    capsThreshold: data.capsThreshold ?? null,
                    mentionThreshold: data.mentionThreshold ?? null,
                },
            });
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur enregistrt.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
