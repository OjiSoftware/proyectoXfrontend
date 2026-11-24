import React, { useState, useEffect } from "react";
import { catalogApi } from "@/services/CatalogService";
import { Product } from "@/types/product.types";
import ProductCard from "@/components/ProductCard";

interface Props {
  currentProductId: number;
  categoryId?: number;
}

const SimilarProducts: React.FC<Props> = ({ currentProductId, categoryId }) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const allProducts = await catalogApi.getCatalog();

        const filtered = allProducts.filter(
          (p: any) => (p.categoryId === categoryId || p.category?.id === categoryId) && p.id !== currentProductId
        );

        setSimilarProducts(filtered.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar productos similares:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSimilar();
    }
  }, [currentProductId, categoryId]);

  if (loading || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 md:mt-16 w-full">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#37b9c7]">Recomendados</span>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1A2D2A]">
          Otros clientes también vieron
        </h2>
      </div>

      <div className="grid grid-flow-col auto-cols-[190px] md:auto-cols-[240px] gap-4 md:gap-5 overflow-x-auto pb-6 snap-x snap-mandatory pt-2 px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {similarProducts.map((p) => (
          <div key={p.id} className="snap-start flex h-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
