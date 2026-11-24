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
        <div className="flex items-center justify-between bg-white rounded-3xl border border-[#D5F3F4] shadow-xs px-5 py-3.5">

            {/* MOBILE */}
            <div className="sm:hidden w-full flex items-center justify-center gap-4">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-[#2b99a6] bg-[#F4FBFB] border border-[#D5F3F4] hover:bg-[#D5F3F4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                    <ChevronLeftIcon className="size-4" />
                </button>

                <span className="text-xs text-[#3d635f] font-semibold font-nunito">
                    Página{" "}
                    <span className="font-extrabold text-[#2b99a6]">
                        {currentPage}
                    </span>{" "}
                    de{" "}
                    <span className="font-extrabold text-[#2b99a6]">
                        {totalPages}
                    </span>
                </span>

                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-[#2b99a6] bg-[#F4FBFB] border border-[#D5F3F4] hover:bg-[#D5F3F4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                    <ChevronRightIcon className="size-4" />
                </button>
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-nunito text-[#3d635f]">
                        Mostrando{" "}
                        <span className="font-extrabold text-[#2b99a6]">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>
                        {" "}a{" "}
                        <span className="font-extrabold text-[#2b99a6]">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>
                        {" "}de{" "}
                        <span className="font-extrabold text-[#2b99a6]">
                            {totalItems}
                        </span>
                        {" "}resultados
                    </p>
                </div>

                <div>
                    <nav className="isolate inline-flex items-center gap-1.5">
                        {/* PREV */}
                        <button
                            onClick={() =>
                                onPageChange(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-full p-2 bg-[#F4FBFB] text-[#2b99a6] border border-[#D5F3F4] hover:bg-[#D5F3F4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                        >
                            <ChevronLeftIcon className="size-5" />
                        </button>

                        {/* NUMEROS */}
                        {pages.map((page, i) =>
                            page === "..." ? (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-[#3d635f] font-nunito font-bold"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`
                                        w-9 h-9 rounded-full font-nunito text-sm font-extrabold cursor-pointer transition-all duration-200
                                        ${currentPage === page
                                            ? "bg-[#33aab8] text-white shadow-sm scale-105"
                                            : "bg-[#F4FBFB] text-[#3d635f] border border-[#D5F3F4] hover:bg-[#D5F3F4]/60 hover:text-[#2b99a6]"
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        {/* NEXT */}
                        <button
                            onClick={() =>
                                onPageChange(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-full p-2 bg-[#F4FBFB] text-[#2b99a6] border border-[#D5F3F4] hover:bg-[#D5F3F4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                        >
                            <ChevronRightIcon className="size-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
