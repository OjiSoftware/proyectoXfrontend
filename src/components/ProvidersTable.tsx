import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
} from "flowbite-react";
import { Link } from "react-router-dom";
import { ArrowUpIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ROUTES } from "@/constants/routes";
import { Provider } from "@/types/provider.types";

interface ProviderWithIndex extends Provider {
    originalIndex: number;
}

interface ProvidersTableProps {
    providers: ProviderWithIndex[];
    onDelete: (provider: Provider) => void;
    currentPage: number;
    itemsPerPage: number;
    onSort: (column: string) => void;
    currentSortColumn: string | null;
    currentSortDirection: "asc" | "desc" | null;
}

export function ProvidersTable({
    providers,
    onDelete,
    onSort,
    currentSortColumn,
    currentSortDirection,
}: ProvidersTableProps) {
    const renderSortArrow = (column: string) => {
        const isActive = currentSortColumn === column;
        return (
            <ArrowUpIcon
                className={`w-3 h-3 ms-1 transition-all duration-150 ${
                    isActive && currentSortDirection
                        ? currentSortDirection === "desc"
                            ? "rotate-180 opacity-100"
                            : "opacity-100"
                        : "opacity-0"
                }`}
            />
        );
    };

    return (
        <div className="overflow-x-auto rounded-2xl management-table-container relative w-full">
            <Table hoverable className="w-full border-collapse management-table">
                <TableHead className="bg-[#151124] border-b border-white/10 text-slate-300 [&_th]:!bg-transparent [&_th]:transition-all [&_th:hover]:!bg-white/5 [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider">
                    <TableRow className="hover:bg-transparent border-none">
                        {/* # */}
                        <TableHeadCell
                            className="w-16 md:w-20 px-4 cursor-pointer select-none text-center"
                            onClick={() => onSort("rowNum")}
                        >
                            <div className="flex items-center justify-start">
                                # {renderSortArrow("rowNum")}
                            </div>
                        </TableHeadCell>

                        {/* Nombre */}
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

                        {/* Contacto / Teléfono */}
                        <TableHeadCell className="hidden md:table-cell! text-left select-none">
                            Contacto
                        </TableHeadCell>

                        {/* Email */}
                        <TableHeadCell className="hidden lg:table-cell! text-left select-none">
                            Email
                        </TableHeadCell>

                        {/* Acciones */}
                        <TableHeadCell className="w-24 md:w-32 select-none text-center">
                            Acciones
                        </TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y divide-white/5">
                    {providers.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={5} className="text-center py-8 text-slate-400 text-sm">
                                No se encontraron proveedores registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        providers.map((provider: ProviderWithIndex) => (
                            <TableRow
                                key={provider.id}
                                className="bg-transparent hover:bg-white/5 transition-colors text-sm border-white/5 group"
                            >
                                <TableCell className="px-4 font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                                    {provider.originalIndex}
                                </TableCell>

                                <TableCell className="text-left py-3">
                                    <span
                                        className="text-sm font-semibold text-slate-100 truncate block max-w-[200px] md:max-w-none"
                                        title={provider.name}
                                    >
                                        {provider.name}
                                    </span>
                                </TableCell>

                                <TableCell className="hidden md:table-cell! text-left text-slate-300 py-3">
                                    {provider.contact || provider.phone ? (
                                        <div className="flex flex-col">
                                            {provider.contact && <span>{provider.contact}</span>}
                                            {provider.phone && (
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {provider.phone}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic text-xs">-</span>
                                    )}
                                </TableCell>

                                <TableCell className="hidden lg:table-cell! text-left text-slate-300 py-3">
                                    {provider.email || <span className="text-slate-500 italic text-xs">-</span>}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center justify-center gap-3">
                                        <Link
                                            title="Editar proveedor"
                                            to={ROUTES.providers.edit(provider.id)}
                                            className="text-slate-400 hover:text-amber-400 transition-colors active:scale-95"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </Link>
                                        <button
                                            title="Eliminar proveedor"
                                            onClick={() => onDelete(provider)}
                                            className="text-slate-400 hover:text-rose-400 transition-colors active:scale-95 cursor-pointer"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
