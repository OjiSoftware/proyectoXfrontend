import { TrendingDown, TrendingUp } from "lucide-react";

interface GrowthIndicatorProps {
    /** Variación contra el período anterior (null = sin período anterior). */
    value: number | null;
    /** Unidad que se muestra junto al valor: "%" (variación) o " pp" (puntos porcentuales). */
    suffix?: string;
}

export default function GrowthIndicator({ value, suffix = "%" }: GrowthIndicatorProps) {
    return (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
            {value === null ? (
                <span className="text-[var(--text-muted)]">
                    Sin período anterior para comparar
                </span>
            ) : (
                <span
                    className={`inline-flex items-center gap-1 font-medium ${
                        value >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                >
                    {value >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {value >= 0 ? "+" : ""}
                    {value}
                    {suffix} vs período anterior
                </span>
            )}
        </div>
    );
}
