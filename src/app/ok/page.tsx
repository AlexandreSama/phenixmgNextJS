import { prisma } from "@/lib/prisma";

export default async function DbTest() {
    const guilds = await prisma.guild.findMany({ take: 5 });
    return (
        <pre className="p-6 bg-white/10 rounded-xl border border-white/10 overflow-auto">
      {JSON.stringify(guilds, null, 2)}
    </pre>
    );
}
