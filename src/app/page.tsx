import Image from "next/image";
import DashboardButton from "@/components/DashboardButton";

export default function Home() {
    return (
        <main className="relative min-h-screen overflow-hidden">
            {/* Background plein écran */}
            <Image
                src="/background.png"
                alt="Fond Phenix"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
            />

            {/* Voile sombre */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Contenu */}
            <div className="relative z-10 flex min-h-screen items-center justify-center">
                <div className="text-center px-6">
                    <div className="mx-auto mb-6 h-28 w-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.webp"
                            alt="Logo Phenix"
                            className="h-full w-full object-contain drop-shadow-[0_0_25px_rgba(255,100,50,0.6)]"
                        />
                    </div>

                    <h1
                        className="text-4xl md:text-6xl font-[var(--font-cinzel)] tracking-wide
                       bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-200 bg-clip-text text-transparent"
                    >
                        PhenixMG
                    </h1>

                    <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto">
                        Configurez votre bot et gérez votre communauté.
                    </p>

                    <div className="mt-8">
                        <DashboardButton />
                    </div>
                </div>
            </div>
        </main>
    );
}
