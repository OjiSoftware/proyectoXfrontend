import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TerminosPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-8 lg:py-12 flex-grow flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 w-full flex-1 flex flex-col relative overflow-hidden">

          <div className="relative z-10 w-full flex flex-col items-start lg:block">
            <h1 className="text-[1.1rem] lg:text-[1.2rem] font-bold font-poppins text-[#2f3027] text-left leading-tight pb-4">
              Términos y Condiciones
            </h1>

            <div className="text-[14px] md:text-[16px] text-gray-500 font-lato max-w-4xl space-y-6 text-left leading-relaxed">
              <p>
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">1. Aceptación de los Términos y Uso del Website</h3>
              <p>
                Al acceder y utilizar el sitio web de ElementAll (en adelante "el Website"), el usuario (en adelante "el Usuario") acepta estar sujeto a los presentes Términos y Condiciones. Para la utilización del Website, el Usuario declara bajo juramento tener 18 (dieciocho) años de edad o más. Si el usuario fuera menor de edad, los padres, tutores y/o responsables serán exclusiva y plenamente responsables por el uso del Website por parte de éstos.
              </p>
              <p className="mt-2">
                La registración como Usuario es libre y gratuita. Quien la intente deberá brindar información veraz, completa y precisa, siendo el único responsable por la misma. No se permite la utilización del Website para actividades contrarias a la ley, moral, buenas costumbres, ni para violar derechos de propiedad intelectual, divulgar datos de terceros sin autorización, o interferir con el normal funcionamiento de los servidores de la empresa.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">2. Información de Productos y Disponibilidad</h3>
              <p>
                Si bien nos esforzamos en que la información publicada en nuestro Website, incluyendo descripciones de productos, características técnicas y fotografías, sea lo más precisa posible, pueden existir errores involuntarios. Las fotografías son de carácter ilustrativo.
              </p>
              <p className="mt-2">
                La disponibilidad de los productos anunciados está sujeta al movimiento diario del inventario de ElementAll S.R.L. Es posible que algunos artículos seleccionados no se encuentren en stock al momento de preparar la orden.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">3. Condiciones Comerciales, Precios y Pago</h3>
              <p>
                Los precios exhibidos en la tienda online están expresados en pesos argentinos e incluyen IVA. Los precios pueden variar con los que constan en las sucursales físicas y pueden sufrir modificaciones. Las compras online podrán realizarse con los medios de pago disponibles expresamente en el proceso de Checkout. ElementAll no recolecta ni almacena datos de su tarjeta de crédito o débito, siendo esto responsabilidad de cada entidad procesadora de pagos (ej: MercadoPago u otras pasarelas).
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">4. Entregas de Pedidos</h3>
              <p>
                Para la recepción o retiro de los pedidos es indispensable presentar un documento de identidad original que acredite que la persona es mayor de 18 años. En el caso de entregas a domicilio donde el titular no se encuentre presente, se debe dejar explícito previamente quién será el adulto responsable autorizado para recibir la compra.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">5. Derecho de Revocación y Cambios</h3>
              <p>
                De acuerdo a la Ley N° 24.240 y Res. 424/2020 de la República Argentina, el consumidor tiene derecho a revocar la aceptación del producto dentro de los 10 (diez) días corridos desde la entrega del bien. En el Website disponemos de un "Botón de Arrepentimiento" para facilitar este trámite. El producto debe devolverse en perfecto estado, con sus accesorios y empaque original. Se sugiere conservar la factura y remito.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">6. Propiedad Intelectual</h3>
              <p>
                Todos los elementos visuales, logotipos, código fuente, textos y bases de datos del Website son propiedad única de ElementAll S.R.L. y de sus desarrolladores (OJI Software). Queda prohibida la copia, reproducción, scraping, venta o explotación comercial del Website sin autorización expresa.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">7. Garantías</h3>
              <p>
                ElementAll S.R.L. no otorga ninguna garantía distinta de la garantía legal mínima establecida en la Ley 24.240 de Defensa del Consumidor, con relación a los productos comercializados en el Website, ni será responsable por los daños o perjuicios ocasionados al Usuario o a terceros con motivo o en ocasión del uso indebido de los mismos.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">8. Fallas en el Sistema</h3>
              <p>
                No garantizamos la inexistencia de eventuales dificultades técnicas o fallas en los sistemas o en Internet que eventualmente puedan impedir o dificultar el uso del Sitio Web. El sistema puede no estar disponible debido a mantenimientos programados, fallas de conectividad ajenas a la empresa, o casos fortuitos.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">9. Legislación y Jurisdicción</h3>
              <p>
                Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier conflicto que surja en relación con este sitio web se someterá a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Córdoba, Provincia de Córdoba.
              </p>

            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
