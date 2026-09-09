import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PrivacidadPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-8 lg:py-12 flex-grow flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 w-full flex-1 flex flex-col relative overflow-hidden">

          <div className="relative z-10 w-full flex flex-col items-start lg:block">
            <h1 className="text-[1.8rem] md:text-[2.2rem] font-bold font-poppins mb-6 text-[#2f3027] leading-tight text-left">
              Políticas de Privacidad
            </h1>

            <div className="text-[14px] md:text-[16px] text-gray-500 font-lato max-w-4xl space-y-6 text-left leading-relaxed">
              <p>
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">1. Introducción y Registro de Base de Datos</h3>
              <p>
                En ElementAll S.R.L. respetamos y protegemos la privacidad de nuestros usuarios ('Datos Personales'). Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y compartimos la información. Los datos proporcionados se incluirán en una Base de Datos de clientes de nuestra titularidad, y serán tratados según las disposiciones de la Ley 25.326 de Protección de Datos Personales y su Decreto Reglamentario 1558/2001.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">2. Recopilación de Información</h3>
              <p>
                Podremos solicitarle: i) datos de identificación (tipo y número de documento, nombre y apellido, CUIT), y ii) datos de contacto (teléfono, domicilio, correo electrónico). Al registrarse para adquirir bienes, también podremos requerir datos impositivos (categoría de IVA) y datos de pagos necesarios para efectuar transacciones. De negarse a proporcionar los Datos Personales requeridos, la consecuencia será que no podrá registrarse ni realizar contrataciones en el sitio.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">3. Finalidad y Uso de la Información</h3>
              <p>
                La información personal recopilada se utiliza para:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Verificar su identidad y cumplir con nuestras obligaciones legales y contractuales.</li>
                <li>Procesar sus compras, emitir comprobantes y registrar la entrega de los productos.</li>
                <li>Elaborar estadísticas, estudios de mercado y perfiles de consumo.</li>
                <li>Remitir publicidad, newsletters, novedades e información de marketing promocional (de la cual puede desuscribirse en cualquier momento).</li>
                <li>Brindarle atención al cliente y gestionar quejas o sugerencias.</li>
              </ul>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">4. Plazo de Conservación de los Datos</h3>
              <p>
                ElementAll conservará sus Datos Personales por el tiempo necesario para el cumplimiento de las finalidades descritas en la presente Política y de las obligaciones legales/fiscales. Su información será destruida cuando haya dejado de ser necesaria, salvo obligación legal de conservarla por un término mayor.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">5. Derechos del Titular (Acceso, Rectificación y Supresión)</h3>
              <p>
                Usted tiene la facultad de ejercer el derecho de acceso a sus Datos Personales en forma gratuita a intervalos no inferiores a seis meses. Asimismo, tiene derecho a solicitar la rectificación, actualización o supresión de sus datos, contactándose mediante nuestra sección de Contacto o enviando un e-mail a contacto@elementall.com.ar, previa acreditación de su identidad.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">6. Uso de Cookies</h3>
              <p>
                El Sitio Web utiliza una tecnología de identificación basada en "cookies", necesaria para brindar un mejor servicio. Las cookies son ficheros de texto que quedan almacenados en su navegador. No sirven para identificar indirectamente a una persona determinada de forma inequívoca al navegar genéricamente, pero mejoran la funcionalidad. Usted puede configurar su navegador para no aceptar cookies, aunque esto podría afectar el correcto funcionamiento del sitio.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">7. Cesión de Datos a Terceros</h3>
              <p>
                ElementAll no vende su información. Sin embargo, para cumplir con obligaciones asumidas (ej. compras), necesitamos compartir sus Datos Personales con terceros estrictamente necesarios para la prestación del servicio (proveedores de logística/envíos, procesadores de pago como MercadoPago, proveedores de hosting). Éstos deberán adoptar las medidas técnicas para garantizar la confidencialidad de los mismos.
              </p>

              <h3 className="text-[0.8rem] lg:text-[0.9rem] font-bold font-poppins text-[#2f3027] mt-8 mb-3">8. Seguridad</h3>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger su información personal contra accesos no autorizados o alteraciones. No obstante, ninguna transmisión a través de Internet es 100% segura.
              </p>


            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
