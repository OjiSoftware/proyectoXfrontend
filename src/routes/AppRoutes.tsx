import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Productos
import ProductsPage from "@/pages/management/products";
import CreateProductPage from "@/pages/management/products/CreateProductPage";
import EditProductPage from "@/pages/management/products/EditProductPage";

// Dashboard y Reportes
import DashboardPage from "@/pages/management/dashboard";
import ReportsPage from "@/pages/management/reports";

// Marcas
import BrandsPage from "@/pages/management/brands";
import CreateBrandPage from "@/pages/management/brands/CreateBrandPage";
import EditBrandPage from "@/pages/management/brands/EditBrandPage";

// Categorias
import CategoriesPage from "@/pages/management/categories";
import CreateCategoryPage from "@/pages/management/categories/CreateCategoryPage";
import EditCategoryPage from "@/pages/management/categories/EditCategoryPage";

// Subcategorias
import SubCategoriesPage from "@/pages/management/subcategories";
import CreateSubCategoryPage from "@/pages/management/subcategories/CreateSubCategoryPage";
import EditSubCategoryPage from "@/pages/management/subcategories/EditSubCategoryPage";

// Ventas
import SalesPage from "@/pages/management/sales";
import CreateSalesPage from "@/pages/management/sales/CreateSalesPage";
import EditSAlesPage from "@/pages/management/sales/EditSalesPage";

// Login
import RecoverPasswordPage from "@/pages/auth/RecoverPasswordPage";
import LoginPage from "@/pages/auth";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import CatalogPage from "@/pages/public/catalog";
import HomePage from "@/pages/public";

// Cart
import CartPage from "@/pages/public/cart";
import CheckoutPage from "@/pages/public/cart/CheckoutPage";
import CheckoutStatus from "@/pages/public/cart/CheckoutStatusPage";

import ContactoPage from "@/pages/public/contacto";
import ArrepentimientoPage from "@/pages/public/legal/ArrepentimientoPage";
import LibroQuejasPage from "@/pages/public/legal/LibroQuejasPage";
import TerminosPage from "@/pages/public/legal/TerminosPage";
import PrivacidadPage from "@/pages/public/legal/PrivacidadPage";
import ProductDetailPage from "@/pages/public/product";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* RUTAS PÚBLICAS (Clientes y Visitantes) */}

                {/* HOME */}
                <Route path="/" element={<HomePage />} />

                {/* Contacto */}
                <Route path="/contacto" element={<ContactoPage />} />

                {/* Legales */}
                <Route
                    path="/arrepentimiento"
                    element={<ArrepentimientoPage />}
                />
                <Route path="/libro-quejas" element={<LibroQuejasPage />} />
                <Route
                    path="/terminos-condiciones"
                    element={<TerminosPage />}
                />
                <Route
                    path="/politicas-privacidad"
                    element={<PrivacidadPage />}
                />

                {/* Catalog & Product */}
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />

                {/* Shopping Cart, Checkout and Checkout Status */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/status" element={<CheckoutStatus />} />

                {/* Auth Flow */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/recover" element={<RecoverPasswordPage />} />
                <Route
                    path="/auth/reset/:token"
                    element={<ResetPasswordPage />}
                />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* RUTAS PRIVADAS (Solo Administradores - ERP) */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/management"
                        element={<Navigate to="/management/dashboard" replace />}
                    />
                    
                    {/* DASHBOARD */}
                    <Route 
                        path="/management/dashboard" 
                        element={<DashboardPage />} 
                    />

                    {/* REPORTS */}
                    <Route 
                        path="/management/reports" 
                        element={<ReportsPage />} 
                    />

                    {/* PRODUCTS */}
                    <Route
                        path="/management/products"
                        element={<ProductsPage />}
                    />
                    <Route
                        path="/management/products/create"
                        element={<CreateProductPage />}
                    />
                    <Route
                        path="/management/products/edit/:id"
                        element={<EditProductPage />}
                    />

                    {/* BRANDS */}
                    <Route path="/management/brands" element={<BrandsPage />} />
                    <Route
                        path="/management/brands/create"
                        element={<CreateBrandPage />}
                    />
                    <Route
                        path="/management/brands/edit/:id"
                        element={<EditBrandPage />}
                    />

                    {/* CATEGORIES */}
                    <Route path="/management/categories" element={<CategoriesPage />} />
                    <Route
                        path="/management/categories/create"
                        element={<CreateCategoryPage />}
                    />
                    <Route
                        path="/management/categories/edit/:id"
                        element={<EditCategoryPage />}
                    />

                    {/* SUBCATEGORIES */}
                    <Route path="/management/subcategories" element={<SubCategoriesPage />} />
                    <Route
                        path="/management/subcategories/create"
                        element={<CreateSubCategoryPage />}
                    />
                    <Route
                        path="/management/subcategories/edit/:id"
                        element={<EditSubCategoryPage />}
                    />

                    {/* SALES */}
                    <Route path="/management/sales" element={<SalesPage />} />
                    <Route
                        path="/management/sales/create"
                        element={<CreateSalesPage />}
                    />
                    <Route
                        path="/management/sales/edit/:id"
                        element={<EditSAlesPage />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
