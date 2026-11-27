export type DatePresetId = "today" | "7d" | "30d" | "month";

export const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

export const getPresetRange = (preset: DatePresetId) => {
    const now = new Date();
    const today = toInputDate(now);

    if (preset === "today") return { from: today, to: today };
    if (preset === "7d") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return { from: toInputDate(start), to: today };
    }
    if (preset === "30d") {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return { from: toInputDate(start), to: today };
    }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toInputDate(startOfMonth), to: today };
};

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "7d", label: "7 días" },
    { id: "30d", label: "30 días" },
    { id: "month", label: "Este mes" },
];
