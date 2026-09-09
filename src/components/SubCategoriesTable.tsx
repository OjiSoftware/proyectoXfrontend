import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
} from "flowbite-react";
import { PencilIcon, TrashIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { SubCategory } from "@/types/subcategory.types";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

// Extendemos SubCategory para TS
type SubCategoryWithIndex = SubCategory & { originalIndex?: number };

interface SubCategoriesTableProps {
    subcategories: SubCategoryWithIndex[];
    onDelete: (subCategory: SubCategory) => void;
    currentPage: number;
    itemsPerPage: number;
    // Nuevas props
    onSort: (column: string) => void;
    currentSortColumn: string | null;
    currentSortDirection: "asc" | "desc" | null;
}

export function SubCategoriesTable({
    subcategories,
    onDelete,
    currentPage,
    itemsPerPage,
    onSort,
    currentSortColumn,
    currentSortDirection,
}: SubCategoriesTableProps) {
    const renderSortArrow = (column: string) => {
        const isActive = currentSortColumn === column;
        return (
            <ArrowUpIcon
                className={`w-3 h-3 transition-all duration-150 ${isActive && currentSortDirection
                        ? currentSortDirection === "desc"
                            ? "rotate-180 opacity-100"
                            : "opacity-100"
                        : "opacity-0"
                    }`}
            />
        );
    };

    return (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0C0A15] shadow-2xl relative w-full">
            <Table hoverable className="w-full border-collapse">
                <TableHead className="bg-[#151320] border-b border-white/10 text-slate-300 [&_th]:!bg-transparent [&_th]:transition-all [&_th:hover]:!bg-white/5 [&_th]:font-semibold [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wider">
                    <TableRow className="hover:bg-transparent border-none">
                        {/* 1. ROW NUM (Cambiamos el onClick de id a rowNum) */}
                        <TableHeadCell
                            className="w-16 md:w-24 px-4 cursor-pointer select-none text-center"
                            onClick={() => onSort("rowNum")}
                        >
                            <div className="flex items-center justify-start">
                                # {renderSortArrow("rowNum")}
                            </div>
                        </TableHeadCell>

                        {/* 2. Nombre */}
                        <TableHeadCell
                            className="cursor-pointer select-none text-left"
                            onClick={() => onSort("name")}
                        >
                            <div className="relative inline-flex items-center">
                                <span>Nombre</span>
                                <div className="absolute -right-6">
                                    {renderSortArrow("name")}
                                </div>
                            </div>
                        </TableHeadCell>

                        {/* 3. Acciones */}
                        <TableHeadCell className="w-24 md:w-32 select-none text-center">
                            Acciones
                        </TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y divide-white/5">
                    {subcategories.map((subCategory: SubCategoryWithIndex) => (
                        <TableRow
                            key={subCategory.id}
                            className="bg-transparent hover:bg-white/5 transition-colors text-xs border-white/5 group"
                        >
                            <TableCell className="px-4 md:font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">
                                {subCategory.originalIndex}
                            </TableCell>

                            <TableCell className="text-left py-3">
                                <span
                                    className="text-xs md:text-xs md:font-bold text-slate-200 truncate block max-w-[200px] md:max-w-none"
                                    title={subCategory.name}
                                >
                                    {subCategory.name}
                                </span>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center justify-center gap-3">
                                    <Link
                                        title="Editar subcategoría"
                                        to={ROUTES.subcategories.edit(subCategory.id)}
                                        className="text-slate-500 hover:text-amber-400 transition-colors active:scale-95"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        title="Eliminar subcategoría"
                                        onClick={() => onDelete(subCategory)}
                                        className="text-slate-500 hover:text-rose-500 transition-colors active:scale-95 cursor-pointer"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

