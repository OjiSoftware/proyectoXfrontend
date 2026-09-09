import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, Mock } from 'vitest';

vi.mock('../hooks/useAuth')

describe('ProtectedRoute', () => {
    test("debe mostrar el loader mientras esta cargando", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isLoading: true
        })
        render(<ProtectedRoute />)

        //identificar al loader

        expect(screen.getByTestId('loader')).toBeInTheDocument();

    });

    test("debe mostrar el contenido si esta autenticado", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            isLoading: false
        });
        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<div>Contenido Protegido</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/Contenido Protegido/i)).toBeInTheDocument();
    });

    test("debe redireccionar al login, si fallo el autenticado", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isLoading: false
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<div>Contenido Protegido</div>} />
                    </Route>
                    <Route path="/auth/login" element={<div>Pantalla de Login</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByText(/Contenido Protegido/i)).not.toBeInTheDocument();

        expect(screen.getByText(/Pantalla de Login/i)).toBeInTheDocument();
    })

});


