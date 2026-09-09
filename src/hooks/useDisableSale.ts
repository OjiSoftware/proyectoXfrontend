import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sale } from '../types/sale.types';
import { saleApi } from '../services/SaleService';

export function useDisableSale(
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>,
) {
  const [loading, setLoading] = useState(false);

  const disableSale = async (id: number, options?: { silent?: boolean }) => {
    setLoading(true);

    try {
      await saleApi.update(id.toString(), {
        status: 'CANCELLED',
        silent: options?.silent,
      });

      setSales((prev) =>
        prev.map(
          (s): Sale => (s.id === id ? { ...s, status: 'CANCELLED' } : s),
        ),
      );

      if (options?.silent) {
        toast.success('Venta cancelada en silencio 🤫');
      } else {
        toast.success('Venta cancelada y cliente notificado 📧');
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudo deshabilitar la venta');
    } finally {
      setLoading(false);
    }
  };

  return { disableSale, loading };
}
