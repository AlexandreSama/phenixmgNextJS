import { Cinzel, Marcellus } from "next/font/google";

export const cinzel = Cinzel({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-cinzel",
});

export const marcellus = Marcellus({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-marcellus",
});
