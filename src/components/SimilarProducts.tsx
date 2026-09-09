// SimilarProducts.tsx
import React, { useState, useEffect } from "react";
import { catalogApi } from "@/services/CatalogService";
import { Product } from "@/types/product.types";
import ProductCard from "@/components/ProductCard";

interface Props {
  currentProductId: number;
  subCategoryId: number;
}

const SimilarProducts: React.FC<Props> = ({ currentProductId, subCategoryId }) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        // Traemos todo el catálogo y filtramos en el cliente (para evitar crear un nuevo endpoint)
        const allProducts = await catalogApi.getCatalog();

        // Filtramos por la misma subcategoría y excluimos el producto actual
        const filtered = allProducts.filter(
          (p: Product) => p.subCategoryId === subCategoryId && p.id !== currentProductId
        );

        // Tomamos un máximo de 5 para no saturar la vista
        setSimilarProducts(filtered.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar productos similares:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subCategoryId) {
      fetchSimilar();
    }
  }, [currentProductId, subCategoryId]);

  if (loading || similarProducts.length === 0) {
    return null; // No mostramos nada si carga o no hay similares
  }

  return (
    <div className="mt-10 md:mt-16 w-full">

      <h2 className="border-t border-[#9E9494]/30 pt-4 text-lg md:text-2xl font-bold font-montserrat text-[#1A2D2A] text-center md:mb-8 mb-4">
        Otros clientes también vieron
      </h2>

      <div className="grid grid-flow-col auto-cols-[180px] md:auto-cols-[240px] gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory pt-2 px-2 no-scrollbar">
        {similarProducts.map((p) => (
          <div key={p.id} className="snap-start flex h-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Estilos para ocultar scrollbar en crudo */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default SimilarProducts;
