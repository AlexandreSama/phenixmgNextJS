"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function DashboardButton() {
    const { status } = useSession();

    if (status === "loading") {
        return (
            <button
                disabled
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-semibold
                   bg-gray-600/60 cursor-wait"
            >
                Chargement…
            </button>
        );
    }

    if (status === "unauthenticated") {
        return (
            <button
                onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-semibold
                   bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600
                   shadow-lg hover:shadow-xl transition"
            >
                Accéder au dashboard
            </button>
        );
    }

    // Déjà connecté → lien direct
    return (
        <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-semibold
                 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600
                 shadow-lg hover:shadow-xl transition"
        >
            Accéder au dashboard
        </Link>
    );
}
