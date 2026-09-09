import { useState, useEffect } from 'react';
import { productApi } from '@/services/ProductService';
import { saleApi } from '@/services/SaleService';
import { Product } from '@/types/product.types';

export const useSaleEdit = (saleId: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState<number | null>(null);
  const [initialStatus, setInitialStatus] = useState<string>('PENDING');

  const [formData, setFormData] = useState({
    status: 'PENDING',
    notes: '',
    total: 0,
    details: [] as any[],
    name: '',
    surname: '',
    dni: '',
    phoneNumber: '',
    email: '',
    street: '',
    number: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    floor: '',
    apartment: '',
    reference: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!saleId) return;
      try {
        setIsLoading(true);
        const [productsData, saleData] = await Promise.all([
          productApi.getAllProducts(),
          saleApi.getById(saleId),
        ]);

        setProducts(productsData);

        if (saleData) {
          setClientId(saleData.clientId);
          setInitialStatus(saleData.status || 'PENDING');
          const address = saleData.client?.addresses?.[0] || {};

          const mappedDetails = saleData.details.map((d: any) => {
            const product = productsData.find((p: any) => p.id === d.productId);

            const price = d.unitaryPrice
              ? Number(d.unitaryPrice)
              : Number(product?.price || 0);

            const actualAvailableStock = (product?.stock || 0) + d.quantity;

            return {
              productId: d.productId,
              name: product?.name || 'Producto desconocido',
              price: price,
              quantity: d.quantity,
              stock: actualAvailableStock,
            };
          });

          setFormData({
            status: saleData.status || 'PENDING',
            notes: saleData.notes || '',
            total: Number(saleData.total) || 0,
            details: mappedDetails,
            name: saleData.client?.name || '',
            surname: saleData.client?.surname || '',
            dni: saleData.client?.dni || '',
            phoneNumber: saleData.client?.phoneNumber || '',
            email: saleData.client?.email || '',
            street: address.street || '',
            number: address.streetNum ? address.streetNum.toString() : '',
            city: address.locality || '',
            province: address.province || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
            floor: address.floor ? address.floor.toString() : '',
            apartment: address.apartment || '',
            reference: address.reference || '',
          });
        }
      } catch (error) {
        console.error('Error cargando la venta', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [saleId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addProductToSale = (product: Product) => {
    setFormData((prev) => {
      const existingItem = prev.details.find((d) => d.productId === product.id);

      let newDetails;
      if (existingItem) {
        newDetails = prev.details.map((d) => {
          if (d.productId === product.id) {
            const maxStock = d.stock ?? Infinity;
            return { ...d, quantity: Math.min(d.quantity + 1, maxStock) };
          }
          return d;
        });
      } else {
        newDetails = [
          ...prev.details,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            stock: product.stock,
          },
        ];
      }

      const newTotal = newDetails.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      const roundedTotal = Number(newTotal.toFixed(2));

      return {
        ...prev,
        details: newDetails,
        total: roundedTotal,
      };
    });
  };
  const updateProductQuantity = (productId: number, quantity: number) => {
    setFormData((prev) => {
      const newDetails = prev.details.map((d) => {
        if (d.productId === productId) {
          const maxStock = d.stock ?? Infinity;
          const validatedQuantity =
            quantity === 0 ? 0 : Math.min(quantity, maxStock);
          return { ...d, quantity: validatedQuantity };
        }
        return d;
      });

      const newTotal = newDetails.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      const roundedTotal = Number(newTotal.toFixed(2));

      return {
        ...prev,
        details: newDetails,
        total: roundedTotal,
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
    clientId,
    initialStatus,
  };
};
