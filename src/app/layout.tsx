import "./globals.css";
import type { Metadata } from "next";
import { cinzel, marcellus } from "@/lib/fonts";
import React from "react";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
    title: "Phenix MG",
    description: "Dashboard & Forum du bot Phenix",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={`${cinzel.variable} ${marcellus.variable}`}>
        <body className="bg-[#0d0f12] text-[#ECE7DB] font-[var(--font-marcellus)] antialiased">
        <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    );
}
