import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';
import { vi } from 'vitest';

describe('SearchBar', () => {
    test('debe llamar a onChange cuando el usuario escribe', () => {
        const mockOnChange = vi.fn();

        render(
            <SearchBar
                value=""
                onChange={mockOnChange}
                placeholder="Buscar productos..."
            />
        );

        const input = screen.getByPlaceholderText("Buscar productos...");

        // Act: Simulamos que escribimos
        fireEvent.change(input, { target: { value: 'herramientas' } });

        // Assert: Comprobamos si el espía fue llamado con 'herramientas'
        expect(mockOnChange).toHaveBeenCalledWith('herramientas');
    });

    test('debe llamar a onSubmit al presionar Enter', () => {
        const mockOnSubmit = vi.fn();

        render(
            <SearchBar
                value="tractor"
                onChange={() => { }}
                onSubmit={mockOnSubmit}
            />
        );

        const input = screen.getByDisplayValue("tractor"); // Buscamos por el valor que ya tiene

        // Act: Simulamos presionar la tecla Enter
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // Assert
        expect(mockOnSubmit).toHaveBeenCalledWith('tractor');
    });
});
