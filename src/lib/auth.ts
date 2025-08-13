// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { JWT } from "next-auth/jwt";
import type { Profile, Session } from "next-auth";

/** ==== Augmentations types ==== */
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        tokenType?: string;
        user?: {
            id: string;
            username: string;
            discriminator?: string;
            global_name?: string;
            avatar?: string | null;
        };
    }
}

declare module "next-auth" {
    interface Session {
        discord?: {
            accessToken?: string;
            tokenType?: string;
            user?: {
                id: string;
                username: string;
                discriminator?: string;
                global_name?: string;
                avatar?: string | null;
            };
        };
    }
}

function isDiscordProfile(p: Profile | null | undefined): p is Profile & {
    id: string;
    username: string;
    discriminator?: string;
    global_name?: string;
    avatar?: string | null;
} {
    if (!p) return false;
    const obj = p as unknown as { id?: unknown; username?: unknown };
    return typeof obj.id === "string" && typeof obj.username === "string";
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID ?? "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
            authorization: { params: { scope: "identify guilds", prompt: "none" } },
        }),
    ],
    session: { strategy: "jwt" },
    // debug: true, // optionnel
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                if (typeof account.expires_at === "number") {
                    token.expiresAt = account.expires_at * 1000;
                }
                token.tokenType = account.token_type ?? "Bearer";

                if (isDiscordProfile(profile)) {
                    type Ext = typeof profile & {
                        discriminator?: string;
                        global_name?: string;
                        avatar?: string | null;
                    };
                    const p = profile as Ext;
                    token.user = {
                        id: p.id,
                        username: p.username,
                        discriminator: p.discriminator,
                        global_name: p.global_name,
                        avatar: p.avatar ?? null,
                    };
                }
            }

            const now = Date.now();
            const willExpireSoon = token.expiresAt && token.expiresAt - 60_000 < now;
            if (willExpireSoon && token.refreshToken) {
                try {
                    const res = await fetch("https://discord.com/api/oauth2/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.DISCORD_CLIENT_ID ?? "",
                            client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
                            grant_type: "refresh_token",
                            refresh_token: token.refreshToken,
                        }),
                    });
                    if (res.ok) {
                        const data: {
                            access_token: string;
                            token_type: string;
                            expires_in: number;
                            refresh_token?: string;
                        } = await res.json();
                        token.accessToken = data.access_token;
                        token.tokenType = data.token_type ?? "Bearer";
                        token.expiresAt = Date.now() + data.expires_in * 1000;
                        if (data.refresh_token) token.refreshToken = data.refresh_token;
                    } else {
                        delete token.accessToken;
                        delete token.refreshToken;
                        delete token.expiresAt;
                        delete token.tokenType;
                    }
                } catch {
                    // silencieux
                }
            }

            return token as JWT;
        },

        async session({ session, token }) {
            (session as Session).discord = {
                accessToken: token.accessToken,
                tokenType: token.tokenType,
                user: token.user,
            };
            return session;
        },
    },
};
