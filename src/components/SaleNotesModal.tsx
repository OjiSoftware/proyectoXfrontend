import { useState, useEffect } from 'react';
import { saleApi } from '@/services/SaleService';
import { Sale } from '@/types/sale.types';
import { MessageSquareText, X } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

interface SaleNotesModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SaleNotesModal({
  isOpen,
  sale,
  onClose,
  onSuccess,
}: SaleNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirmOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isConfirmOpen]);

  useEffect(() => {
    if (sale) {
      setNotes((sale as any).notes || '');
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      await saleApi.update(sale.id.toString(), {
        status: sale.status,
        notes: notes,
        details: sale.details.map((d: any) => ({
          productId: d.productId,
          quantity: d.quantity,
        })),
      });
      setIsConfirmOpen(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar la nota', error);
      alert('Hubo un error al guardar el comentario.');
    } finally {
      setIsLoading(false);
    }
  };

  // Variable para saber si el botón debe estar bloqueado
  const isSaveDisabled = isLoading || !notes.trim();

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <div
          className="bg-[#0C0A15]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 md:p-8 w-full max-w-md md:max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left transform transition-all duration-300 animate-fade-in flex flex-col h-auto max-h-[90vh] ring-1 ring-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4 shrink-0">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquareText
                className="text-indigo-400 shrink-0"
                size={20}
              />
              <span className="truncate">Notas de la venta #{sale.id}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-rose-400 hover:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer p-1 shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body / Formulario */}
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 mb-6 shrink-0 shadow-inner">
            <h3 className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-2 md:mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
              Comentarios Administrativos
            </h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Agregá notas internas, recordatorios o aclaraciones sobre esta
              venta.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: El cliente solicitó factura A después de la compra..."
              className="w-full bg-[#151320] border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-600 resize-none h-32 md:h-40"
            />
          </div>

          {/* Footer / Botones y Validación */}
          <div className="flex flex-col items-end w-full shrink-0 border-t border-white/5 pt-5">
            <div className="flex flex-col-reverse md:flex-row gap-3 w-full">
              <button
                className="flex-1 w-full px-5 py-3 md:py-2.5 font-bold rounded-2xl text-sm border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white active:scale-95"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isSaveDisabled}
                className={`flex-1 w-full px-5 py-3 md:py-2.5 font-bold rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 border
                  ${
                    isSaveDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 border-white/5 pointer-events-none'
                      : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  }`}
              >
                Guardar notas
              </button>
            </div>

            {/* Mensajito de validación */}
            <div className="h-5 relative w-full mt-1">
              {isSaveDisabled && !isLoading && (
                <p className="absolute top-2 right-0 text-slate-500 text-[10px] text-right uppercase tracking-wide font-medium">
                  * Escriba un comentario para guardar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Guardar notas"
        message="¿Estás seguro de que deseas registrar estos comentarios administrativos en la venta?"
        confirmText="Guardar"
        cancelText="Revisar"
        variant="success"
        isLoading={isLoading}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

