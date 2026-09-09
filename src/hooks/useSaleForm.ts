import { useState, useEffect } from "react";
import { productApi } from "@/services/ProductService";
import { Product } from "@/types/product.types";

export const useSaleForm = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    status: "PENDING",
    total: 0,
    details: [] as any[],
    name: "",
    surname: "",
    dni: "",
    phoneNumber: "",
    email: "",
    street: "",
    number: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    floor: "",
    apartment: "",
    reference: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getAllProducts(); //
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para manejar cambios en inputs simples (si los tienes)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Lógica para el Selector de Productos
  const addProductToSale = (product: Product) => {
    setFormData((prev) => {
      const existingItem = prev.details.find(d => d.productId === product.id);

      let newDetails;
      if (existingItem) {
        newDetails = prev.details.map(d => {
          if (d.productId === product.id) {
            const maxStock = d.stock ?? Infinity;
            return { ...d, quantity: Math.min(d.quantity + 1, maxStock) };
          }
          return d;
        });
      } else {
        newDetails = [...prev.details, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock
        }];
      }

      const newTotal = newDetails.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const roundedTotal = Number(newTotal.toFixed(2));

      return {
        ...prev,
        details: newDetails,
        total: roundedTotal
      };
    });
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    setFormData((prev) => {
      if (quantity < 0) return prev;

      const newDetails = prev.details.map(d => {
        if (d.productId === productId) {
          const maxStock = d.stock ?? Infinity;
          return { ...d, quantity: Math.min(quantity, maxStock) };
        }
        return d;
      });

      const newTotal = newDetails.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const roundedTotal = Number(newTotal.toFixed(2));

      return {
        ...prev,
        details: newDetails,
        total: roundedTotal
      };
    });
  };

  return {
    formData,
    setFormData,
    products,
    handleChange,
    addProductToSale,
    updateProductQuantity,
    isLoading,
  };
};
