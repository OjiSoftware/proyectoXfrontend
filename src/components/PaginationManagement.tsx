import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Genera los botones de página con puntos suspensivos
    const getPages = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
            {/* MOBILE */}
            <div className="sm:hidden w-full flex items-center justify-center gap-4">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-2xl text-slate-500 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                    <ChevronLeftIcon title="Anterior" className="size-5" />
                </button>

                <span className="text-xs text-slate-400 text-center">
                    Página{" "}
                    <span className="text-slate-200 font-bold">
                        {currentPage}
                    </span>{" "}
                    de{" "}
                    <span className="text-slate-200 font-bold">{totalPages}</span>
                </span>

                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-2xl text-slate-500 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                    <ChevronRightIcon title="Siguiente" className="size-5" />
                </button>
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between px-2">
                <div>
                    <p className="text-xs text-slate-400">
                        Mostrando{" "}
                        <span className="text-slate-200 font-bold">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        a{" "}
                        <span className="text-slate-200 font-bold">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        de{" "}
                        <span className="text-slate-200 font-bold">
                            {totalItems}
                        </span>{" "}
                        resultados
                    </p>
                </div>

                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-2xl shadow-sm border border-white/5 bg-white/[0.01]">
                        {/* Prev */}
                        <button
                            onClick={() =>
                                onPageChange(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-2xl px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 border-r border-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <ChevronLeftIcon className="size-4" />
                        </button>

                        {/* Pages */}
                        {pages.map((page, i) =>
                            page === "..." ? (
                                <span
                                    key={`dots-${i}`}
                                    className="relative inline-flex items-center px-4 py-2 text-xs text-slate-500 border-r border-white/5"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={`page-${page}-${i}`}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-300 border-r border-white/5
                ${
                    currentPage === page
                        ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)] z-10"
                        : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                                >
                                    {page}
                                </button>
                            ),
                        )}

                        {/* Next */}
                        <button
                            onClick={() =>
                                onPageChange(
                                    Math.min(totalPages, currentPage + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-2xl px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <ChevronRightIcon className="size-4" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
