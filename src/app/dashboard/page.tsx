import {getServerSession} from "next-auth";
import { authOptions } from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function DashboardHome() {

    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    return (
        <section className="mt-2">
            <h1 className="text-4xl md:text-5xl font-[var(--font-cinzel)] font-bold">
                SÉLECTIONNEZ UN SERVEUR
            </h1>
            <p className="mt-3 text-white/75 max-w-xl">
                Choisissez votre guilde en haut de la sidebar pour commencer.
            </p>
        </section>
    );
}
