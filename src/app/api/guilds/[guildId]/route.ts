import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ guildId: string }> }
) {
    const { guildId } = await ctx.params; // ✅ Next 15: params est un Promise

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        return NextResponse.json({ error: "Missing DISCORD_BOT_TOKEN" }, { status: 500 });
    }

    const r = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
        {
            headers: { Authorization: `Bot ${token}` },
            cache: "no-store",
        }
    );

    if (!r.ok) {
        const txt = await r.text();
        return NextResponse.json({ error: `Discord: ${r.status} ${txt}` }, { status: r.status });
    }

    const guild = await r.json();
    return NextResponse.json(guild);
}
