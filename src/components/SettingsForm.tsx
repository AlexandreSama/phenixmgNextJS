"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Option = { id: string; name: string };

type Initial = {
    // GuildChannels
    welcomeChannelId: string;
    goodbyeChannelId: string;
    logChannelId: string;
    botAnnouncementsChannelId: string;
    raidsTd2ChannelId: string;
    activitiesTd2ChannelId: string;
    incursionChannelId: string;
    buildChannelId: string;
    // GuildRoles
    raidManagerRoleId: string;
    // Moderation
    muteRoleId: string;
    maxWarnsMuteMinutes: number | null;
    maxWarnsKick: number | null;
    maxWarnsBanDays: number | null;
    warnDecayDays: number | null;
    automodEnabled: boolean;
    blockInvites: boolean;
    blockLinks: boolean;
    capsThreshold: number | null;
    mentionThreshold: number | null;
};

function Select({
                    label,
                    value,
                    onChange,
                    options,
                    required,
                    placeholder = "Sélectionner…",
                }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <div className="mb-1 text-sm text-white/70">
                {label} {required && <span className="text-red-500">*</span>}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none
                   focus:bg-white/[0.08] text-sm"
            >
                {!required && <option value="">{placeholder}</option>}
                {required && !value && <option value="" disabled>{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </label>
    );
}

function Toggle({
                    checked,
                    onChange,
                    label,
                }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`inline-flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2
                  ${checked ? "bg-white/[0.10]" : "bg-white/[0.04] hover:bg-white/[0.07]"}`}
        >
            <span className="text-sm">{label}</span>
            <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                    ${checked ? "bg-orange-500" : "bg-white/20"}`}
            >
        <span
            className={`h-5 w-5 transform rounded-full bg-white transition
                      ${checked ? "translate-x-5" : "translate-x-1"}`}
        />
      </span>
        </button>
    );
}

function NumberField({
                         label,
                         value,
                         onChange,
                         placeholder,
                         min,
                         max,
                     }: {
    label: string;
    value: number | null;
    onChange: (v: number | null) => void;
    placeholder?: string;
    min?: number;
    max?: number;
}) {
    return (
        <label className="block">
            <div className="mb-1 text-sm text-white/70">{label}</div>
            <input
                type="number"
                value={value ?? ""}
                min={min}
                max={max}
                onChange={(e) => {
                    const v = e.target.value;
                    onChange(v === "" ? null : Number(v));
                }}
                placeholder={placeholder}
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none
                   focus:bg-white/[0.08] text-sm"
            />
        </label>
    );
}

export default function SettingsForm({
                                         guildId,
                                         initial,
                                         channels,
                                         roles,
                                     }: {
    guildId: string;
    initial: Initial;
    channels: Option[];
    roles: Option[];
}) {
    const [state, setState] = useState<Initial>(initial);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    // TD2 visible si des valeurs existent déjà
    const defaultTD2 =
        !!initial.raidsTd2ChannelId ||
        !!initial.activitiesTd2ChannelId ||
        !!initial.incursionChannelId ||
        !!initial.buildChannelId ||
        !!initial.raidManagerRoleId;
    const [showTD2, setShowTD2] = useState<boolean>(defaultTD2);

    // Charger préférence UI
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ui:showTD2");
            if (saved === "true") setShowTD2(true);
            else if (saved === "false") setShowTD2(false);
        } catch {}
         
    }, []);

    // Sauver préférence UI
    useEffect(() => {
        try {
            localStorage.setItem("ui:showTD2", String(showTD2));
        } catch {}
    }, [showTD2]);

    const set = <K extends keyof Initial>(k: K) => (v: Initial[K]) =>
        setState((s) => ({ ...s, [k]: v }));

    // Normaliser les champs requis par rapport aux options actuelles
    const channelIds = useMemo(() => new Set(channels.map((c) => c.id)), [channels]);
    const normalized = useMemo(
        () => ({
            ...state,
            welcomeChannelId: channelIds.has(state.welcomeChannelId) ? state.welcomeChannelId : "",
            goodbyeChannelId: channelIds.has(state.goodbyeChannelId) ? state.goodbyeChannelId : "",
            logChannelId: channelIds.has(state.logChannelId) ? state.logChannelId : "",
            botAnnouncementsChannelId: channelIds.has(state.botAnnouncementsChannelId)
                ? state.botAnnouncementsChannelId
                : "",
        }),
        [state, channelIds]
    );

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        setErr(null);

        const payload: Initial = showTD2
            ? normalized
            : {
                ...normalized,
                raidsTd2ChannelId: "",
                activitiesTd2ChannelId: "",
                incursionChannelId: "",
                buildChannelId: "",
                raidManagerRoleId: "",
            };

        try {
            const res = await fetch(`/api/guilds/${guildId}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({} as { error?: string }));
                setErr(data?.error ?? `HTTP ${res.status}`);
                return;
            }
            setMsg("Configuration enregistrée ✅");
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Erreur lors de l’enregistrement");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* Salons requis */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Salons requis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Salon bienvenue" required value={normalized.welcomeChannelId} onChange={set("welcomeChannelId")} options={channels} />
                    <Select label="Salon départ" required value={normalized.goodbyeChannelId} onChange={set("goodbyeChannelId")} options={channels} />
                    <Select label="Salon logs" required value={normalized.logChannelId} onChange={set("logChannelId")} options={channels} />
                    <Select label="Salon annonces bot" required value={normalized.botAnnouncementsChannelId} onChange={set("botAnnouncementsChannelId")} options={channels} />
                </div>
            </section>

            {/* The Division 2 (optionnel) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">The Division 2</h2>
                    <Toggle checked={showTD2} onChange={setShowTD2} label={showTD2 ? "Actif" : "Masqué"} />
                </div>

                <AnimatePresence initial={false}>
                    {showTD2 && (
                        <motion.div
                            key="td2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select label="Salon Raids (TD2)" value={state.raidsTd2ChannelId} onChange={set("raidsTd2ChannelId")} options={channels} />
                                <Select label="Salon Activités (TD2)" value={state.activitiesTd2ChannelId} onChange={set("activitiesTd2ChannelId")} options={channels} />
                                <Select label="Salon Incursions" value={state.incursionChannelId} onChange={set("incursionChannelId")} options={channels} />
                                <Select label="Salon Builds" value={state.buildChannelId} onChange={set("buildChannelId")} options={channels} />
                                <Select label="Rôle Raid Manager (optionnel)" value={state.raidManagerRoleId} onChange={set("raidManagerRoleId")} options={roles} placeholder="Aucun" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Modération */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Modération</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Rôle muet (optionnel)" value={state.muteRoleId} onChange={set("muteRoleId")} options={roles} placeholder="Aucun" />
                    <NumberField label="Décroissance des avertissements (jours)" value={state.warnDecayDays} onChange={set("warnDecayDays")} placeholder="ex: 30" min={0} />
                    <NumberField label="Seuil majuscules (CAPS) %" value={state.capsThreshold} onChange={set("capsThreshold")} placeholder="ex: 70" min={0} max={100} />
                    <NumberField label="Seuil mentions (par message)" value={state.mentionThreshold} onChange={set("mentionThreshold")} placeholder="ex: 5" min={0} />
                    <NumberField label="Max warns → mute (minutes)" value={state.maxWarnsMuteMinutes} onChange={set("maxWarnsMuteMinutes")} placeholder="ex: 30" min={0} />
                    <NumberField label="Max warns → kick" value={state.maxWarnsKick} onChange={set("maxWarnsKick")} placeholder="ex: 5" min={0} />
                    <NumberField label="Max warns → ban (jours)" value={state.maxWarnsBanDays} onChange={set("maxWarnsBanDays")} placeholder="ex: 7" min={0} />
                </div>

                <div className="flex flex-wrap gap-3">
                    <Toggle checked={state.automodEnabled} onChange={set("automodEnabled")} label="AutoMod activé" />
                    <Toggle checked={state.blockInvites} onChange={set("blockInvites")} label="Bloquer les invitations" />
                    <Toggle checked={state.blockLinks} onChange={set("blockLinks")} label="Bloquer les liens" />
                </div>
            </section>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600
                     px-5 py-2 font-semibold disabled:opacity-60"
                >
                    {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
                {msg && <div className="text-sm text-emerald-400">{msg}</div>}
                {err && <div className="text-sm text-red-400">{err}</div>}
            </div>
        </form>
    );
}
