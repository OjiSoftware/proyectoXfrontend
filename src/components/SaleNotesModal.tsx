import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { saleApi } from '@/services/SaleService';
import { Sale } from '@/types/sale.types';
import { MessageSquareText, X, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import toast from 'react-hot-toast';

interface SaleNotesModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  onSuccess: (updatedNotes: string) => void;
}

export function SaleNotesModal({
  isOpen,
  sale,
  onClose,
  onSuccess,
}: SaleNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSale, setIsFetchingSale] = useState(false);
  const [fullDetails, setFullDetails] = useState<Array<{ productId: number; quantity: number }>>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirmOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isConfirmOpen, isLoading]);

  useEffect(() => {
    let active = true;
    const loadSaleContext = async () => {
      if (!isOpen || !sale) return;

      const currentNote = sale.notes || '';
      setNotes(currentNote);
      setInitialNotes(currentNote);

      const inlineDetails = Array.isArray(sale.details)
        ? sale.details.map((d) => ({
            productId: Number(d.productId),
            quantity: Number(d.quantity),
          }))
        : [];
      setFullDetails(inlineDetails);

      try {
        setIsFetchingSale(true);
        const remoteSale = await saleApi.getById(sale.id.toString());
        if (!active || !remoteSale) return;

        if (typeof remoteSale.notes === 'string') {
          setNotes(remoteSale.notes);
          setInitialNotes(remoteSale.notes);
        }
        if (Array.isArray(remoteSale.details) && remoteSale.details.length > 0) {
          setFullDetails(
            remoteSale.details.map((d: any) => ({
              productId: Number(d.productId),
              quantity: Number(d.quantity),
            })),
          );
        }
      } catch {
        // Si falla la carga extra, mantenemos los datos que ya traía la fila
      } finally {
        if (active) setIsFetchingSale(false);
      }
    };

    loadSaleContext();
    return () => {
      active = false;
    };
  }, [isOpen, sale]);

  if (!isOpen || !sale) return null;

  const trimmedNotes = notes.trim();
  const trimmedInitial = initialNotes.trim();
  const hasChanged = trimmedNotes !== trimmedInitial;
  const isSaveDisabled = isLoading || isFetchingSale || !hasChanged;

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = {
        status: sale.status,
        notes: trimmedNotes,
      };

      if (fullDetails.length > 0) {
        payload.details = fullDetails;
      }

      await saleApi.update(sale.id.toString(), payload);
      toast.success(
        trimmedNotes
          ? 'Comentario guardado correctamente.'
          : 'Comentario eliminado de la venta.',
      );
      setIsConfirmOpen(false);
      onSuccess(trimmedNotes);
      onClose();
    } catch (error) {
      console.error('Error al guardar la nota', error);
      toast.error('No se pudo guardar el comentario de la venta.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-poppins"
        onClick={() => !isLoading && onClose()}
      >
        <div
          className="bg-[#0C0A15]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 md:p-7 w-full max-w-[560px] shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left transform transition-all duration-300 animate-fade-in flex flex-col h-auto max-h-[90vh] ring-1 ring-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <MessageSquareText size={19} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-bold text-slate-100 truncate">
                  Comentarios de la venta #{sale.id}
                </h2>
                <p className="text-[11px] text-slate-400 truncate">
                  Observaciones internas y seguimiento administrativo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer p-1 shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body / Formulario */}
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 mb-5 shrink-0 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <h3 className="text-[10px] md:text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                Nota Administrativa
              </h3>
              {notes.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => setNotes('')}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  title="Borrar contenido de la nota"
                >
                  <Trash2 size={12} />
                  Limpiar texto
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Agregá o editá notas internas, aclaraciones de cobro, cambios o recordatorios sobre esta operación.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isFetchingSale || isLoading}
              placeholder={
                isFetchingSale
                  ? 'Cargando comentario actual...'
                  : 'Ej: El cliente abonó diferencia en efectivo / Revisar stock...'
              }
              className="w-full bg-[#151320] border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 resize-none h-32 md:h-36"
            />
          </div>

          {/* Footer / Botones y Validación */}
          <div className="flex flex-col items-end w-full shrink-0 border-t border-white/5 pt-4">
            <div className="flex flex-col-reverse md:flex-row gap-3 w-full">
              <button
                type="button"
                className="btn btn-md btn-ghost flex-1 w-full rounded-2xl"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={isSaveDisabled}
                className="btn btn-md btn-success flex-1 w-full rounded-2xl"
              >
                {trimmedNotes === '' && trimmedInitial !== ''
                  ? 'Eliminar comentario'
                  : 'Guardar comentario'}
              </button>
            </div>

            {/* Mensajito de validación */}
            <div className="h-5 relative w-full mt-1">
              {!hasChanged && !isLoading && !isFetchingSale && (
                <p className="absolute top-2 right-0 text-slate-500 text-[10px] text-right uppercase tracking-wide font-medium">
                  * Modifique el comentario para guardar cambios
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={
          trimmedNotes === '' && trimmedInitial !== ''
            ? 'Eliminar comentario'
            : 'Guardar comentario'
        }
        message={
          trimmedNotes === '' && trimmedInitial !== ''
            ? '¿Estás seguro de que deseas borrar el comentario administrativo de esta venta?'
            : '¿Estás seguro de que deseas actualizar los comentarios administrativos en la venta?'
        }
        confirmText="Confirmar"
        cancelText="Revisar"
        variant={trimmedNotes === '' && trimmedInitial !== '' ? 'danger' : 'success'}
        isLoading={isLoading}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>,
    document.body,
  );
}
