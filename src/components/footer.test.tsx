import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { BrowserRouter } from 'react-router-dom';

describe('Footer', () => {
    test('debe mostrar el texto correcto', () => {
        // 1. Arrange: Renderizamos el componente. 
        // OJO: Como Footer usa <Link>, hay que envolverlo en <BrowserRouter> o <MemoryRouter>
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
        // 2. Act: En este caso no hay clicks, solo queremos buscar un elemento.
        // Usamos screen.getByText o screen.getByAltText para buscar en el "navegador virtual"
        const textoLegal = screen.getByText(/Todos los derechos reservados/i);
        // 3. Assert: Verificamos que el elemento exista.
        expect(textoLegal).toBeInTheDocument();
    });
});
