import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import { Product } from "@/types/product.types";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { CheckCircle } from "lucide-react";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";

// Extendemos Product internamente para que TS sepa que trae el originalIndex
type ProductWithIndex = Product & { originalIndex?: number };

interface ProductsTableProps {
  products: ProductWithIndex[];
  onDelete: (product: Product) => void;
  currentPage: number;
  itemsPerPage: number;
  onSort: (column: string) => void;
  currentSortColumn: string | null;
  currentSortDirection: "asc" | "desc" | null;
  visibleColumns?: Set<string>;
}

export function ProductsTable({
  products,
  onDelete,
  currentPage,
  itemsPerPage,
  onSort,
  currentSortColumn,
  currentSortDirection,
  visibleColumns,
}: ProductsTableProps) {
  // Si no se pasa visibleColumns, se muestran todas
  const isVisible = (col: string) => !visibleColumns || visibleColumns.has(col);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const formatARS = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }),
    [],
  );

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const renderSortArrow = (column: string) => {
    const isActive = currentSortColumn === column;
    return (
      <ArrowUpIcon
        className={`w-3 h-3 ms-1 transition-all duration-150 ${isActive && currentSortDirection
          ? currentSortDirection === "desc"
            ? "rotate-180 opacity-100"
            : "opacity-100"
          : "opacity-0"
          }`}
      />
    );
  };

  const hideOnTablet = "hidden lg:table-cell!";
  const hideOnMobile = "hidden md:table-cell!";

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0C0A15] shadow-2xl">
      <Table hoverable className="w-full">
        <TableHead className="bg-[#151320] border-b border-white/10 text-slate-300 [&_th]:!bg-transparent [&_th]:transition-all [&_th:hover]:!bg-white-5 [&_th]:font-semibold [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wider">
          <TableRow className="hover:bg-transparent border-none">
            <TableHeadCell
              className="px-4 w-14 cursor-pointer select-none"
              onClick={() => onSort('rowNum')}
            >
              <div className="flex items-center">
                # {renderSortArrow('rowNum')}
              </div>
            </TableHeadCell>

            <TableHeadCell
              className="cursor-pointer select-none text-center"
              onClick={() => onSort('name')}
            >
              <div className="relative inline-flex items-center justify-center">
                <span>Nombre</span>
                <div className="absolute -right-6">{renderSortArrow('name')}</div>
              </div>
            </TableHeadCell>

            {isVisible('unit') && (
              <TableHeadCell
                className={`${hideOnTablet} cursor-pointer select-none text-center`}
                onClick={() => onSort('unit')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Unidad</span>
                  <div className="absolute -right-6">{renderSortArrow('unit')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('brand') && (
              <TableHeadCell
                className={`${hideOnTablet} cursor-pointer select-none text-center`}
                onClick={() => onSort('brand.name')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Marca</span>
                  <div className="absolute -right-6">{renderSortArrow('brand.name')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('category') && (
              <TableHeadCell
                className={`${hideOnTablet} cursor-pointer select-none text-center`}
                onClick={() => onSort('subCategory.category.name')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Categoría</span>
                  <div className="absolute -right-6">{renderSortArrow('subCategory.category.name')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('subCategory') && (
              <TableHeadCell
                className={`${hideOnTablet} cursor-pointer select-none text-center`}
                onClick={() => onSort('subCategory.name')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Subcategoría</span>
                  <div className="absolute -right-6">{renderSortArrow('subCategory.name')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('stock') && (
              <TableHeadCell
                className={`${hideOnMobile} cursor-pointer select-none text-center`}
                onClick={() => onSort('stock')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Stock</span>
                  <div className="absolute -right-6">{renderSortArrow('stock')}</div>
                </div>
              </TableHeadCell>
            )}

            {isVisible('price') && (
              <TableHeadCell
                className={`${hideOnMobile} cursor-pointer select-none text-center`}
                onClick={() => onSort('price')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span>Precio</span>
                  <div className="absolute -right-6">{renderSortArrow('price')}</div>
                </div>
              </TableHeadCell>
            )}

            <TableHeadCell className="select-none text-center">Acciones</TableHeadCell>

            {isVisible('catalog') && (
              <TableHeadCell
                className="cursor-pointer select-none text-center"
                onClick={() => onSort('showingInCatalog')}
              >
                <div className="relative inline-flex items-center justify-center">
                  <span className="md:hidden">Cat.</span>
                  <span className="hidden md:inline">Catálogo</span>
                  <div className="absolute -right-6">{renderSortArrow('showingInCatalog')}</div>
                </div>
              </TableHeadCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody className="divide-y divide-white/5">
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="bg-transparent hover:bg-white/5 transition-colors text-xs border-white/5 group"
            >
              <TableCell className="px-4 font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">
                {product.originalIndex}
              </TableCell>

              <TableCell className="text-left py-3">
                <div className="flex flex-col items-start justify-center">
                  <span className="font-bold text-slate-200">{product.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">ID: {product.id}</span>
                </div>
              </TableCell>

              {isVisible('unit') && (
                <TableCell className={`${hideOnTablet} text-center text-slate-400`}>
                  {product.unit || '-'}
                </TableCell>
              )}

              {isVisible('brand') && (
                <TableCell className={`${hideOnTablet} text-center text-slate-400`}>
                  {product.brand?.name || 'Sin marca'}
                </TableCell>
              )}

              {isVisible('category') && (
                <TableCell className={`${hideOnTablet} text-center text-slate-400`}>
                  {product.subCategory?.category?.name || 'Sin categoría'}
                </TableCell>
              )}

              {isVisible('subCategory') && (
                <TableCell className={`${hideOnTablet} text-center text-slate-400`}>
                  {product.subCategory?.name || '-'}
                </TableCell>
              )}

              {isVisible('stock') && (
                <TableCell className={`${hideOnMobile} font-bold text-center`}>
                  <span className={product.stock === 0 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'text-slate-300'}>
                    {product.stock ?? 0}
                  </span>
                </TableCell>
              )}

              {isVisible('price') && (
                <TableCell className={`${hideOnMobile} font-mono text-emerald-400 text-center font-medium`}>
                  {formatARS.format(product.price ?? 0)}
                </TableCell>
              )}

              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <button
                    title="Ver detalles"
                    className="text-slate-500 hover:text-indigo-400 transition-colors active:scale-95 cursor-pointer"
                    onClick={() => handleOpenDetails(product)}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <Link
                    title="Editar producto"
                    to={ROUTES.products.edit(product.id)}
                    className="text-slate-500 hover:text-amber-400 transition-colors active:scale-95"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    title="Eliminar producto"
                    onClick={() => onDelete(product)}
                    className="text-slate-500 hover:text-rose-500 transition-colors active:scale-95 cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>

              {isVisible('catalog') && (
                <TableCell>
                  <div className="flex justify-center items-center">
                    {product.showingInCatalog && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isDetailsModalOpen && selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          product={selectedProduct}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

