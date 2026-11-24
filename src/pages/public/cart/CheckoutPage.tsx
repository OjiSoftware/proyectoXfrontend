import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutButton from '@/components/CheckoutButton';
import { ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import { ClockIcon, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDataConfirmed, setIsDataConfirmed] = useState(() => {
    return !!sessionStorage.getItem('currentSaleId');
  });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [saleId, setSaleId] = useState<number | null>(() => {
    const savedSaleId = sessionStorage.getItem('currentSaleId');
    return savedSaleId ? parseInt(savedSaleId, 10) : null;
  });

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem('temp_checkout_data');

    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      name: '',
      surname: '',
      email: '',
      dni: '',
      phone: '',
      street: '',
      number: '',
      floor: '',
      apartment: '',
      city: '',
      province: '',
      postalCode: '',
      country: '',
      reference: '',
    };
  });

  // 1. Redirección de seguridad
  useEffect(() => {
    if (cart.length === 0) {
      if (!saleId) {
        navigate('/cart');
      } else {
        navigate('/catalogo');
      }
    }
  }, [cart, navigate, saleId]);

  useEffect(() => {
    const expiresAtStr = sessionStorage.getItem('saleExpiresAt');

    if (!expiresAtStr) {
      setTimeLeft(null);
      return;
    }

    const expiresAt = new Date(expiresAtStr).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = expiresAt - now;

      if (difference <= 0) {
        sessionStorage.removeItem('currentSaleId');
        sessionStorage.removeItem('saleExpiresAt');

        setTimeLeft(0);
        setSaleId(null);

        navigate(
          `/checkout/status?status=rejected&reason=expired&external_reference=${saleId}`,
        );

        return null;
      }

      return Math.floor(difference / 1000);
    };

    const initialTime = calculateTimeLeft();
    if (initialTime !== null) setTimeLeft(initialTime);

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      if (newTime !== null) setTimeLeft(newTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, clearCart, saleId]);

  useEffect(() => {
    if (!saleId) return;

    const checkOrderStatus = async () => {
      try {
        const API_URL =
          import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API_URL}/sales/${saleId}`);

        if (res.ok) {
          const saleData = await res.json();

          if (saleData.status === 'CANCELLED') {
            const expiresAtStr = sessionStorage.getItem('saleExpiresAt');
            const now = Date.now();
            const isExpired =
              expiresAtStr && new Date(expiresAtStr).getTime() < now;

            sessionStorage.removeItem('currentSaleId');
            sessionStorage.removeItem('saleExpiresAt');
            setSaleId(null);
            setTimeLeft(null);
            setIsDataConfirmed(false);

            const reason = isExpired ? 'expired' : 'admin_cancel';

            navigate(
              `/checkout/status?status=rejected&reason=${reason}&external_reference=${saleId}`,
            );
          }
        }
      } catch (error) {
        console.error('Error verificando el estado de la orden', error);
      }
    };

    checkOrderStatus();
    const interval = setInterval(checkOrderStatus, 15000);

    return () => clearInterval(interval);
  }, [saleId, navigate]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);

    sessionStorage.setItem('temp_checkout_data', JSON.stringify(newData));
  };

  const handleConfirmData = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDataConfirmed(true);
  };

  const handleOrderCreated = useCallback((id: number) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    sessionStorage.setItem('currentSaleId', id.toString());
    sessionStorage.setItem('saleExpiresAt', expiresAt);

    setSaleId(id);
    setTimeLeft(600);
  }, []);

  const handleCancelCheckout = useCallback(async () => {
    if (saleId) {
      try {
        const API_URL =
          import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        await fetch(`${API_URL}/sales/${saleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CANCELLED',
          }),
        });
      } catch (error) {
        console.error('Error al cancelar la orden en el backend:', error);
      }
    }

    sessionStorage.removeItem('currentSaleId');
    sessionStorage.removeItem('saleExpiresAt');
    sessionStorage.removeItem('temp_checkout_data');

    setSaleId(null);
    setTimeLeft(null);
    setIsDataConfirmed(false);

    navigate('/cart');
  }, [navigate, saleId]);

  const memoizedItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    [cart],
  );

  const memoizedClientData = useMemo(
    () => ({
      ...formData,
      addresses: {
        street: formData.street,
        streetNum: parseInt(formData.number, 10) || 0,
        floor: formData.floor ? parseInt(formData.floor, 10) : undefined,
        apartment: formData.apartment || undefined,
        locality: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        reference: formData.reference || undefined,
      },
    }),
    [formData],
  );

  if (cart.length === 0 && !saleId) return null;

  const isFormInvalid = useMemo(() => {
    return (
      !formData.name.trim() ||
      !formData.surname.trim() ||
      !formData.email.trim() ||
      !formData.dni.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.number.trim() ||
      !formData.city.trim() ||
      !formData.province.trim() ||
      !formData.postalCode.trim() ||
      !formData.country.trim()
    );
  }, [formData]);

  const getTimerTheme = (seconds: number | null) => {
    if (seconds === null) return { bg: '', text: '', bar: '', inner: '' };

    if (seconds > 300) {
      return {
        bg: 'bg-[#FFF9CE] border-amber-200',
        text: 'text-[#2b99a6]',
        bar: 'bg-[#33aab8]',
        inner: 'border-amber-100',
      };
    } else if (seconds > 60) {
      return {
        bg: 'bg-[#FFF0DC] border-orange-200',
        text: 'text-amber-700',
        bar: 'bg-amber-400',
        inner: 'border-orange-100',
      };
    } else {
      return {
        bg: 'bg-red-50 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
        text: 'text-red-600',
        bar: 'bg-red-500 animate-pulse',
        inner: 'border-red-100',
      };
    }
  };

  const timerTheme = getTimerTheme(timeLeft);
  const inputClass =
    'border border-[#D5F3F4] rounded-2xl p-2.5 outline-none focus:border-[#33aab8] focus:ring-2 focus:ring-[#33aab8]/20 bg-[#F4FBFB] placeholder:text-gray-400 text-[#1A2D2A] transition-all';

  return (
    <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="w-full max-w-[1187px] mx-auto py-6 md:py-8 flex-grow px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#37b9c7] via-[#33aab8] to-[#2b99a6] p-6 md:p-8 mb-6 shadow-[0_12px_30px_-12px_rgba(43,170,176,0.45)] border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/15" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF000]" /> Paso final
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-fredoka text-[#FFF000] leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">
              Finalizar compra
            </h1>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative w-fit bg-[#FFF6B8] hover:bg-white text-[#1A2D2A] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <ChevronLeftIcon className="w-4 h-4 text-[#2b99a6]" />
            Volver al carrito
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* IZQUIERDA: Formulario */}
          <div className="flex-[0_0_100%] lg:flex-[0_0_66%] bg-white rounded-3xl shadow-sm border border-[#D5F3F4] p-6 md:p-8 w-full">
            {!isDataConfirmed ? (
              <form
                onSubmit={handleConfirmData}
                className="flex flex-col gap-6 font-nunito"
              >
                {/* SECCIÓN 1: Datos Personales */}
                <div>
                  <h2 className="text-lg font-bold text-[#2b99a6] mb-1 border-b border-[#D5F3F4] pb-2">
                    Datos personales
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Nombre *
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: Juan"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Apellido *
                      </label>
                      <input
                        required
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="juan@correo.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3d635f]">
                        DNI / CUIT *
                      </label>
                      <input
                        required
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Sin puntos"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Teléfono *
                      </label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: 3512345678"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: Dirección de Envío/Facturación */}
                <div>
                  <h2 className="text-lg font-bold text-[#2b99a6] mb-1 border-b border-[#D5F3F4] pb-2">
                    Dirección de envío
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Calle *
                      </label>
                      <input
                        required
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: Av. Rivadavia"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Número *
                      </label>
                      <input
                        required
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Altura"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#3d635f]">
                          Piso
                        </label>
                        <input
                          type="text"
                          name="floor"
                          value={formData.floor}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Opc."
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#3d635f]">
                          Depto.
                        </label>
                        <input
                          type="text"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Opc."
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Ciudad / Localidad *
                      </label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Provincia *
                      </label>
                      <input
                        required
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Provincia"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:col-span-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#3d635f]">
                          Código Postal *
                        </label>
                        <input
                          required
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Ej: 5000"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#3d635f]">
                          País *
                        </label>
                        <input
                          required
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Ej: Argentina"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-4">
                      <label className="text-sm font-bold text-[#3d635f]">
                        Referencia
                      </label>
                      <input
                        type="text"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: Casa con rejas negras..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end w-full">
                  <button
                    type="submit"
                    disabled={isFormInvalid}
                    className={`w-full mt-2 py-3.5 text-sm uppercase tracking-wider font-bold rounded-full transition-all duration-300 flex justify-center items-center ${
                      isFormInvalid
                        ? 'bg-[#33aab8]/40 text-white/80 cursor-not-allowed'
                        : 'bg-[#33aab8] text-white hover:bg-[#2b99a6] cursor-pointer shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5 active:scale-[0.98]'
                    }`}
                  >
                    Confirmar datos
                  </button>

                  <div className="h-5 relative w-full mt-2">
                    {isFormInvalid && (
                      <p className="absolute top-3 right-0 text-gray-400 text-[10px] text-right uppercase tracking-wide font-bold whitespace-nowrap">
                        * Complete todos los campos requeridos para continuar
                      </p>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 animate-in fade-in duration-500">
                <CheckCircleIcon
                  className={`w-16 h-16 ${saleId ? 'text-[#2b99a6]' : 'text-[#37b9c7]'} mb-4`}
                />
                <h2 className="text-2xl font-bold text-[#2b99a6] mb-2">
                  {saleId ? '¡Stock reservado!' : '¡Datos confirmados!'}
                </h2>
                <p className="text-[#3d635f] text-center mb-6 max-w-sm leading-relaxed">
                  {saleId ? (
                    <>
                      Tu pedido{' '}
                      <span className="font-bold text-[#2b99a6]">#{saleId}</span>{' '}
                      ya está registrado y el stock reservado. Completá el pago
                      antes de que expire el tiempo.
                    </>
                  ) : (
                    'Hacé clic en el botón de abajo para verificar stock y proceder al pago seguro.'
                  )}
                </p>

                {saleId && timeLeft !== null && timeLeft > 0 && (
                  <div className="mb-8 w-full max-w-xs transition-colors duration-500">
                    <div
                      className={`${timerTheme.bg} rounded-3xl p-4 flex flex-col items-center shadow-sm relative overflow-hidden transition-all duration-500 border`}
                    >
                      <div
                        className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-linear ${timerTheme.bar}`}
                        style={{
                          width: `${(timeLeft / 600) * 100}%`,
                        }}
                      />

                      <p
                        className={`${timerTheme.text} text-[11px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5 transition-colors duration-500`}
                      >
                        <ClockIcon
                          className={`w-3.5 h-3.5 ${timeLeft <= 60 ? 'animate-bounce' : ''}`}
                        />
                        Tu reserva expira en
                      </p>

                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`bg-white px-4 py-2 rounded-2xl shadow-inner border font-mono text-3xl font-black tabular-nums tracking-tight transition-colors duration-500 ${timerTheme.text} ${timerTheme.inner}`}
                        >
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-md">
                  <CheckoutButton
                    saleId={saleId}
                    clientData={memoizedClientData}
                    items={memoizedItems}
                    total={totalPrice}
                    onOrderCreated={handleOrderCreated}
                    disabled={timeLeft !== null && timeLeft <= 0}
                  />

                  {!saleId ? (
                    <button
                      onClick={() => setIsDataConfirmed(false)}
                      className="w-full mt-5 py-3 px-4 text-sm font-bold text-[#3d635f] bg-[#F4FBFB] border border-[#D5F3F4] rounded-full shadow-xs hover:bg-[#D5F3F4]/50 hover:text-[#2b99a6] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      Editar mis datos
                    </button>
                  ) : (
                    <div className="w-full max-w-md mt-8">
                      {!isCancelModalOpen ? (
                        <button
                          type="button"
                          onClick={() => setIsCancelModalOpen(true)}
                          className="w-full py-3 px-4 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-full shadow-xs hover:bg-red-50 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          Cancelar reserva y modificar carrito
                        </button>
                      ) : (
                        <div className="w-full p-4 bg-white border border-red-200 rounded-2xl shadow-sm">
                          <div className="flex flex-col gap-3">
                            <span className="text-xs text-red-600 text-center font-bold leading-tight">
                              ¿Seguro que querés cancelar? Se liberará el stock
                              de la orden #{saleId}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleCancelCheckout}
                                className="w-1/2 py-2.5 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                Sí, cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-1/2 py-2.5 bg-gray-100 text-[#3d635f] text-xs font-bold rounded-full hover:bg-gray-200 transition-all cursor-pointer"
                              >
                                No, volver
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DERECHA: Resumen de orden estático */}
          <div className="flex-[0_0_100%] lg:flex-[1_1_32%] bg-gradient-to-br from-[#FFF9CE] to-[#FFF29C] rounded-3xl shadow-md border border-amber-200/70 p-6 sticky top-8 flex flex-col gap-3 font-nunito w-full">
            <h3 className="font-bold text-lg text-[#2b99a6] border-b border-amber-200/70 pb-3 mb-1">
              Resumen de tu pedido
            </h3>

            <div className="flex flex-col gap-2 pb-3 border-b border-amber-200/70">
              <div className="flex justify-between items-center text-sm font-semibold text-[#3d635f]">
                <span>Subtotal ({totalItems} artículos):</span>
                <span>
                  $
                  {totalPrice.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-2 mt-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#3d635f] text-base">
                  Total Final:
                </span>
                <span className="font-black text-2xl text-[#2b99a6]">
                  $
                  {totalPrice.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="bg-white/75 rounded-2xl p-3.5 mt-1 border border-amber-200/60">
              <p className="text-xs text-[#3d635f] text-center leading-relaxed font-semibold">
                Al confirmar tus datos, se generará una orden de compra en
                nuestro sistema. El pago se procesa de forma 100% segura a
                través de Mercado Pago.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
