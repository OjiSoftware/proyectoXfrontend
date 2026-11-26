import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportDropdownProps {
    onExportExcel: () => void | Promise<void>;
    onExportPdf?: () => void | Promise<void>;
    compact?: boolean;
}

export function ExportDropdown({
    onExportExcel,
    onExportPdf,
    compact = false,
}: ExportDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                title="Exportar"
                className={
                    compact
                        ? `h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              open
                                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`
                        : `h-11 inline-flex items-center gap-2 px-4 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              open
                                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`
                }
            >
                <Download className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                <span>Exportar</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#151519] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2.5 pt-1 pb-1.5">
                        Formato
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onExportExcel();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Excel (.xlsx)</span>
                    </button>
                    {onExportPdf && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onExportPdf();
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>PDF (.pdf)</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
