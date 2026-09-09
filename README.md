# 💻 ElementAll - Frontend App

La interfaz de usuario de **ElementAll**, diseñada para ofrecer una experiencia administrativa y de compra rápida, moderna y responsiva.

---

## Tecnologías
- **React 19**: Biblioteca UI de última generación.
- **Vite**: Herramienta de construcción ultra veloz.
- **Tailwind CSS**: Framework CSS para diseño ágil.
- **Flowbite React**: Componentes UI pre-construidos y estilizados.
- **React Router Dom**: Manejo de navegación SPA.
- **Lucide React**: Set de iconos modernos y ligeros.

---

## Características UI
- **Dashboard Administrativo**: Gestión de ventas y productos en tiempo real.
- **Checkout Dinámico**: Integración con el sistema de reservas y MercadoPago.
- **Diseño Responsivo**: Adaptado para tablets y escritorio.
- **Feedback en tiempo real**: Notificaciones visuales con `react-hot-toast`.

---

## Instalación y Uso

### 1. Preparación
```bash
npm install
```

### 2. Configuración
Crea un archivo `.env` en la raíz de esta carpeta con la URL de la API:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Ejecución
```bash
npm run dev
```
La aplicación estará disponible en la URL que indique la terminal (por defecto `http://localhost:5173`).

---

## Estructura de Carpetas (`/src`)
- **`components/`**: Componentes reutilizables (Botones, Modales, Tablas).
- **`pages/`**: Vistas principales de la aplicación.
- **`services/`**: Cliente de API y funciones de fetch.
- **`hooks/`**: Lógica de React personalizada.
- **`types/`**: Interfaces de TypeScript compartidas con el backend.
- **`context/`**: Manejo de estado global (Auth, Carrito).

---

## Guía de Estilo
El proyecto utiliza una paleta de colores moderna basada en HSL y el sistema de diseño de **Flowbite**. Para añadir nuevos estilos, se recomienda usar clases de Tailwind directamente en los componentes para mantener la consistencia.

---

Desarrollado para el ecosistema **ElementAll**.
