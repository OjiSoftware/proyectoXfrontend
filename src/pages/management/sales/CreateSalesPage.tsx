import DashboardLayout from "@/layouts/DashboardLayout";
import { useSaleForm } from "@/hooks/useSaleForm";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useState } from "react";
import { ShoppingCart, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { TrashIcon } from "@heroicons/react/20/solid";
import ProductSelector from "@/components/ProductsSelector";
import { saleApi } from "@/services/SaleService";
import { clientApi } from "@/services/ClientService";

export default function CreateSalePage() {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  const {
    formData,
    setFormData,
    products,
    addProductToSale,
    updateProductQuantity,
    handleChange,
    isLoading,
  } = useSaleForm();

  const removeItem = (productId: number) => {
    const itemToRemove = formData.details.find(
      (d) => d.productId === productId,
    );
    if (!itemToRemove) return;

    const newTotal =
      formData.total - Number(itemToRemove.price) * itemToRemove.quantity;
    setFormData({
      ...formData,
      details: formData.details.filter((d) => d.productId !== productId),
      total: Number(newTotal.toFixed(2)),
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(formData.dni)) {
      alert('El DNI debe tener entre 7 y 8 números sin puntos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (formData.details.length === 0) {
      alert('Por favor, agrega al menos un producto a la venta.');
      return;
    }

    if (formData.status === '') {
      alert('Por favor, selecciona un estado para la venta.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const clientPayload = {
        name: formData.name,
        surname: formData.surname,
        dni: formData.dni,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
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
      };
      const clientResponse = await clientApi.create(clientPayload);
      const newClientId = clientResponse.id || clientResponse.client?.id;

      const payload = {
        clientId: newClientId,
        status: formData.status,
        sendEmail: sendEmail,
        details: formData.details.map((d) => ({
          productId: d.productId,
          quantity: d.quantity,
        })),
      };

      await saleApi.create(payload);
      setShowConfirmModal(false);
      navigate('/management/sales');
    } catch (error) {
      console.error('Error al crear la venta o el cliente', error);
      alert('Hubo un error al registrar la venta.');
    }
  };

  const isFormInvalid =
    !formData.name.trim() ||
    !formData.surname.trim() ||
    !formData.dni.trim() ||
    !formData.email.trim() ||
    !formData.street.trim() ||
    !formData.number.trim() ||
    !formData.city.trim() ||
    !formData.postalCode.trim() ||
    !formData.country.trim() ||
    !formData.province.trim() ||
    formData.details.length === 0 ||
    isLoading;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 min-h-full flex flex-col justify-center pb-48">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end mb-4">
          <div>
            <button
              onClick={() => navigate('/management/sales')}
              className="text-xs px-2 py-1 -ml-2 text-brand-400 hover:text-brand-300 mb-3 flex items-center gap-1 cursor-pointer"
            >
              ? Volver
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="text-brand-400" size={24} />
              Nueva venta
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none cursor-pointer w-full md:w-auto md:min-w-[160px]"
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="bg-slate-800/80 border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-6"
        >
          <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-800/50">
            <button
              type="button"
              onClick={() => setIsClientOpen(!isClientOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="text-brand-400" size={20} />
                <h2 className="text-xs md:text-xs font-semibold text-white uppercase">
                  Datos del cliente y facturación
                </h2>
              </div>
              {isClientOpen ? (
                <ChevronUp className="text-gray-400" size={20} />
              ) : (
                <ChevronDown className="text-gray-400" size={20} />
              )}
            </button>

            {isClientOpen && (
              <div className="p-4 border-t border-white/5 space-y-4 shadow-inner">
                <h3 className="text-brand-400 text-xs font-semibold border-b border-white/10 pb-1 uppercase">
                  Información personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Nombre <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      placeholder="Ej: Juan"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Apellido <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      placeholder="Ej: Pérez"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      DNI <span className="font-bold">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="Sin puntos"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Teléfono <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      placeholder="+54 9 11..."
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-end">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Correo electrónico <span className="font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        placeholder="correo@ejemplo.com"
                        className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>

                    {/* Checkbox inteligente */}
                    <label
                      className={`flex items-center gap-2 mt-3 cursor-pointer group transition-opacity ${
                        formData.status !== 'COMPLETED'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'opacity-100'
                      }`}
                      title={
                        formData.status !== 'COMPLETED'
                          ? 'Solo disponible para ventas completadas'
                          : ''
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.status === 'COMPLETED' ? sendEmail : false
                        } // Forzamos false si no es COMPLETED
                        disabled={formData.status !== 'COMPLETED'}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-500 text-brand-500 bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-[10px] text-gray-400 uppercase group-hover:text-gray-200 transition-colors">
                        Enviar confirmación automática a este correo
                      </span>
                    </label>
                  </div>
                </div>

                <h3 className="text-brand-400 text-xs font-semibold border-b border-white/10 pb-1 mt-6 uppercase">
                  Dirección de facturación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Calle <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      autoComplete="address-line1"
                      placeholder="Ej: Av. Rivadavia"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Número <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      autoComplete="address-line2"
                      placeholder="Altura"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Piso
                      </label>
                      <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        autoComplete="address-line3"
                        placeholder="Opc."
                        className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Depto.
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        autoComplete="address-line4"
                        placeholder="Opc."
                        className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Ciudad / Localidad <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      placeholder="Ciudad"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Provincia <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      autoComplete="address-level1"
                      placeholder="Provincia"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Código postal <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      autoComplete="postal-code"
                      placeholder="Ej: 1000"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      País <span className="font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      autoComplete="country-name"
                      placeholder="País"
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Referencia
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="Ej: Esquina con pared azul..."
                      className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-brand-400 text-xs font-semibold border-b border-white/10 pb-1 mb-4 uppercase">
              Productos de la venta
            </h3>
            <ProductSelector
              products={products}
              onProductSelect={addProductToSale}
            />
          </div>

          {/* MOBILE cards */}
          <div className="md:hidden space-y-3">
            {formData.details.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-white">{item.name}</div>
                  <button
                    type="button"
                    title="Eliminar producto"
                    className="text-red-500 hover:text-red-400 transition cursor-pointer"
                    onClick={() => removeItem(item.productId)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Cantidad</span>

                  {/* NUEVO SELECTOR MOBILE */}
                  <div className="flex items-center bg-slate-700 border border-gray-500 rounded-lg h-8 shadow-sm transition-all focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-400 overflow-hidden w-fit">
                    <button
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-gray-400 hover:bg-slate-600 hover:text-red-400 transition-colors cursor-pointer active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        updateProductQuantity(
                          item.productId,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 12h-15"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                          updateProductQuantity(item.productId, 0);
                          return;
                        }
                        const val = parseInt(rawValue, 10);
                        if (!isNaN(val)) {
                          updateProductQuantity(
                            item.productId,
                            Math.min(Math.max(1, val), item.stock ?? Infinity),
                          );
                        }
                      }}
                      onBlur={() => {
                        if (item.quantity < 1)
                          updateProductQuantity(item.productId, 1);
                      }}
                      className="w-10 h-full text-center bg-transparent border-none font-bold text-white text-xs focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      type="button"
                      disabled={
                        item.stock !== undefined && item.quantity >= item.stock
                      }
                      className={`w-8 h-full flex items-center justify-center transition-colors ${
                        item.stock !== undefined && item.quantity >= item.stock
                          ? 'text-gray-500 bg-slate-800 cursor-not-allowed'
                          : 'text-gray-400 hover:bg-slate-600 hover:text-green-400 cursor-pointer active:bg-slate-500'
                      }`}
                      onClick={() =>
                        updateProductQuantity(
                          item.productId,
                          Math.min(item.stock ?? Infinity, item.quantity + 1),
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                  </div>
                  {/* FIN NUEVO SELECTOR MOBILE */}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Precio</span>
                  <span className="text-gray-300">
                    {Number(item.price).toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-brand-300">
                    {(Number(item.price) * item.quantity).toLocaleString(
                      'es-AR',
                      {
                        style: 'currency',
                        currency: 'ARS',
                      },
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP Table */}
          <div className="hidden md:block overflow-x-auto bg-slate-800/50 rounded-xl border border-white/10">
            <table className="w-full text-center text-gray-300 text-xs">
              <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Le agregamos el 'index' al map para poder enumerar */}
                {formData.details.map((item, index) => (
                  <tr key={item.productId}>
                    <td className="px-4 py-3 text-left text-gray-500 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-left font-medium text-white">
                      {item.name}
                    </td>

                    {/* Cantidad: Centrado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center mx-auto bg-slate-700 border border-gray-500 rounded-lg h-8 shadow-sm transition-all focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-400 overflow-hidden w-fit">
                        <button
                          type="button"
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:bg-slate-600 hover:text-red-400 transition-colors cursor-pointer active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            updateProductQuantity(
                              item.productId,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 12h-15"
                            />
                          </svg>
                        </button>

                        <input
                          type="number"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            if (rawValue === '') {
                              updateProductQuantity(item.productId, 0);
                              return;
                            }
                            const val = parseInt(rawValue, 10);
                            if (!isNaN(val)) {
                              updateProductQuantity(
                                item.productId,
                                Math.min(
                                  Math.max(1, val),
                                  item.stock ?? Infinity,
                                ),
                              );
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity < 1)
                              updateProductQuantity(item.productId, 1);
                          }}
                          className="w-10 h-full text-center bg-transparent border-none font-bold text-white text-xs focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          disabled={
                            item.stock !== undefined &&
                            item.quantity >= item.stock
                          }
                          className={`w-8 h-full flex items-center justify-center transition-colors ${
                            item.stock !== undefined &&
                            item.quantity >= item.stock
                              ? 'text-gray-500 bg-slate-800 cursor-not-allowed'
                              : 'text-gray-400 hover:bg-slate-600 hover:text-green-400 cursor-pointer active:bg-slate-500'
                          }`}
                          onClick={() =>
                            updateProductQuantity(
                              item.productId,
                              Math.min(
                                item.stock ?? Infinity,
                                item.quantity + 1,
                              ),
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Precio: Centrado */}
                    <td className="px-4 py-3">
                      {Number(item.price).toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      })}
                    </td>

                    {/* Subtotal: Centrado */}
                    <td className="px-4 py-3 font-bold text-brand-300">
                      {(Number(item.price) * item.quantity).toLocaleString(
                        'es-AR',
                        {
                          style: 'currency',
                          currency: 'ARS',
                        },
                      )}
                    </td>

                    {/* Acción: Centrada */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        title="Eliminar producto"
                        className="text-red-500 hover:text-red-400 transition cursor-pointer mx-auto flex"
                        onClick={() => removeItem(item.productId)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start pt-4 border-t border-white/10 gap-4 mt-4">
            <div className="text-xl font-bold text-white self-end md:self-auto">
              Total:{' '}
              <span className="text-green-400">
                {Number(formData.total).toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                })}
              </span>
            </div>

            <div className="flex flex-col items-end w-full md:w-auto">
              <div className="flex flex-row gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/management/sales')}
                  className="flex-1 md:flex-none md:min-w-35 px-4 py-3 text-xs font-bold rounded-lg border border-slate-600 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-slate-500/20 hover:text-white hover:border-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isFormInvalid}
                  className={`flex-1 md:flex-none md:min-w-35 px-4 py-3 text-xs font-bold rounded-lg transition-all duration-300
                                      ${
                                        isFormInvalid
                                          ? 'bg-emerald-600 text-white cursor-not-allowed opacity-50'
                                          : 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                      }`}
                >
                  Finalizar venta
                </button>
              </div>

              <div className="h-5 relative w-full">
                {isFormInvalid && !isLoading && (
                  <p className="absolute top-4 right-0 text-slate-500 text-[10px] text-right uppercase tracking-wide font-medium whitespace-nowrap">
                    * Complete todos los campos requeridos para guardar
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        <ConfirmModal
          isOpen={showConfirmModal}
          title="Confirmar venta"
          variant="success"
          message={
            <div className="text-slate-300 text-xs">
              ¿Estás seguro de registrar esta venta por un total de
              <b className="text-white ml-1 font-bold">
                {Number(formData.total).toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                })}
              </b>
              ?
            </div>
          }
          isLoading={isLoading}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          confirmText="Confirmar"
          cancelText="Revisar"
        />
      </div>
    </DashboardLayout>
  );
}

