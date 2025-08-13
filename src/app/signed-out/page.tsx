"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignedOut() {
    const router = useRouter();

    useEffect(() => {
        const t = setTimeout(() => {
            router.replace("/");
        }, 900); // ~0.9s d'anim puis home
        return () => clearTimeout(t);
    }, [router]);

    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0f12] text-[#ECE7DB]">
            {/* glow blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-600/15 blur-3xl" />
                <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center text-center"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.webp"
                    alt="Phenix"
                    className="h-16 w-16 mb-4 drop-shadow-[0_0_20px_rgba(255,120,60,0.5)]"
                />

                <motion.h1
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-xl font-semibold"
                >
                    Déconnexion…
                </motion.h1>

                <motion.p
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-1 text-sm text-white/70"
                >
                    À bientôt ! Redirection vers l’accueil.
                </motion.p>

                {/* petite barre de progression */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                    className="mt-5 h-1 w-56 rounded-full bg-white/10 overflow-hidden"
                >
                    <div className="h-full w-full bg-gradient-to-r from-rose-500 to-orange-400" />
                </motion.div>
            </motion.div>
        </main>
    );
}
